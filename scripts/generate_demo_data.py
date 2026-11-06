#!/usr/bin/env python3

import argparse
import hashlib
import json
import math
import os
import re
import shlex
import shutil
import subprocess
import tempfile
from pathlib import Path


TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z0-9]*")
DOT_EDGE_RE = re.compile(r'^"?([^"\s]+)"?\s*->\s*"?([^"\s]+)"?\[(.+)\];$')
SCALE = 60.0


def run_command(command, allowed_returncodes=None):
    completed = subprocess.run(command, check=False, text=True, capture_output=True)
    allowed = {0} if allowed_returncodes is None else set(allowed_returncodes)
    if completed.returncode not in allowed:
        raise subprocess.CalledProcessError(
            completed.returncode,
            command,
            output=completed.stdout,
            stderr=completed.stderr,
        )
    return completed.stdout


def parse_gate_log(log_text):
    """Parse AMulet's `-verify -v4` output.

    Besides the existing partial-product/xor-gate/slice bookkeeping, this
    also splits the (now four) `print_all_gate_constraints` dumps into
    separate phase snapshots: `baseline` (before any elimination),
    `xor_removed` (after `remove_internal_xor_gates`), and then either
    `elimination` (after `remove_single_occs_gates`, on circuits that take
    the XOR-slicing path) or `decomposition` (after `decomposing`, on
    circuits that take the input-cone slicing path). Each snapshot is a
    fresh full listing of every currently-alive gate/output's polynomial,
    so it must not be merged with the previous snapshot - a gate missing
    from a later dump has been eliminated.

    It also records the *individual* gate eliminations inside each of those
    three reduction phases, in order, as `micro_events`. Each elimination
    (`eliminate_by_one_gate`) is followed by a bare `n->print_gate_constraint`
    (no "gate X:" label - just the polynomial, whose leading term names the
    surviving gate it belongs to) and, once a gate has no parents left, a
    "[amulet2] removed/eliminated/decomposed <name>" message. Replaying
    those events in order against the phase's starting snapshot lets the
    frontend step through eliminations one at a time instead of only seeing
    the phase's start and end state.
    """
    partial_products = []
    xor_gates = []
    slice_outputs = []
    slice_memberships = {}
    gate_polynomials = {}
    notes = []
    current_gate = None
    current_slice = None
    in_slice_listing = False

    snapshots = {}
    counts = {}
    current_dict = {}
    pending_label = "baseline"

    micro_events = {"xor_removed": [], "elimination": [], "decomposition": [], "unassigned_removed": []}
    micro_phase = None

    def flush(label):
        if current_dict:
            snapshots[label] = dict(current_dict)
        current_dict.clear()

    for raw_line in log_text.splitlines():
        line = raw_line.strip()
        if not line:
            if in_slice_listing:
                current_slice = None
            continue

        if "filled" in line and "slices" in line:
            in_slice_listing = True
            continue

        partial_match = re.search(r"partial product\s+(\w+)", line, re.IGNORECASE)
        if partial_match:
            partial_products.append(partial_match.group(1))
            continue

        xor_match = re.search(r"xor-gate\s+(\w+)", line, re.IGNORECASE)
        if xor_match:
            xor_gates.append(xor_match.group(1))
            continue

        slice_match = re.search(r"init slice\s+(\d+)\s+with output\s+(\w+)", line, re.IGNORECASE)
        if slice_match:
            slice_outputs.append({"slice": int(slice_match.group(1)), "output": slice_match.group(2)})
            continue

        # On the XOR-chain slicing path (`slicing_xor()` in slicing.cpp) AMulet
        # never prints the `fill_slices`/`print_slices` per-slice listing below -
        # that dump only happens on the input-cone path (`slicing_non_xor()`).
        # Instead each gate's slice is reported inline as it's assigned/moved:
        # "xor-chain assign X to slice N" (slice_by_xor_chains) and "moved gate
        # X to slice N" (fix_jut_gates, only called on the XOR path). Capturing
        # these is the only way to get internal-gate slice membership for the
        # (more common) XOR-chain benchmarks instead of leaving every internal
        # gate ungrouped.
        slice_assign_match = re.search(
            r"(?:xor-chain assign|moved gate)\s+(\w+)\s+to slice\s+(\d+)", line, re.IGNORECASE
        )
        if slice_assign_match:
            slice_memberships[slice_assign_match.group(1)] = int(slice_assign_match.group(2))
            continue

        if in_slice_listing:
            listing_match = re.search(r"^\[amulet2\]\s+slice\s+(\d+)$", raw_line.strip(), re.IGNORECASE)
            if listing_match:
                current_slice = int(listing_match.group(1))
                continue

            node_match = re.search(r"^\[amulet2\]\s+(s\d+|l\d+)$", raw_line.strip(), re.IGNORECASE)
            if current_slice is not None and node_match:
                slice_memberships[node_match.group(1)] = current_slice
                continue

        # Reduction-phase start markers: everything unlabeled between one of
        # these and its matching end marker below is that phase's individual
        # gate-elimination trace, recorded into micro_events.
        if re.search(r"remove internal xor gates$", line, re.IGNORECASE):
            micro_phase = "xor_removed"
            continue

        if re.search(r"remove single occurence gates$", line, re.IGNORECASE):
            micro_phase = "elimination"
            continue

        if re.search(r"eliminate booth pattern$", line, re.IGNORECASE):
            micro_phase = "decomposition"
            continue

        if re.search(r"eliminate single occs$", line, re.IGNORECASE):
            micro_phase = "decomposition"
            continue

        # XOR-chain path only (`remove_slice_minus_one_gates` in
        # elimination.cpp): once slicing has run, any gate that still never
        # got a slice assigned is discarded outright - substituted into its
        # parent just like the other reduction phases, so it uses the same
        # "removed %s" trace and belongs in micro_events the same way.
        # Previously untracked, which is exactly why these gates used to
        # linger as permanently "alive" and "ungrouped" in every stage after
        # this one, even though AMulet itself had already dropped them.
        if re.search(r"remove gates that are not assigned to slices$", line, re.IGNORECASE):
            micro_phase = "unassigned_removed"
            continue

        # Phase boundaries. Order matters: a dump that finished printing
        # sits in `current_dict` until the *next* boundary line tells us
        # what to call it and clears it for the next dump.
        xor_removed_match = re.search(r"removed\s+(\d+)\s+internal xor gates", line, re.IGNORECASE)
        if xor_removed_match:
            flush("baseline")
            counts["xor_removed_count"] = int(xor_removed_match.group(1))
            pending_label = "xor_removed"
            micro_phase = None
            continue

        if re.search(r"slicing based on xor", line, re.IGNORECASE):
            flush("xor_removed")
            pending_label = "elimination"
            continue

        elim_match = re.search(r"removed\s+(\d+)\s+single occurence gates", line, re.IGNORECASE)
        if elim_match:
            flush("xor_removed")  # no-op if "slicing based on xor" already flushed it
            counts["elimination_count"] = int(elim_match.group(1))
            pending_label = "elimination"
            micro_phase = None
            continue

        if re.search(r"slicing based on input cones", line, re.IGNORECASE):
            flush("xor_removed")  # no-op if already flushed via the xor-slicing branch
            pending_label = "decomposition"
            continue

        booth_match = re.search(r"eliminated\s+(\d+)\s+variables from booth pattern", line, re.IGNORECASE)
        if booth_match:
            counts["booth_count"] = int(booth_match.group(1))
            continue

        decomposed_match = re.search(r"decomposed\s+(\d+)\s+variables", line, re.IGNORECASE)
        if decomposed_match:
            flush(pending_label)  # normally a no-op; nothing prints between here and the dump
            counts["decomposition_count"] = int(decomposed_match.group(1))
            pending_label = "decomposition"
            micro_phase = None
            continue

        unassigned_match = re.search(r"removed\s+(\d+)\s+gates that are not assigned to slices", line, re.IGNORECASE)
        if unassigned_match:
            counts["unassigned_removed_count"] = int(unassigned_match.group(1))
            micro_phase = None
            continue

        # Individual elimination events within a reduction phase: a gate
        # losing its last parent is reported by name once its absorber's
        # updated polynomial has already been printed.
        removal_match = re.match(r"\[amulet2\]\s+(?:removed|eliminated|decomposed)\s+(\w+)$", line, re.IGNORECASE)
        if removal_match and micro_phase:
            micro_events[micro_phase].append(("remove", removal_match.group(1), None))
            continue

        gate_match = re.search(r"(?:gate|output)\s+(\w+):", line, re.IGNORECASE)
        if gate_match:
            current_gate = gate_match.group(1)
            continue

        if current_gate and line.endswith(";"):
            # Every gate appears in the baseline dump first (dumps only ever
            # shrink after that), so keep the first value seen instead of
            # letting later phase dumps silently overwrite the original,
            # pre-elimination polynomial.
            gate_polynomials.setdefault(current_gate, line)
            current_dict[current_gate] = line
            current_gate = None
            continue

        if not current_gate and micro_phase and line.endswith(";") and not line.startswith("[amulet2]"):
            owner_match = re.match(r"-(\w+)", line)
            if owner_match:
                micro_events[micro_phase].append(("update", owner_match.group(1), line))
            continue

        if line.startswith("[amulet2]"):
            notes.append(re.sub(r"^\[amulet2\]\s*", "", line))

    flush(pending_label)

    return {
        "partial_products": partial_products,
        "xor_gates": xor_gates,
        "slice_outputs": slice_outputs,
        "slice_memberships": slice_memberships,
        "gate_polynomials": gate_polynomials,
        "notes": notes,
        "snapshots": snapshots,
        "counts": counts,
        "micro_events": micro_events,
    }


