// Sequence Stack pattern (3x2 stacked symbols)
(function (global) {
  const { svgDoc, smallRegularPolygon } = SvgUtils;

  // coordinate layout for 2 columns x 3 rows
  const POS = [
    { x: 40, y: 32 }, { x: 40, y: 80 }, { x: 40, y: 128 },
    { x: 120, y: 32 }, { x: 120, y: 80 }, { x: 120, y: 128 },
  ];

  function pointsForDiamond(cx, cy, r = 16) {
    return [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]];
  }

  function pointsForTriangle(cx, cy, r = 18, up = true) {
    return up ? [[cx, cy - r], [cx - r, cy + r], [cx + r, cy + r]] : [[cx, cy + r], [cx - r, cy - r], [cx + r, cy - r]];
  }

  function heartPath(cx, cy, s = 18) {
    // simple heart path approximation centered at cx,cy
    const topY = cy - s * 0.2;
    const leftX = cx - s * 0.5;
    const rightX = cx + s * 0.5;
    const bottomX = cx;
    const bottomY = cy + s * 0.7;
    return `M ${cx} ${topY} ` +
      `C ${cx - s} ${topY - s*0.2} ${leftX - s*0.1} ${cy + s*0.1} ${bottomX} ${bottomY} ` +
      `C ${rightX + s*0.1} ${cy + s*0.1} ${cx + s} ${topY - s*0.2} ${cx} ${topY} Z`;
  }

  function renderSymbol(sym, cx, cy, opts = {}) {
    const stroke = opts.stroke_color || 'black';
    const sw = (opts.stroke_w || 3.0).toFixed(1);
  const fill = sym.filled ? (sym.fill_color || '#888') : 'white';
    const type = sym.type;
    if (type === 'circle') {
      return `<circle cx='${cx.toFixed(1)}' cy='${cy.toFixed(1)}' r='18' fill='${fill}' stroke='${stroke}' stroke-width='${sw}'/>`;
    }
    if (type === 'diamond') {
      return `<polygon points='${pointsForDiamond(cx, cy, 16).map(p => p.map(v=>v.toFixed(1)).join(',')).join(' ')}' fill='${fill}' stroke='${stroke}' stroke-width='${sw}'/>`;
    }
    if (type === 'triangle') {
      return `<polygon points='${pointsForTriangle(cx, cy, 18, true).map(p => p.map(v=>v.toFixed(1)).join(',')).join(' ')}' fill='${fill}' stroke='${stroke}' stroke-width='${sw}'/>`;
    }
    if (type === 'heart') {
      return `<path d='${heartPath(cx, cy, 20)}' fill='${fill}' stroke='${stroke}' stroke-width='${sw}' />`;
    }
    if (type === 'pentagon' || type === 'hexagon') {
      const n = type === 'pentagon' ? 5 : 6;
      const pts = smallRegularPolygon(cx, cy, 16, n, 0);
      return `<polygon points='${pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}' fill='${fill}' stroke='${stroke}' stroke-width='${sw}'/>`;
    }
    // fallback
    return `<text x='${cx.toFixed(1)}' y='${cy.toFixed(1)}' dominant-baseline='middle' text-anchor='middle'>?</text>`;
  }

  function renderScene(symbols, opts = {}) {
    const defs = [];
    const body = [];
    const stroke_color = opts.stroke_color || 'black';
    for (let i = 0; i < 6; i++) {
      const p = POS[i];
      body.push(renderSymbol(symbols[i], p.x, p.y, { stroke_color, stroke_w: 3.0 }));
    }
    return svgDoc(body.join(''), defs.join(''));
  }

  // rotation order (snake clockwise): indices 0->1->2->5->4->3->0
  const ORDER = [0,1,2,5,4,3];

  function advanceState(symbols, t) {
    const n = ORDER.length;
    const out = Array(6).fill(null).map(()=>({}));
    for (let i = 0; i < n; i++) {
      const fromIdx = ORDER[i];
      const toIdx = ORDER[(i + t) % n];
      out[toIdx] = { ...symbols[fromIdx] };
    }
    return out;
  }

  function makeAdversaries(correct_symbols, base_symbols) {
    // produce three plausible wrong options:
    // 1) shading instead stays at previous spot
    const prev = [...correct_symbols].map(s => ({ ...s }));
    // flip filling for two nearby tokens
    const flipOne = [...correct_symbols].map(s=>({ ...s }));
    flipOne[ORDER[1]].filled = !flipOne[ORDER[1]].filled;
    const swapTwo = [...correct_symbols].map(s=>({ ...s }));
    // swap two adjacent positions in ORDER
    const a = ORDER[2], b = ORDER[3];
    const tmp = swapTwo[a]; swapTwo[a] = swapTwo[b]; swapTwo[b] = tmp;
    return [prev, flipOne, swapTwo];
  }

  function generate_sequence_stack_question(rng) {
    // base symbol set; we'll shuffle order so shapes vary per-seed
    const base_types = ['heart','diamond','triangle','hexagon','circle','pentagon'];
    rng.shuffle(base_types);

    // choose how many filled/shaded tokens to show (weighted)
    const nFilled = PatternRng.weightedChoice(rng, [[1,0.6],[2,0.25],[3,0.1],[0,0.05]]);
    const filledIdxs = [];
    if (nFilled > 0) {
      const idxs = [0,1,2,3,4,5];
      rng.shuffle(idxs);
      for (let i = 0; i < Math.min(nFilled, idxs.length); i++) filledIdxs.push(idxs[i]);
    }

    // pick per-filled-symbol colors deterministically
    const fillChoices = ['#666','#777','#888','#999','#555'];
    const symbols = base_types.map((t, i) => ({
      type: t,
      filled: filledIdxs.includes(i),
      fill_color: filledIdxs.includes(i) ? rng.choice(fillChoices) : 'white'
    }));

    // create 4 states by advancing by +1 each frame
    const states = [0,1,2,3].map(t => advanceState(symbols, t));

    const frames = states.slice(0,3).map(s => renderScene(s));
    const correct_symbols = states[3];
    const correct_svg = renderScene(correct_symbols);

    const variants = makeAdversaries(correct_symbols, symbols);
    const wrong_svgs = variants.map(v => renderScene(v));

    const options = [correct_svg, wrong_svgs[0], wrong_svgs[1], wrong_svgs[2]];
    const idxs = [0,1,2,3]; rng.shuffle(idxs);
    const option_svgs = idxs.map(i => options[i]);
    const letters = ['A','B','C','D'];

    return {
      type: 'sequence_stack',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs,
      correct: letters[idxs.indexOf(0)],
      rationale: 'Symbols rotate along a snake order (down left column, across bottom, up right column) each frame; a single shaded token moves with them.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.sequence_stack = { generate: generate_sequence_stack_question };
})(window);
