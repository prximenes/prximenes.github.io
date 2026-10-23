/* ============================================================
   O QUE SIGNIFICA NP — Aula 8 (Slides 14–17)
   Árvore pega / não pega da Soma de Subconjunto (S = {3,5,7,11,13}).
   Três modos: robô único (DFS), robôs que se clonam e chute de sorte.
   Nós em ordem de heap: raiz = 1, filho "pega" = 2i, filho "não pega" = 2i+1.
   ============================================================ */

(function () {
  'use strict';

  const S = [3, 5, 7, 11, 13];
  const DEPTH = S.length;
  const LEAVES = 1 << DEPTH;
  const NODES = 2 * LEAVES - 1;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const TREE_W = 960;
  const LEVEL_H = 70;
  const TOP = 16;

  const MODE_TEXT = {
    det: '🤖 <strong>Computador comum (determinístico):</strong> um robô só. Em cada bifurcação ele precisa escolher <em>um</em> lado; se não der certo, volta e tenta o outro. É a força bruta: no pior caso visita todas as 2ⁿ folhas.',
    nd: '🌌 <strong>Computador mágico (não determinístico):</strong> em cada bifurcação o robô <strong>se clona</strong> e as cópias seguem pelos dois lados <em>ao mesmo tempo</em>. Se <em>alguma</em> cópia chegar em k, a resposta é SIM. O relógio só conta a altura da árvore: n passos.',
    lucky: '🍀 <strong>Chute de sorte:</strong> imagine que alguém sopra, em cada bifurcação, o lado certo. O robô desce direto, sem voltar. O caminho soprado é exatamente o <strong>certificado</strong> T, e conferir a soma no fim é o <strong>verificador</strong> do Slide 14.'
  };

  const QUIZ = [
    {
      q: 'NP quer dizer “Não Polinomial”.',
      a: false,
      why: 'NP = <strong>N</strong>ão determinístico <strong>P</strong>olinomial. Vários problemas em NP têm algoritmo polinomial (todos os de P!).'
    },
    {
      q: 'Todo problema em P também está em NP.',
      a: true,
      why: 'Se dá para <em>resolver</em> rápido, dá para <em>verificar</em> rápido: basta resolver de novo e ignorar o certificado. Por isso P ⊆ NP.'
    },
    {
      q: 'Problemas em NP não podem ser resolvidos por computadores.',
      a: false,
      why: 'Podem sim: a força bruta resolve todos. O que não se conhece (para os mais difíceis) é um algoritmo <strong>polinomial</strong>.'
    },
    {
      q: 'O computador quântico é o “computador mágico” não determinístico.',
      a: false,
      why: 'Não. Computadores quânticos aceleram alguns problemas específicos (como fatorar), mas não se sabe se resolvem problemas NP-completos em tempo polinomial.'
    },
    {
      q: 'Para estar em NP, basta que respostas SIM tenham um certificado curto que se verifica em tempo polinomial.',
      a: true,
      why: 'Essa é a definição via verificador (Slide 14), equivalente à do computador mágico: o chute certo do mágico <em>é</em> o certificado.'
    },
    {
      q: 'Se alguém provar que P = NP, todo problema fácil de verificar ficaria fácil de resolver.',
      a: true,
      why: 'Exatamente: Sudoku, Mochila, SAT… todos teriam algoritmos polinomiais. Boa parte da criptografia atual deixaria de ser segura.'
    }
  ];

  const SCALE_REFS = [
    [8e9, 'pessoas no planeta Terra'],
    [2e11, 'estrelas na Via Láctea'],
    [7.5e18, 'grãos de areia de todas as praias da Terra'],
    [1e24, 'estrelas no universo observável'],
    [1.3e50, 'átomos do planeta Terra'],
    [1e80, 'átomos do universo observável']
  ];

  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------
  // Geometria da árvore
  // ------------------------------------------------------------
  const depthOf = (id) => 31 - Math.clz32(id);
  const isLeaf = (id) => id >= LEAVES;
  const pos = new Array(NODES + 1);
  const sumAt = new Array(NODES + 1);

  (function computeTree() {
    for (let id = NODES; id >= 1; id--) {
      const d = depthOf(id);
      const y = TOP + d * LEVEL_H;
      if (isLeaf(id)) {
        pos[id] = { x: (id - LEAVES + 0.5) * TREE_W / LEAVES, y };
      } else {
        pos[id] = { x: (pos[2 * id].x + pos[2 * id + 1].x) / 2, y };
      }
    }
    sumAt[1] = 0;
    for (let id = 1; id < LEAVES; id++) {
      const d = depthOf(id);
      sumAt[2 * id] = sumAt[id] + S[d];
      sumAt[2 * id + 1] = sumAt[id];
    }
  })();

  function pathTo(leaf) {
    const path = [];
    for (let id = leaf; id >= 1; id = Math.floor(id / 2)) path.unshift(id);
    return path;
  }

  function membersOf(leaf) {
    const path = pathTo(leaf);
    const members = [];
    for (let i = 1; i < path.length; i++) {
      if (path[i] === 2 * path[i - 1]) members.push(S[i - 1]);
    }
    return members;
  }

  // ------------------------------------------------------------
  // SVG
  // ------------------------------------------------------------
  const els = { nodes: [], edges: [], robots: null };

  function svgEl(tag, attrs, text) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function buildSvg() {
    const svg = $('tree');
    svg.innerHTML = '';
    const gEdges = svgEl('g');
    const gLabels = svgEl('g');
    const gNodes = svgEl('g');
    els.robots = svgEl('g');

    for (let d = 0; d < DEPTH; d++) {
      gLabels.appendChild(svgEl('text', {
        class: 'level-label', x: -112, y: TOP + d * LEVEL_H + LEVEL_H / 2
      }, `pega o ${S[d]}?`));
    }

    for (let id = 2; id <= NODES; id++) {
      const parent = Math.floor(id / 2);
      const take = id % 2 === 0;
      const line = svgEl('line', {
        class: 'edge ' + (take ? 'take' : 'skip'),
        x1: pos[parent].x, y1: pos[parent].y, x2: pos[id].x, y2: pos[id].y
      });
      gEdges.appendChild(line);
      els.edges[id] = line;
      if (depthOf(id) <= 2) {
        const mx = (pos[parent].x + pos[id].x) / 2 + (take ? -16 : 16);
        const my = (pos[parent].y + pos[id].y) / 2 - 4;
        gLabels.appendChild(svgEl('text', { class: 'edge-label ' + (take ? 'take' : 'skip'), x: mx, y: my }, take ? `+${S[depthOf(parent)]}` : 'não'));
      }
    }

    for (let id = 1; id <= NODES; id++) {
      const g = svgEl('g', { class: 'node' + (isLeaf(id) ? ' leaf' : '') });
      g.appendChild(svgEl('circle', { cx: pos[id].x, cy: pos[id].y, r: isLeaf(id) ? 12.5 : 15 }));
      g.appendChild(svgEl('text', { x: pos[id].x, y: pos[id].y }, sumAt[id]));
      const title = svgEl('title', {}, isLeaf(id)
        ? `Subconjunto {${membersOf(id).join(', ')}} soma ${sumAt[id]}`
        : `Soma parcial: ${sumAt[id]}`);
      g.appendChild(title);
      gNodes.appendChild(g);
      els.nodes[id] = g;
    }

    svg.appendChild(gEdges);
    svg.appendChild(gLabels);
    svg.appendChild(gNodes);
    svg.appendChild(els.robots);
  }

  // ------------------------------------------------------------
  // Estado da animação
  // ------------------------------------------------------------
  const state = {
    mode: 'det',
    k: 25,
    tick: 0,
    playing: false,
    timer: null,
    done: false,
    // modo comum
    moves: [],
    // modo sorte
    luckyLeaf: null,
    hasSolution: true
  };

  function solutionsFor(k) {
    const sols = [];
    for (let id = LEAVES; id <= NODES; id++) if (sumAt[id] === k) sols.push(id);
    return sols;
  }

  // Busca em profundidade com o caminho de volta; para ao achar k
  function buildDfsMoves(k) {
    const moves = [];
    let found = false;
    (function dfs(id) {
      moves.push(id);
      if (isLeaf(id)) {
        if (sumAt[id] === k) found = true;
        return;
      }
      for (const child of [2 * id, 2 * id + 1]) {
        dfs(child);
        if (found) return;
        moves.push(id);
      }
    })(1);
    return moves;
  }

  function resetAnimation() {
    stopPlaying();
    state.tick = 0;
    state.done = false;
    const sols = solutionsFor(state.k);
    state.hasSolution = sols.length > 0;
    state.moves = buildDfsMoves(state.k);
    // Sem solução, o "sortudo" chuta um caminho qualquer e o verificador recusa
    state.luckyLeaf = state.hasSolution ? sols[0] : LEAVES + Math.floor(Math.random() * LEAVES);
    $('mode-explain').innerHTML = MODE_TEXT[state.mode];
    render();
    setMsg('', 'Aperte <strong>Rodar</strong> ou avance com <strong>Um passo</strong>.');
  }

  function totalTicks() {
    if (state.mode === 'det') return state.moves.length - 1;
    return DEPTH + 1; // n descidas + 1 passo de conferência
  }

  function step() {
    if (state.done) return false;
    state.tick++;
    if (state.tick >= totalTicks()) {
      state.tick = totalTicks();
      state.done = true;
    }
    render();
    if (state.done) onDone();
    return !state.done;
  }

  function stopPlaying() {
    state.playing = false;
    clearTimeout(state.timer);
    $('play-btn').textContent = '▶ Rodar';
  }

  function delay() {
    const v = Number($('speed').value);
    return Math.round(1200 * Math.pow(30 / 1200, v / 100));
  }

  function play() {
    if (state.playing) {
      stopPlaying();
      return;
    }
    if (state.done) resetAnimation();
    state.playing = true;
    $('play-btn').textContent = '⏸ Pausar';
    const loop = () => {
      if (!state.playing) return;
      // No modo mágico e no de sorte cada passo é mais "importante": um pouco mais lento
      const factor = state.mode === 'det' ? 1 : 3;
      if (step()) state.timer = setTimeout(loop, delay() * factor);
      else stopPlaying();
    };
    state.timer = setTimeout(loop, 150);
  }

  // ------------------------------------------------------------
  // Renderização
  // ------------------------------------------------------------
  function clearClasses() {
    for (let id = 1; id <= NODES; id++) {
      els.nodes[id].setAttribute('class', 'node' + (isLeaf(id) ? ' leaf' : ''));
      if (id >= 2) els.edges[id].setAttribute('class', 'edge ' + (id % 2 === 0 ? 'take' : 'skip'));
    }
    els.robots.innerHTML = '';
  }

  function addClass(el, cls) {
    el.setAttribute('class', el.getAttribute('class') + ' ' + cls);
  }

  function placeRobot(id, emoji, small) {
    els.robots.appendChild(svgEl('text', {
      class: 'robot' + (small ? ' small' : ''),
      x: pos[id].x,
      y: pos[id].y - (small ? 22 : 27)
    }, emoji));
  }

  function classifyLeaf(id) {
    addClass(els.nodes[id], sumAt[id] === state.k ? 'yes' : 'no');
  }

  function render() {
    clearClasses();
    if (state.mode === 'det') renderDet();
    else if (state.mode === 'nd') renderNd();
    else renderLucky();
  }

  function renderDet() {
    const visited = new Set();
    let leaves = 0;
    for (let i = 0; i <= state.tick; i++) {
      const id = state.moves[i];
      if (!visited.has(id)) {
        visited.add(id);
        if (isLeaf(id)) leaves++;
      }
    }
    visited.forEach((id) => {
      addClass(els.nodes[id], 'seen');
      if (id >= 2) addClass(els.edges[id], 'trail');
      if (isLeaf(id)) classifyLeaf(id);
    });
    const here = state.moves[state.tick];
    placeRobot(here, '🤖', false);

    setStats({
      time: state.tick,
      timeHint: 'cada passo = descer ou subir um galho',
      robots: 1,
      robotsHint: 'um único robô',
      work: state.tick,
      leaves
    });
  }

  function renderNd() {
    const t = state.tick;
    const depthReached = Math.min(t, DEPTH);
    for (let id = 1; id <= NODES; id++) {
      const d = depthOf(id);
      if (d <= depthReached) {
        addClass(els.nodes[id], 'cloned');
        if (id >= 2) addClass(els.edges[id], 'clone');
      }
    }
    const robots = 1 << depthReached;
    const first = 1 << depthReached;
    const checking = t > DEPTH;
    for (let id = first; id < first * 2; id++) {
      let emoji = '🤖';
      if (checking) {
        classifyLeaf(id);
        emoji = sumAt[id] === state.k ? '🎉' : '😞';
      }
      placeRobot(id, emoji, depthReached >= 4);
    }
    let work = 0;
    for (let d = 1; d <= depthReached; d++) work += 1 << d;
    if (checking) work += LEAVES;

    setStats({
      time: t,
      timeHint: checking ? `${DEPTH} descidas + 1 conferência` : 'o relógio só conta a altura',
      robots,
      robotsHint: depthReached ? `2${Demo.sup(depthReached)} cópias trabalhando juntas` : 'ainda não se clonou',
      work,
      leaves: checking ? LEAVES : 0
    });
  }

  function renderLucky() {
    const t = state.tick;
    const path = pathTo(state.luckyLeaf);
    const depthReached = Math.min(t, DEPTH);
    for (let i = 0; i <= depthReached; i++) {
      const id = path[i];
      addClass(els.nodes[id], 'seen');
      if (id >= 2) addClass(els.edges[id], 'cert');
    }
    const checking = t > DEPTH;
    if (checking) classifyLeaf(state.luckyLeaf);
    placeRobot(path[depthReached], checking ? (state.hasSolution ? '🎉' : '😬') : '🤖', false);

    setStats({
      time: t,
      timeHint: checking ? 'descidas + conferência da soma' : 'sempre desce, nunca volta',
      robots: 1,
      robotsHint: 'um robô com muita sorte',
      work: t,
      leaves: checking ? 1 : 0
    });

    if (!checking && t > 0) {
      const members = membersOf(path[depthReached]);
      setMsg('magic', `🍀 Sopro até agora: <span class="mono">T = {${members.join(', ')}}</span>. O robô não testa nada, só segue o sopro.`);
    }
  }

  function setStats(s) {
    $('st-time').textContent = s.time;
    $('st-time-hint').textContent = s.timeHint;
    $('st-robots').textContent = Demo.fmtInt(s.robots);
    $('st-robots-hint').textContent = s.robotsHint;
    $('st-work').textContent = Demo.fmtInt(s.work);
    $('st-leaves').textContent = s.leaves;
  }

  function setMsg(kind, html) {
    const el = $('tree-msg');
    el.className = 'callout' + (kind ? ' ' + kind : '');
    el.innerHTML = html;
  }

  function onDone() {
    const k = state.k;
    const sols = solutionsFor(k);
    if (state.mode === 'det') {
      const leavesSeen = new Set(state.moves.filter(isLeaf)).size;
      if (sols.length) {
        const leaf = state.moves[state.moves.length - 1];
        setMsg('warn', `🤖 Achou <span class="mono">{${membersOf(leaf).join(', ')}}</span> = ${k} depois de <strong>${state.tick} passos</strong> e ${leavesSeen} das 32 folhas. ` +
          `Se a resposta fosse NÃO, teria que visitar <strong>todas</strong> as 2⁵ = 32. Com n = 60 números seriam 2⁶⁰ ≈ 10¹⁸ folhas.`);
      } else {
        setMsg('bad', `🤖 Visitou <strong>todas as 32 folhas</strong> em ${state.tick} passos: nenhuma soma ${k}. Resposta NÃO. Para ter certeza do NÃO, a força bruta não pode pular nada.`);
      }
    } else if (state.mode === 'nd') {
      if (sols.length) {
        setMsg('ok', `🌌 Em apenas <strong>${DEPTH + 1} passos de relógio</strong> (n + 1), ${sols.length === 1 ? 'um clone gritou' : sols.length + ' clones gritaram'} “achei!” 🎉, então a resposta é <strong>SIM</strong>. ` +
          `O truque: 32 robôs trabalharam ao mesmo tempo. Tempo polinomial, mas com uma quantidade exponencial de clones.`);
      } else {
        setMsg('bad', `🌌 Em ${DEPTH + 1} passos de relógio todos os 32 clones conferiram e nenhum chegou em ${k}: resposta <strong>NÃO</strong>.`);
      }
    } else {
      const members = membersOf(state.luckyLeaf);
      const expr = members.length ? members.join(' + ') : '0';
      if (state.hasSolution) {
        setMsg('ok', `🍀 Certificado <span class="mono">T = {${members.join(', ')}}</span>. Verificador: <span class="mono">${expr} = ${sumAt[state.luckyLeaf]} = k</span> ✓. ` +
          `Foram ${DEPTH} descidas + 1 conferência: <strong>tempo polinomial</strong>. “Mágico que se clona” e “sortudo + verificador” são duas formas de dizer a mesma coisa.`);
      } else {
        setMsg('bad', `😬 Não existe caminho que some ${k}. O chute <span class="mono">T = {${members.join(', ')}}</span> dá ${sumAt[state.luckyLeaf]} ≠ ${k}, e <strong>qualquer</strong> outro chute também seria recusado. Numa instância NÃO, nenhum certificado engana o verificador (Slide 14, item 2).`);
      }
    }
  }

  // ------------------------------------------------------------
  // Escala e quiz
  // ------------------------------------------------------------
  function renderScale() {
    const n = Number($('scale-n').value);
    const clones = Math.pow(2, n);
    $('scale-n-label').textContent = n;
    $('scale-time').textContent = n;
    $('scale-clones').textContent = Demo.fmtInt(clones);
    let ref = null;
    for (const r of SCALE_REFS) if (clones >= r[0]) ref = r;
    $('scale-msg').innerHTML = ref
      ? `Com n = ${n}, o mágico termina em ${n} passos, mas precisa de mais robôs do que <strong>${ref[1]}</strong> (≈ ${Demo.fmtInt(ref[0])}).`
      : `Com n = ${n}, ainda dá: ${Demo.fmtInt(clones)} robôs. Mas cada número a mais <strong>dobra</strong> o exército de clones.`;
  }

  function renderQuiz() {
    $('quiz').innerHTML = QUIZ.map((item, i) => `
      <button type="button" class="quiz-card ${item.a ? 'true' : 'false'}" data-i="${i}">
        <span class="quiz-tag">${i + 1}. Verdadeiro ou falso?</span>
        <span class="quiz-statement">${item.q}</span>
        <span class="quiz-answer"><strong>${item.a ? '✅ Verdadeiro.' : '❌ Falso.'}</strong> ${item.why}</span>
      </button>`).join('');
    $('quiz').querySelectorAll('.quiz-card').forEach((card) => {
      card.addEventListener('click', () => {
        card.classList.toggle('open');
        card.querySelector('.quiz-tag').textContent = card.classList.contains('open')
          ? (card.classList.contains('true') ? 'Verdadeiro' : 'Falso')
          : `${Number(card.dataset.i) + 1}. Verdadeiro ou falso?`;
      });
    });
  }

  // ------------------------------------------------------------
  // Inicialização
  // ------------------------------------------------------------
  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll('#mode-pills .pill').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
    resetAnimation();
  }

  function setK(k) {
    if (!Number.isFinite(k)) return;
    state.k = Math.max(0, Math.min(39, Math.round(k)));
    $('k-input').value = state.k;
    resetAnimation();
  }

  function init() {
    buildSvg();

    document.querySelectorAll('#mode-pills .pill').forEach((btn) => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
    document.querySelectorAll('.k-control .btn').forEach((btn) => {
      btn.addEventListener('click', () => setK(Number(btn.dataset.k)));
    });
    $('k-input').addEventListener('change', (e) => setK(Number(e.target.value)));

    $('play-btn').addEventListener('click', play);
    $('step-btn').addEventListener('click', () => {
      stopPlaying();
      step();
    });
    $('reset-btn').addEventListener('click', resetAnimation);
    $('scale-n').addEventListener('input', renderScale);

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === ' ') {
        e.preventDefault();
        play();
      } else if (e.key === 'ArrowRight') {
        stopPlaying();
        step();
      } else if (e.key === '1') setMode('det');
      else if (e.key === '2') setMode('nd');
      else if (e.key === '3') setMode('lucky');
    });

    resetAnimation();
    renderScale();
    renderQuiz();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