def parse_reduction_trace(log_text):
    """Parse the specification-rewrite trace that AMulet's `reduce()` prints
    at the end of `-verify -v4` (after slicing/elimination/decomposition have
    finished). Slice by slice, from the most-significant output down to s0,
    the (incremental) specification polynomial is reduced by each remaining
    gate constraint in turn until the remainder collapses to 0, proving the
    circuit implements the specification.

    Returns an ordered list of `{"type": "slice-start", "slice": n}`,
    `{"type": "reduce", "polynomial": ..., "remainder": ...}` and
    `{"type": "slice-end", "slice": n, "remainder": ...}` entries, plus the
    final `"CORRECT MULTIPLIER"` / `"INCORRECT MULTIPLIER"` result line.
    """
    in_reduction = False
    awaiting_slice_end = False
    pending_poly = None
    current_slice = None
    steps = []
    result = None

    for raw_line in log_text.splitlines():
        line = raw_line.strip()
        if not in_reduction:
            if re.search(r"started reducing$", line, re.IGNORECASE):
                in_reduction = True
            continue

        if line in ("[amulet2]", ""):
            continue

        slice_start_match = re.match(r"\[amulet2\]\s*reducing by slice\s+(\d+)$", line, re.IGNORECASE)
        if slice_start_match:
            current_slice = int(slice_start_match.group(1))
            steps.append({"type": "slice-start", "slice": current_slice})
            continue

        slice_end_match = re.match(r"\[amulet2\]\s*after reducing by slice\s+(\d+)$", line, re.IGNORECASE)
        if slice_end_match:
            awaiting_slice_end = True
            current_slice = int(slice_end_match.group(1))
            continue

        reducing_match = re.match(r"\[amulet2\]\s*reducing by (.+);$", line, re.IGNORECASE)
        if reducing_match:
            pending_poly = f"{reducing_match.group(1)};"
            continue

        remainder_match = re.match(r"\[amulet2\]\s*remainder is (.+);$", line, re.IGNORECASE)
        if remainder_match:
            remainder = f"{remainder_match.group(1)};"
            if awaiting_slice_end:
                steps.append({"type": "slice-end", "slice": current_slice, "remainder": remainder})
                awaiting_slice_end = False
            elif pending_poly is not None:
                steps.append({"type": "reduce", "polynomial": pending_poly, "remainder": remainder})
                pending_poly = None
            continue

        result_match = re.match(r"\[amulet2\]\s*(CORRECT MULTIPLIER|INCORRECT MULTIPLIER)$", line, re.IGNORECASE)
        if result_match:
            result = result_match.group(1).upper()
            break

    return {"steps": steps, "result": result}


