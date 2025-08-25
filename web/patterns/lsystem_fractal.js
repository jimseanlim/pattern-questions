// L-system fractal (JS port)
(function (global) {
  const { svgDoc } = SvgUtils;

  function turtle_execute(commands, step=10, angle=25) {
    let x = 75, y = 150; // start lower
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
    // Contract: produce 3 preview frames (progressive build) + missing fourth, and 4 option svgs
    const axiom = 'F';
    const rulesChoices = [
      { F: 'F[+F]F[-F]F' },
      { F: 'FF-[-F+F+F]+[+F-F-F]' },
      { F: 'F[+F]F' },
    ];

    // pick base rule and an alternate rule for distractors
    const baseRuleIdx = rng.choice([0,1,2]);
    const altRuleIdx = rng.choice([0,1,2].filter(i => i !== baseRuleIdx));
    const baseRules = rulesChoices[baseRuleIdx];
    const altRules = rulesChoices[altRuleIdx];

    const depth = rng.choice([3, 4, 5]);

    function buildCmd(rules, depth) {
      let cmd = axiom;
      for (let i = 0; i < depth; i++) {
        let nxt = '';
        for (const ch of cmd) nxt += (rules[ch] || ch);
        cmd = nxt;
      }
      return cmd;
    }

    const cmd = buildCmd(baseRules, depth);
    const altCmd = buildCmd(altRules, depth);

    const angle = rng.uniform(18, 34);
    const step = 4 * (depth === 3 ? 1 : (depth === 4 ? 0.75 : 0.6)) * rng.uniform(0.85, 1.15);

    const path = turtle_execute(cmd, step, angle);
    const altPath = turtle_execute(altCmd, step * rng.uniform(0.9, 1.1), angle * rng.uniform(0.9, 1.1));

    // visual properties
    const colorChoices = ['#000', '#111', '#222', '#050505'];
    const col = rng.choice(colorChoices);
    const sw = rng.uniform(0.7, 1.6);

    // convert path -> line elements
    const makeLine = (seg, opts = {}) => {
      const { stroke = col, stroke_w = sw, jitter = 0 } = opts;
      const jx = rng ? (rng.uniform(-jitter, jitter)) : 0;
      const jy = rng ? (rng.uniform(-jitter, jitter)) : 0;
      return `<line x1='${(seg[0]+jx).toFixed(1)}' y1='${(seg[1]+jy).toFixed(1)}' x2='${(seg[2]+jx).toFixed(1)}' y2='${(seg[3]+jy).toFixed(1)}' stroke='${stroke}' stroke-width='${stroke_w.toFixed(1)}' stroke-linecap='round'/>`;
    };

    const lines = path.map(seg => makeLine(seg));
    const altLines = altPath.map(seg => makeLine(seg, { stroke: col, stroke_w: sw * rng.uniform(0.9, 1.2) }));

    // create 3 preview frames with small variety: different progress fractions and sometimes rotated
    const fracChoices = rng.choice([[0.2,0.45,0.7],[0.15,0.4,0.8],[0.25,0.5,0.75]]);
    const frames = fracChoices.map((f, idx) => {
      const n = Math.max(1, Math.floor(lines.length * f));
      let body = lines.slice(0, n).join('');
      // occasionally apply a small rotation to intermediate frames to add visual variance
      if (rng.choice([true, false, false])) {
        const rot = rng.uniform(-8, 8);
        body = `<g transform='rotate(${rot.toFixed(1)},80,80)'>${body}</g>`;
      }
      return svgDoc(body);
    });

    // Correct (full) svg
    const correct = svgDoc(lines.join(''));

    // Build a selection of plausible distractors
    const similar = svgDoc(lines.slice(0, Math.floor(lines.length * 0.92)).join(''));
    const truncated = svgDoc(lines.slice(0, Math.floor(lines.length * 0.6)).join(''));
    const recolored = correct.replace(new RegExp(col, 'g'), '#555');
    // alt-rule option: different branching / topology
    const altOption = svgDoc(altLines.join(''));
    // jittered variant: slightly perturb endpoints (simulate drawing noise)
    const jitterLines = path.map(seg => makeLine(seg, { jitter: rng.uniform(0.3, 1.6) }));
    const jittered = svgDoc(jitterLines.join(''));

    // Choose four options from the pool ensuring correct is present
    const pool = [correct, similar, truncated, recolored, altOption, jittered];
    // always include correct; pick 3 other unique items from pool
    const others = pool.filter(p => p !== correct);
    // shuffle others and take first 3
    rng.shuffle(others);
    const options = [correct, others[0], others[1], others[2]];

    const idxs = [0,1,2,3]; rng.shuffle(idxs);
    const letters = ['A','B','C','D'];

    return {
      type: 'lsystem_fractal',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'L-system generated branching via turtle graphics. The correct option is the final (complete) rendering of the system using the chosen production rule and parameters.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.lsystem_fractal = { generate: generate_lsystem_fractal_question };
})(window);

