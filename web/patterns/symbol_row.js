// Symbol Row pattern (JS port)
(function (global) {
  const { renderSymbolRowSvg } = SvgUtils;

  function advanceSymbolRow(symbols, t) {
    const n = symbols.length;
    const rotated = Array.from({ length: n }, (_, i) => ({ ...symbols[(i - (t % n) + n) % n] }));
    if (t > 0) {
      for (const s of rotated) {
        if (s.type === 'circle_half') {
          s.orient = (s.orient || 'L') === 'L' ? 'R' : 'L';
        } else if (s.type === 'triangle') {
          s.up = !(s.up !== false);
        } else if (s.type === 'diamond') {
          if ((t + 1) % 2 === 0) s.filled = !Boolean(s.filled);
        }
      }
    }
    return rotated;
  }

  function getStates(symbols) {
    return [0,1,2,3].map(t => advanceSymbolRow(symbols, t));
  }

  function makeAdversarial(correct_syms, base_symbols) {
    const w1 = advanceSymbolRow(base_symbols, -3);
    const noflip = advanceSymbolRow(base_symbols, 3).map(s => {
      const c = { ...s };
      if (c.type === 'circle_half') { c.orient = (c.orient || 'L') === 'L' ? 'R' : 'L'; }
      else if (c.type === 'triangle') { c.up = !(c.up !== false); }
      else if (c.type === 'diamond') { c.filled = Boolean(c.filled); }
      return c;
    });
    const wrongGate = advanceSymbolRow(base_symbols, 3).map(s => ({ ...s, filled: s.type === 'diamond' ? !Boolean(s.filled) : s.filled }));
    return [w1, noflip, wrongGate];
  }

  function generate_symbol_row_question(rng) {
    const symbols = [
      { type: 'circle_half', orient: rng.choice(['L','R']) },
      { type: 'diamond', filled: rng.choice([true,false]) },
      { type: 'triangle', up: rng.choice([true,false]) },
      { type: 'cross' },
    ];
    rng.shuffle(symbols);
    const scale = rng.uniform(0.9, 1.2);
    const stroke_color = rng.choice(['black','#111','#222']);
    const states = getStates(symbols);
    const frames = states.slice(0,3).map(syms => renderSymbolRowSvg(syms, { scale, stroke_color }));
    const correct_syms = states[3];
    const correct = renderSymbolRowSvg(correct_syms, { scale, stroke_color });
    const variants = makeAdversarial(correct_syms, symbols);
    const wrong = variants.map(v => renderSymbolRowSvg(v, { scale, stroke_color }));
    const similar = wrong[1];
    const incorrect1 = wrong[0];
    const incorrect2 = wrong[2];
    const options = [correct, similar, incorrect1, incorrect2];
    const idxs = [0,1,2,3];
    rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'symbol_row',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Order rotates; circle halves flip; triangles flip; diamonds toggle on even frames.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.symbol_row = { generate: generate_symbol_row_question };
})(window);

