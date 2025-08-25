// L-system fractal (JS port)
(function (global) {
  const { svgDoc } = SvgUtils;

  function turtle_execute(commands, step=10, angle=25) {
    let x = 80, y = 120; // start lower
    let ang = -90;
    const stack = [];
    const path = [];
    for (const c of commands) {
      if (c === 'F') {
        const nx = x + step * Math.cos(ang * Math.PI/180);
        const ny = y + step * Math.sin(ang * Math.PI/180);
        path.push([x,y,nx,ny]);
        x = nx; y = ny;
      } else if (c === '+') ang += angle;
      else if (c === '-') ang -= angle;
      else if (c === '[') stack.push([x,y,ang]);
      else if (c === ']') { const s = stack.pop(); x = s[0]; y = s[1]; ang = s[2]; }
    }
    return path;
  }

  function generate_lsystem_fractal_question(rng) {
    const axiom = 'F';
    const rules = rng.choice([
      { F: 'F[+F]F[-F]F' },
      { F: 'FF-[-F+F+F]+[+F-F-F]' },
    ]);
    const depth = rng.choice([3,4]);
    let cmd = axiom;
    for (let i=0;i<depth;i++) {
      let nxt = '';
      for (const ch of cmd) nxt += (rules[ch] || ch);
      cmd = nxt;
    }
    const angle = rng.uniform(22, 30);
    const step = 4 * (depth===3 ? 1 : 0.7) * rng.uniform(0.9, 1.1);
    const path = turtle_execute(cmd, step, angle);
    const col = rng.choice(['#000','#111','#222']);
    const sw = rng.uniform(0.8, 1.4);
    const lines = path.map(seg => `<line x1='${seg[0].toFixed(1)}' y1='${seg[1].toFixed(1)}' x2='${seg[2].toFixed(1)}' y2='${seg[3].toFixed(1)}' stroke='${col}' stroke-width='${sw.toFixed(1)}'/>`);
    const frames = [0.25,0.5,0.75].map(f => svgDoc(lines.slice(0, Math.floor(lines.length*f)).join('')));
    const correct = svgDoc(lines.join(''));
    const similar = svgDoc(lines.slice(0, Math.floor(lines.length*0.9)).join(''));
    const w1 = svgDoc(lines.slice(0, Math.floor(lines.length*0.6)).join(''));
    const w2 = correct.replace(new RegExp(col,'g'), '#555');
    const options = [correct, similar, w1, w2];
    const idxs = [0,1,2,3]; rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'lsystem_fractal',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'L-system generated branching via turtle graphics.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.lsystem_fractal = { generate: generate_lsystem_fractal_question };
})(window);

