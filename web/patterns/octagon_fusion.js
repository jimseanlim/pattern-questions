// Octagon Fusion pattern (JS port)
(function (global) {
  const { renderOctagonLinesScene } = SvgUtils;
  const O_N = 8;

  function generate_octagon_fusion_question(rng) {
    const start_rot = rng.randrange(O_N);
    const poly_r = rng.uniform(64, 76);
    const start_angle = -90 + 22.5 + rng.uniform(-10, 10);
    const outline_w = rng.uniform(2.4, 3.6);
    const token_size = rng.uniform(8, 12);
    const token_sides = rng.choice([5, 6, 7]);

    function get_state(t, rot) {
      t = ((t % 4) + 4) % 4;
      if (t === 0) {
        const tok = [(rot + 2) % O_N, (rot + 6) % O_N];
        const lines = [[rot + 1, rot + 5], [rot + 3, rot + 7]];
        return { tok, lines, center: false };
      } else if (t === 1) {
        const tok = [(rot + 1) % O_N, (rot + 4) % O_N];
        const lines = [[rot + 0, rot + 3], [rot + 2, rot + 5]];
        return { tok, lines, center: false };
      } else if (t === 2) {
        const spokes = [rot + 0, rot + 3, rot + 5];
        return { tok: [], lines: [], spokes, center: true };
      } else if (t === 3) {
        const tok = [(rot + 1) % O_N, (rot + 5) % O_N];
        const lines = [[rot + 1, rot + 5]];
        return { tok, lines, center: false };
      }
      return {};
    }

    function render_state(state) {
      const common = { poly_r, start_angle, outline_w, token_size, token_sides };
      if (state.center) {
        return renderOctagonLinesScene(state.tok || [], state.lines || [], { ...common, spokes: state.spokes || [], center_token: true });
      }
      return renderOctagonLinesScene(state.tok || [], state.lines || [], common);
    }

    const states = [0,1,2,3].map(i => get_state(i, start_rot));
    const frames = states.slice(0,3).map(render_state);
    const correct = render_state(states[3]);

    const w1 = render_state(get_state(2, start_rot));
    const w2 = render_state(get_state(4, start_rot));
    const w3 = render_state(get_state(3, start_rot + 2));

    const options = [correct, w3, w1, w2];
    const idxs = [0,1,2,3];
    rng.shuffle(idxs);
    const letters = ['A','B','C','D'];
    return {
      type: 'octagon_fusion',
      question: 'Choose the missing fourth frame.',
      frame_svgs: [...frames, ''],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: '4-stage cycle: cross → split → center → line → cross...',
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.octagon_fusion = { generate: generate_octagon_fusion_question };
})(window);

