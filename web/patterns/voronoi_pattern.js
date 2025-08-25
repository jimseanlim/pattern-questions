// Voronoi pattern (JS port, raster approximation)
(function (global) {
  const { svgDoc } = SvgUtils;

  function l2(a,b){ const dx=a[0]-b[0], dy=a[1]-b[1]; return dx*dx+dy*dy; }

  function lloyd_relax(points, bounds, iterations){
    const [w,h] = bounds; let pts = points.slice();
    for (let it=0; it<iterations; it++) {
      const cells = Array.from({length: pts.length}, () => []);
      for (let x=0; x<160; x+=8) {
        for (let y=0; y<160; y+=8) {
          let dmin = Infinity, idx = 0;
          for (let i=0;i<pts.length;i++) {
            const d = l2([x,y], pts[i]);
            if (d < dmin) { dmin = d; idx = i; }
          }
          cells[idx].push([x,y]);
        }
      }
      const np = [];
      for (let i=0;i<cells.length;i++){
        const cell = cells[i];
        if (cell.length === 0) { np.push(pts[i]); }
        else {
          let sx=0, sy=0; for (const p of cell){ sx+=p[0]; sy+=p[1]; }
          np.push([sx/cell.length, sy/cell.length]);
        }
      }
      pts = np;
    }
    return pts;
  }

  function generate_voronoi_pattern_question(rng) {
    const n = rng.randrange(6, 12);
    let pts = Array.from({length:n}, () => [rng.random()*140+10, rng.random()*140+10]);
    pts = lloyd_relax(pts, [160,160], rng.choice([1,2,3]));

    function render_cells(points, perturb=0.0, palette_shift=0) {
      const palettes = [
        ['#f0a', '#0af', '#fa0', '#0f8', '#888', '#c0c'],
        ['#222', '#555', '#888', '#bbb', '#eee', '#000'],
        ['#e63946','#f1fa8c','#a8dadc','#457b9d','#1d3557','#2a9d8f'],
      ];
      let color_pool = rng.choice(palettes).slice();
      if (palette_shift) {
        const d = palette_shift % color_pool.length;
        color_pool = color_pool.slice(d).concat(color_pool.slice(0,d));
      }
      const body = [];
      const step = rng.choice([4,5,6,8]);
      for (let x=0; x<160; x+=step) {
        for (let y=0; y<160; y+=step) {
          let dmin = Infinity, idx = 0;
          for (let i=0;i<points.length;i++) {
            const d = l2([x+PatternRng.jitter(rng,perturb), y+PatternRng.jitter(rng,perturb)], points[i]);
            if (d < dmin) { dmin = d; idx = i; }
          }
          const c = color_pool[idx % color_pool.length];
          body.push(`<rect x='${x}' y='${y}' width='${step}' height='${step}' fill='${c}' stroke='none'/>`);
        }
      }
      return body.join('');
    }

    const frames = [0,1,2].map(t => svgDoc(render_cells(pts, 0.0 + t*0.2)));
    const correct = svgDoc(render_cells(pts, 0.1, 0));
    const similar = svgDoc(render_cells(pts, 0.1, 1));
    const w1 = svgDoc(render_cells(pts, 0.0, 2));
    const w2 = svgDoc(render_cells(pts, 0.4, 3));

    const options = [correct, similar, w1, w2];
    const idxs = [0,1,2,3]; rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'voronoi',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Voronoi regions with mild Lloyd relaxation and perturbation.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.voronoi = { generate: generate_voronoi_pattern_question };
})(window);

