# Circuit Verification Demo

This repository contains a small static website intended for a tutorial on circuit verification. It is designed to work well on GitHub Pages without a build step.

## What it shows

- Real AMulet2 runs on multiplier AIGs from 2 to 64 bits (sp-ar-rc-64 has ~48k gates), with two toy multipliers as a fallback.
- Hover-based inspection of node-level circuit polynomials.
- A left-hand panel with the currently visible set of circuit polynomials.
- Step-by-step preprocessing stages leading up to specification rewriting.
- Specification rewriting gate by gate: the current specification polynomial on top, and below it the circuit with a dashed cut line that moves down past each gate as it is substituted.
- Optional ingestion of real AMulet benchmark outputs into the static demo.

## Run locally

Because the site is fully static, you can open `index.html` directly in a browser, or serve the folder with a tiny web server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Generate demo data from AMulet

If you have benchmark `.aig` files on disk, generate the site's data with:

```bash
python3 scripts/generate_demo_data.py \
	--amulet /home/daniela/work/git_github_intern/amulet2/amulet \
	/path/to/benchmark1.aig /path/to/benchmark2.aig
```

The committed data is all of `circuits/`, in this order. The picker shows the correct sp-ar-rc multipliers (`sp-ar-rc-<n>`) in a second row and everything else in the first, each row in argument order:

```bash
python3 scripts/generate_demo_data.py --amulet <amulet> \
	circuits/btor2.aig circuits/bp-os-cu-4.aig circuits/bp-wt-cl-4.aig \
	circuits/sp-dt-lf-4.aig circuits/sp-ar-rc-4_faulty.aig \
	circuits/sp-ar-rc-4.aig circuits/sp-ar-rc-8.aig circuits/sp-ar-rc-16.aig circuits/sp-ar-rc-32.aig circuits/sp-ar-rc-64.aig
```

`<amulet>` must be built with the demo's verbose instrumentation (per-gate `print_gate_constraint` / `print_all_gate_constraints` output, kept in a stash of the amulet2 checkout). A stock build still runs, but its stages come out different (no "Eliminate internal xor gates" stage, for example).

This writes [data/generated/examples.json](data/generated/examples.json), a small manifest, plus one file per circuit in [data/generated/examples/](data/generated/examples/). The site loads the manifest and fetches each circuit only when it is selected, so the large ones (sp-ar-rc-64 is ~34 MB) are not downloaded up front. Each manifest entry links its file with a content hash, so regenerated circuits are not served stale from cache. Circuit files left over from a previous run are removed. When the manifest is present, the frontend uses it instead of the built-in toy circuits.

Graph layout: circuits with up to 3000 AND gates are laid out by Graphviz `dot`. Above that `dot` is far too slow (sp-ar-rc-32 does not finish in 10+ minutes), so the generator uses its own layered layout instead: inputs at the bottom, outputs just above the gates that drive them, straight edges. Pass `--layout dot` or `--layout layered` to force either one.

The generator uses:

- `amulet -verify -v4` for naming, partial-product, XOR, per-gate and rewriting trace data.
- `amulet -substitute` (optional via `--substitute-final-adder`) to cut out the final-stage adder before visualization and rewriting stages.
- `amulet -certify` for the polynomial set and specification polynomial.

AMulet rewrites the specification slice by slice and only logs the part it has started on. The generator turns that into one rewrite of the whole polynomial (no slices): per step it stores the gate substituted and the resulting change to the polynomial, and it checks every step is exactly that substitution (modulo 2^(2n), as AMulet reduces coefficients) before writing anything.

## Publish with GitHub Pages

1. Push the repository to GitHub.
2. In the repository settings, open the Pages section.
3. Set the source to deploy from the main branch root.
4. Save, then open the published URL.

Before committing a change to `main.js` or `styles.css`, run `python3 scripts/stamp_asset_versions.py`. It updates the `?v=` content hash on both references in `index.html`. Without it, GitHub Pages' 10-minute caching can leave visitors with the new HTML but the old JS/CSS.