LEADING_GATE_RE = re.compile(r"^-(\w+)")


def augment_slice_memberships_from_reduction(slice_memberships, steps):
    """Backfill any gate the log-scraped slice listing missed using the final
    specification-rewrite trace as ground truth.

    Every gate still alive once preprocessing finishes gets substituted into
    the running remainder exactly once, grouped under its `slice-start`
    .. `slice-end` bracket - and each "reducing by <polynomial>;" line's
    leading term names that gate (same `-name+...` convention the rest of
    this file already relies on, e.g. the `owner_match` parsing above). This
    is the only reliable, path-independent source of slice membership: on
    the XOR-chain slicing path AMulet's own `-v4` trace does not log every
    internal reassignment (some moves only print the gate name, not which
    slice it moved to), so scraping `slice_by_xor_chains`'s messages alone
    leaves real gaps. It only covers gates that survive to the end, not ones
    eliminated earlier in preprocessing, but that's exactly the set that
    still needs a slice tag once it reaches this point.
    """
    current_slice = None
    for step in steps:
        if step["type"] in ("slice-start", "slice-end"):
            current_slice = step.get("slice") if step["type"] == "slice-start" else None
            continue
        if step["type"] == "reduce" and current_slice is not None:
            match = LEADING_GATE_RE.match(step["polynomial"].strip())
            if match:
                slice_memberships[match.group(1)] = current_slice


SPEC_TERM_RE = re.compile(r"[+-]?[^+-]+")
SPEC_TERM_COEFF_RE = re.compile(r"([+-]?\d*)\*?(.*)")


def split_specification_by_slice(spec_expression):
    """Splits AMulet's flat top-level specification polynomial (e.g.
    `-128*s7-64*s6+...+64*a3*b3+...-s0+a0*b0;`) into the per-slice increment
    it is built up from.

    AMulet computes this internally, slice by slice from the MSB down, as
    `inc_spec_poly(i)` (elimination.cpp): the weighted output term `2^i * s_i`
    (the slice's "output gate") plus the weighted partial-product terms
    `2^i * a_k*b_j` with `k+j == i` that must cancel against it (the slice's
    "partial products") - then adds it to the carried-forward remainder
    before reducing by that slice's own internal gates. AMulet's `-v4` trace
    never prints `inc_spec_poly(i)` itself, only the reduce steps that
    consume it, so this reconstructs the same split from the coefficients of
    the already-printed specification: every monomial's coefficient
    magnitude is exactly `2^i` for the slice it belongs to (verified against
    all 4 demo circuits - every coefficient is a power of two, one output
    term per slice, and the rest are the slice's partial products).
    """
    body = spec_expression.strip()
    if body.endswith(";"):
        body = body[:-1]
    body = body.replace(" ", "")
    if not body:
        return {}

    buckets = {}
    for raw_term in SPEC_TERM_RE.findall(body):
        coeff_text, _rest = SPEC_TERM_COEFF_RE.match(raw_term).groups()
        if coeff_text in ("", "+"):
            coeff = 1
        elif coeff_text == "-":
            coeff = -1
        else:
            coeff = int(coeff_text)
        slice_index = int(round(math.log2(abs(coeff))))
        buckets.setdefault(slice_index, []).append(raw_term)

    def join_terms(terms):
        text = "".join(terms)
        if text.startswith("+"):
            text = text[1:]
        return f"{text};"

    result = {}
    for slice_index, terms in buckets.items():
        output_terms = [term for term in terms if re.search(r"\bs\d+\b", term)]
        partial_product_terms = [term for term in terms if term not in output_terms]
        result[slice_index] = {
            "outputTerm": join_terms(output_terms) if output_terms else None,
            "partialProducts": join_terms(partial_product_terms) if partial_product_terms else None,
            "localSpecification": join_terms(terms),
        }
    return result


def apply_specification_split(steps, spec_expression):
    """Enriches each `slice-start` step in-place with the slice's local
    specification split (see `split_specification_by_slice`), so the
    Specification rewrite tab can show it before the slice's own reduce
    steps run.
    """
    slice_specs = split_specification_by_slice(spec_expression)
    for step in steps:
        if step["type"] != "slice-start":
            continue
        spec = slice_specs.get(step["slice"])
        if not spec:
            continue
        step["outputTerm"] = spec["outputTerm"]
        step["partialProducts"] = spec["partialProducts"]
        step["localSpecification"] = spec["localSpecification"]


