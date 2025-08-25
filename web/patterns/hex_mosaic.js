// Hex Mosaic pattern (JS port)
(function (global) {
  const { svgDoc, pointsToStr } = SvgUtils;

  function hex_center_to_point(q, r, size) {
    const x = size * (1.5 * q);
    const y = size * ((Math.sqrt(3)/2) * q + Math.sqrt(3) * r);
    return [x, y];
  }

  function hex_polygon(cx, cy, size, angle_offset_deg = -30) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI/180) * (60 * i + angle_offset_deg);
      pts.push([cx + size * Math.cos(a), cy + size * Math.sin(a)]);
    }
    return pts;
  }

  function generate_hex_mosaic_question(rng) {
    const size = rng.uniform(14, 22);
    const cols = rng.choice([5,6,7]);
    const rows = rng.choice([4,5,6]);
    const cx = 80, cy = 80;
    const flat_top = rng.random() < 0.5;
    const angle_offset = flat_top ? 0.0 : -30.0;
    const stroke_w = rng.uniform(1.5, 2.5);
    const palettes = [
      ['#888','white','#555'],
      ['#aac','#f7f7f7','#334'],
      ['#cfe3ff','#ffffff','#2a6f97'],
      ['#ffd6a5','#fff7e6','#e07a5f'],
      ['#e5ffd6','#ffffff','#2d6a4f'],
    ];
    const base_pal_idx = rng.randrange(palettes.length);

    function make_mosaic(jitter_scale = 0.0, palette_idx = null) {
      const pal = palettes[(palette_idx == null ? base_pal_idx : (palette_idx % palettes.length + palettes.length) % palettes.length)];
      const [fill_on, fill_off, motif_col] = pal;
      const off_x = cx - (cols * size * 1.5) / 2;
      const off_y = cy - (rows * size * Math.sqrt(3)) / 2;
      let idx = 0;
      const body = [];
      for (let r = 0; r < rows; r++) {
        for (let q = 0; q < cols; q++) {
          const p = hex_center_to_point(q, r, size);
          const x = p[0] + off_x + PatternRng.jitter(rng, jitter_scale);
          const y = p[1] + off_y + PatternRng.jitter(rng, jitter_scale);
          const pts = hex_polygon(x, y, size, angle_offset);
          const motif = rng.choice(['dot','line','triangle']);
          const fill = ((q + r + idx) % 3 === 0) ? fill_on : fill_off;
          body.push(`<polygon points='${pointsToStr(pts)}' fill='${fill}' stroke='#000' stroke-width='${stroke_w.toFixed(2)}'/>`);
          if (motif === 'dot') {
            body.push(`<circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='${(size*0.25).toFixed(1)}' fill='${motif_col}'/>`);
          } else if (motif === 'line') {
            body.push(`<line x1='${(x-size*0.4).toFixed(1)}' y1='${y.toFixed(1)}' x2='${(x+size*0.4).toFixed(1)}' y2='${y.toFixed(1)}' stroke='${motif_col}' stroke-width='${stroke_w.toFixed(2)}'/>`);
          } else {
            const tpts = [[x, y - size*0.3], [x - size*0.25, y + size*0.15], [x + size*0.25, y + size*0.15]];
            body.push(`<polygon points='${pointsToStr(tpts)}' fill='${motif_col}' stroke='#333' stroke-width='1' />`);
          }
          idx += 1;
        }
      }
      return body.join('');
    }

    const frames = [0,1,2].map(t => svgDoc(make_mosaic(0.0 + t*0.4)));
    const correct = svgDoc(make_mosaic(0.25));
    const w1 = svgDoc(make_mosaic(0.0));
    const w2 = svgDoc(make_mosaic(0.8));
    const w3 = svgDoc(make_mosaic(0.25, base_pal_idx + 1));

    const options = [correct, w1, w2, w3];
    const idxs = [0,1,2,3];
    rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'hex_mosaic',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Hex tessellation with palette and motif variety.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.hex_mosaic = { generate: generate_hex_mosaic_question };
})(window);

