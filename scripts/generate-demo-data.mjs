#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

function parseArgs(argv) {
  const args = { out: path.resolve("data/generated/examples.json") };
  const inputs = [];

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--amulet") {
      args.amulet = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (value === "--out") {
      args.out = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    inputs.push(path.resolve(value));
  }

  if (!args.amulet || !inputs.length) {
    throw new Error("Usage: node scripts/generate-demo-data.mjs --amulet /path/to/amulet file1.aig [file2.aig ...] [--out data/generated/examples.json]");
  }

  return { ...args, inputs };
}

function readCommandOutput(amuletPath, args, options = {}) {
  return execFileSync(amuletPath, args, {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    ...options
  });
}

function parseGateLog(logText) {
  // Mirrors scripts/generate_demo_data.py's parse_gate_log(). Besides the
  // existing partial-product/xor-gate/slice bookkeeping, this splits the
  // (now four) print_all_gate_constraints dumps in `-verify -v4` output into
  // separate phase snapshots: "baseline" (before any elimination),
  // "xorRemoved" (after remove_internal_xor_gates), and then either
  // "elimination" (remove_single_occs_gates, XOR-slicing path) or
  // "decomposition" (decomposing, input-cone slicing path). Each snapshot is
  // a fresh full listing, not merged with the previous one - a gate missing
  // from a later dump has been eliminated.
  const lines = logText.split(/\r?\n/);
  const partialProducts = [];
  const xorGates = [];
  const sliceOutputs = [];
  const gatePolynomials = new Map();
  const notes = [];
  let currentGate = null;

  const snapshots = new Map();
  const counts = {};
  let currentDict = new Map();
  let pendingLabel = "baseline";

  // Ordered per-gate elimination trace within each reduction phase, mirroring
  // scripts/generate_demo_data.py: "update" events refresh a surviving gate's
  // polynomial as it absorbs a child, "remove" events mark that child as
  // eliminated (its absorber's polynomial already reflects the merge by then).
  const microEvents = { xorRemoved: [], elimination: [], decomposition: [] };
  let microPhase = null;

  const flush = (label) => {
    if (currentDict.size) {
      snapshots.set(label, new Map(currentDict));
    }
    currentDict = new Map();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const partialMatch = line.match(/partial product\s+(\w+)/i);
    if (partialMatch) {
      partialProducts.push(partialMatch[1]);
      continue;
    }

    const xorMatch = line.match(/xor-gate\s+(\w+)/i);
    if (xorMatch) {
      xorGates.push(xorMatch[1]);
      continue;
    }

    const sliceMatch = line.match(/init slice\s+(\d+)\s+with output\s+(\w+)/i);
    if (sliceMatch) {
      sliceOutputs.push({ slice: Number(sliceMatch[1]), output: sliceMatch[2] });
      continue;
    }

    // Reduction-phase start markers: everything unlabeled between one of
    // these and its matching end marker below is that phase's individual
    // gate-elimination trace, recorded into microEvents.
    if (/remove internal xor gates$/i.test(line)) {
      microPhase = "xorRemoved";
      continue;
    }

    if (/remove single occurence gates$/i.test(line)) {
      microPhase = "elimination";
      continue;
    }

    if (/eliminate booth pattern$/i.test(line)) {
      microPhase = "decomposition";
      continue;
    }

    if (/eliminate single occs$/i.test(line)) {
      microPhase = "decomposition";
      continue;
    }

    const xorRemovedMatch = line.match(/removed\s+(\d+)\s+internal xor gates/i);
    if (xorRemovedMatch) {
      flush("baseline");
      counts.xorRemovedCount = Number(xorRemovedMatch[1]);
      pendingLabel = "xorRemoved";
      microPhase = null;
      continue;
    }

    if (/slicing based on xor/i.test(line)) {
      flush("xorRemoved");
      pendingLabel = "elimination";
      continue;
    }

    const elimMatch = line.match(/removed\s+(\d+)\s+single occurence gates/i);
    if (elimMatch) {
      flush("xorRemoved"); // no-op if "slicing based on xor" already flushed it
      counts.eliminationCount = Number(elimMatch[1]);
      pendingLabel = "elimination";
      microPhase = null;
      continue;
    }

    if (/slicing based on input cones/i.test(line)) {
      flush("xorRemoved"); // no-op if already flushed via the xor-slicing branch
      pendingLabel = "decomposition";
      continue;
    }

    const boothMatch = line.match(/eliminated\s+(\d+)\s+variables from booth pattern/i);
    if (boothMatch) {
      counts.boothCount = Number(boothMatch[1]);
      continue;
    }

    const decomposedMatch = line.match(/decomposed\s+(\d+)\s+variables/i);
    if (decomposedMatch) {
      flush(pendingLabel); // normally a no-op; nothing prints between here and the dump
      counts.decompositionCount = Number(decomposedMatch[1]);
      pendingLabel = "decomposition";
      microPhase = null;
      continue;
    }

    // Individual elimination events within a reduction phase: a gate
    // losing its last parent is reported by name once its absorber's
    // updated polynomial has already been printed.
    const removalMatch = line.match(/^\[amulet2\]\s+(?:removed|eliminated|decomposed)\s+(\w+)$/i);
    if (removalMatch && microPhase) {
      microEvents[microPhase].push(["remove", removalMatch[1], null]);
      continue;
    }

    const gateMatch = line.match(/(?:gate|output)\s+(\w+):/i);
    if (gateMatch) {
      currentGate = gateMatch[1];
      continue;
    }

    if (currentGate && line.endsWith(";")) {
      // Every gate appears in the baseline dump first (dumps only ever
      // shrink after that), so keep the first value seen instead of
      // letting later phase dumps silently overwrite the original,
      // pre-elimination polynomial.
      if (!gatePolynomials.has(currentGate)) {
        gatePolynomials.set(currentGate, line);
      }
      currentDict.set(currentGate, line);
      currentGate = null;
      continue;
    }

    if (!currentGate && microPhase && line.endsWith(";") && !line.startsWith("[amulet2]")) {
      const ownerMatch = line.match(/^-(\w+)/);
      if (ownerMatch) {
        microEvents[microPhase].push(["update", ownerMatch[1], line]);
      }
      continue;
    }

    if (line.startsWith("[amulet2]")) {
      notes.push(line.replace(/^\[amulet2\]\s*/, ""));
    }
  }

  flush(pendingLabel);

  return { partialProducts, xorGates, sliceOutputs, gatePolynomials, notes, snapshots, counts, microEvents };
}