def parse_polynomial_file(polys_text):
    result = []
    for raw_line in polys_text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if re.fullmatch(r"\d+\s+\d+;?", line):
            continue
        result.append(line)
    return result


def variable_tokens(expression):
    return list(dict.fromkeys(TOKEN_RE.findall(expression)))


def parse_input_labels(log_text, input_count):
    labels = {}
    half = input_count // 2

    for prefix in ("a", "b"):
        for line in log_text.splitlines():
            if f"{prefix}[0]" not in line or "input[" not in line:
                continue
            indices = [int(value) for value in re.findall(r"input\[(\d+)\]", line)]
            if not indices:
                continue
            step = indices[1] - indices[0] if len(indices) >= 2 else 1
            start = indices[0]
            for bit in range(half):
                labels[start + bit * step] = f"{prefix}{bit}"
            break

    return labels


def parse_dot_edge_attributes(dot_text):
    edges = {}
    for raw_line in dot_text.splitlines():
        line = raw_line.strip()
        edge_match = DOT_EDGE_RE.match(line)
        if not edge_match:
            continue
        source, target, attrs_text = edge_match.groups()
        attrs = dict(re.findall(r"(\w+)=([\w\"]+)", attrs_text))
        edges[(source, target)] = attrs
    return edges


def parse_plain_graph(plain_text):
    graph = {"width": 0.0, "height": 0.0, "nodes": {}, "edges": {}}

    for raw_line in plain_text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        tokens = shlex.split(line)
        if tokens[0] == "graph":
            graph["width"] = float(tokens[2]) * SCALE
            graph["height"] = float(tokens[3]) * SCALE
            continue

        if tokens[0] == "node":
            name = tokens[1]
            graph["nodes"][name] = {
                "x": float(tokens[2]) * SCALE,
                "y": float(tokens[3]) * SCALE,
                "width": float(tokens[4]) * SCALE,
                "height": float(tokens[5]) * SCALE,
                "label": tokens[6],
                "shape": tokens[8],
            }
            continue

        if tokens[0] == "edge":
            source = tokens[1]
            target = tokens[2]
            points_count = int(tokens[3])
            point_tokens = tokens[4:4 + points_count * 2]
            points = []
            for index in range(0, len(point_tokens), 2):
                points.append((float(point_tokens[index]) * SCALE, float(point_tokens[index + 1]) * SCALE))
            graph["edges"][(source, target)] = points

    return graph


# Graphviz's `dot` gives the nicest pictures, but its crossing minimization
# grows much faster than linearly: ~15s for sp-ar-rc-16 (2.8k gates), still
# unfinished after 10+ minutes for sp-ar-rc-32 (11.7k gates) even with its
# speed knobs turned down. Above this many AND gates `--layout auto` switches
# to layered_plain_graph() below, which is linear per sweep.
DOT_MAX_AND_GATES = 3000

LAYERED_RANK_SEP = 64.0
LAYERED_NODE_SEP = 15.0
LAYERED_MARGIN = 30.0
LAYERED_SWEEPS = 8
DOT_NODE_RE = re.compile(r'^"?([^"\s\[]+)"?\[(.+)\];$')


def aig_and_gate_count(input_path):
    """The A field of the aiger header (`aig M I L O A`)."""
    with open(input_path, "rb") as handle:
        header = handle.readline().split()
    return int(header[5])


def layered_node_size(shape, label):
    # Mirrors the sizes `dot` picks for aigtodot's nodes (in SCALE units):
    # a 0.75x0.5in ellipse that widens for 3+ character labels, a fixed
    # 0.75x0.5in box for inputs, and an output triangle that widens with its
    # "P[k]" label.
    if shape == "box":
        return 45.0, 30.0
    if shape == "triangle":
        return 99.66 + 19.5 * max(0, len(label) - 4), 38.33
    return max(45.0, 18.0 + 9.75 * len(label)), 30.0


def place_layer(layer, desired, widths, xs):
    """Give the nodes of one rank, in `layer` order, the x positions closest
    (least squares) to `desired` that keep LAYERED_NODE_SEP between
    neighbors. Subtracting each node's minimum offset from the left turns
    that into an isotonic regression, solved by pool-adjacent-violators."""
    offsets = []
    offset = 0.0
    for index, name in enumerate(layer):
        if index:
            offset += (widths[layer[index - 1]] + widths[name]) / 2 + LAYERED_NODE_SEP
        offsets.append(offset)

    blocks = []  # [sum, count] of pooled (desired - offset) values
    for index, name in enumerate(layer):
        blocks.append([desired[name] - offsets[index], 1])
        while len(blocks) > 1 and blocks[-2][0] * blocks[-1][1] > blocks[-1][0] * blocks[-2][1]:
            total, count = blocks.pop()
            blocks[-1][0] += total
            blocks[-1][1] += count

    index = 0
    for total, count in blocks:
        value = total / count
        for _ in range(count):
            xs[layer[index]] = value + offsets[index]
            index += 1


def ellipse_boundary(cx, cy, width, height, towards_x, towards_y):
    dx = towards_x - cx
    dy = towards_y - cy
    if dx == 0 and dy == 0:
        return cx, cy
    scale = 1.0 / math.sqrt((dx / (width / 2)) ** 2 + (dy / (height / 2)) ** 2)
    return cx + dx * scale, cy + dy * scale


