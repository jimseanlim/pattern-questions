// Scatter Symbols pattern (JS port)
(function (global) {
  // helpers
  function gauss(rng, mean = 0, sd = 1) {
    // Box-Muller transform
    let u = 0, v = 0;
    while (u === 0) u = rng.random();
    while (v === 0) v = rng.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * sd + mean;
  }

  function randint(rng, a, b) {
    const span = b - a + 1;
    return Math.floor(rng.random() * span) + a;
  }

  function generate_scatter_symbols_question(rng) {
    const symbols = ['circle', 'triangle', 'square'];
    const cluster_count = rng.choice([2, 3, 4]);
    const palettes = [
      ['#444', '#666', '#555'],
      ['#0a0', '#06c', '#555'],
      ['#222', '#444', '#666'],
    ];
    const palette = rng.choice(palettes);
    const [col_circle, col_tri, col_sq] = palette;

    const clusters = [];
    for (let i = 0; i < cluster_count; i++) {
      clusters.push([rng.random() * 120 + 20, rng.random() * 120 + 20, rng.random() * 20 + 8]);
    }

    const points = [];
    const n_points = randint(rng, 50, 80);
    for (let i = 0; i < n_points; i++) {
      const c = rng.choice(clusters);
      const angle = rng.random() * 2 * Math.PI;
      const r = Math.abs(gauss(rng, 0, 1)) * c[2];
      const x = c[0] + r * Math.cos(angle) + PatternRng.jitter(rng, 4);
      const y = c[1] + r * Math.sin(angle) + PatternRng.jitter(rng, 4);
      const sym = rng.choice(symbols);
      points.push([x, y, sym]);
    }

    function render(shift = 0.0) {
      const body = [];
      for (let i = 0; i < points.length; i++) {
        const [x, y, sym] = points[i];
        if (sym === 'circle') {
          const r = rng.uniform(3, 5);
          body.push(`<circle cx='${(x + shift).toFixed(1)}' cy='${y.toFixed(1)}' r='${r.toFixed(1)}' fill='${col_circle}'/>`);
        } else if (sym === 'triangle') {
          const s = rng.uniform(6, 8);
          body.push(`<polygon points='${x.toFixed(1)},${(y - s/2).toFixed(1)} ${(x - s*0.5).toFixed(1)},${(y + s/2).toFixed(1)} ${(x + s*0.5).toFixed(1)},${(y + s/2).toFixed(1)}' fill='${col_tri}'/>`);
        } else {
          const s = rng.uniform(5, 7);
          body.push(`<rect x='${(x - s/2).toFixed(1)}' y='${(y - s/2).toFixed(1)}' width='${s.toFixed(1)}' height='${s.toFixed(1)}' fill='${col_sq}'/>`);
        }
      }
      return SvgUtils.svgDoc(body.join(''));
    }

    const frames = [render(0.0), render(1.5), render(3.0)];
    // In Python original code frames = [0.0, 1.5, 3.0] then correct shift=3.0
    // but to keep similar behavior we'll produce first 3 frames with small incremental shifts
    // and correct at shift=3.0 as in the Python version
    const correct = render(3.0);
    // similar: same layout, color tweak for circle
    // escape col_circle for regex
    const esc = col_circle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const similar = correct.replace(new RegExp(esc, 'g'), '#222');
    const incorrect1 = render(0.0);
    const incorrect2 = render(6.0);

    const options = [correct, similar, incorrect1, incorrect2];
    rng.shuffle(options);
    const letters = ['A', 'B', 'C', 'D'];
    const correct_letter = letters[options.indexOf(correct)];

    return {
      type: 'scatter_symbols',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [frames[0], frames[1], frames[2], ''],
      option_svgs: options,
      correct: correct_letter,
      rationale: 'Scatter of small motifs with cluster seeds and Gaussian dispersion.'
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.scatter_symbols = { generate: generate_scatter_symbols_question };
})(window);