function parsePolynomialFile(polysText) {
  return polysText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^\d+\s+\d+;?$/.test(line));
}

function variableTokens(expression) {
  const tokens = expression.match(/[A-Za-z][A-Za-z0-9]*/g) ?? [];
  return [...new Set(tokens)];
}

function classifyNode(name, partialProducts, xorGates, outputs) {
  if (/^[ab]\d+$/i.test(name)) {
    return { type: "input", role: "Primary input" };
  }

  if (outputs.has(name)) {
    return { type: "output", role: "Output bit" };
  }

  if (partialProducts.has(name)) {
    return { type: "and", role: "Partial product" };
  }

  if (xorGates.has(name)) {
    return { type: "and", role: "XOR support" };
  }

  return { type: "and", role: "Internal support" };
}

function computeLayout(nodes, edges) {
  const levelById = new Map();
  const incoming = new Map(nodes.map((node) => [node.id, []]));

  for (const edge of edges) {
    incoming.get(edge.to)?.push(edge.from);
  }

  for (const node of nodes) {
    if (node.type === "input") {
      levelById.set(node.id, 0);
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes) {
      if (levelById.has(node.id)) {
        continue;
      }

      const parents = incoming.get(node.id) ?? [];
      if (!parents.length) {
        levelById.set(node.id, 1);
        changed = true;
        continue;
      }

      if (parents.every((parent) => levelById.has(parent))) {
        const parentLevel = Math.max(...parents.map((parent) => levelById.get(parent)));
        levelById.set(node.id, parentLevel + 1);
        changed = true;
      }
    }
  }

  const levels = new Map();
  for (const node of nodes) {
    const level = levelById.get(node.id) ?? 1;
    if (!levels.has(level)) {
      levels.set(level, []);
    }
    levels.get(level).push(node);
  }

  for (const layer of levels.values()) {
    layer.sort((left, right) => left.label.localeCompare(right.label, undefined, { numeric: true }));
  }

  for (const [level, layer] of [...levels.entries()].sort((left, right) => left[0] - right[0])) {
    layer.forEach((node, index) => {
      node.x = 100 + level * 170;
      node.y = 70 + index * 66;
    });
  }
}

