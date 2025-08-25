// Spiral Creative pattern (JS port)
(function (global) {
  const { svgDoc } = SvgUtils;
  const { weightedChoice, jitter } = PatternRng;

  function generate_spiral_creative_question(rng) {
    const n_turns = (rng.creativity >= 0.8)
      ? weightedChoice(rng, [[3, 0.35], [4, 0.3], [5, 0.2], [6, 0.15]])
      : weightedChoice(rng, [[3, 0.6], [4, 0.3], [5, 0.1]]);

    const points = [];
    const cx = 80, cy = 80;
    const max_r = 160 * (0.38 + 0.1 * rng.creativity);
    const total = n_turns * 8;
    for (let i = 0; i < total; i++) {
      const t = i / total;
      const angle = t * n_turns * 2 * Math.PI + jitter(rng, 0.4);
      const r = t * max_r * (1.0 + jitter(rng, 0.15));
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push([x, y]);
    }

    function frameUpTo(cut) {
      const body = [];
      for (let j = 0; j < cut - 1; j++) {
        const [x1, y1] = points[j];
        const [x2, y2] = points[j + 1];
        const stroke_w = 2 + rng.creativity * (3.5 + 2.0 * (j % 7 === 0 ? 1 : 0.4));
        body.push(`<line x1='${x1.toFixed(1)}' y1='${y1.toFixed(1)}' x2='${x2.toFixed(1)}' y2='${y2.toFixed(1)}' stroke='#000' stroke-width='${stroke_w.toFixed(2)}' stroke-linecap='round'/>`);
      }
      const [tx, ty] = points[cut - 1];
      body.push(`<circle cx='${tx.toFixed(1)}' cy='${ty.toFixed(1)}' r='${(4 + rng.creativity * 6).toFixed(1)}' fill='#888' />`);
      return svgDoc(body.join(""));
    }

    const frames = [
      frameUpTo(Math.floor(points.length * 0.25)),
      frameUpTo(Math.floor(points.length * 0.50)),
      frameUpTo(Math.floor(points.length * 0.75)),
    ];

    const correct_svg = frameUpTo(points.length);

    // wrong1: mirrored horizontally around center x = cx
    let body = [];
    for (let j = 0; j < points.length - 1; j++) {
      const [x1, y1] = points[j];
      const [x2, y2] = points[j + 1];
      const [mx1, my1] = [2 * cx - x1, y1];
      const [mx2, my2] = [2 * cx - x2, y2];
      body.push(`<line x1='${mx1.toFixed(1)}' y1='${my1.toFixed(1)}' x2='${mx2.toFixed(1)}' y2='${my2.toFixed(1)}' stroke='#000' stroke-width='2'/>`);
    }
    const wrong1 = svgDoc(body.join(""));

    // wrong2: full segments but early tip dot
    body = [];
    for (let j = 0; j < points.length - 1; j++) {
      const [x1, y1] = points[j];
      const [x2, y2] = points[j + 1];
      body.push(`<line x1='${x1.toFixed(1)}' y1='${y1.toFixed(1)}' x2='${x2.toFixed(1)}' y2='${y2.toFixed(1)}' stroke='#000' stroke-width='2'/>`);
    }
    const early = points[Math.max(3, Math.floor(points.length / 3))];
    body.push(`<circle cx='${early[0].toFixed(1)}' cy='${early[1].toFixed(1)}' r='6' fill='#888' />`);
    const wrong2 = svgDoc(body.join(""));

    // wrong3: remove a middle chunk
    body = [];
    const mid = Math.floor(points.length / 2);
    for (let j = 0; j < points.length - 1; j++) {
      if (j >= mid - 1 && j <= mid + 2) continue;
      const [x1, y1] = points[j];
      const [x2, y2] = points[j + 1];
      body.push(`<line x1='${x1.toFixed(1)}' y1='${y1.toFixed(1)}' x2='${x2.toFixed(1)}' y2='${y2.toFixed(1)}' stroke='#000' stroke-width='2'/>`);
    }
    const wrong3 = svgDoc(body.join(""));

    // similar: slightly truncated spiral with tip
    const simCut = Math.max(2, points.length - Math.max(1, Math.floor((points.length - 1) / 20)));
    body = [];
    for (let j = 0; j < simCut - 1; j++) {
      const [x1, y1] = points[j];
      const [x2, y2] = points[j + 1];
      const stroke_w = 2 + rng.creativity * 4 * (j % 7 === 0 ? 1 : 0.4);
      body.push(`<line x1='${x1.toFixed(1)}' y1='${y1.toFixed(1)}' x2='${x2.toFixed(1)}' y2='${y2.toFixed(1)}' stroke='#000' stroke-width='${stroke_w.toFixed(2)}' stroke-linecap='round'/>`);
    }
    const simTip = points[simCut - 1];
    body.push(`<circle cx='${simTip[0].toFixed(1)}' cy='${simTip[1].toFixed(1)}' r='${(4 + rng.creativity * 6).toFixed(1)}' fill='#888' />`);
    const similar = svgDoc(body.join(""));

    const options = [correct_svg, similar, wrong1, (rng.random() < 0.5 ? wrong2 : wrong3)];
    const idxs = [0, 1, 2, 3];
    rng.shuffle(idxs);
    const letters = ["A", "B", "C", "D"];

    return {
      type: "spiral_creative",
      question: "Choose the missing fourth frame.",
      frame_svgs: [...frames, ""],
      option_svgs: idxs.map(i => options[i]),
      correct: letters[idxs.indexOf(0)],
      rationale: "Spiral growth with variable jitter and marker placement controlled by creativity.",
    };
  }

  global.Patterns = global.Patterns || {};
  global.Patterns.spiral_creative = { generate: generate_spiral_creative_question };
})(window);