def layered_plain_graph(dot_text):
    """A fast stand-in for `dot -Tplain` on large AIGs, returning the same
    structure as parse_plain_graph() so build_aig_graph() can't tell them
    apart.

    It is a plain layered (Sugiyama-style) layout. Inputs sit on the bottom
    rank. Every other gate sits as high as it can: one rank below its
    lowest consumer, but still above all of its children. Outputs float one
    rank above the gate that drives them, as they do in dot's pictures.
    Within a rank, nodes are ordered and placed by alternating downward and
    upward barycenter sweeps. Edges are straight lines clipped to the node
    outlines. aigtodot's input pins (I*) are left out because
    build_aig_graph() drops them anyway.
    """
    shapes = {}
    labels = {}
    children = {}
    parents = {}

    def touch(name):
        if name not in children:
            children[name] = []
            parents[name] = []

    for raw_line in dot_text.splitlines():
        line = raw_line.strip()
        edge_match = DOT_EDGE_RE.match(line)
        if edge_match:
            source, target, _ = edge_match.groups()
            if source.startswith("I") or target.startswith("I"):
                continue
            touch(source)
            touch(target)
            children[source].append(target)
            parents[target].append(source)
            continue
        node_match = DOT_NODE_RE.match(line)
        if node_match:
            name, attrs = node_match.groups()
            if name.startswith("I"):
                continue
            touch(name)
            shape_match = re.search(r"shape=(\w+)", attrs)
            label_match = re.search(r'label="([^"]*)"', attrs)
            if shape_match:
                shapes[name] = shape_match.group(1)
            if label_match:
                labels[name] = label_match.group(1)

    names = list(children)
    widths = {}
    heights = {}
    for name in names:
        shapes.setdefault(name, "ellipse")
        labels.setdefault(name, name)
        widths[name], heights[name] = layered_node_size(shapes[name], labels[name])

    # Longest path up from the sinks (the inputs): the lowest rank each node
    # can take while staying above all of its children.
    rank = {name: 0 for name in names}
    pending_children = {name: len(children[name]) for name in names}
    queue = [name for name in names if not children[name]]
    topo_from_bottom = []
    while queue:
        name = queue.pop()
        topo_from_bottom.append(name)
        for parent in parents[name]:
            rank[parent] = max(rank[parent], rank[name] + 1)
            pending_children[parent] -= 1
            if pending_children[parent] == 0:
                queue.append(parent)
    if len(topo_from_bottom) != len(names):
        raise ValueError("AIG graph has a cycle; cannot build a layered layout")

    # Pull every non-input gate up to just below its lowest consumer, top
    # down, so partial products sit next to the adders that use them instead
    # of piling up on rank 1.
    for name in reversed(topo_from_bottom):
        if shapes[name] == "box" or not parents[name] or not children[name]:
            continue
        rank[name] = min(rank[parent] for parent in parents[name]) - 1

    # Initial order: depth-first from the outputs in bit order, so low
    # product bits start on the left as in dot's layouts.
    discovery = {}
    outputs = sorted((name for name in names if name.startswith("O")), key=lambda value: int(value[1:]))
    roots = outputs + [name for name in names if not parents[name] and not name.startswith("O")]
    for root in roots:
        stack = [root]
        while stack:
            name = stack.pop()
            if name in discovery:
                continue
            discovery[name] = len(discovery)
            stack.extend(reversed(children[name]))
    for name in names:
        discovery.setdefault(name, len(discovery))

    layers = {}
    for name in sorted(names, key=lambda value: discovery[value]):
        layers.setdefault(rank[name], []).append(name)

    # All-zero targets pool into one block: each rank starts centered on 0.
    xs = {}
    for layer in layers.values():
        place_layer(layer, {name: 0.0 for name in layer}, widths, xs)

    ranks_top_down = sorted(layers, reverse=True)
    for sweep in range(LAYERED_SWEEPS):
        downward = sweep % 2 == 0
        for layer_rank in (ranks_top_down if downward else reversed(ranks_top_down)):
            layer = layers[layer_rank]
            desired = {}
            for name in layer:
                neighbors = parents[name] if downward else children[name]
                if not neighbors:
                    neighbors = children[name] if downward else parents[name]
                desired[name] = sum(xs[other] for other in neighbors) / len(neighbors) if neighbors else xs[name]
            # Stable sort: ties keep the previous sweep's order.
            layer.sort(key=lambda value: desired[value])
            place_layer(layer, desired, widths, xs)

    min_x = min(xs[name] - widths[name] / 2 for name in names)
    max_x = max(xs[name] + widths[name] / 2 for name in names)
    max_height = max(heights.values())
    max_rank = max(rank.values())

    graph = {
        "width": (max_x - min_x) + 2 * LAYERED_MARGIN,
        "height": max_rank * LAYERED_RANK_SEP + max_height + 2 * LAYERED_MARGIN,
        "nodes": {},
        "edges": {},
    }
    for name in names:
        graph["nodes"][name] = {
            "x": xs[name] - min_x + LAYERED_MARGIN,
            # Plain-format convention: y grows upwards (build_aig_graph flips it).
            "y": LAYERED_MARGIN + max_height / 2 + rank[name] * LAYERED_RANK_SEP,
            "width": widths[name],
            "height": heights[name],
            "label": labels[name],
            "shape": shapes[name],
        }

    for source in names:
        info = graph["nodes"][source]
        for target in children[source]:
            other = graph["nodes"][target]
            graph["edges"][(source, target)] = [
                ellipse_boundary(info["x"], info["y"], info["width"], info["height"], other["x"], other["y"]),
                ellipse_boundary(other["x"], other["y"], other["width"], other["height"], info["x"], info["y"]),
            ]

    return graph


