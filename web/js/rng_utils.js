// Simple seeded RNG utilities for the browser app
// Provides: makeRng(seedStr, creativity), weightedChoice, jitter

(function (global) {
  function djb2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h) + str.charCodeAt(i);
      h |= 0; // 32-bit
    }
    return h >>> 0; // unsigned
  }

  // Mulberry32 PRNG
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  function makeRng(seedStr, creativity) {
    const seedRepr = seedStr ?? null;
    let seedInt;
    if (seedStr == null || seedStr === "") {
      seedInt = (Math.random() * 2 ** 32) >>> 0;
    } else if (/^\d+$/.test(String(seedStr))) {
      seedInt = (parseInt(seedStr, 10) >>> 0);
    } else {
      seedInt = djb2(String(seedStr));
    }
    const _rand = mulberry32(seedInt >>> 0);

    const api = {
      _seed_repr: seedRepr,
      _seed_int: seedInt >>> 0,
      creativity: clamp01(Number.isFinite(creativity) ? creativity : 0),
      random() { return _rand(); },
      uniform(a, b) { return a + (b - a) * _rand(); },
      randrange(n) { return Math.floor(_rand() * n); },
      choice(arr) { return arr[Math.floor(_rand() * arr.length)]; },
      shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(_rand() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      },
    };
    return api;
  }

  function weightedChoice(rng, pairs) {
    const total = pairs.reduce((acc, [, w]) => acc + w, 0);
    if (total <= 0) return pairs[0][0];
    let pick = rng.random() * total;
    for (const [v, w] of pairs) {
      if ((pick -= w) <= 0) return v;
    }
    return pairs[pairs.length - 1][0];
  }

  function jitter(rng, scale = 1.0) {
    return (rng.random() * 2 - 1) * rng.creativity * scale;
  }

  global.PatternRng = { makeRng, weightedChoice, jitter };
})(window);

