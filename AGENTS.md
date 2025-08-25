# Repository Guidelines

## Project Structure & Module Organization
- `app.py`: PyQt6 GUI entry point.
- `local_generator.py`: Orchestrates pattern selection via `PATTERN_REGISTRY` and `generate_question()`.
- Pattern modules (e.g., `polygon_tokens.py`, `symbol_row.py`, `spiral_creative.py`, …): Each exposes `generate_<name>_question(rng)` returning frames, options, and the correct answer.
- Utilities: `svg_utils.py` (SVG helpers), `rng_utils.py` (seed/creativity), `requirements.txt` (runtime deps), `.env.example` (config reference).

## Build, Test, and Development Commands
- Install: `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
- Run: `python app.py`
- Reproducible run (example): `PATTERN_TYPE=polygon_tokens PATTERN_SEED=42 PATTERN_CREATIVITY=0.3 python app.py`
  - Env vars: `PATTERN_TYPE` selects a generator; `PATTERN_SEED` fixes randomness; `PATTERN_CREATIVITY` ∈ [0.0–1.0] biases more creative generators at ≥0.5.

## Coding Style & Naming Conventions
- Follow PEP 8; 4-space indentation; line length ~100.
- Files/modules: `snake_case.py`; functions: `snake_case`; classes: `CapWords`.
- Type hints encouraged (see `app.py`, `rng_utils.py`).
- New generator: name function `generate_<name>_question(rng)` and register it in `PATTERN_REGISTRY` in `local_generator.py`.
- Return shape for generators:
  - Keys: `question`, `frame_svgs` (list of 4 with the 4th blank), `option_svgs` (4), `correct` ("A".."D"). Optionally `rationale`, `seed`, `creativity`.

## Testing Guidelines
- No test suite yet. Prefer pure, small functions in modules and manually verify via seeded runs.
- If adding tests, use `pytest` under `tests/` with `test_*.py` files; aim for logic (not GUI) coverage. Example: `pytest -q`.

## Commit & Pull Request Guidelines
- Commits: use clear, imperative messages; Conventional Commits are welcome (e.g., `feat: add voronoi generator`, `fix: correct SVG viewBox`).
- PRs must include:
  - What/why summary and linked issue (if any).
  - Repro details: exact command and env vars (e.g., `PATTERN_TYPE`, `PATTERN_SEED`, `PATTERN_CREATIVITY`).
  - Visuals: screenshot of the 3-frame sequence + options.
  - Scope: keep diffs focused; update `PATTERN_REGISTRY` and docs when adding generators.

## Agent-Specific Instructions
- Adding a new pattern:
  - Implement `generate_<name>_question(rng)` that returns the structure above using helpers from `svg_utils.py`.
  - Register it in `PATTERN_REGISTRY` and, if applicable, adjust creative weights in `local_generator.py`.
  - Validate with a fixed seed and include a rationale explaining the rule.