def classify_node(name, partial_products, xor_gates, outputs):
    if re.fullmatch(r"[ab]\d+", name, re.IGNORECASE):
        return {"type": "input", "role": "Primary input"}
    if name in outputs:
        return {"type": "output", "role": "Output bit"}
    if name in partial_products:
        return {"type": "and", "role": "Partial product"}
    if name in xor_gates:
        return {"type": "and", "role": "XOR support"}
    return {"type": "and", "role": "Internal support"}


def classify_internal_role(name, partial_products, xor_gates):
    if name in partial_products:
        return "Partial product"
    if name in xor_gates:
        return "XOR support"
    return "Internal support"


def coordinate(value):
    # Two decimals is far below a pixel at any zoom the site offers, and it
    # cuts the float noise dot's inch-to-unit scaling leaves behind
    # (132.17999999999998) - a real size win on the large circuits.
    return round(value, 2)


def build_aig_graph(input_path, verify_log, gate_expressions, output_names, partial_products, xor_gates, slice_memberships, layout="auto"):
    if layout == "auto":
        layout = "dot" if aig_and_gate_count(input_path) <= DOT_MAX_AND_GATES else "layered"
    with tempfile.TemporaryDirectory(prefix="aigvis-") as temp_dir:
        dot_path = os.path.join(temp_dir, "graph.dot")
        run_command(["aigtodot", "-i", input_path, dot_path])
        dot_text = Path(dot_path).read_text(encoding="utf8")
        if layout == "dot":
            plain_graph = parse_plain_graph(run_command(["dot", "-Tplain", dot_path]))
        else:
            plain_graph = layered_plain_graph(dot_text)

    dot_edges = parse_dot_edge_attributes(dot_text)
    input_labels = parse_input_labels(verify_log, len([node for node in plain_graph["nodes"] if node.isdigit() and int(node) <= len(output_names)]))

    numeric_nodes = sorted(
        [name for name in plain_graph["nodes"] if name.isdigit()],
        key=lambda value: int(value)
    )
    input_count = len([name for name in numeric_nodes if int(name) <= len(input_labels)]) if input_labels else len(output_names)
    if not input_labels:
        half = input_count // 2
        for index in range(input_count):
            prefix = "a" if index < half else "b"
            bit = index if index < half else index - half
            input_labels[index] = f"{prefix}{bit}"

    dot_to_id = {}
    nodes = []
    graph_height = plain_graph["height"]

    def flipped_y(value):
        return graph_height - value

    numeric_input_count = 0
    for name in numeric_nodes:
        info = plain_graph["nodes"][name]
        index = int(name)
        if index <= max(input_labels.keys()) + 1:
            input_label = input_labels.get(index - 1, f"i{index - 1}")
            node_id = input_label
            node_type = "input"
            role = "Primary input"
            numeric_input_count += 1
        else:
            literal_name = f"l{2 * index}"
            node_id = literal_name
            node_type = "and"
            role = classify_internal_role(literal_name, partial_products, xor_gates)

        dot_to_id[name] = node_id
        nodes.append(
            {
                "id": node_id,
                "label": node_id,
                "type": node_type,
                "shape": "box" if node_type == "input" else "ellipse",
                "role": role,
                "signal": node_id,
                "polynomial": gate_expressions.get(node_id, f"{node_id} is referenced by AMulet during preprocessing."),
                "x": coordinate(info["x"]),
                "y": coordinate(flipped_y(info["y"])),
                "width": coordinate(info["width"]),
                "height": coordinate(info["height"]),
                "slice": slice_memberships.get(node_id),
            }
        )

    output_nodes = sorted(
        [name for name in plain_graph["nodes"] if name.startswith("O")],
        key=lambda value: int(value[1:])
    )
    for name in output_nodes:
        info = plain_graph["nodes"][name]
        output_label = f"s{int(name[1:])}"
        dot_to_id[name] = output_label
        nodes.append(
            {
                "id": output_label,
                "label": output_label,
                "type": "output",
                "shape": "triangle",
                "role": "Output bit",
                "signal": output_label,
                "polynomial": gate_expressions.get(output_label, f"{output_label} is referenced by AMulet during preprocessing."),
                "x": coordinate(info["x"]),
                "y": coordinate(flipped_y(info["y"])),
                "width": coordinate(info["width"]),
                "height": coordinate(info["height"]),
                "slice": slice_memberships.get(output_label, int(name[1:])),
            }
        )

    edges = []
    for (source, target), points in plain_graph["edges"].items():
        if source.startswith("I") or target.startswith("I"):
            continue
        if source not in dot_to_id or target not in dot_to_id:
            continue

        attributes = dot_edges.get((source, target), {})
        edges.append(
            {
                "from": dot_to_id[source],
                "to": dot_to_id[target],
                "inverted": attributes.get("arrowhead") == "dot",
                "points": [[coordinate(x), coordinate(flipped_y(y))] for x, y in points],
            }
        )

    return {
        "nodes": nodes,
        "edges": edges,
        "graphWidth": coordinate(plain_graph["width"]),
        "graphHeight": coordinate(plain_graph["height"]),
    }


