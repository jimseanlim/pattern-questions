// Sierpinski pattern (JS port)
(function (global) {
  const { svgDoc, pointsToStr } = SvgUtils;

  function sierpinski_tri(depth, ax, ay, bx, by, cx, cy, out) {
    if (depth === 0) {
      out.push([[ax,ay],[bx,by],[cx,cy]]);
    } else {
      const abx = (ax+bx)/2, aby = (ay+by)/2;
      const bcx = (bx+cx)/2, bcy = (by+cy)/2;
      const cax = (cx+ax)/2, cay = (cy+ay)/2;
      sierpinski_tri(depth-1, ax,ay, abx,aby, cax,cay, out);
      sierpinski_tri(depth-1, abx,aby, bx,by, bcx,bcy, out);
      sierpinski_tri(depth-1, cax,cay, bcx,bcy, cx,cy, out);
    }
  }

  function generate_sierpinski_question(rng) {
    const depth = rng.choice([3,4]);
    const top_x = 80 + rng.uniform(-6, 6);
    const top_y = 20 + rng.uniform(-6, 6);
    const left_x = 20 + rng.uniform(-6, 6);
    const left_y = 140 + rng.uniform(-6, 6);
    const right_x = 140 + rng.uniform(-6, 6);
    const right_y = 140 + rng.uniform(-6, 6);
    const tris = [];
    sierpinski_tri(depth, top_x, top_y, left_x, left_y, right_x, right_y, tris);
    const fill = rng.choice(['#888','#777','#666']);
    const sw = rng.uniform(0.8, 1.4);
    const polys = tris.map(t => `<polygon points='${pointsToStr(t)}' fill='${fill}' stroke='#000' stroke-width='${sw.toFixed(1)}'/>`);
    const frames = [0.25,0.5,0.75].map(f => svgDoc(polys.slice(0, Math.floor(polys.length*f)).join('')));
    const correct = svgDoc(polys.join(''));
    const similar = svgDoc(polys.slice(0, Math.floor(polys.length*0.9)).join(''));
    const w1 = svgDoc(polys.slice(0, Math.floor(polys.length*0.6)).join(''));
    const w2 = correct.replace(/#888/g,'#666');
    const options = [correct, similar, w1, w2];
    const idxs = [0,1,2,3]; rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'sierpinski',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Recursive triangular subdivision producing fractal tiling.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.sierpinski = { generate: generate_sierpinski_question };
})(window);

