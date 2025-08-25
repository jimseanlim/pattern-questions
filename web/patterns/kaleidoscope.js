// Kaleidoscope pattern (JS port)
(function (global) {
  const { svgDoc } = SvgUtils;

  function generate_kaleidoscope_question(rng) {
    const sectors = rng.choice([6,8,10,12]);
    const base_lines = [];
    const n_lines = Math.floor(rng.uniform(4,9));
    const base_angle = rng.uniform(0,360);
    const step = rng.uniform(6,18);
    const add_dots = rng.random() < 0.5;
    const stroke_w = rng.uniform(1.6, 2.6);
    for (let i=0; i<n_lines; i++) {
      const dx1 = rng.uniform(-28,28) + PatternRng.jitter(rng,10);
      const dy1 = rng.uniform(-28,28) + PatternRng.jitter(rng,10);
      const dx2 = rng.uniform(-28,28) + PatternRng.jitter(rng,10);
      const dy2 = rng.uniform(-28,28) + PatternRng.jitter(rng,10);
      const x1 = 80 + dx1, y1 = 80 + dy1;
      const x2 = 80 + dx2, y2 = 80 + dy2;
      base_lines.push([x1,y1,x2,y2]);
    }

    function render_variant(mirror=false, angle_offset=0) {
      const body = [];
      for (let a=0; a<sectors; a++) {
        const rot = angle_offset + 360 * a / sectors;
        const ra = (Math.PI/180)*rot;
        for (const [x1,y1,x2,y2] of base_lines) {
          function rotp(x,y) {
            const dx = x-80, dy = y-80;
            let rx = dx*Math.cos(ra) - dy*Math.sin(ra);
            let ry = dx*Math.sin(ra) + dy*Math.cos(ra);
            if (mirror && (a%2===1)) rx = -rx;
            return [80+rx, 80+ry];
          }
          const p1 = rotp(x1,y1);
          const p2 = rotp(x2,y2);
          body.push(`<line x1='${p1[0].toFixed(1)}' y1='${p1[1].toFixed(1)}' x2='${p2[0].toFixed(1)}' y2='${p2[1].toFixed(1)}' stroke='#000' stroke-width='${stroke_w.toFixed(2)}'/>`);
          if (add_dots) {
            const mx = (x1+x2)/2, my=(y1+y2)/2; const pm = rotp(mx,my);
            body.push(`<circle cx='${pm[0].toFixed(1)}' cy='${pm[1].toFixed(1)}' r='2' fill='#444'/>`);
          }
        }
      }
      return body.join('');
    }

    const frames = [0,1,2].map(t => svgDoc(render_variant(true, base_angle + t*step)));
    const correct = svgDoc(render_variant(true, base_angle + 3*step));
    const w1 = svgDoc(render_variant(false, base_angle + 3*step));
    const w2 = svgDoc(render_variant(true, base_angle + 3*step - 7));
    const w3 = svgDoc(render_variant(true, base_angle + 3*step + 12));

    const options = [correct, w2, w1, w3];
    const idxs = [0,1,2,3]; rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'kaleidoscope',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Mirrored sector tiling with randomized motifs and rotation phase.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.kaleidoscope = { generate: generate_kaleidoscope_question };
})(window);