function buildMicroSteps(events, verb) {
  // Mirrors scripts/generate_demo_data.py's build_micro_steps(). Turns one
  // reduction phase's individual gate eliminations into an ordered list of
  // one-gate-at-a-time steps, so the UI can offer a small forward/back
  // control to apply them manually - without exploding the phase into
  // 40-150+ separate top-level stages.
  //
  // Each step only carries *its own* delta (the one gate eliminated, plus
  // whichever gate(s) got a new polynomial as a result), not a full
  // resnapshot of every gate alive so far - repeating the full alive-gate
  // list on every single one would blow up examples.json into the tens of
  // megabytes. The frontend reconstructs state by replaying deltas forward.
  const total = events.filter(([kind]) => kind === "remove").length;
  const microSteps = [];
  let pendingUpdates = new Map();

  for (const [kind, name, expression] of events) {
    if (kind === "update") {
      pendingUpdates.set(name, expression);
      continue;
    }

    const index = microSteps.length + 1;
    microSteps.push({
      eliminated: name,
      updates: [...pendingUpdates.entries()].map(([nodeId, expr]) => ({ nodeId, expression: expr })),
      summary: `AMulet ${verb} gate ${name} by substituting it directly into its parent's polynomial. (${index}/${total})`
    });
    pendingUpdates = new Map();
  }

  return microSteps;
}

function buildStages(example, gateData, outputEquations, specExpression) {
  const summaryPolys = Array.from(gateData.gatePolynomials.entries()).slice(0, 10).map(([label, expression]) => ({ label, expression }));
  const partialPolys = gateData.partialProducts.slice(0, 12).map((label) => ({ label, expression: gateData.gatePolynomials.get(label) ?? `${label};` }));
  const xorPolys = gateData.xorGates.slice(0, 12).map((label) => ({ label, expression: gateData.gatePolynomials.get(label) ?? `${label};` }));
  const slicePolys = gateData.sliceOutputs.map(({ slice, output }) => ({ label: `slice ${slice}`, expression: `${output}: ${outputEquations.get(output) ?? "output relation unavailable"}` }));

  const { snapshots } = gateData;

  const stages = [
    {
      name: "Extract gate constraints",
      summary: "Read the gate-level polynomial equations that AMulet derives directly from the AIG structure.",
      polynomials: [...summaryPolys, ...partialPolys],
      dimmedNodes: [],
      rootUpdates: []
    },
    {
      name: "Detect partial products",
      summary: `AMulet flags ${gateData.partialProducts.length} partial-product gates while scanning the AIG.`,
      polynomials: partialPolys.length ? partialPolys : summaryPolys,
      dimmedNodes: [],
      rootUpdates: []
    },
    {
      name: "Identify xor support",
      summary: `AMulet reports ${gateData.xorGates.length} XOR-support gates before elimination.`,
      polynomials: xorPolys.length ? xorPolys : summaryPolys,
      dimmedNodes: [],
      rootUpdates: []
    },
    {
      name: "Initialize slices",
      summary: "Output bits are grouped into slices that anchor the elimination and decomposition passes.",
      polynomials: slicePolys.length ? slicePolys : summaryPolys,
      dimmedNodes: [],
      rootUpdates: []
    }
  ];

  const { microEvents, counts } = gateData;

  if (snapshots.has("xorRemoved")) {
    const xorCount = counts.xorRemovedCount ?? 0;
    stages.push({
      name: "Remove internal xor gates",
      summary: `AMulet removed ${xorCount} internal XOR gates by direct substitution. Use the node-by-node control below to apply them one at a time, or Next/Run all to skip ahead.`,
      polynomials: [],
      microSteps: buildMicroSteps(microEvents.xorRemoved, "removed")
    });
  }

  if (snapshots.has("elimination")) {
    const elimCount = counts.eliminationCount ?? 0;
    stages.push({
      name: "Eliminate single-occurrence nodes",
      summary: `AMulet eliminated ${elimCount} single-occurrence nodes by substituting each into its parent gate (XOR-based slicing path). Use the node-by-node control below to apply them one at a time, or Next/Run all to skip ahead.`,
      polynomials: [],
      microSteps: buildMicroSteps(microEvents.elimination, "eliminated")
    });
  } else if (snapshots.has("decomposition")) {
    const decompCount = counts.decompositionCount ?? 0;
    const boothCount = counts.boothCount ?? 0;
    const boothNote = boothCount ? ` (${boothCount} of them first isolated via booth-pattern elimination)` : "";
    stages.push({
      name: "Decompose remaining gates",
      summary: `AMulet decomposed ${decompCount} remaining single-occurrence gates${boothNote}, since this circuit takes the input-cone slicing path instead of XOR-based slicing. Use the node-by-node control below to apply them one at a time, or Next/Run all to skip ahead.`,
      polynomials: [],
      microSteps: buildMicroSteps(microEvents.decomposition, "decomposed")
    });
  }

  // No delta of its own - the frontend replay lands here with whatever the
  // last stage above left behind once fully applied, same as today's
  // rewritten wires.
  stages.push({
    name: "Prepare specification rewrite",
    summary: "The remaining output equations are aligned so the weighted sum can be matched against the multiplier specification polynomial.",
    polynomials: [{ label: "spec", expression: specExpression }]
  });

  return stages;
}

