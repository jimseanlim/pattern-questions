// Polygon Tokens pattern (JS port)
(function (global) {
  const { renderHeptagonScene } = SvgUtils;

  const N_POLY = 7;

  function dividerStateAt(t, startIdx) {
    const base_v = (startIdx + t) % N_POLY;
    const side_sign = ((t + 1) % 2 === 0) ? -1 : +1;
    return [base_v, side_sign];
  }

  function tokensStateAt(t, solidStart, hatchStart) {
    const solid_idx = (solidStart + t) % N_POLY;
    const hatch_idx = (hatchStart - 2 * t) % N_POLY;
    return [solid_idx, hatch_idx];
  }

  function getStates(base_div, solid_start, hatch_start) {
    const states = [];
    for (let t = 0; t < 4; t++) {
      const [div_v, side] = dividerStateAt(t, base_div);
      const [s_idx, h_idx] = tokensStateAt(t, solid_start, hatch_start);
      states.push({ div_v, side, s_idx, h_idx });
    }
    return states;
  }

  function makeAdversarial(correct_state, base_div, solid_start, hatch_start) {
    const { div_v, side, s_idx, h_idx } = correct_state;
    const v_a = { div_v, side: +1, s_idx, h_idx };
    const t = 3;
    const s_wrong = (solid_start - 2 * t) % N_POLY;
    const h_wrong = (hatch_start + t) % N_POLY;
    const v_b = { div_v, side, s_idx: s_wrong, h_idx: h_wrong };
    const [div_prev, side_prev] = dividerStateAt(2, base_div);
    const v_c = { div_v: div_prev, side: side_prev, s_idx, h_idx };
    const unique = [];
    for (const v of [v_a, v_b, v_c]) {
      const key = `${v.div_v}|${v.side}|${v.s_idx}|${v.h_idx}`;
      const corr = `${div_v}|${side}|${s_idx}|${h_idx}`;
      if (key !== corr && !unique.some(u => `${u.div_v}|${u.side}|${u.s_idx}|${u.h_idx}` === key)) {
        unique.push(v);
      }
    }
    return unique;
  }

  function generate_polygon_tokens_question(rng) {
    const base_div = rng.randrange(N_POLY);
    const solid_start = rng.randrange(N_POLY);
    const hatch_start = (solid_start + 3) % N_POLY;
    const poly_r = rng.uniform(54, 66);
    const token_r = rng.uniform(8, 12);
    const token_sides = rng.choice([6, 8, 10]);
    const token_rot = rng.choice([0.0, 11.25, 22.5, 33.75]);
    const outline_w = rng.uniform(2.2, 3.6);

    const states = getStates(base_div, solid_start, hatch_start);
    const frames = states.slice(0, 3).map(s =>
      renderHeptagonScene(s.div_v, s.side, s.s_idx, s.h_idx, {
        poly_r, token_r, token_sides, token_rot, outline_w,
      })
    );

    const correct_state = states[3];
    const correct_svg = renderHeptagonScene(
      correct_state.div_v, correct_state.side, correct_state.s_idx, correct_state.h_idx,
      { poly_r, token_r, token_sides, token_rot, outline_w }
    );

    const variants = makeAdversarial(correct_state, base_div, solid_start, hatch_start);
    const wrong_svgs = variants.map(v => renderHeptagonScene(v.div_v, v.side, v.s_idx, v.h_idx, { poly_r, token_r, token_sides, token_rot, outline_w }));
    while (wrong_svgs.length < 3) {
      const v = {
        div_v: (correct_state.div_v + wrong_svgs.length + 1) % N_POLY,
        side: correct_state.side,
        s_idx: (correct_state.s_idx + 1 + wrong_svgs.length) % N_POLY,
        h_idx: correct_state.h_idx,
      };
      wrong_svgs.push(renderHeptagonScene(v.div_v, v.side, v.s_idx, v.h_idx, { poly_r, token_r, token_sides, token_rot, outline_w }));
    }

    const options = [correct_svg, wrong_svgs[0], wrong_svgs[1], wrong_svgs[2]];
    const idxs = [0, 1, 2, 3];
    rng.shuffle(idxs);
    const option_svgs = idxs.map(i => options[i]);
    const letters = ["A", "B", "C", "D"];
    const correct_letter = letters[idxs.indexOf(0)];

    return {
      type: "polygon_tokens",
      question: "Choose the missing fourth frame.",
      frame_svgs: [...frames, ""],
      option_svgs,
      correct: correct_letter,
      rationale: "Divider rotates +1 with parity flip on even frames; solid token +1 CW; hatched token −2 CCW.",
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.polygon_tokens = { generate: generate_polygon_tokens_question };
})(window);