def build_micro_steps(events, verb):
    """Turn one reduction phase's individual gate eliminations into an
    ordered list of one-gate-at-a-time steps, so the UI can offer a small
    forward/back control to apply them manually - without exploding the
    phase into 40-150+ separate top-level stages.

    `events` is the ordered (kind, name, expression) list collected by
    parse_gate_log: "update" events refresh a surviving gate's polynomial as
    it absorbs a child, "remove" events mark that child as eliminated - at
    which point its absorber's polynomial already reflects the merge, so
    that update is attached to this step's delta.

    Each step only carries *its own* delta (the one gate eliminated, plus
    whichever gate(s) got a new polynomial as a result), not a full
    resnapshot of every gate alive so far - repeating the full alive-gate
    list on every single one would blow up examples.json into the tens of
    megabytes. The frontend reconstructs state by replaying deltas forward.
    """
    total = sum(1 for kind, _, _ in events if kind == "remove")
    micro_steps = []
    pending_updates = {}

    for kind, name, expression in events:
        if kind == "update":
            pending_updates[name] = expression
            continue

        index = len(micro_steps) + 1
        micro_steps.append({
            "eliminated": name,
            "updates": [{"nodeId": n, "expression": e} for n, e in pending_updates.items()],
            "summary": f"AMulet {verb} gate {name} by substituting it directly into its parent's polynomial. ({index}/{total})",
        })
        pending_updates = {}

    return micro_steps


def build_stages(example, gate_data, output_equations):
    gate_items = list(gate_data["gate_polynomials"].items())
    summary_polys = [{"label": label, "expression": expression} for label, expression in gate_items[:10]]
    partial_polys = [
        {"label": label, "expression": gate_data["gate_polynomials"].get(label, f"{label};")}
        for label in gate_data["partial_products"][:12]
    ]
    xor_polys = [
        {"label": label, "expression": gate_data["gate_polynomials"].get(label, f"{label};")}
        for label in gate_data["xor_gates"][:12]
    ]
    slice_polys = [
        {"label": f"slice {item['slice']}", "expression": f"{item['output']}: {output_equations.get(item['output'], 'output relation unavailable')}"}
        for item in gate_data["slice_outputs"]
    ]

    snapshots = gate_data["snapshots"]
    counts = gate_data["counts"]

    stages = [
        {
            "name": "Extract gate constraints",
            "summary": "Read the gate-level polynomial equations that AMulet derives directly from the AIG structure.",
            "polynomials": summary_polys + partial_polys,
            "dimmedNodes": [],
            "rootUpdates": [],
        },
        {
            "name": "Detect partial products",
            "summary": f"AMulet flags {len(gate_data['partial_products'])} partial-product gates while scanning the AIG.",
            "polynomials": partial_polys or summary_polys,
            "dimmedNodes": [],
            "rootUpdates": [],
        },
        {
            "name": "Identify xor support",
            "summary": f"AMulet reports {len(gate_data['xor_gates'])} XOR-support gates before elimination.",
            "polynomials": xor_polys or summary_polys,
            "dimmedNodes": [],
            "rootUpdates": [],
        },
    ]

    micro_events = gate_data["micro_events"]

    if "xor_removed" in snapshots:
        xor_count = counts.get("xor_removed_count", 0)
        stages.append({
            "name": "Remove internal xor gates",
            "summary": f"AMulet removed {xor_count} internal XOR gates by direct substitution. Use the node-by-node control below to apply them one at a time, or Next/Run all to skip ahead.",
            "polynomials": [],
            "microSteps": build_micro_steps(micro_events["xor_removed"], "removed"),
        })

    # Comes after xor removal (matching AMulet's own order: slicing only runs
    # once the internal xor gates are gone) rather than before it. No
    # `dimmedNodes`/`rootUpdates` of its own - it deliberately isn't a
    # checkpoint, so the overlay lookup falls through to "Remove internal xor
    # gates" above and shows every one of those gates already gone instead of
    # dangling as ungrouped, no-longer-existent nodes.
    stages.append({
        "name": "Initialize slices",
        "summary": "Output bits are grouped into slices that anchor the elimination and decomposition passes.",
        "polynomials": slice_polys or summary_polys,
    })

    if "elimination" in snapshots:
        elim_count = counts.get("elimination_count", 0)
        stages.append({
            "name": "Eliminate single-occurrence nodes",
            "summary": f"AMulet eliminated {elim_count} single-occurrence nodes by substituting each into its parent gate (XOR-based slicing path). Use the node-by-node control below to apply them one at a time, or Next/Run all to skip ahead.",
            "polynomials": [],
            "microSteps": build_micro_steps(micro_events["elimination"], "eliminated"),
        })
    elif "decomposition" in snapshots:
        decomp_count = counts.get("decomposition_count", 0)
        booth_count = counts.get("booth_count", 0)
        booth_note = f" ({booth_count} of them first isolated via booth-pattern elimination)" if booth_count else ""
        stages.append({
            "name": "Eliminate single-occurrence nodes",
            "summary": f"AMulet decomposed {decomp_count} remaining single-occurrence gates{booth_note}, since this circuit takes the input-cone slicing path instead of XOR-based slicing. Use the node-by-node control below to apply them one at a time, or Next/Run all to skip ahead.",
            "polynomials": [],
            "microSteps": build_micro_steps(micro_events["decomposition"], "decomposed"),
        })

    if micro_events["unassigned_removed"]:
        unassigned_count = counts.get("unassigned_removed_count", 0)
        stages.append({
            "name": "Remove gates without a slice",
            "summary": f"AMulet discarded {unassigned_count} gates that never received a slice assignment during XOR-chain slicing, substituting each into its parent gate. Use the node-by-node control below to apply them one at a time, or Next/Run all to skip ahead.",
            "polynomials": [],
            "microSteps": build_micro_steps(micro_events["unassigned_removed"], "removed"),
        })

    return stages


def humanize_benchmark_name(file_path):
    return Path(file_path).stem.replace("-", " ").replace("_", " ")


