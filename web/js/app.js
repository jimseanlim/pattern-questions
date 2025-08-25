// Wire UI to the browser orchestrator
(function () {
  const els = {
    patternLabel: document.getElementById('patternLabel'),
    patternType: document.getElementById('patternType'),
    seedInput: document.getElementById('seedInput'),
    creativityInput: document.getElementById('creativityInput'),
    newBtn: document.getElementById('newBtn'),
    nextBtn: document.getElementById('nextBtn'),
    questionText: document.getElementById('questionText'),
    feedback: document.getElementById('feedback'),
    frames: [
      document.getElementById('frame0'),
      document.getElementById('frame1'),
      document.getElementById('frame2'),
      document.getElementById('frame3'),
    ],
    frameCaps: [
      document.getElementById('frameCap0'),
      document.getElementById('frameCap1'),
      document.getElementById('frameCap2'),
      document.getElementById('frameCap3'),
    ],
    opts: {
      A: document.getElementById('optA'),
      B: document.getElementById('optB'),
      C: document.getElementById('optC'),
      D: document.getElementById('optD'),
    },
  };

  // Helper to set inner SVG safely inside a button/thumb element
  function setThumb(el, svg) {
    if (!svg) {
      const W = 160, H = 160;
      svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' width='${W}' height='${H}'>`+
            `<rect x='0' y='0' width='${W}' height='${H}' fill='white' stroke='#ddd'/>`+
            `<text x='50%' y='52%' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='#999'>?</text>`+
            `</svg>`;
    }
    // Synchronous innerHTML can block the main thread when many large SVGs are set at once.
    // We keep this function for single-use, but prefer setThumbAsync for batched updates.
    el.innerHTML = svg;
  }

  // Async version that batches DOM updates onto animation frames to keep UI responsive
  function setThumbAsync(el, svg) {
    return new Promise((resolve) => {
      if (!svg) {
        const W = 160, H = 160;
        svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' width='${W}' height='${H}'>`+
              `<rect x='0' y='0' width='${W}' height='${H}' fill='white' stroke='#ddd'/>`+
              `<text x='50%' y='52%' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='#999'>?</text>`+
              `</svg>`;
      }
      requestAnimationFrame(() => {
        el.innerHTML = svg;
        // Yield another frame so the browser can paint if multiple updates queued
        requestAnimationFrame(resolve);
      });
    });
  }

  function readParams() {
    const url = new URL(window.location.href);
    return {
      type: url.searchParams.get('pattern_type') || url.searchParams.get('type') || '',
      seed: url.searchParams.get('pattern_seed') || url.searchParams.get('seed') || '',
      creativity: parseFloat(url.searchParams.get('pattern_creativity') || url.searchParams.get('creativity') || '0') || 0,
    };
  }

  function writeParams({ type, seed, creativity }) {
    const url = new URL(window.location.href);
    if (type) url.searchParams.set('pattern_type', type); else url.searchParams.delete('pattern_type');
    if (seed) url.searchParams.set('pattern_seed', seed); else url.searchParams.delete('pattern_seed');
    url.searchParams.set('pattern_creativity', String(creativity ?? 0));
    history.replaceState(null, '', url);
  }

  function populatePatternOptions() {
    const keys = BrowserOrchestrator.getRegisteredKeys();
    els.patternType.innerHTML = '';
  // Add a top option that represents a random/unforced selection. An empty
  // value is passed through as undefined to the orchestrator so it will
  // pick a pattern according to the RNG and creativity settings.
  const randomOpt = document.createElement('option');
  randomOpt.value = '';
  randomOpt.textContent = 'Random';
  els.patternType.appendChild(randomOpt);
    for (const k of keys) {
      const opt = document.createElement('option');
      opt.value = k; opt.textContent = k;
      els.patternType.appendChild(opt);
    }
  }

  function setEnabledOptions(enabled) {
    for (const k of ['A','B','C','D']) {
      els.opts[k].disabled = !enabled;
    }
  }

  let rng = null;
  let current = null;

  function newRngFromInputs() {
    const seed = els.seedInput.value.trim();
    const creativity = Math.max(0, Math.min(1, parseFloat(els.creativityInput.value) || 0));
    rng = PatternRng.makeRng(seed, creativity);
    return rng;
  }

  function renderQuestion(q) {
    els.feedback.textContent = '';
    els.questionText.textContent = q.question || '';
    els.patternLabel.textContent = q.type ? `Pattern: ${q.type}` : '';

    // Disable interaction while we update the DOM to avoid concurrent generation requests
    setEnabledOptions(false);
    els.nextBtn.disabled = true;

    // Batch the SVG updates to avoid long synchronous blocks that freeze the UI.
    // Update frames first, then options. We use the async setter which yields to the
    // browser between each SVG so the page stays responsive.
    (async () => {
      // Frames: first 3 provided, 4th blank
      for (let i = 0; i < 4; i++) {
        const svg = (i < 3) ? (q.frame_svgs?.[i] || null) : null;
        await setThumbAsync(els.frames[i], svg);
        els.frameCaps[i].textContent = (i === 3) ? '?' : '';
      }

      // Options
      const map = { A: 0, B: 1, C: 2, D: 3 };
      for (const [letter, idx] of Object.entries(map)) {
        await setThumbAsync(els.opts[letter], q.option_svgs?.[idx] || null);
      }

      // Re-enable options after DOM updates complete
      setEnabledOptions(true);
    })();
  }

  function loadQuestion() {
    current = BrowserOrchestrator.generateQuestion(rng, els.patternType.value || undefined);
    renderQuestion(current);
  }

  function handleOption(letter) {
    if (!current) return;
    if (letter === current.correct) {
      els.feedback.textContent = '✅ Correct! Click Next Question.';
      els.feedback.style.color = 'green';
      setEnabledOptions(false);
      els.nextBtn.disabled = false;
    } else {
      els.feedback.textContent = '❌ Incorrect. Try again.';
      els.feedback.style.color = 'red';
    }
  }

  // Init
  populatePatternOptions();
  const params = readParams();
  els.patternType.value = params.type && Array.from(els.patternType.options).some(o => o.value === params.type)
    ? params.type : '';
  els.seedInput.value = params.seed || '';
  els.creativityInput.value = String(params.creativity ?? 0);
  newRngFromInputs();
  writeParams({ type: els.patternType.value, seed: els.seedInput.value, creativity: rng.creativity });
  loadQuestion();

  // Events
  els.newBtn.addEventListener('click', () => {
    newRngFromInputs();
    writeParams({ type: els.patternType.value, seed: els.seedInput.value, creativity: rng.creativity });
    loadQuestion();
  });
  els.nextBtn.addEventListener('click', () => {
    loadQuestion();
  });

  for (const k of ['A','B','C','D']) {
    els.opts[k].addEventListener('click', () => handleOption(k));
  }
})();

