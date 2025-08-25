// Orchestrator in JS: registry + generateQuestion()
(function (global) {
  const registry = {
    polygon_tokens: () => global.Patterns.polygon_tokens.generate,
    spiral_creative: () => global.Patterns.spiral_creative.generate,
    checkerboard: () => global.Patterns.checkerboard.generate,
    concentric_rings: () => global.Patterns.concentric_rings.generate,
    hex_mosaic: () => global.Patterns.hex_mosaic.generate,
    kaleidoscope: () => global.Patterns.kaleidoscope.generate,
    lsystem_fractal: () => global.Patterns.lsystem_fractal.generate,
    moire: () => global.Patterns.moire.generate,
    octagon_fusion: () => global.Patterns.octagon_fusion.generate,
    pentagon_triangle: () => global.Patterns.pentagon_triangle.generate,
    perlin_grid: () => global.Patterns.perlin_grid.generate,
    pinwheel_spiral: () => global.Patterns.pinwheel_spiral.generate,
    radial_spokes: () => global.Patterns.radial_spokes.generate,
    sequence_stack: () => global.Patterns.sequence_stack.generate,
    sierpinski: () => global.Patterns.sierpinski.generate,
    symbol_row: () => global.Patterns.symbol_row.generate,
    voronoi: () => global.Patterns.voronoi.generate,
    scatter_symbols: () => global.Patterns.scatter_symbols.generate,
  };

  const letters = ["A", "B", "C", "D"];
  const _RECENT = [];
  const _SEEN_SIGS = new Set();

  function optionsAreUnique(option_svgs) {
    if (!option_svgs || option_svgs.length !== 4) return false;
    const trimmed = option_svgs.map(s => (s || "").trim());
    if (trimmed.some(s => !s)) return false;
    return new Set(trimmed).size === 4;
  }

  function questionSignature(q) {
    const frames = (q.frame_svgs || q.frames || []).slice(0, 3).map(s => (s || "").trim());
    const opts = q.option_svgs || [];
    const corrLetter = q.correct;
    const idx = letters.indexOf(corrLetter);
    const corrSvg = (idx >= 0 && idx < opts.length) ? (opts[idx] || "").trim() : "";
    const t = (q.type || q.pattern || "").trim();
    return [t, ...frames, corrSvg].join("|");
  }

  function chooseWeighted(rng, pairs) {
    return PatternRng.weightedChoice(rng, pairs);
  }

  // Fallback generator used when a pattern module isn't loaded or doesn't
  // expose a proper `generate` function. Returns a simple, valid question
  // with distinct option SVGs so the orchestrator can continue.
  function missingGenerator(key) {
    return function (rng) {
      const W = 160, H = 160;
      const make = (ch) => (`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' width='${W}' height='${H}'>`+
                            `<rect x='0' y='0' width='${W}' height='${H}' fill='white' stroke='#ddd'/>`+
                            `<text x='50%' y='52%' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='#999'>${ch}</text>`+
                            `</svg>`);
      const frames = [make('1'), make('2'), make('3')];
      const opts = [make('A'), make('B'), make('C'), make('D')];
      const letters = ['A','B','C','D'];
      return {
        type: key,
        question: `Pattern "${key}" not loaded; showing placeholder.`,
        frame_svgs: [...frames, ''],
        option_svgs: opts,
        correct: letters[rng ? (rng._seed_int % 4) : 0],
        rationale: 'Placeholder generated because the requested pattern module was unavailable.'
      };
    };
  }

  function getRegisteredKeys() {
    return Object.keys(registry);
  }

  function pickGenerator(rng, forcedType) {
    let chosen;
    if (forcedType && registry[forcedType]) {
      chosen = forcedType;
    } else {
      if (rng.creativity >= 0.5) {
        const choices = [
          ["spiral_creative", 2.5],
          ["kaleidoscope", 1.8],
          ["moire", 1.5],
          ["lsystem_fractal", 1.4],
          ["pinwheel_spiral", 1.2],
          ["perlin_grid", 1.0],
          ["voronoi", 1.0],
          ["hex_mosaic", 0.9],
          ["concentric_rings", 0.8],
          ["radial_spokes", 0.8],
          ["checkerboard", 0.6],
          ["sierpinski", 0.5],
          ["sequence_stack", 0.5],
          ["scatter_symbols", 0.5],
          ["polygon_tokens", 1.0],
          ["symbol_row", 0.9],
          ["pentagon_triangle", 0.9],
          ["octagon_fusion", 0.9],
        ];
        for (let i = 0; i < 6; i++) {
          const k = chooseWeighted(rng, choices);
          if (!_RECENT.includes(k)) { chosen = k; break; }
        }
        if (!chosen) chosen = choices[0][0];
      } else {
        const keys = getRegisteredKeys();
        for (let i = 0; i < 6; i++) {
          const k = rng.choice(keys);
          if (!_RECENT.includes(k)) { chosen = k; break; }
        }
        if (!chosen) chosen = rng.choice(getRegisteredKeys());
      }
    }
    if (_RECENT.push(chosen) > 2) _RECENT.shift();
    // Call the registry entry to obtain the generator function. If the
    // module hasn't been loaded yet or doesn't expose a function at
    // `generate`, fall back to a safe placeholder generator so the UI
    // doesn't throw when attempting to call `.generate` on undefined.
    try {
      const maybeGen = registry[chosen] && registry[chosen]();
      if (typeof maybeGen === 'function') return { key: chosen, gen: maybeGen };
    } catch (e) {
      // fall through to fallback
    }
    return { key: chosen, gen: missingGenerator(chosen) };
  }

  function generateQuestion(rng, forcedType) {
    const { key, gen } = pickGenerator(rng, forcedType);
    let last = null;
    for (let attempts = 0; attempts < 32; attempts++) {
      const q = gen(rng);
      last = q;
      const opts = q.option_svgs || [];
      if (optionsAreUnique(opts)) {
        const sig = questionSignature(q);
        if (!_SEEN_SIGS.has(sig)) {
          _SEEN_SIGS.add(sig);
          q.type = q.type || key;
          q.seed = rng._seed_repr;
          q.seed_int = rng._seed_int;
          q.creativity = rng.creativity;
          return q;
        }
      }
    }
    // Fallback
    if (last) {
      last.type = last.type || key;
      last.seed = rng._seed_repr;
      last.seed_int = rng._seed_int;
      last.creativity = rng.creativity;
      return last;
    }
    const q = gen(rng);
    q.type = q.type || key;
    q.seed = rng._seed_repr;
    q.seed_int = rng._seed_int;
    q.creativity = rng.creativity;
    return q;
  }

  global.BrowserOrchestrator = { generateQuestion, getRegisteredKeys };
})(window);

