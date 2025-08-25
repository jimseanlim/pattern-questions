// Moire pattern (JS port)
(function (global) {
  const { svgDoc } = SvgUtils;

  function line_grid(angle_deg, spacing, opts={}) {
    const stroke = opts.stroke || '#000';
    const opacity = opts.opacity ?? 0.6;
    const stroke_width = opts.stroke_width ?? 1.0;
    const translate = opts.translate || [0,0];
    const extent = opts.extent ?? 220.0;
    const ang = (Math.PI/180) * angle_deg;
    const [tx, ty] = translate;
    const body = [];
    const count = Math.floor((extent * 2) / Math.max(1.0, spacing)) + 8;
    for (let i = -Math.floor(count/2); i <= Math.floor(count/2); i++) {
      const offset = i * spacing;
      const x1 = 80 + tx + offset * Math.cos(ang) - extent * Math.sin(ang);
      const y1 = 80 + ty + offset * Math.sin(ang) + extent * Math.cos(ang);
      const x2 = 80 + tx + offset * Math.cos(ang) + extent * Math.sin(ang);
      const y2 = 80 + ty + offset * Math.sin(ang) - extent * Math.cos(ang);
      body.push(`<line x1='${x1.toFixed(1)}' y1='${y1.toFixed(1)}' x2='${x2.toFixed(1)}' y2='${y2.toFixed(1)}' stroke='${stroke}' stroke-width='${stroke_width.toFixed(2)}' opacity='${opacity}'/>`);
    }
    return body.join('');
  }

  function generate_moire_question(rng) {
    const a1 = rng.uniform(0, 10);
    const a2 = a1 + rng.uniform(1.5, 8.0);
    const s1 = rng.uniform(5.0, 9.0);
    const s2 = Math.max(3.5, s1 + rng.uniform(-1.5, 2.5));
    const step = rng.uniform(0.4, 1.2);
    const pal = rng.choice(['#555', '#666', '#333', '#0a0', '#06c']);
    const sw1 = rng.uniform(0.9, 1.6), sw2 = rng.uniform(0.8, 1.4);
    const op1 = rng.uniform(0.5, 0.8), op2 = rng.uniform(0.45, 0.7);
    const dx2 = rng.uniform(-6, 6), dy2 = rng.uniform(-6, 6);

    const frames = [0,1,2].map(t => svgDoc(line_grid(a1 + t*step, s1, { stroke_width: sw1, opacity: op1 })));
    const correct = svgDoc(
      line_grid(a1 + 3*step, s1, { stroke_width: sw1, opacity: op1 }) +
      line_grid(a2 + 3*step, s2, { stroke: pal, stroke_width: sw2, opacity: op2, translate: [dx2, dy2] })
    );
    const w1 = svgDoc(
      line_grid(a1 + 2*step, s1, { stroke_width: sw1, opacity: op1 }) +
      line_grid(a2 + 2*step, s2, { stroke: pal, stroke_width: sw2, opacity: op2, translate: [dx2, dy2] })
    );
    const w2 = svgDoc(line_grid(a1 + 5*step, s1, { stroke_width: sw1, opacity: op1 }));
    const w3 = svgDoc(
      line_grid(a1 + 3*step, s1, { stroke_width: sw1, opacity: op1 }) +
      line_grid(a2 + 3*step + 1.2, s2, { stroke: pal, stroke_width: sw2, opacity: op2, translate: [dx2 + 3, dy2 - 2] })
    );

    const options = [correct, w3, w1, w2];
    const idxs = [0,1,2,3]; rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'moire',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Two layered line grids with randomized angles, spacing, stroke, and offsets.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.moire = { generate: generate_moire_question };
})(window);