function humanizeBenchmarkName(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  return base.replace(/-/g, " ");
}

function buildExample(inputPath, polysText, specText, verifyLog) {
  const gateData = parseGateLog(verifyLog);
  const polyLines = parsePolynomialFile(polysText);
  const specExpression = specText.trim();
  const outputEquations = new Map();
  const outputNames = new Set();

  for (const line of polyLines) {
    const [label] = variableTokens(line);
    if (label?.startsWith("s")) {
      outputEquations.set(label, line);
      outputNames.add(label);
    }
  }

  const gateExpressions = new Map(gateData.gatePolynomials);
  for (const [output, expression] of outputEquations.entries()) {
    gateExpressions.set(output, expression);
  }

  const allNames = new Set();
  for (const [name, expression] of gateExpressions.entries()) {
    allNames.add(name);
    for (const token of variableTokens(expression)) {
      allNames.add(token);
    }
  }

  const partialProducts = new Set(gateData.partialProducts);
  const xorGates = new Set(gateData.xorGates);
  const nodes = [...allNames]
    .filter((name) => !/^\d+$/.test(name))
    .map((name) => {
      const classification = classifyNode(name, partialProducts, xorGates, outputNames);
      return {
        id: name,
        label: name,
        type: classification.type,
        role: classification.role,
        signal: name,
        polynomial: gateExpressions.get(name) ?? `${name} is referenced by AMulet during preprocessing.`,
        stageNote: partialProducts.has(name)
          ? "Detected by AMulet as a partial product during preprocessing."
          : xorGates.has(name)
            ? "Detected by AMulet as XOR-support structure."
            : outputNames.has(name)
              ? "Output slice anchor used before specification rewriting."
              : /^[ab]\d+$/i.test(name)
                ? "Primary input used by the multiplier benchmark."
                : "Internal support gate emitted in AMulet's verbose trace."
      };
    });

  const edges = [];
  for (const [name, expression] of gateExpressions.entries()) {
    const dependencies = variableTokens(expression).filter((token) => token !== name);
    for (const dependency of dependencies) {
      edges.push({ from: dependency, to: name });
    }
  }

  const seen = new Set();
  const uniqueEdges = edges.filter((edge) => {
    const key = `${edge.from}->${edge.to}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  computeLayout(nodes, uniqueEdges);

  const label = humanizeBenchmarkName(inputPath);
  const example = {
    id: path.basename(inputPath, path.extname(inputPath)),
    label,
    title: `${label} multiplier`,
    description: `Generated from ${path.basename(inputPath)} via AMulet verbose verification and certification output.`,
    stageNote: "This benchmark is rendered from real AMulet output instead of hand-authored toy data.",
    nodes,
    edges: uniqueEdges,
    stages: []
  };

  example.stages = buildStages(example, gateData, outputEquations, specExpression);
  return example;
}

function generateExample(amuletPath, inputPath) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "circuit-demo-"));
  const polysPath = path.join(tempDir, "out.polys");
  const proofPath = path.join(tempDir, "out.proof");
  const specPath = path.join(tempDir, "out.spec");

  try {
    const verifyLog = readCommandOutput(amuletPath, ["-verify", inputPath, "-v4"]);
    readCommandOutput(amuletPath, ["-certify", inputPath, polysPath, proofPath, specPath, "-p2"]);

    const polysText = fs.readFileSync(polysPath, "utf8");
    const specText = fs.readFileSync(specPath, "utf8");
    return buildExample(inputPath, polysText, specText, verifyLog);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const examples = args.inputs.map((inputPath) => generateExample(args.amulet, inputPath));

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, `${JSON.stringify(examples, null, 2)}\n`);
  process.stdout.write(`Wrote ${examples.length} demo example(s) to ${args.out}\n`);
}

main();