// SVG helpers (JS port of a subset used in Python)
(function (global) {
  const SVG_SIZE = 160;
  const CENTER = [SVG_SIZE / 2, SVG_SIZE / 2];

  function svgDoc(body, extraDefs = "") {
    return (
      `<svg xmlns='http://www.w3.org/2000/svg' width='${SVG_SIZE}' height='${SVG_SIZE}' viewBox='0 0 ${SVG_SIZE} ${SVG_SIZE}'>` +
      `<defs>${extraDefs}</defs>` +
      `<rect width='100%' height='100%' fill='white'/>` +
      body +
      `</svg>`
    );
  }

  function regularPolygonPoints(n, cx, cy, r, startAngleDeg = -90) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (Math.PI / 180) * (startAngleDeg + 360 * i / n);
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  }

  function pointTowardsCenter(px, py, cx, cy, factor) {
    return [px + (cx - px) * factor, py + (cy - py) * factor];
  }

  function pointsToStr(pts) {
    return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  }

  function smallRegularPolygon(cx, cy, r, n = 8, rotationDeg = 0) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (Math.PI / 180) * (rotationDeg + 360 * i / n);
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  }

  function renderHeptagonScene(divBaseIdx, sideSign, solidIdx, hatchIdx, opts = {}) {
    const {
      poly_r = 60, token_r = 10, token_sides = 8, token_rot = 22.5,
      stroke_color = '#000', outline_w = 3.0, token_outline_w = 2.0,
    } = opts;

    const [cx, cy] = CENTER;
    const hept = regularPolygonPoints(7, cx, cy, poly_r);

    const v1 = hept[(divBaseIdx % 7 + 7) % 7];
    const v2 = hept[((divBaseIdx + sideSign * 3) % 7 + 7) % 7];

    const [s_px, s_py] = pointTowardsCenter(...hept[(solidIdx % 7 + 7) % 7], cx, cy, 0.28);
    const [h_px, h_py] = pointTowardsCenter(...hept[(hatchIdx % 7 + 7) % 7], cx, cy, 0.28);

    const solid = smallRegularPolygon(s_px, s_py, token_r, token_sides, token_rot);
    const hatch = smallRegularPolygon(h_px, h_py, token_r, token_sides, token_rot);

    const defs = (
      "<pattern id='hatch' width='6' height='6' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>" +
      "<line x1='0' y1='0' x2='0' y2='6' stroke='#777' stroke-width='1'/></pattern>"
    );
    const body = (
      `<polygon points='${pointsToStr(hept)}' fill='none' stroke='${stroke_color}' stroke-width='${outline_w}'/>` +
      `<line x1='${v1[0].toFixed(1)}' y1='${v1[1].toFixed(1)}' x2='${v2[0].toFixed(1)}' y2='${v2[1].toFixed(1)}' stroke='${stroke_color}' stroke-width='${outline_w}'/>` +
      `<polygon points='${pointsToStr(solid)}' fill='#888' stroke='${stroke_color}' stroke-width='${token_outline_w}'/>` +
      `<polygon points='${pointsToStr(hatch)}' fill='url(#hatch)' stroke='${stroke_color}' stroke-width='${token_outline_w}'/>`
    );
    return svgDoc(body, defs);
  }

  // Additional scene renderers used by multiple patterns
  function renderSymbolRowSvg(symbols, opts = {}) {
    const scale = opts.scale ?? 1.0;
    const stroke_color = opts.stroke_color ?? 'black';
    const spacing = SVG_SIZE / (symbols.length + 1);
    const y = SVG_SIZE / 2;
    const defs = [];
    const body = [];
    for (let i = 0; i < symbols.length; i++) {
      const x = spacing * (i + 1);
      const sym = symbols[i];
      const t = sym.type;
      if (t === 'circle_half') {
        const orient = sym.orient || 'L';
        const r = 18 * scale;
        const cid = `clipc${i+1}`;
        defs.push(`<clipPath id='${cid}'><circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='${r.toFixed(1)}'/></clipPath>`);
        if (orient === 'L') {
          body.push(`<rect x='${(x - r).toFixed(1)}' y='${(y - r).toFixed(1)}' width='${r.toFixed(1)}' height='${(2*r).toFixed(1)}' fill='#888' clip-path='url(#${cid})'/>`);
        } else {
          body.push(`<rect x='${x.toFixed(1)}' y='${(y - r).toFixed(1)}' width='${r.toFixed(1)}' height='${(2*r).toFixed(1)}' fill='#888' clip-path='url(#${cid})'/>`);
        }
        body.push(`<circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='${r.toFixed(1)}' fill='white' stroke='${stroke_color}' stroke-width='${(3*scale).toFixed(1)}'/>`);
      } else if (t === 'triangle') {
        const up = sym.up !== false;
        const h = 30 * scale;
        const pts = [
          [x, y - (up ? h/2 : -h/2)],
          [x - h/2, y + (up ? h/2 : -h/2)],
          [x + h/2, y + (up ? h/2 : -h/2)],
        ];
        body.push(`<polygon points='${pointsToStr(pts)}' fill='white' stroke='${stroke_color}' stroke-width='${(3*scale).toFixed(1)}' />`);
      } else if (t === 'diamond') {
        const r = 18 * scale;
        const pts = [[x, y - r],[x + r, y],[x, y + r],[x - r, y]];
        const filled = !!sym.filled;
        body.push(`<polygon points='${pointsToStr(pts)}' fill='${filled ? '#888' : 'white'}' stroke='${stroke_color}' stroke-width='${(3*scale).toFixed(1)}' />`);
      } else if (t === 'cross') {
        const s = 18 * scale;
        body.push(
          `<line x1='${(x - s).toFixed(1)}' y1='${(y - s).toFixed(1)}' x2='${(x + s).toFixed(1)}' y2='${(y + s).toFixed(1)}' stroke='${stroke_color}' stroke-width='${(3*scale).toFixed(1)}'/>`+
          `<line x1='${(x + s).toFixed(1)}' y1='${(y - s).toFixed(1)}' x2='${(x - s).toFixed(1)}' y2='${(y + s).toFixed(1)}' stroke='${stroke_color}' stroke-width='${(3*scale).toFixed(1)}'/>`
        );
      } else {
        body.push(`<text x='${x.toFixed(1)}' y='${y.toFixed(1)}' dominant-baseline='middle' text-anchor='middle' font-size='20'>?</text>`);
      }
    }
    return svgDoc(body.join(''), defs.join(''));
  }

  function renderPentagonTriangleScene(token_idx, inner_up, opts = {}) {
    const {
      poly_r = 60, start_angle = -90, spoke_w = 3.0, stroke_color = '#000', inner_h = 26.0, inner_fill = '#888'
    } = opts;
    const [cx, cy] = CENTER;
    const pent = regularPolygonPoints(5, cx, cy, poly_r, start_angle);
    const body = [];
    body.push(`<polygon points='${pointsToStr(pent)}' fill='none' stroke='${stroke_color}' stroke-width='${spoke_w}'/>`);
    for (const v of pent) {
      body.push(`<line x1='${cx.toFixed(1)}' y1='${cy.toFixed(1)}' x2='${v[0].toFixed(1)}' y2='${v[1].toFixed(1)}' stroke='${stroke_color}' stroke-width='${spoke_w}'/>`);
    }
    const vxvy = pent[((token_idx % 5) + 5) % 5];
    const [vx, vy] = pointTowardsCenter(vxvy[0], vxvy[1], cx, cy, 0.42);
    const h = inner_h;
    let outer, inner;
    if (inner_up) {
      outer = [[vx, vy - h/2], [vx - h/2, vy + h/2], [vx + h/2, vy + h/2]];
      inner = [[vx, vy - h/4], [vx - h/4, vy + h/4], [vx + h/4, vy + h/4]];
    } else {
      outer = [[vx, vy + h/2], [vx - h/2, vy - h/2], [vx + h/2, vy - h/2]];
      inner = [[vx, vy + h/4], [vx - h/4, vy - h/4], [vx + h/4, vy - h/4]];
    }
    body.push(`<polygon points='${pointsToStr(outer)}' fill='white' stroke='${stroke_color}' stroke-width='${spoke_w}' />`);
    body.push(`<polygon points='${pointsToStr(inner)}' fill='${inner_fill}' stroke='${stroke_color}' stroke-width='${Math.max(2.0, spoke_w-1).toFixed(1)}' />`);
    return svgDoc(body.join(''));
  }

  function renderOctagonLinesScene(token_indices, lines, opts = {}) {
    const {
      spokes = null, center_token = false,
      poly_r = 70, start_angle = -90 + 22.5, outline_w = 3.0, stroke_color = '#000', token_size = 10.0, token_sides = 6,
    } = opts;
    const [cx, cy] = CENTER;
    const oct_pts = regularPolygonPoints(8, cx, cy, poly_r, start_angle);
    const body = [];
    body.push(`<polygon points='${pointsToStr(oct_pts)}' fill='none' stroke='${stroke_color}' stroke-width='${outline_w}'/>`);
    for (const [a, b] of lines || []) {
      const v1 = oct_pts[((a % 8) + 8) % 8];
      const v2 = oct_pts[((b % 8) + 8) % 8];
      body.push(`<line x1='${v1[0].toFixed(1)}' y1='${v1[1].toFixed(1)}' x2='${v2[0].toFixed(1)}' y2='${v2[1].toFixed(1)}' stroke='${stroke_color}' stroke-width='${outline_w}'/>`);
    }
    if (spokes) {
      for (const s_idx of spokes) {
        const v = oct_pts[((s_idx % 8) + 8) % 8];
        body.push(`<line x1='${cx.toFixed(1)}' y1='${cy.toFixed(1)}' x2='${v[0].toFixed(1)}' y2='${v[1].toFixed(1)}' stroke='${stroke_color}' stroke-width='${outline_w}'/>`);
      }
    }
    if (center_token) {
      const token_poly = smallRegularPolygon(cx, cy, token_size, token_sides, 0);
      body.push(`<polygon points='${pointsToStr(token_poly)}' fill='#888' stroke='${stroke_color}' stroke-width='${Math.max(2.0, outline_w-1).toFixed(1)}'/>`);
    } else {
      for (const idx of token_indices || []) {
        const v = oct_pts[((idx % 8) + 8) % 8];
        const [px, py] = pointTowardsCenter(v[0], v[1], cx, cy, 0.15);
        const token_poly = smallRegularPolygon(px, py, token_size, token_sides, 0);
        body.push(`<polygon points='${pointsToStr(token_poly)}' fill='#888' stroke='${stroke_color}' stroke-width='${Math.max(2.0, outline_w-1).toFixed(1)}'/>`);
      }
    }
    return svgDoc(body.join(''));
  }

  global.SvgUtils = {
    SVG_SIZE, CENTER, svgDoc,
    regularPolygonPoints, pointTowardsCenter, pointsToStr, smallRegularPolygon,
    renderHeptagonScene, renderSymbolRowSvg, renderPentagonTriangleScene, renderOctagonLinesScene,
  };
})(window);
