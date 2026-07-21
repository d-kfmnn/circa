# Circuit Verification Demo

This repository contains a small static website intended for a tutorial on circuit verification. It is designed to work well on GitHub Pages without a build step.

## What it shows

- Two toy multiplier AIGs.
- Hover-based inspection of node-level circuit polynomials.
- A left-hand panel with the currently visible set of circuit polynomials.
- Step-by-step preprocessing stages leading up to specification rewriting.
- Optional ingestion of real AMulet benchmark outputs into the static demo.

## Run locally

Because the site is fully static, you can open `index.html` directly in a browser, or serve the folder with a tiny web server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Generate demo data from AMulet

If you have benchmark `.aig` files on disk, generate a JSON payload for the site with:

```bash
python3 scripts/generate_demo_data.py \
	--amulet /home/daniela/work/git_github_intern/amulet2/amulet \
	--substitute-final-adder \
	/path/to/benchmark1.aig /path/to/benchmark2.aig
```

This writes [data/generated/examples.json](/home/daniela/work/git_github_intern/circuit_ver_demo/data/generated/examples.json). When that file contains examples, the frontend will load them automatically instead of the built-in toy circuits.

The generator uses:

- `amulet -verify -v4` for naming, slice, partial-product, XOR, and per-gate trace data.
- `amulet -substitute` (optional via `--substitute-final-adder`) to cut out the final-stage adder before visualization and rewriting stages.
- `amulet -certify` for the polynomial set and specification polynomial.

## Publish with GitHub Pages

1. Push the repository to GitHub.
2. In the repository settings, open the Pages section.
3. Set the source to deploy from the main branch root.
4. Save, then open the published URL.