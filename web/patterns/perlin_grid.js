// Perlin-like Grid pattern (JS port; simple smoothed noise)
(function (global) {
  const { svgDoc } = SvgUtils;

  function smooth_random_grid(w, h, rng) {
    let grid = Array.from({length: h}, () => Array.from({length: w}, () => rng.random()));
    for (let k=0; k<3; k++) {
      const ng = Array.from({length: h}, () => Array.from({length: w}, () => 0));
      for (let y=0; y<h; y++) {
        for (let x=0; x<w; x++) {
          let s=0, c=0;
          for (let dy=-1; dy<=1; dy++) {
            for (let dx=-1; dx<=1; dx++) {
              const nx = Math.min(Math.max(x+dx,0),w-1);
              const ny = Math.min(Math.max(y+dy,0),h-1);
              s += grid[ny][nx]; c++;
            }
          }
          ng[y][x] = s/c;
        }
      }
      grid = ng;
    }
    return grid;
  }

  function generate_perlin_grid_question(rng) {
    const gw = rng.choice([8, 10, 12]);
    const gh = rng.choice([8, 10, 12]);
    const grid = smooth_random_grid(gw, gh, rng);
    const points = [];
    const cell = 160 / gw;
    for (let y=0; y<gh; y++) {
      for (let x=0; x<gw; x++) {
        const px = x*cell + cell/2 + PatternRng.jitter(rng, cell*0.2);
        const py = y*cell + cell/2 + PatternRng.jitter(rng, cell*0.2);
        const val = grid[y][x];
        points.push([px, py, val]);
      }
    }

    function render_lines(thresh=0.4) {
      const body = [];
      for (const [x,y,v] of points) {
        if (v > thresh) {
          body.push(`<circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='${rng.uniform(3,5).toFixed(1)}' fill='#000'/>`);
        } else {
          const s = rng.uniform(5,7);
          body.push(`<rect x='${(x-s/2).toFixed(1)}' y='${(y-s/2).toFixed(1)}' width='${s.toFixed(1)}' height='${s.toFixed(1)}' fill='#555'/>`);
        }
      }
      return body.join('');
    }

    const frames = [0,1,2].map(t => svgDoc(render_lines(0.3 + t*0.05)));
    const base_t = rng.uniform(0.35, 0.45);
    const correct = svgDoc(render_lines(base_t));
    const similar = svgDoc(render_lines(Math.min(0.9, base_t + 0.08)));
    const w1 = svgDoc(render_lines(Math.max(0.05, base_t - 0.1)));
    const w2 = svgDoc(render_lines(base_t)).replace(/#000/g,'#222');

    const options = [correct, similar, w1, w2];
    const idxs = [0,1,2,3]; rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'perlin_grid',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Smoothed noise grid with thresholded markers.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.perlin_grid = { generate: generate_perlin_grid_question };
})(window);

