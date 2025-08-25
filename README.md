# Pattern Questions (Browser)

This repository is a browser-only HTML/JavaScript app that generates multiple-choice visual sequence questions entirely on the client.

Quick highlights

- Single-page client-side app: open `web/index.html` in a modern browser.
- Deterministic generation: use the Seed input for reproducible output.
- Creativity control: the Creativity input tweaks variation (0.0–1.0).
- Pattern selection: choose a specific pattern from the dropdown or pick the built-in "Random" option to let the generator pick.

Running locally

Option 1 — Open the file directly

- Double-click `web/index.html` or use your browser's "Open File" command. Some browsers restrict local file access for complex features — if you see missing behavior, use the static server option below.

Option 2 — Serve a static server (recommended)

```bash
cd web
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Key files

- `web/index.html` — main UI and layout.
- `web/js/app.js` — UI wiring, parameter handling, and DOM updates.
- `web/js/local_generator.js` — orchestrator and registry that picks/filters pattern generators.
- `web/js/rng_utils.js` — seeded RNG utilities for deterministic behavior.
- `web/js/svg_utils.js` — helpers for building SVG markup used by patterns.
- `web/patterns/*.js` — individual pattern generator modules.

URL parameters

You can preset the UI via URL parameters:

- `pattern_type` — force a named pattern (omit or use empty for Random).
- `pattern_seed` — seed string/int for deterministic generation.
- `pattern_creativity` — float (0.0–1.0) for creativity.

Example:

```text
http://localhost:8000/?pattern_type=spiral_creative&pattern_seed=42&pattern_creativity=0.7
```

Extending patterns

Add a new pattern module under `web/patterns/` and register it in `web/js/local_generator.js`'s `registry` object to make it available in the dropdown.

Contributing

File a pull request with a new pattern and a short demo page or screenshots. Keep generators deterministic given the RNG and seed where possible so samples are reproducible.

License

See the root `LICENSE` or project metadata for licensing details.
