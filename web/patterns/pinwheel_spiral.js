// Pinwheel Spiral pattern (JS port)
(function (global) {
  const { svgDoc } = SvgUtils;

  function generate_pinwheel_spiral_question(rng) {
    const turns = rng.choice([3,4,5,6]);
    const n = turns * rng.choice([16,18,20]);
    const cx = 80, cy = 80;
    const bodyElems = [];
    const stroke_w = rng.uniform(0.8, 1.6);
    const col = rng.choice(['#000','#111','#222']);
    for (let i=0;i<n;i++) {
      const t = i / n;
      const angle = t * turns * 2 * Math.PI + PatternRng.jitter(rng, 0.3);
      const r = 5 + t * rng.uniform(60, 80);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      const s = 6 + t * rng.uniform(5, 8);
      const pts = [[x, y - s], [x - s*0.6, y + s*0.5], [x + s*0.6, y + s*0.5]];
      bodyElems.push(`<polygon points='${pts.map(p=>`${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}' fill='none' stroke='${col}' stroke-width='${stroke_w.toFixed(1)}'/>`);
    }
    const frames = [0.25,0.5,0.75].map(f => svgDoc(bodyElems.slice(0, Math.floor(bodyElems.length*f)).join('')));
    const correct = svgDoc(bodyElems.join(''));
    const similar = svgDoc(bodyElems.slice(0, Math.floor(bodyElems.length*0.9)).join(''));
    const w1 = svgDoc(bodyElems.slice(0, Math.floor(bodyElems.length*0.6)).join(''));
    const w2 = correct.replace(/stroke/g,'#555');
    const options = [correct, similar, w1, w2];
    const idxs = [0,1,2,3]; rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'pinwheel_spiral',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Triangles placed along a spiral path.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.pinwheel_spiral = { generate: generate_pinwheel_spiral_question };
})(window);

