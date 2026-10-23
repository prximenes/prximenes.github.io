/* ============================================================
   MOCHILA 0-1 — Verificar vs. Resolver (Aula 8, Slides 7–8)
   Pergunta de decisão: existe T com Σw ≤ C e Σv ≥ V?
   O tabuleiro desenha os 2ⁿ subconjuntos; a força bruta pinta um por um.
   ============================================================ */

(function () {
  'use strict';

  const TREASURES = [
    ['👑', 'Coroa'], ['🗿', 'Estátua'], ['💍', 'Anel'], ['🏺', 'Vaso'],
    ['💎', 'Diamante'], ['📜', 'Mapa'], ['🗡️', 'Adaga'], ['🪙', 'Moedas'],
    ['🧭', 'Bússola'], ['🔮', 'Orbe'], ['🛡️', 'Escudo'], ['📿', 'Colar'],
    ['🏆', 'Taça'], ['🎻', 'Violino'], ['⌛', 'Ampulheta'], ['🪔', 'Lâmpada']
  ];

  // Instância do Slide 8: (w, v) = (3,4), (5,6), (2,3), (4,5); C = 9, V = 12
  const SLIDE_INSTANCE = {
    items: [[3, 4], [5, 6], [2, 3], [4, 5]],
    C: 9,
    V: 12
  };

  const OPS_PER_SECOND = 1e9;
  const UNIVERSE_YEARS = 1.38e10;

  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------
  // Instâncias
  // ------------------------------------------------------------
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeInstance(n) {
    let raw;
    if (n === 4) {
      raw = SLIDE_INSTANCE;
    } else {
      const rnd = mulberry32(n * 7919);
      const items = [];
      for (let i = 0; i < n; i++) {
        const w = 1 + Math.floor(rnd() * 9);
        const v = Math.max(1, Math.round(w * (0.6 + rnd() * 1.1)));
        items.push([w, v]);
      }
      const totalW = items.reduce((s, it) => s + it[0], 0);
      raw = { items, C: Math.round(totalW * 0.4), V: null };
    }

    const size = 1 << n;
    const W = new Int32Array(size);
    const Val = new Int32Array(size);
    for (let mask = 1; mask < size; mask++) {
      const low = mask & -mask;
      const i = 31 - Math.clz32(low);
      W[mask] = W[mask ^ low] + raw.items[i][0];
      Val[mask] = Val[mask ^ low] + raw.items[i][1];
    }

    // Instâncias aleatórias: a meta V é o melhor valor possível (poucas soluções)
    let V = raw.V;
    if (V === null) {
      V = 0;
      for (let mask = 0; mask < size; mask++) {
        if (W[mask] <= raw.C && Val[mask] > V) V = Val[mask];
      }
    }

    let firstSolution = -1;
    for (let mask = 0; mask < size && firstSolution < 0; mask++) {
      if (W[mask] <= raw.C && Val[mask] >= V) firstSolution = mask;
    }

    return {
      n,
      items: raw.items.map(([w, v], i) => ({ w, v, emoji: TREASURES[i][0], name: TREASURES[i][1] })),
      C: raw.C,
      V,
      size,
      W,
      Val,
      firstSolution
    };
  }

  // ------------------------------------------------------------
  // Estado
  // ------------------------------------------------------------
  let inst = null;
  let selection = 0;
  let verifyToken = 0;
  let greedyTimer = null;

  const brute = {
    tested: 0, drawn: 0, found: 0, firstFoundAt: -1,
    running: false, paused: false, rate: 4, acc: 0, lastTs: null
  };

  const membersOf = (mask) => inst.items.map((_, i) => i).filter((i) => mask & (1 << i));

  // ------------------------------------------------------------
  // Itens e mochila
  // ------------------------------------------------------------
  function renderItems() {
    const grid = $('items-grid');
    grid.innerHTML = '';
    inst.items.forEach((it, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'item';
      btn.dataset.idx = i;
      btn.title = `${it.name}: ${it.w} kg, ${it.v} moedas` + (i < 9 ? ` (tecla ${i + 1})` : '');
      btn.innerHTML = `
        <span class="idx">${i + 1}</span>
        <span class="in-badge">🎒</span>
        <span class="emoji">${it.emoji}</span>
        <span class="name">${it.name}</span>
        <span class="stats"><span>${it.w} kg</span><span class="text-warn">🪙${it.v}</span></span>`;
      btn.addEventListener('click', () => toggleItem(i));
      grid.appendChild(btn);
    });
  }

  function toggleItem(i) {
    stopGreedy();
    setSelection(selection ^ (1 << i));
  }

  function setSelection(mask, opts) {
    selection = mask;
    document.querySelectorAll('#items-grid .item').forEach((el, i) => {
      el.classList.toggle('in', Boolean(mask & (1 << i)));
    });
    renderBag();
    runVerifier();
    if (!opts || !opts.keepMsg) updatePickMsg();
    drawOverlay();
  }

  function renderBag() {
    const w = inst.W[selection];
    const v = inst.Val[selection];
    const wBar = $('w-bar');
    const vBar = $('v-bar');
    // A escala do peso vai até 1,5·C para o estouro ficar visível
    const wMax = inst.C * 1.5;
    const vMax = Math.max(inst.V * 1.25, v);
    wBar.style.width = Math.min(100, w / wMax * 100) + '%';
    wBar.className = w > inst.C ? 'over' : '';
    $('w-bar').parentElement.querySelector('.meter-limit').style.left = (inst.C / wMax * 100) + '%';
    vBar.style.width = Math.min(100, v / vMax * 100) + '%';
    vBar.className = v >= inst.V ? 'good' : '';
    $('v-limit').style.left = (inst.V / vMax * 100) + '%';
    $('w-text').textContent = `${w} / ${inst.C} kg`;
    $('v-text').textContent = `${v} / meta ${inst.V}`;
  }

  function updatePickMsg() {
    const w = inst.W[selection];
    const v = inst.Val[selection];
    const el = $('pick-msg');
    if (!selection) {
      el.className = 'callout';
      el.innerHTML = 'Tente achar uma combinação que vale pelo menos a meta sem passar do peso.';
    } else if (w > inst.C) {
      el.className = 'callout bad';
      el.innerHTML = `💥 <strong>Estourou!</strong> ${w} kg é mais do que os ${inst.C} kg que a mochila aguenta.`;
    } else if (v >= inst.V) {
      el.className = 'callout ok';
      el.innerHTML = `🎉 <strong>Achou!</strong> ${v} moedas com ${w} kg. Quanto tempo você levou para achar? E o verificador, quanto levou para conferir?`;
    } else {
      el.className = 'callout';
      el.innerHTML = `Cabe (${w} de ${inst.C} kg), mas faltam <strong>${inst.V - v}</strong> moedas para a meta.`;
    }
  }

  // ------------------------------------------------------------
  // Verificador (Slide 8): três passos, animados em sequência
  // ------------------------------------------------------------
  function sumExpr(values) {
    if (!values.length) return '0';
    if (values.length > 7) return values.slice(0, 6).join(' + ') + ' + …';
    return values.join(' + ');
  }

  function runVerifier() {
    const token = ++verifyToken;
    const members = membersOf(selection);
    const w = inst.W[selection];
    const v = inst.Val[selection];
    const steps = [
      {
        pass: true,
        detail: `{${members.map((i) => i + 1).join(', ')}} ⊆ {1, …, ${inst.n}} ✓`
      },
      {
        pass: w <= inst.C,
        detail: `${sumExpr(members.map((i) => inst.items[i].w))} = ${w} ${w <= inst.C ? '≤' : '>'} ${inst.C} ${w <= inst.C ? '✓' : '✗'}`
      },
      {
        pass: v >= inst.V,
        detail: `${sumExpr(members.map((i) => inst.items[i].v))} = ${v} ${v >= inst.V ? '≥' : '<'} ${inst.V} ${v >= inst.V ? '✓' : '✗'}`
      }
    ];

    $('cert-text').textContent = `T = {${members.map((i) => i + 1).join(', ')}}`;
    $('verify-cost').textContent = `${2 * members.length} somas + 2 comparações`;

    steps.forEach((s, k) => {
      const li = $('chk-' + (k + 1));
      li.className = '';
      $('chk-' + (k + 1) + '-detail').textContent = '';
    });
    const verdict = $('verdict');
    verdict.className = 'verdict';
    verdict.textContent = '…';

    steps.forEach((s, k) => {
      setTimeout(() => {
        if (token !== verifyToken) return;
        const li = $('chk-' + (k + 1));
        li.className = 'on ' + (s.pass ? 'pass' : 'fail');
        li.querySelector('.mark').textContent = s.pass ? '✓' : '✗';
        $('chk-' + (k + 1) + '-detail').textContent = s.detail;
      }, 90 * k);
    });

    setTimeout(() => {
      if (token !== verifyToken) return;
      const ok = steps.every((s) => s.pass);
      verdict.className = 'verdict ' + (ok ? 'ok' : 'bad');
      verdict.innerHTML = ok
        ? '✅ Certificado VÁLIDO → resposta SIM'
        : '❌ Certificado recusado<br><span style="font-size: 12px; font-weight: 600; font-family: Inter, sans-serif;">(não prova que a resposta é NÃO: só que esta mochila não serve)</span>';
    }, 90 * steps.length);
  }

  // ------------------------------------------------------------
  // Guloso e oráculo
  // ------------------------------------------------------------
  function stopGreedy() {
    clearTimeout(greedyTimer);
    greedyTimer = null;
  }

  function runGreedy() {
    stopGreedy();
    const order = inst.items.map((_, i) => i)
      .sort((a, b) => inst.items[b].v - inst.items[a].v || inst.items[a].w - inst.items[b].w);
    let mask = 0;
    let weight = 0;
    const picks = [];
    for (const i of order) {
      if (weight + inst.items[i].w <= inst.C) {
        mask |= 1 << i;
        weight += inst.items[i].w;
        picks.push(i);
      }
    }

    setSelection(0, { keepMsg: true });
    const el = $('pick-msg');
    el.className = 'callout warn';
    el.innerHTML = '🤑 Estratégia gulosa: ordenar pelo valor e ir pegando o mais valioso que ainda couber…';

    let k = 0;
    const addNext = () => {
      if (k < picks.length) {
        setSelection(selection | (1 << picks[k]), { keepMsg: true });
        k++;
        greedyTimer = setTimeout(addNext, 450);
        return;
      }
      const v = inst.Val[mask];
      if (v >= inst.V) {
        el.className = 'callout ok';
        el.innerHTML = `Desta vez o guloso chegou a ${v} moedas e bateu a meta. Mas foi sorte: na instância do Slide 8 ele falha. Nenhuma regra simples conhecida acerta sempre.`;
      } else {
        el.className = 'callout bad';
        el.innerHTML = `❌ <strong>O atalho falhou:</strong> o guloso parou em ${v} moedas, mas a meta ${inst.V} é alcançável. Pegar o mais valioso primeiro “desperdiça” espaço.`;
      }
    };
    greedyTimer = setTimeout(addNext, 450);
  }

  function askOracle() {
    stopGreedy();
    setSelection(inst.firstSolution, { keepMsg: true });
    document.querySelectorAll('#items-grid .item.in').forEach((el) => {
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
    });
    const members = membersOf(inst.firstSolution).map((i) => inst.items[i].emoji).join(' ');
    const el = $('pick-msg');
    el.className = 'callout magic';
    el.innerHTML = `🔮 O oráculo soprou: <strong>${members}</strong>. Você não faz ideia de como ele achou, e nem precisa: o verificador confere em O(n).`;
  }

  // ------------------------------------------------------------
  // Tabuleiro da força bruta (canvas base + overlay)
  // ------------------------------------------------------------
  const canvas = () => $('brute-canvas');
  const overlay = () => $('brute-overlay');
  let geom = null;

  function layout() {
    const wrap = $('brute-wrap');
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    [canvas(), overlay()].forEach((c) => {
      c.width = Math.round(rect.width * dpr);
      c.height = Math.round(rect.height * dpr);
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    const cols = 1 << Math.ceil(inst.n / 2);
    const rows = 1 << Math.floor(inst.n / 2);
    const cw = rect.width / cols;
    const ch = rect.height / rows;
    const gap = Math.min(4, Math.max(0, Math.min(cw, ch) * 0.1 - 0.4));
    geom = { cols, rows, cw, ch, gap, width: rect.width, height: rect.height };
  }

  function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  function cellRect(mask) {
    const c = mask % geom.cols;
    const r = Math.floor(mask / geom.cols);
    return [c * geom.cw + geom.gap / 2, r * geom.ch + geom.gap / 2, geom.cw - geom.gap, geom.ch - geom.gap];
  }

  function colorFor(mask, tested, colors) {
    if (!tested) return colors.untested;
    if (inst.W[mask] > inst.C) return colors.heavy;
    if (inst.Val[mask] >= inst.V) return colors.valid;
    return colors.light;
  }

  function paletteNow() {
    return {
      untested: cssVar('--sq-untested'),
      heavy: cssVar('--sq-heavy'),
      light: cssVar('--sq-light'),
      valid: cssVar('--sq-valid'),
      ring: cssVar('--sq-ring'),
      text: cssVar('--text-primary')
    };
  }

  function drawBase() {
    const ctx = canvas().getContext('2d');
    const colors = paletteNow();
    ctx.clearRect(0, 0, geom.width, geom.height);
    for (let mask = 0; mask < inst.size; mask++) {
      ctx.fillStyle = colorFor(mask, mask < brute.tested, colors);
      ctx.fillRect(...cellRect(mask));
    }
    brute.drawn = brute.tested;
    if (inst.n <= 4) drawLabels(ctx, colors);
  }

  // Para o tabuleiro pequeno (4 itens), escreve os emojis dentro de cada quadradinho
  function drawLabels(ctx, colors) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let mask = 0; mask < inst.size; mask++) {
      const [x, y, w, h] = cellRect(mask);
      const members = membersOf(mask);
      ctx.font = `${Math.max(10, Math.min(22, w / 4.2))}px sans-serif`;
      ctx.fillStyle = colors.text;
      ctx.fillText(members.length ? members.map((i) => inst.items[i].emoji).join('') : '∅', x + w / 2, y + h / 2 - h * 0.12);
      ctx.font = `600 ${Math.max(9, Math.min(13, w / 8))}px 'JetBrains Mono', monospace`;
      ctx.fillText(`${inst.W[mask]}kg · 🪙${inst.Val[mask]}`, x + w / 2, y + h / 2 + h * 0.2);
    }
  }

  function drawIncremental() {
    if (brute.drawn >= brute.tested) return;
    if (inst.n <= 4) {
      drawBase();
      return;
    }
    const ctx = canvas().getContext('2d');
    const colors = paletteNow();
    for (let mask = brute.drawn; mask < brute.tested; mask++) {
      ctx.fillStyle = colorFor(mask, true, colors);
      ctx.fillRect(...cellRect(mask));
    }
    brute.drawn = brute.tested;
  }

  function drawOverlay() {
    if (!geom) return;
    const ctx = overlay().getContext('2d');
    const colors = paletteNow();
    ctx.clearRect(0, 0, geom.width, geom.height);

    // Mochila sendo testada agora
    if (brute.tested > 0 && brute.tested <= inst.size && (brute.running || brute.tested < inst.size)) {
      const [x, y, w, h] = cellRect(brute.tested - 1);
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
    }

    // Anel dourado: a mochila montada pelo aluno
    const [x, y, w, h] = cellRect(selection);
    ctx.strokeStyle = colors.ring;
    ctx.lineWidth = 4;
    if (Math.min(w, h) >= 16) {
      ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    } else {
      // Quadradinhos minúsculos (12 e 16 itens): um anel maior em volta para ser visível
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.max(Math.max(w, h) * 0.75, 9), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function renderBits(mask) {
    const row = $('bits-row');
    if (row.children.length !== inst.n) {
      row.innerHTML = inst.items.map((it) => `<span class="bit" title="${it.name}">${it.emoji}</span>`).join('');
    }
    Array.from(row.children).forEach((el, i) => el.classList.toggle('on', mask !== null && Boolean(mask & (1 << i))));
    const line = $('current-line');
    if (mask === null) {
      line.textContent = '—';
      return;
    }
    const w = inst.W[mask];
    const v = inst.Val[mask];
    const status = w > inst.C ? 'estoura o peso' : (v >= inst.V ? 'SOLUÇÃO!' : 'cabe, vale pouco');
    line.innerHTML = `nº ${Demo.fmtInt(mask + 1)}: ${w} kg · 🪙${v} → <strong class="${w > inst.C ? 'text-solve' : (v >= inst.V ? 'text-verify' : 'text-info')}">${status}</strong>`;
  }

  function renderBruteStats() {
    $('b-tested').textContent = Demo.fmtInt(brute.tested);
    $('b-tested-hint').textContent = `de ${Demo.fmtInt(inst.size)}`;
    $('b-found').textContent = brute.found;
    $('b-progress').style.width = (brute.tested / inst.size * 100) + '%';
    $('brute-btn').textContent = brute.running ? '⏳ Testando…' : '▶ Testar todas';
    $('brute-pause-btn').textContent = brute.paused ? '▶ Continuar' : '⏸ Pausar';
  }

  function resetBrute() {
    brute.tested = 0;
    brute.drawn = 0;
    brute.found = 0;
    brute.firstFoundAt = -1;
    brute.running = false;
    brute.paused = false;
    brute.acc = 0;
    if (geom) {
      drawBase();
      drawOverlay();
    }
    renderBits(null);
    renderBruteStats();
    const el = $('brute-msg');
    el.className = 'callout';
    el.innerHTML = `Aperte “Testar todas”. Clique em qualquer quadradinho para colocar aquela mochila no verificador.`;
  }

  function startBrute() {
    if (brute.tested >= inst.size || brute.running) resetBrute();
    brute.running = true;
    brute.paused = false;
    renderBruteStats();
  }

  function bruteStep() {
    const mask = brute.tested;
    brute.tested++;
    if (inst.W[mask] <= inst.C && inst.Val[mask] >= inst.V) {
      brute.found++;
      if (brute.firstFoundAt < 0) brute.firstFoundAt = brute.tested;
    }
    if (brute.tested >= inst.size) finishBrute();
  }

  function finishBrute() {
    brute.running = false;
    const el = $('brute-msg');
    el.className = 'callout warn';
    el.innerHTML = `🔦 A força bruta testou <strong>todas as ${Demo.fmtInt(inst.size)}</strong> mochilas (2${Demo.sup(inst.n)}, cada uma com até ${inst.n} somas) e achou <strong>${brute.found}</strong> solução(ões); a primeira apareceu só na tentativa nº ${Demo.fmtInt(brute.firstFoundAt)}. ` +
      `Se a resposta fosse NÃO, ela teria que testar tudo de qualquer jeito. O verificador só olha <strong>1</strong> quadradinho.`;
  }

  function updateBruteSpeed() {
    const v = Number($('brute-speed').value);
    brute.rate = Math.max(1, Math.round(Math.pow(10, v * 6 / 100)));
    $('brute-speed-label').textContent = `${Demo.fmtInt(brute.rate)}/s`;
  }

  function loop(ts) {
    if (brute.lastTs === null) brute.lastTs = ts;
    const dt = Math.min(ts - brute.lastTs, 100);
    brute.lastTs = ts;
    if (brute.running && !brute.paused) {
      brute.acc += brute.rate * dt / 1000;
      const steps = Math.floor(brute.acc);
      brute.acc -= steps;
      for (let s = 0; s < steps && brute.running; s++) bruteStep();
      if (steps > 0) {
        drawIncremental();
        drawOverlay();
        renderBits(brute.tested - 1);
        renderBruteStats();
      }
    }
    requestAnimationFrame(loop);
  }

  function onCanvasClick(e) {
    const rect = $('brute-wrap').getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / geom.cw);
    const r = Math.floor((e.clientY - rect.top) / geom.ch);
    const mask = r * geom.cols + c;
    if (mask >= 0 && mask < inst.size) {
      stopGreedy();
      setSelection(mask);
      renderBits(mask);
    }
  }

  // ------------------------------------------------------------
  // Escala
  // ------------------------------------------------------------
  function renderScale() {
    const n = Number($('scale-n').value);
    const subsets = Math.pow(2, n);
    const solveOps = subsets * n;
    const verifyOps = 2 * n;
    const solveSec = solveOps / OPS_PER_SECOND;
    $('scale-n-label').textContent = n;
    $('scale-subsets').textContent = Demo.fmtInt(subsets);
    $('scale-solve').textContent = Demo.fmtDuration(solveSec);
    $('scale-solve-hint').textContent = `${Demo.fmtInt(solveOps)} operações`;
    $('scale-verify').textContent = Demo.fmtDuration(verifyOps / OPS_PER_SECOND);
    $('scale-verify-hint').textContent = `${verifyOps} operações`;

    const el = $('scale-msg');
    const years = solveSec / (365.25 * 86400);
    if (solveSec < 1) {
      el.className = 'callout ok';
      el.innerHTML = 'Com poucos itens, até a força bruta é instantânea. O problema não é n pequeno.';
    } else if (years < 1) {
      el.className = 'callout warn';
      el.innerHTML = `Já dá para sentir: <strong>${Demo.fmtDuration(solveSec)}</strong> para resolver contra ${Demo.fmtDuration(verifyOps / OPS_PER_SECOND)} para verificar. Cada item a mais dobra o tempo.`;
    } else if (years < UNIVERSE_YEARS) {
      el.className = 'callout bad';
      el.innerHTML = `<strong>${Demo.fmtDuration(solveSec)}</strong> de força bruta. Comprar um computador 1000× mais rápido só permite uns 10 itens a mais.`;
    } else {
      el.className = 'callout bad';
      el.innerHTML = `Mais de <strong>${Demo.fmtInt(years / UNIVERSE_YEARS)}×</strong> a idade do universo (13,8 bilhões de anos). E verificar continua levando ${Demo.fmtDuration(verifyOps / OPS_PER_SECOND)}.`;
    }
  }

  // ------------------------------------------------------------
  // Inicialização
  // ------------------------------------------------------------
  function loadInstance(n) {
    stopGreedy();
    inst = makeInstance(n);
    selection = 0;
    renderItems();
    $('instance-goal').innerHTML = `Capacidade <strong>C = ${inst.C} kg</strong> · Meta <strong>V = ${inst.V} moedas</strong> · ${inst.n} tesouros`;
    $('space-size').textContent = `2${Demo.sup(n)} = ${Demo.fmtInt(inst.size)}`;
    $('bits-row').innerHTML = '';
    layout();
    resetBrute();
    setSelection(0);
  }

  function init() {
    $('brute-speed').value = 10;
    updateBruteSpeed();
    $('brute-speed').addEventListener('input', updateBruteSpeed);

    document.querySelectorAll('#size-pills .pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#size-pills .pill').forEach((b) => b.classList.toggle('active', b === btn));
        loadInstance(Number(btn.dataset.n));
      });
    });

    $('greedy-btn').addEventListener('click', runGreedy);
    $('empty-btn').addEventListener('click', () => { stopGreedy(); setSelection(0); });
    $('oracle-btn').addEventListener('click', askOracle);
    $('brute-btn').addEventListener('click', startBrute);
    $('brute-pause-btn').addEventListener('click', () => {
      brute.paused = !brute.paused;
      renderBruteStats();
    });
    $('brute-reset-btn').addEventListener('click', resetBrute);
    $('brute-overlay').addEventListener('click', onCanvasClick);
    $('scale-n').addEventListener('input', renderScale);

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const k = Number(e.key);
      if (k >= 1 && k <= 9 && k <= inst.n) {
        toggleItem(k - 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        if (!brute.running) startBrute();
        else {
          brute.paused = !brute.paused;
          renderBruteStats();
        }
      }
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        layout();
        drawBase();
        drawOverlay();
      }, 120);
    });
    document.addEventListener('themechange', () => {
      drawBase();
      drawOverlay();
    });

    loadInstance(4);
    renderScale();
    requestAnimationFrame(loop);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
