// Checkerboard pattern (JS port)
(function (global) {
  const { svgDoc } = SvgUtils;
  const { jitter } = PatternRng;

  function make_cells(rows, cols, cell_w, rng, jit = 0.0, dark = '#333', light = '#ddd') {
    const body = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cell_w;
        const y = r * cell_w;
        const jx = jitter(rng, jit) * cell_w;
        const jy = jitter(rng, jit) * cell_w;
        const rot = jitter(rng, 15);
        const fill = ((r + c) % 2 === 0) ? light : dark;
        body.push(
          `<g transform='translate(${(x + jx).toFixed(1)},${(y + jy).toFixed(1)}) rotate(${rot.toFixed(2)})'>`+
          `<rect x='0' y='0' width='${cell_w.toFixed(1)}' height='${cell_w.toFixed(1)}' fill='${fill}' stroke='black' stroke-width='1'/>`+
          `</g>`
        );
      }
    }
    return body.join('');
  }

  function generate_checkerboard_question(rng) {
    const rows = rng.choice([6,8,10]);
    const cols = rows;
    const cell_w = 160 / cols;
    const jit = 0.04 + rng.creativity * rng.uniform(0.08, 0.18);
    const dark = rng.choice(['#333','#222','#444']);
    const light = rng.choice(['#ddd','#eee','#ccc']);

    const frames = [];
    for (let t = 0; t < 3; t++) {
      const b = make_cells(rows, cols, cell_w, rng, jit * (0.5 + 0.5 * t), dark, light);
      frames.push(svgDoc(b));
    }
    const correct = svgDoc(make_cells(rows, cols, cell_w, rng, jit, dark, light));
    const w1 = svgDoc(make_cells(rows, cols, cell_w, rng, 0.0, dark, light));
    const w2 = svgDoc(make_cells(rows, cols, cell_w, rng, jit * 2.0, dark, light));
    const w3 = svgDoc(make_cells(rows, cols, cell_w, rng, jit, '#555', light));

    const options = [correct, w1, w2, w3];
    const idxs = [0,1,2,3];
    rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'checkerboard',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Checkerboard with per-cell jitter/rotation and two-tone palette.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.checkerboard = { generate: generate_checkerboard_question };
})(window);

