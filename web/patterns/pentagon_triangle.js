// Pentagon Triangle pattern (JS port)
(function (global) {
  const { renderPentagonTriangleScene } = SvgUtils;
  const P_N = 5;

  function generate_pentagon_triangle_question(rng) {
    const token_start = rng.randrange(P_N);
    const inner_start = rng.choice([true, false]);
    const poly_r = rng.uniform(56, 66);
    const start_angle = rng.uniform(-100, -60);
    const spoke_w = rng.uniform(2.4, 3.6);
    const inner_h = rng.uniform(22, 30);
    const inner_fill = rng.choice(['#888', '#666']);

    const frames = [];
    let correct_state = null;
    for (let t = 0; t < 4; t++) {
      const tok = (token_start + t) % P_N;
      const up = (t % 2 === 0) ? inner_start : !inner_start;
      if (t < 3) {
        frames.push(renderPentagonTriangleScene(tok, up, { poly_r, start_angle, spoke_w, inner_h, inner_fill }));
      } else {
        correct_state = [tok, up];
      }
    }
    const correct = renderPentagonTriangleScene(correct_state[0], correct_state[1], { poly_r, start_angle, spoke_w, inner_h, inner_fill });

    const w1 = renderPentagonTriangleScene((token_start - 3 + P_N) % P_N, correct_state[1], { poly_r, start_angle, spoke_w, inner_h, inner_fill });
    const w2 = renderPentagonTriangleScene(correct_state[0], !correct_state[1], { poly_r, start_angle, spoke_w, inner_h, inner_fill });
    const w3 = renderPentagonTriangleScene((correct_state[0] + 1) % P_N, correct_state[1], { poly_r, start_angle, spoke_w, inner_h, inner_fill });

    const options = [correct, w2, w1, w3];
    const idxs = [0,1,2,3];
    rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'pentagon_triangle',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: 'Token +1 CW each frame; inner triangle flips each frame.',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.pentagon_triangle = { generate: generate_pentagon_triangle_question };
})(window);

