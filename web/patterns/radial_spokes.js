// Radial Spokes pattern (JS port)
(function (global) {
  const { svgDoc } = SvgUtils;

  function generate_radial_spokes_question(rng) {
    const spokes = PatternRng.weightedChoice(rng, [[10,0.2],[12,0.4],[16,0.25],[20,0.15]]);
    const cx = 80, cy = 80;
    const outer_r = rng.uniform(60, 78);
    const base_angle = rng.uniform(0, 360);
    const step = rng.uniform(3.0, 12.0) * (1.0 + 0.3 * rng.creativity);

    function make_spokes(angle_offset = 0, width_variation = 0.5 + 2.0 * Math.max(0, rng.creativity - 0.5)) {
      const body = [];
      for (let i = 0; i < spokes; i++) {
        const a = (Math.PI/180) * (angle_offset + 360 * i / spokes + PatternRng.jitter(rng, 3));
        const x2 = cx + outer_r * Math.cos(a);
        const y2 = cy + outer_r * Math.sin(a);
        const sw = 2 + PatternRng.jitter(rng, width_variation);
        body.push(`<path d='M ${cx} ${cy} L ${x2.toFixed(1)} ${y2.toFixed(1)}' stroke='#000' stroke-width='${Math.max(1, sw).toFixed(2)}' stroke-linecap='round' opacity='0.95' />`);
      }
      return body.join('');
    }

    const frames = [0,1,2].map(t => svgDoc(make_spokes(base_angle + t * step)));
    const correct = svgDoc(make_spokes(base_angle + 3 * step));
    const w1 = svgDoc(make_spokes(base_angle));
    const w2 = svgDoc(make_spokes(base_angle + 2 * step));
    const w3 = svgDoc(make_spokes(base_angle + 3 * step + 2));

    const options = [correct, w3, w1, w2];
    const idxs = [0,1,2,3];
    rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'radial_spokes',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Spokes rotate with per-spoke jitter and width variation.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.radial_spokes = { generate: generate_radial_spokes_question };
})(window);