def build_example(input_path, graph_input_path, polys_text, spec_text, verify_log, layout="auto"):
    gate_data = parse_gate_log(verify_log)
    poly_lines = parse_polynomial_file(polys_text)
    spec_expression = spec_text.strip()
    output_equations = {}
    output_names = set()

    for line in poly_lines:
      tokens = variable_tokens(line)
      if tokens and tokens[0].startswith("s"):
          output_equations[tokens[0]] = line
          output_names.add(tokens[0])

    gate_expressions = dict(gate_data["gate_polynomials"])
    gate_expressions.update(output_equations)
    partial_products = set(gate_data["partial_products"])
    xor_gates = set(gate_data["xor_gates"])

    reduction = parse_reduction_trace(verify_log)
    augment_slice_memberships_from_reduction(gate_data["slice_memberships"], reduction["steps"])
    apply_specification_split(reduction["steps"], spec_expression)

    aig_graph = build_aig_graph(
        graph_input_path,
        verify_log,
        gate_expressions,
        output_names,
        partial_products,
        xor_gates,
        gate_data["slice_memberships"],
        layout,
    )

    label = humanize_benchmark_name(input_path)
    example = {
        "id": Path(input_path).stem,
        "label": label,
        "title": f"{label} multiplier",
        "description": f"Generated from {Path(input_path).name} via AMulet verbose verification and certification output.",
        "stageNote": "This benchmark is rendered from real AMulet output instead of hand-authored toy data.",
        "graphWidth": aig_graph["graphWidth"],
        "graphHeight": aig_graph["graphHeight"],
        "slices": sorted({slice_index for slice_index in gate_data["slice_memberships"].values()}),
        "nodes": aig_graph["nodes"],
        "edges": aig_graph["edges"],
        "stages": [],
        "specification": None,
    }
    example["stages"] = build_stages(example, gate_data, output_equations)

    example["specification"] = {
        "polynomial": spec_expression,
        "steps": reduction["steps"],
        "result": reduction["result"],
    }
    return example


def generate_example(amulet_path, input_path, layout="auto"):
    temp_dir = tempfile.mkdtemp(prefix="circuit-demo-")
    polys_path = os.path.join(temp_dir, "out.polys")
    proof_path = os.path.join(temp_dir, "out.proof")
    spec_path = os.path.join(temp_dir, "out.spec")
    substitute_cnf_path = os.path.join(temp_dir, "substitute.cnf")
    substitute_aig_path = os.path.join(temp_dir, "substitute.aig")
    try:
        graph_input_path = input_path
        if generate_example.use_substitute:
            run_command(
                [amulet_path, "-substitute", input_path, substitute_cnf_path, substitute_aig_path, "-v2"],
                allowed_returncodes={0, 1},
            )
            graph_input_path = substitute_aig_path

        verify_log = run_command([amulet_path, "-verify", graph_input_path, "-v4"], allowed_returncodes={0, 1})
        run_command([amulet_path, "-certify", graph_input_path, polys_path, proof_path, spec_path, "-p2"], allowed_returncodes={0, 1})
        polys_text = Path(polys_path).read_text(encoding="utf8")
        spec_text = Path(spec_path).read_text(encoding="utf8")
        return build_example(input_path, graph_input_path, polys_text, spec_text, verify_log, layout)
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


generate_example.use_substitute = False


EXAMPLES_DIR_NAME = "examples"


def write_examples(examples, out_path):
    """Write `out_path` as a small manifest plus one compact file per example
    in a sibling `examples/` directory.

    The site used to download every circuit up front from one file. With
    sp-ar-rc-64 (~48k gates) in the set that alone would be tens of
    megabytes, so it now loads only the manifest and fetches each circuit
    when it's selected. Each manifest entry's `file` carries a content hash
    (`?v=...`) so GitHub Pages' 10-minute caching can't hand out a stale
    circuit after a regeneration. Per-example files left over from circuits
    no longer in the run are removed: the run defines the full set, as the
    single-file output always did.
    """
    examples_dir = out_path.parent / EXAMPLES_DIR_NAME
    examples_dir.mkdir(parents=True, exist_ok=True)
    manifest = []
    written = set()
    for example in examples:
        file_name = f"{example['id']}.json"
        payload = json.dumps(example, separators=(",", ":")) + "\n"
        (examples_dir / file_name).write_text(payload, encoding="utf8")
        written.add(file_name)
        digest = hashlib.sha256(payload.encode("utf8")).hexdigest()[:10]
        manifest.append({
            "id": example["id"],
            "label": example["label"],
            "title": example["title"],
            "nodeCount": len(example["nodes"]),
            "file": f"{EXAMPLES_DIR_NAME}/{file_name}?v={digest}",
        })
        print(f"  {file_name}: {len(example['nodes'])} nodes, {len(payload) / 1e6:.1f} MB")

    for stale in sorted(examples_dir.glob("*.json")):
        if stale.name not in written:
            stale.unlink()
            print(f"  removed stale {stale.name}")

    out_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--amulet", required=True)
    parser.add_argument("--out", default="data/generated/examples.json")
    parser.add_argument("--substitute-final-adder", action="store_true")
    parser.add_argument(
        "--layout",
        choices=["auto", "dot", "layered"],
        default="auto",
        help=f"graph layout: Graphviz dot, the built-in layered layout, or auto (dot up to {DOT_MAX_AND_GATES} AND gates)",
    )
    parser.add_argument("inputs", nargs="+")
    args = parser.parse_args()

    generate_example.use_substitute = args.substitute_final_adder

    examples = [generate_example(args.amulet, input_path, args.layout) for input_path in args.inputs]
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    write_examples(examples, out_path)
    print(f"Wrote {len(examples)} demo example(s) to {out_path}")


if __name__ == "__main__":
    main()