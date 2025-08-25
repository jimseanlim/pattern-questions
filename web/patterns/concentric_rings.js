// Concentric Rings pattern (JS port)
(function (global) {
  const { svgDoc } = SvgUtils;

  function generate_concentric_rings_question(rng) {
    const rings = PatternRng.weightedChoice(rng, [[4,0.35],[5,0.35],[6,0.2],[7,0.1]]);
    const cx = 80, cy = 80;
    const max_r = rng.uniform(60, 78);
    const ring_width = max_r / (rings * rng.uniform(1.05, 1.25));
    const dash_base = Math.floor(rng.uniform(3, 8));

    const bodyFrames = [];
    for (let t = 0; t < 3; t++) {
      const body = [];
      for (let i = 0; i < rings; i++) {
        const r = max_r - i * ring_width;
        let dash = '';
        if ((i + Math.floor(rng.uniform(0,2))) % 2 === 0 && rng.random() < 0.6) {
          dash = ` stroke-dasharray='${dash_base + i} ${dash_base + i}'`;
        }
        const opacity = 1.0 - (i / rings) * 0.6;
        body.push(`<circle cx='${cx}' cy='${cy}' r='${r.toFixed(1)}' fill='none' stroke='#000' stroke-width='${(ring_width*0.9).toFixed(2)}'${dash} opacity='${opacity.toFixed(2)}'/>`);
      }
      bodyFrames.push(svgDoc(body.join('')));
    }

    const correctBody = [];
    for (let i = 0; i < rings; i++) {
      const r = max_r - i * ring_width;
      correctBody.push(`<circle cx='${cx}' cy='${cy}' r='${r.toFixed(1)}' fill='none' stroke='#000' stroke-width='${(ring_width*0.9).toFixed(2)}' opacity='${(1.0 - (i / rings) * 0.6).toFixed(2)}'/>`);
    }
    const correct = svgDoc(correctBody.join(''));
    const w1 = svgDoc(Array.from({length: rings}, (_,i) => `<circle cx='${cx}' cy='${cy}' r='${(max_r - i*ring_width).toFixed(1)}' fill='none' stroke='#000' stroke-width='${(ring_width*0.8).toFixed(2)}' opacity='${(1.0 - (i / rings) * 0.6).toFixed(2)}'/>`).join(''));
    const w2 = svgDoc(Array.from({length: rings}, (_,i) => `<circle cx='${cx}' cy='${cy}' r='${((max_r - i*ring_width) * (0.9 + 0.1*rng.random())).toFixed(1)}' fill='none' stroke='#000' stroke-width='${(ring_width*0.9).toFixed(2)}' opacity='0.9'/>`).join(''));
    const w3 = svgDoc(Array.from({length: rings}, (_,i) => `<circle cx='${(cx + PatternRng.jitter(rng, 4)).toFixed(1)}' cy='${(cy + PatternRng.jitter(rng, 4)).toFixed(1)}' r='${(max_r - i*ring_width).toFixed(1)}' fill='none' stroke='#000' stroke-width='${(ring_width*0.9).toFixed(2)}' opacity='0.9'/>`).join(''));

    const options = [correct, w1, w2, w3];
    const idxs = [0,1,2,3];
    rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'concentric_rings',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...bodyFrames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Alternating rings with optional dash and small radial noise.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.concentric_rings = { generate: generate_concentric_rings_question };
})(window);

