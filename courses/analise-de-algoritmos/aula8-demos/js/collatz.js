/* ============================================================
   COLLATZ — Para ou não para? (Aula 9, Slides 12–15)
   1) Trajetória de n passo a passo (BigInt: os picos passam de 2^53)
   2) Observador com relógio: simular K passos não decide a parada
   3) Varredura n = 1..N: testar muitos casos não é prova
   ============================================================ */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const { fmtInt } = window.Demo;

  const MAX_INPUT = 10n ** 15n;
  const SAFETY_STEPS = 20000;

  const PRESET_NOTES = {
    '6': 'Exemplo do Slide 12: 6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1.',
    '7': 'Pequeno, mas já sobe até 52 antes de descer.',
    '27': 'Slides 12–15: 111 passos e pico de 9 232.',
    '97': 'Vizinho do 27 na fama: 118 passos.',
    '871': 'Slide 15: sobe até 190 996 antes de descer.',
    '837799': 'O mais teimoso abaixo de 1 milhão: 524 passos.'
  };

  const WATCH_LIST = ['6', '27', '703', '6171', '77031', '837799', '63728127', '9780657630'];

  // ------------------------------------------------------------
  // Utilidades
  // ------------------------------------------------------------
  function css(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  function fmtBig(b) {
    const s = b.toString();
    if (s.length <= 15) return Number(b).toLocaleString('pt-BR');
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function collatzSeq(start) {
    const seq = [start];
    let n = start;
    while (n !== 1n && seq.length <= SAFETY_STEPS) {
      n = (n % 2n === 0n) ? n / 2n : 3n * n + 1n;
      seq.push(n);
    }
    return seq;
  }

  function stepsOf(start) {
    let n = BigInt(start);
    let s = 0;
    while (n !== 1n && s <= SAFETY_STEPS) {
      n = (n % 2n === 0n) ? n / 2n : 3n * n + 1n;
      s++;
    }
    return s;
  }

  function setupCanvas(canvas) {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: rect.width, h: rect.height };
  }

  function niceTicks(max, count) {
    if (max <= 0) return [0];
    const raw = max / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    const ticks = [];
    for (let v = 0; v <= max + 1e-9; v += step) ticks.push(v);
    return ticks;
  }

  function shortNum(v) {
    if (v >= 1e12) return (v / 1e12).toFixed(v >= 1e13 ? 0 : 1).replace('.', ',') + ' tri';
    if (v >= 1e9) return (v / 1e9).toFixed(v >= 1e10 ? 0 : 1).replace('.', ',') + ' bi';
    if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace('.', ',') + ' mi';
    if (v >= 1e4) return (v / 1e3).toFixed(0) + ' mil';
    return Math.round(v).toLocaleString('pt-BR');
  }

  // ------------------------------------------------------------
  // 1) Trajetória
  // ------------------------------------------------------------
  const traj = {
    seq: [1n],
    idx: 0,
    max: 1n,
    maxIdx: 0,
    playing: false,
    acc: 0,
    last: 0,
    scale: 'lin'
  };

  function speedToRate(v) {
    // 0..100 → 1..400 passos por segundo (exponencial)
    return Math.round(Math.pow(400, v / 100));
  }

  function loadStart(start) {
    traj.seq = collatzSeq(start);
    traj.idx = 0;
    traj.max = start;
    traj.maxIdx = 0;
    stopPlay();
    renderTraj();
  }

  function advance(k) {
    const last = traj.seq.length - 1;
    for (let i = 0; i < k && traj.idx < last; i++) {
      traj.idx++;
      const v = traj.seq[traj.idx];
      if (v > traj.max) {
        traj.max = v;
        traj.maxIdx = traj.idx;
      }
    }
    if (traj.idx >= last) stopPlay();
    renderTraj();
  }

  function stopPlay() {
    traj.playing = false;
    $('play-btn').innerHTML = (traj.idx >= traj.seq.length - 1 && traj.seq.length > 1) ? '✓ Chegou em 1' : '▶ Rodar';
    $('play-btn').disabled = traj.idx >= traj.seq.length - 1;
  }

  function togglePlay() {
    if (traj.idx >= traj.seq.length - 1) return;
    traj.playing = !traj.playing;
    $('play-btn').innerHTML = traj.playing ? '⏸ Pausar' : '▶ Rodar';
    if (traj.playing) {
      traj.last = performance.now();
      traj.acc = 0;
      requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    if (!traj.playing) return;
    const dt = Math.min(0.1, (now - traj.last) / 1000);
    traj.last = now;
    traj.acc += dt * speedToRate(+$('speed').value);
    const k = Math.floor(traj.acc);
    if (k > 0) {
      traj.acc -= k;
      advance(k);
    }
    if (traj.playing) requestAnimationFrame(tick);
  }

  function renderTraj() {
    const cur = traj.seq[traj.idx];
    const done = cur === 1n;
    const odd = cur % 2n === 1n;

    $('cur-n').textContent = fmtBig(cur);
    const tag = $('cur-parity');
    tag.className = 'parity-tag' + (done ? ' one' : odd ? ' odd' : '');
    tag.textContent = done ? 'chegou em 1: o laço termina' : odd ? 'ímpar → 3n + 1' : 'par → n / 2';

    $('st-steps').textContent = fmtInt(traj.idx);
    $('st-max').textContent = fmtBig(traj.max);
    $('st-max-hint').textContent = traj.maxIdx > 0 ? 'atingido no passo ' + traj.maxIdx : 'pico da subida';

    const verdict = $('run-verdict');
    if (done) {
      verdict.className = 'verdict ok';
      verdict.textContent = '✓ Parou! collatz(' + fmtBig(traj.seq[0]) + ') termina em ' + fmtInt(traj.idx) + ' passos';
    } else {
      verdict.className = 'verdict wait';
      verdict.textContent = '… ainda rodando: vai parar?';
    }

    // Linha ativa do código
    const active = done ? 6 : odd ? 4 : 3;
    document.querySelectorAll('#code-box .ln').forEach((el) => {
      const line = +el.dataset.line;
      el.classList.toggle('active', !done && line === active);
      el.classList.toggle('done', done && line === 6);
    });

    renderTrail();
    drawTraj();
  }

  function renderTrail() {
    const box = $('trail');
    const LIMIT = 80;
    const upto = traj.idx;
    const from = Math.max(0, upto - LIMIT + 1);
    const parts = [];
    if (from > 0) {
      parts.push('<span class="chip">' + fmtBig(traj.seq[0]) + '</span>');
      parts.push('<span class="chip ellipsis">… ' + fmtInt(from - 1) + ' valores …</span>');
    }
    for (let i = from; i <= upto; i++) {
      const v = traj.seq[i];
      const cls = v === 1n ? 'one' : (v % 2n === 1n ? 'odd' : 'even');
      parts.push('<span class="chip ' + cls + '">' + fmtBig(v) + '</span>');
    }
    box.innerHTML = parts.join('');
    box.scrollTop = box.scrollHeight;
  }

  function drawTraj() {
    const canvas = $('traj-canvas');
    const { ctx, w, h } = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const padL = 64, padR = 16, padT = 16, padB = 30;
    const pw = w - padL - padR;
    const ph = h - padT - padB;
    const log = traj.scale === 'log';

    const xMax = Math.max(20, traj.idx);
    const yMaxRaw = Math.max(4, Number(traj.max));
    const yOf = (v) => {
      if (log) {
        const top = Math.log10(yMaxRaw) || 1;
        return padT + ph - (Math.log10(Math.max(1, v)) / top) * ph;
      }
      return padT + ph - (v / yMaxRaw) * ph;
    };
    const xOf = (i) => padL + (i / xMax) * pw;

    const textCol = css('--text-secondary');
    const gridCol = css('--border-subtle');
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = textCol;
    ctx.strokeStyle = gridCol;
    ctx.lineWidth = 1;

    // Grade Y
    const yTicks = log
      ? Array.from({ length: Math.floor(Math.log10(yMaxRaw)) + 1 }, (_, k) => Math.pow(10, k))
      : niceTicks(yMaxRaw, 4);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    yTicks.forEach((v) => {
      const y = yOf(v);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
      ctx.fillText(shortNum(v), padL - 8, y);
    });

    // Grade X
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    niceTicks(xMax, 6).forEach((v) => {
      const x = xOf(v);
      ctx.fillText(String(v), x, padT + ph + 8);
    });
    ctx.textAlign = 'right';
    ctx.fillText('passo →', padL - 8, padT + ph + 8);

    // Linha do 1
    ctx.strokeStyle = css('--c-verify');
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, yOf(1));
    ctx.lineTo(w - padR, yOf(1));
    ctx.stroke();
    ctx.setLineDash([]);

    // Trajetória
    ctx.strokeStyle = css('--c-info');
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= traj.idx; i++) {
      const x = xOf(i);
      const y = yOf(Number(traj.seq[i]));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Pico
    if (traj.maxIdx > 0) {
      const px = xOf(traj.maxIdx);
      const py = yOf(Number(traj.max));
      ctx.fillStyle = css('--c-warn');
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textBaseline = 'bottom';
      ctx.textAlign = px > w - 120 ? 'right' : 'left';
      ctx.fillText('pico: ' + fmtBig(traj.max), px + (px > w - 120 ? -8 : 8), Math.max(padT + 12, py - 2));
    }

    // Ponto atual
    const cx = xOf(traj.idx);
    const cy = yOf(Number(traj.seq[traj.idx]));
    ctx.fillStyle = traj.seq[traj.idx] === 1n ? css('--c-verify') : css('--text-primary');
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function parseInput() {
    const raw = $('n-input').value.replace(/[\s.]/g, '');
    if (!/^\d+$/.test(raw)) return null;
    const b = BigInt(raw);
    if (b < 1n || b > MAX_INPUT) return null;
    return b;
  }

  function initTrajectory() {
    $('preset-pills').addEventListener('click', (e) => {
      const btn = e.target.closest('.pill');
      if (!btn) return;
      document.querySelectorAll('#preset-pills .pill').forEach((p) => p.classList.toggle('active', p === btn));
      $('n-input').value = btn.dataset.n;
      $('n-input').classList.remove('invalid');
      $('preset-note').textContent = PRESET_NOTES[btn.dataset.n] || '';
      loadStart(BigInt(btn.dataset.n));
    });

    $('n-input').addEventListener('input', () => {
      const b = parseInput();
      $('n-input').classList.toggle('invalid', b === null);
      document.querySelectorAll('#preset-pills .pill').forEach((p) => p.classList.toggle('active', b !== null && p.dataset.n === b.toString()));
      if (b === null) {
        $('preset-note').textContent = 'Digite um inteiro entre 1 e 10¹⁵.';
        return;
      }
      $('preset-note').textContent = PRESET_NOTES[b.toString()] || '';
      loadStart(b);
    });

    $('play-btn').addEventListener('click', togglePlay);
    $('step-btn').addEventListener('click', () => { stopPlay(); advance(1); });
    $('finish-btn').addEventListener('click', () => { stopPlay(); advance(Infinity); });
    $('reset-btn').addEventListener('click', () => loadStart(traj.seq[0]));

    $('scale-pills').addEventListener('click', (e) => {
      const btn = e.target.closest('.pill');
      if (!btn) return;
      traj.scale = btn.dataset.scale;
      document.querySelectorAll('#scale-pills .pill').forEach((p) => p.classList.toggle('active', p === btn));
      drawTraj();
    });

    const updateSpeed = () => { $('speed-label').textContent = speedToRate(+$('speed').value) + ' passos/s'; };
    $('speed').addEventListener('input', updateSpeed);
    updateSpeed();

    $('preset-note').textContent = PRESET_NOTES['27'];
    loadStart(27n);
  }

  // ------------------------------------------------------------
  // 2) Observador com relógio
  // ------------------------------------------------------------
  const watchSteps = WATCH_LIST.map((n) => ({ n, steps: stepsOf(n) }));

  function renderWatch() {
    const K = +$('k-slider').value;
    $('k-label').textContent = K;

    let unknown = 0;
    $('watch-grid').innerHTML = watchSteps.map(({ n, steps }) => {
      const yes = steps <= K;
      if (!yes) unknown++;
      const pct = Math.min(100, (Math.min(steps, K) / K) * 100);
      const detail = yes
        ? 'chegou em 1 no passo ' + steps + ' (de ' + K + ' permitidos)'
        : 'tempo esgotado após ' + K + ' passos, ainda longe de 1?';
      return '<div class="watch ' + (yes ? 'yes' : 'unk') + '">' +
        '<div class="watch-head"><span class="watch-n">n = ' + fmtBig(BigInt(n)) + '</span>' +
        '<span class="watch-answer">' + (yes ? 'SIM, para' : '🤷 não sei') + '</span></div>' +
        '<div class="watch-bar"><span style="width:' + pct + '%"></span></div>' +
        '<div class="watch-detail">' + detail + '</div></div>';
    }).join('');

    const msg = $('watch-msg');
    if (unknown === 0) {
      msg.className = 'callout ok';
      msg.innerHTML = '<strong>Com K = ' + K + ' todos responderam SIM.</strong> Mas é só porque escolhemos n que sabemos que param. Para um n novo, nenhum K fixo garante resposta.';
    } else {
      const hidden = watchSteps.filter((w) => w.steps > K);
      const next = hidden.reduce((a, b) => (a.steps < b.steps ? a : b));
      msg.className = 'callout warn';
      msg.innerHTML = '<strong>' + unknown + ' “não sei”.</strong> Spoiler: todos eles param! O n = ' + fmtBig(BigInt(next.n)) +
        ' para no passo ' + next.steps + '. O observador não tinha como saber: depois de ' + K +
        ' passos, “ainda rodando” parece igualzinho a “nunca vai parar”.' +
        (hidden.some((w) => w.steps > 600) ? ' E alguns precisam de mais de 600 passos, mais do que o controle deixa esperar.' : '');
    }
  }

  // ------------------------------------------------------------
  // 3) Varredura n = 1..N
  // ------------------------------------------------------------
  const scan = { N: 10000, steps: null, drawn: 0, running: false, record: 0, recordN: 0, yMax: 1 };

  function sliderToN(v) {
    // 0..100 → 100..200 000 (log)
    const n = Math.round(100 * Math.pow(2000, v / 100));
    const mag = Math.pow(10, Math.floor(Math.log10(n)) - 1);
    return Math.round(n / mag) * mag;
  }

  function computeScan(N) {
    const steps = new Int32Array(N + 1);
    let yMax = 1;
    for (let i = 2; i <= N; i++) {
      let n = i;
      let s = 0;
      while (n >= i) {
        n = (n % 2 === 0) ? n / 2 : 3 * n + 1;
        s++;
      }
      steps[i] = s + steps[n];
      if (steps[i] > yMax) yMax = steps[i];
    }
    return { steps, yMax };
  }

  function resetScan() {
    scan.running = false;
    scan.N = sliderToN(+$('scan-n').value);
    const r = computeScan(scan.N);
    scan.steps = r.steps;
    scan.yMax = r.yMax;
    scan.drawn = 0;
    scan.record = 0;
    scan.recordN = 0;
    $('scan-n-label').textContent = fmtInt(scan.N);
    $('scan-btn').innerHTML = '▶ Testar todos';
    $('scan-btn').disabled = false;
    $('scan-msg').className = 'callout';
    $('scan-msg').textContent = 'Aperte “Testar todos” e acompanhe.';
    updateScanStats();
    drawScanAxes();
  }

  function scanGeom() {
    const canvas = $('scan-canvas');
    const rect = canvas.parentElement.getBoundingClientRect();
    const padL = 44, padR = 14, padT = 14, padB = 28;
    const w = rect.width, h = rect.height;
    return {
      w, h, padL, padR, padT, padB,
      xOf: (n) => padL + (n / scan.N) * (w - padL - padR),
      yOf: (s) => padT + (h - padT - padB) - (s / (scan.yMax * 1.05)) * (h - padT - padB)
    };
  }

  function drawScanAxes() {
    const canvas = $('scan-canvas');
    const { ctx, w, h } = setupCanvas(canvas);
    const g = scanGeom();
    ctx.clearRect(0, 0, w, h);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = css('--text-secondary');
    ctx.strokeStyle = css('--border-subtle');
    ctx.lineWidth = 1;

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    niceTicks(scan.yMax, 4).forEach((v) => {
      const y = g.yOf(v);
      ctx.beginPath();
      ctx.moveTo(g.padL, y);
      ctx.lineTo(w - g.padR, y);
      ctx.stroke();
      ctx.fillText(String(v), g.padL - 6, y);
    });
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    niceTicks(scan.N, 5).forEach((v) => {
      ctx.fillText(shortNum(v), g.xOf(v), h - g.padB + 8);
    });
    ctx.textAlign = 'left';
    ctx.fillText('n', w - g.padR - 10, h - g.padB + 8);
    ctx.save();
    ctx.translate(12, g.padT + 4);
    ctx.textBaseline = 'top';
    ctx.fillText('passos', 0, 0);
    ctx.restore();

    // Redesenha o que já foi testado (troca de tema / resize)
    drawScanPoints(1, scan.drawn);
  }

  function drawScanPoints(from, to) {
    if (to < from) return;
    const canvas = $('scan-canvas');
    const ctx = canvas.getContext('2d');
    const g = scanGeom();
    const size = scan.N > 50000 ? 1.2 : scan.N > 5000 ? 1.6 : 2.4;
    ctx.fillStyle = css('--c-magic');
    ctx.globalAlpha = scan.N > 20000 ? 0.45 : 0.7;
    for (let n = from; n <= to; n++) {
      ctx.fillRect(g.xOf(n) - size / 2, g.yOf(scan.steps[n]) - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    if (scan.recordN > 0) {
      ctx.fillStyle = css('--c-warn');
      ctx.beginPath();
      ctx.arc(g.xOf(scan.recordN), g.yOf(scan.record), 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function updateScanStats() {
    $('sc-tested').textContent = fmtInt(scan.drawn);
    $('sc-tested-hint').textContent = 'de ' + fmtInt(scan.N);
    $('sc-ok').textContent = fmtInt(scan.drawn);
    $('sc-record').textContent = scan.recordN ? fmtInt(scan.recordN) : '—';
    $('sc-record-hint').textContent = scan.recordN ? scan.record + ' passos até chegar em 1' : 'o n mais “teimoso” até agora';
    $('sc-progress').style.width = (scan.drawn / scan.N * 100) + '%';
  }

  function scanTick() {
    if (!scan.running) return;
    const chunk = Math.max(1, Math.ceil(scan.N / 180)); // ~3 s a 60 fps
    const from = scan.drawn + 1;
    const to = Math.min(scan.N, scan.drawn + chunk);
    for (let n = from; n <= to; n++) {
      if (scan.steps[n] > scan.record) {
        scan.record = scan.steps[n];
        scan.recordN = n;
      }
    }
    scan.drawn = to;
    drawScanPoints(from, to);
    updateScanStats();
    if (scan.drawn >= scan.N) {
      scan.running = false;
      $('scan-btn').innerHTML = '✓ Todos chegaram em 1';
      $('scan-btn').disabled = true;
      const msg = $('scan-msg');
      msg.className = 'callout warn';
      msg.innerHTML = '<strong>' + fmtInt(scan.N) + ' casos testados, nenhum contraexemplo.</strong> Isso prova a conjectura? <strong>Não.</strong> ' +
        'Pode existir um n gigante que nunca chega em 1 (ou que cresce para sempre). Computadores já foram até ≈ 3 × 10²⁰ e a pergunta continua em aberto: testar muitos casos ≠ provar para todos.';
      return;
    }
    requestAnimationFrame(scanTick);
  }

  function initScan() {
    $('scan-n').addEventListener('input', resetScan);
    $('scan-reset-btn').addEventListener('click', resetScan);
    $('scan-btn').addEventListener('click', () => {
      if (scan.drawn >= scan.N) return;
      scan.running = !scan.running;
      $('scan-btn').innerHTML = scan.running ? '⏸ Pausar' : '▶ Continuar';
      if (scan.running) requestAnimationFrame(scanTick);
    });
    resetScan();
  }

  // ------------------------------------------------------------
  // Inicialização
  // ------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initTrajectory();
    $('k-slider').addEventListener('input', renderWatch);
    renderWatch();
    initScan();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { drawTraj(); drawScanAxes(); }, 120);
    });
    document.addEventListener('themechange', () => { drawTraj(); drawScanAxes(); });

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stopPlay();
        advance(1);
      }
    });
  });
})();
