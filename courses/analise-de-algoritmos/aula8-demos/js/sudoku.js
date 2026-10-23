/* ============================================================
   SUDOKU — Verificar vs. Resolver (Aula 8, Slide 6)
   Verificador: percorre 9 linhas, 9 colunas e 9 blocos (243 cheques).
   Resolvedor: backtracking clássico, um "passo" = um dígito testado.
   ============================================================ */

(function () {
  'use strict';

  const PUZZLES = {
    classic: {
      label: 'Clássico (Slide 25)',
      puzzle: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
      solution: '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
    },
    hard: {
      label: 'Arto Inkala (2012)',
      puzzle: '800000000003600000070090200050007000000045700000100030001000068008500010090000400',
      solution: '812753649943682175675491283154237896369845721287169534521974368438526917796318452'
    }
  };

  const MINI = {
    puzzle: '0004001220000301',
    solution: '1234341221434321'
  };

  const MAX_STEPS_PER_FRAME = 25000;

  const $ = (id) => document.getElementById(id);
  const parse = (s) => s.split('').map(Number);

  // ------------------------------------------------------------
  // Geometria da grade
  // ------------------------------------------------------------
  function buildUnits(n) {
    const b = Math.sqrt(n);
    const units = [];
    for (let r = 0; r < n; r++) {
      units.push({ kind: 'linha', idx: r + 1, cells: Array.from({ length: n }, (_, c) => r * n + c) });
    }
    for (let c = 0; c < n; c++) {
      units.push({ kind: 'coluna', idx: c + 1, cells: Array.from({ length: n }, (_, r) => r * n + c) });
    }
    for (let k = 0; k < n; k++) {
      const br = Math.floor(k / b) * b;
      const bc = (k % b) * b;
      const cells = [];
      for (let a = 0; a < b; a++) {
        for (let d = 0; d < b; d++) cells.push((br + a) * n + bc + d);
      }
      units.push({ kind: 'bloco', idx: k + 1, cells });
    }
    return units;
  }

  function fits(g, n, cell, d) {
    const b = Math.sqrt(n);
    const r = Math.floor(cell / n);
    const c = cell % n;
    for (let k = 0; k < n; k++) {
      if (g[r * n + k] === d || g[k * n + c] === d) return false;
    }
    const br = r - (r % b);
    const bc = c - (c % b);
    for (let a = 0; a < b; a++) {
      for (let e = 0; e < b; e++) {
        if (g[(br + a) * n + bc + e] === d) return false;
      }
    }
    return true;
  }

  // Cria as células e devolve { cells, base } onde base guarda as classes fixas
  function buildGrid(el, n, givenMask, editable) {
    const b = Math.sqrt(n);
    el.innerHTML = '';
    el.classList.toggle('size-4', n === 4);
    el.style.setProperty('--n', n);
    const cells = [];
    const base = [];
    for (let i = 0; i < n * n; i++) {
      const r = Math.floor(i / n);
      const c = i % n;
      const div = document.createElement('div');
      let cls = 'cell';
      if ((c + 1) % b === 0 && c < n - 1) cls += ' box-right';
      if ((r + 1) % b === 0 && r < n - 1) cls += ' box-bottom';
      if (givenMask[i]) cls += ' given';
      div.className = cls;
      if (editable && !givenMask[i]) {
        const input = document.createElement('input');
        input.type = 'text';
        input.inputMode = 'numeric';
        input.maxLength = 1;
        input.dataset.idx = i;
        input.setAttribute('aria-label', `Linha ${r + 1}, coluna ${c + 1}`);
        div.appendChild(input);
      }
      el.appendChild(div);
      cells.push(div);
      base.push(cls);
    }
    return { cells, base };
  }

  // ------------------------------------------------------------
  // Estado da corrida
  // ------------------------------------------------------------
  const UNITS9 = buildUnits(9);
  let puzzleKey = 'classic';
  let givenMask = [];
  let paused = false;
  let racing = false;
  let rate = 32;
  let acc = 0;
  let lastTs = null;

  const verifier = {
    grid: [], cells: [], base: [],
    unitIdx: 0, pos: 0, seen: new Map(), checks: 0,
    running: false, done: false, result: null, conflict: null,

    load(solution) {
      this.grid = parse(solution);
      const built = buildGrid($('verify-grid'), 9, givenMask, false);
      this.cells = built.cells;
      this.base = built.base;
      this.reset();
    },

    reset() {
      this.unitIdx = 0;
      this.pos = 0;
      this.seen.clear();
      this.checks = 0;
      this.running = false;
      this.done = false;
      this.result = null;
      this.conflict = null;
    },

    step() {
      if (this.done) return;
      const unit = UNITS9[this.unitIdx];
      const cell = unit.cells[this.pos];
      const d = this.grid[cell];
      this.checks++;
      if (d < 1 || d > 9 || this.seen.has(d)) {
        this.conflict = { cells: [this.seen.get(d), cell].filter((x) => x !== undefined), digit: d, unit };
        this.finish('invalid');
        return;
      }
      this.seen.set(d, cell);
      this.pos++;
      if (this.pos === 9) {
        this.pos = 0;
        this.unitIdx++;
        this.seen.clear();
        if (this.unitIdx === UNITS9.length) this.finish('valid');
      }
    },

    finish(result) {
      this.done = true;
      this.running = false;
      this.result = result;
      onVerifierDone();
    },

    render() {
      const unit = !this.done ? UNITS9[this.unitIdx] : null;
      const inUnit = new Set(unit ? unit.cells : []);
      const seenCells = new Set(unit ? unit.cells.slice(0, this.pos) : []);
      const cursor = unit && (this.running || this.checks > 0) ? unit.cells[this.pos] : -1;
      const conflict = new Set(this.conflict ? this.conflict.cells : []);
      const started = this.checks > 0;

      for (let i = 0; i < 81; i++) {
        let cls = this.base[i];
        if (conflict.has(i)) cls += ' conflict';
        else if (this.result === 'valid') cls += ' ok-flash';
        else if (started && i === cursor) cls += ' cursor';
        else if (started && inUnit.has(i)) cls += ' unit' + (seenCells.has(i) ? ' seen' : '');
        this.cells[i].className = cls;
        this.cells[i].textContent = this.grid[i] || '';
      }

      $('v-checks').textContent = this.checks;
      $('v-progress').style.width = (this.checks / 243 * 100) + '%';
      if (this.result === 'valid') {
        $('v-unit').textContent = '✅ válido';
        $('v-unit-hint').textContent = '27 grupos conferidos';
      } else if (this.result === 'invalid') {
        $('v-unit').textContent = '❌ inválido';
        $('v-unit-hint').textContent = `${this.conflict.unit.kind} ${this.conflict.unit.idx}`;
      } else if (started) {
        $('v-unit').textContent = `${unit.kind} ${unit.idx}`;
        $('v-unit-hint').textContent = `grupo ${this.unitIdx + 1} de 27`;
      } else {
        $('v-unit').textContent = '—';
        $('v-unit-hint').textContent = 'linhas → colunas → blocos';
      }
      $('verify-btn').textContent = this.running ? '⏳ Verificando…' : '▶ Verificar';
    }
  };

  const solver = {
    g: [], cells: [], base: [], empties: [], tried: [],
    pos: 0, tries: 0, backs: 0, last: null,
    running: false, done: false, result: null,

    load(puzzle) {
      this.puzzle = parse(puzzle);
      const built = buildGrid($('solve-grid'), 9, givenMask, false);
      this.cells = built.cells;
      this.base = built.base;
      this.reset();
    },

    reset() {
      this.g = this.puzzle.slice();
      this.empties = [];
      this.g.forEach((d, i) => { if (!d) this.empties.push(i); });
      this.tried = new Array(this.empties.length).fill(0);
      this.pos = 0;
      this.tries = 0;
      this.backs = 0;
      this.last = null;
      this.running = false;
      this.done = false;
      this.result = null;
    },

    step() {
      if (this.done) return;
      if (this.pos === this.empties.length) { this.finish('solved'); return; }
      if (this.pos < 0) { this.finish('none'); return; }
      const cell = this.empties[this.pos];
      this.g[cell] = 0;
      const d = this.tried[this.pos] + 1;
      if (d > 9) {
        this.tried[this.pos] = 0;
        this.pos--;
        this.backs++;
        this.last = { type: 'back', cell };
        return;
      }
      this.tried[this.pos] = d;
      this.tries++;
      if (fits(this.g, 9, cell, d)) {
        this.g[cell] = d;
        this.pos++;
        this.last = { type: 'place', cell, digit: d };
        if (this.pos === this.empties.length) this.finish('solved');
      } else {
        this.last = { type: 'reject', cell, digit: d };
      }
    },

    finish(result) {
      this.done = true;
      this.running = false;
      this.result = result;
      this.last = null;
      onSolverDone();
    },

    render() {
      const last = this.last;
      for (let i = 0; i < 81; i++) {
        let cls = this.base[i];
        let text = this.g[i] || '';
        if (last && last.cell === i) {
          if (last.type === 'reject') { cls += ' try'; text = last.digit; }
          else if (last.type === 'back') cls += ' conflict';
          else cls += ' try';
        } else if (this.g[i] && !givenMask[i]) {
          cls += this.result === 'solved' ? ' placed ok-flash' : ' placed';
        }
        this.cells[i].className = cls;
        this.cells[i].textContent = text;
      }
      const filled = Math.max(this.pos, 0);
      $('s-tries').textContent = Demo.fmtInt(this.tries);
      $('s-backs').textContent = Demo.fmtInt(this.backs);
      $('s-empty').textContent = this.empties.length - filled;
      $('s-progress').style.width = (filled / this.empties.length * 100) + '%';
      $('s-tries-hint').textContent = this.tries > 243
        ? `${Demo.fmtInt(Math.floor(this.tries / 243))}× os cheques do verificador`
        : 'dígitos testados';
      $('solve-btn').textContent = this.running ? '⏳ Resolvendo…' : '▶ Resolver';
    }
  };

  // ------------------------------------------------------------
  // Mensagens
  // ------------------------------------------------------------
  function setMsg(id, kind, html) {
    const el = $(id);
    el.className = 'callout' + (kind ? ' ' + kind : '');
    el.innerHTML = html;
  }

  function onVerifierDone() {
    if (verifier.result === 'valid') {
      setMsg('verify-msg', 'ok', `✅ <strong>Certificado válido</strong> em ${verifier.checks} cheques: 9 linhas + 9 colunas + 9 blocos, 9 células cada. Custo fixo, não depende da dificuldade do puzzle.`);
    } else {
      const c = verifier.conflict;
      const what = c.digit ? `o dígito <strong>${c.digit}</strong> aparece duas vezes` : 'há uma célula vazia';
      setMsg('verify-msg', 'bad', `❌ <strong>Certificado inválido</strong>: na ${c.unit.kind} ${c.unit.idx}, ${what}. Descoberto no cheque nº ${verifier.checks}. Basta um erro para recusar.`);
    }
    if (racing) {
      setMsg('race-msg', 'ok', `🏁 <strong>O verificador terminou</strong> com ${verifier.checks} cheques. O resolvedor está em <strong>${Demo.fmtInt(solver.tries)}</strong> tentativas e ainda não acabou…`);
    }
  }

  function onSolverDone() {
    if (solver.result === 'solved') {
      const ratio = Math.round(solver.tries / 243);
      setMsg('solve-msg', 'ok', `✅ <strong>Resolvido</strong> após ${Demo.fmtInt(solver.tries)} tentativas e ${Demo.fmtInt(solver.backs)} voltas atrás. Cada tentativa ainda exigiu conferir linha, coluna e bloco!`);
      if (racing) {
        setMsg('race-msg', 'warn', `🐢 <strong>O resolvedor finalmente terminou</strong>: ${Demo.fmtInt(solver.tries)} tentativas contra 243 cheques, cerca de <strong>${Demo.fmtInt(ratio)}× mais trabalho</strong>, para chegar exatamente à grade que o verificador já tinha conferido.`);
        racing = false;
      }
    } else {
      setMsg('solve-msg', 'bad', '❌ Este puzzle não tem solução.');
    }
  }

  // ------------------------------------------------------------
  // Controles da corrida
  // ------------------------------------------------------------
  function loadPuzzle(key) {
    puzzleKey = key;
    const p = PUZZLES[key];
    givenMask = parse(p.puzzle).map((d) => d !== 0);
    verifier.load(p.solution);
    solver.load(p.puzzle);
    racing = false;
    resetMessages();
    renderAll();
  }

  function resetMessages() {
    setMsg('verify-msg', '', 'O certificado é a grade 9×9 completa. Para cada linha, coluna e bloco: “já vi esse dígito?”');
    setMsg('solve-msg', '', `Algoritmo: na próxima célula vazia, tente 1, 2, …, 9. Se nenhum dígito couber, apague e volte para a célula anterior. Este puzzle tem <strong>${solver.empties.length}</strong> células vazias.`);
    setMsg('race-msg', 'info', 'Dica: comece devagar (🐢) para ver cada passo, depois acelere. O verificador sempre termina em <strong>243 cheques</strong> (ou antes, se achar um erro).');
  }

  function startVerifier() {
    if (verifier.done || verifier.running) verifier.reset();
    verifier.running = true;
    setPaused(false);
  }

  function startSolver() {
    if (solver.done || solver.running) solver.reset();
    solver.running = true;
    setPaused(false);
  }

  function startRace() {
    verifier.load(PUZZLES[puzzleKey].solution);
    solver.reset();
    racing = true;
    resetMessages();
    setMsg('race-msg', 'info', '🏁 <strong>Corrida em andamento</strong>: um passo do verificador = um cheque; um passo do resolvedor = um dígito testado.');
    verifier.running = true;
    solver.running = true;
    setPaused(false);
  }

  function setPaused(value) {
    paused = value;
    $('pause-btn').textContent = paused ? '▶ Continuar' : '⏸ Pausar';
  }

  function sabotage() {
    // Troca dois dígitos da mesma linha, em blocos diferentes:
    // as linhas continuam corretas, o erro só aparece nas colunas/blocos.
    const g = verifier.grid;
    const free = [];
    for (let i = 0; i < 81; i++) if (!givenMask[i]) free.push(i);
    for (let attempt = 0; attempt < 200; attempt++) {
      const a = free[Math.floor(Math.random() * free.length)];
      const r = Math.floor(a / 9);
      const options = free.filter((b) => Math.floor(b / 9) === r && Math.floor((b % 9) / 3) !== Math.floor((a % 9) / 3));
      if (!options.length) continue;
      const b = options[Math.floor(Math.random() * options.length)];
      [g[a], g[b]] = [g[b], g[a]];
      break;
    }
    verifier.reset();
    setMsg('verify-msg', 'warn', '💥 Dois dígitos de uma mesma linha trocaram de lugar. Olhando rápido, a grade parece certa (as linhas ainda estão OK). Aperte <strong>Verificar</strong>.');
    renderAll();
  }

  function restore() {
    verifier.load(PUZZLES[puzzleKey].solution);
    setMsg('verify-msg', '', 'Grade restaurada: é a solução correta do puzzle.');
    renderAll();
  }

  function rateFromSlider(v) {
    return Math.max(1, Math.round(Math.pow(10, v / 20)));
  }

  function updateSpeed() {
    rate = rateFromSlider(Number($('speed').value));
    $('speed-label').textContent = `${Demo.fmtInt(rate)} passos/s`;
  }

  function renderAll() {
    verifier.render();
    solver.render();
  }

  function loop(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min(ts - lastTs, 100);
    lastTs = ts;
    const active = verifier.running || solver.running;
    if (active && !paused) {
      acc += rate * dt / 1000;
      const steps = Math.min(Math.floor(acc), MAX_STEPS_PER_FRAME);
      acc -= Math.floor(acc);
      for (let s = 0; s < steps; s++) {
        if (verifier.running) verifier.step();
        if (solver.running) solver.step();
        if (!verifier.running && !solver.running) break;
      }
      renderAll();
    } else {
      acc = 0;
    }
    requestAnimationFrame(loop);
  }

  // ------------------------------------------------------------
  // Desafio da turma
  // ------------------------------------------------------------
  const challenge = {
    n: 4, puzzle: [], solution: [], cells: [], inputs: [],
    startTs: null, endTs: null, timerId: null,

    load(n) {
      this.n = n;
      const src = n === 4 ? MINI : PUZZLES.classic;
      this.puzzle = parse(src.puzzle);
      this.solution = parse(src.solution);
      this.units = buildUnits(n);
      const built = buildGrid($('challenge-grid'), n, this.puzzle.map((d) => d !== 0), true);
      this.cells = built.cells;
      this.base = built.base;
      this.inputs = [];
      this.cells.forEach((cell, i) => {
        const input = cell.querySelector('input');
        if (input) this.inputs[i] = input;
        else cell.textContent = this.puzzle[i];
      });
      this.resetTimer();
      $('c-verify-time').textContent = '—';
      $('c-verify-hint').textContent = 'aperte “Verificar”';
      setMsg('challenge-msg', '', 'Repare: para verificar, ninguém precisa saber <em>como</em> você chegou na resposta. Basta conferir as regras.');
    },

    resetTimer() {
      clearInterval(this.timerId);
      this.startTs = null;
      this.endTs = null;
      $('c-timer').textContent = '0:00';
    },

    tick() {
      const end = this.endTs || performance.now();
      const s = Math.floor((end - this.startTs) / 1000);
      $('c-timer').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    },

    onInput(input) {
      const v = input.value.replace(new RegExp(`[^1-${this.n}]`, 'g'), '').slice(-1);
      input.value = v;
      input.parentElement.className = this.base[Number(input.dataset.idx)];
      if (this.startTs === null && v) {
        this.startTs = performance.now();
        this.timerId = setInterval(() => this.tick(), 250);
      }
    },

    read() {
      return this.puzzle.map((d, i) => d || Number(this.inputs[i].value) || 0);
    },

    // Mesmo verificador da corrida, mas coletando todos os conflitos
    verify(g) {
      const bad = new Set();
      let empty = 0;
      g.forEach((d) => { if (!d) empty++; });
      for (const unit of this.units) {
        const where = new Map();
        for (const cell of unit.cells) {
          const d = g[cell];
          if (!d) continue;
          if (where.has(d)) { bad.add(cell); bad.add(where.get(d)); } else where.set(d, cell);
        }
      }
      return { bad, empty };
    },

    check() {
      const g = this.read();
      // Mede o verificador repetindo várias vezes (uma execução é rápida demais para o relógio)
      const reps = 2000;
      const t0 = performance.now();
      let res;
      for (let k = 0; k < reps; k++) res = this.verify(g);
      const perRun = (performance.now() - t0) / reps / 1000;
      const checks = 3 * this.n * this.n;

      $('c-verify-time').textContent = Demo.fmtDuration(Math.max(perRun, 1e-8));
      $('c-verify-hint').textContent = `${checks} cheques (média de ${Demo.fmtInt(reps)} execuções)`;

      this.cells.forEach((cell, i) => {
        cell.className = this.base[i] + (res.bad.has(i) ? ' conflict' : '');
      });

      if (res.bad.size) {
        setMsg('challenge-msg', 'bad', `❌ <strong>Não é solução</strong>: há dígitos repetidos (em vermelho). O computador achou isso em ${Demo.fmtDuration(Math.max(perRun, 1e-8))}.`);
      } else if (res.empty) {
        setMsg('challenge-msg', 'warn', `⏳ Até agora nenhuma regra quebrada, mas faltam <strong>${res.empty}</strong> células.`);
      } else {
        if (this.startTs !== null && this.endTs === null) {
          this.endTs = performance.now();
          clearInterval(this.timerId);
          this.tick();
        }
        this.cells.forEach((cell, i) => { cell.className = this.base[i] + ' ok-flash'; });
        const human = this.startTs !== null ? (this.endTs - this.startTs) / 1000 : null;
        const speedup = human ? Demo.fmtInt(human / Math.max(perRun, 1e-8)) : null;
        setMsg('challenge-msg', 'ok', human
          ? `🎉 <strong>Válido!</strong> Você levou <strong>${Demo.fmtDuration(human)}</strong> para resolver; a verificação levou ${Demo.fmtDuration(Math.max(perRun, 1e-8))}, cerca de <strong>${speedup}×</strong> mais rápido.`
          : '🎉 <strong>Válido!</strong> Todas as linhas, colunas e blocos conferem.');
      }
    },

    reveal() {
      this.inputs.forEach((input, i) => { if (input) input.value = this.solution[i]; });
      if (this.startTs !== null && this.endTs === null) {
        this.endTs = performance.now();
        clearInterval(this.timerId);
        this.tick();
      }
      this.cells.forEach((cell, i) => { cell.className = this.base[i]; });
      setMsg('challenge-msg', 'info', 'Solução preenchida. Aperte <strong>Verificar</strong>: conferir é instantâneo, mesmo sem saber como ela foi encontrada.');
    },

    clear() {
      this.load(this.n);
    }
  };

  function renderGrowth() {
    const rows = [4, 9, 16, 25, 36, 100].map((n) => {
      const empties = Math.round(n * n / 2);
      const log10 = empties * Math.log10(n);
      const brute = log10 < 9 ? Demo.fmtInt(Math.pow(n, empties)) : '≈ 10' + Demo.sup(Math.round(log10));
      return `<tr>
        <td class="mono">${n}×${n}</td>
        <td class="mono text-verify">${Demo.fmtInt(3 * n * n)}</td>
        <td class="mono text-solve">${brute}</td>
      </tr>`;
    });
    $('growth-body').innerHTML = rows.join('');
  }

  // ------------------------------------------------------------
  // Inicialização
  // ------------------------------------------------------------
  function init() {
    $('speed').value = 30;
    updateSpeed();
    $('speed').addEventListener('input', updateSpeed);

    $('race-btn').addEventListener('click', startRace);
    $('pause-btn').addEventListener('click', () => setPaused(!paused));
    $('reset-all-btn').addEventListener('click', () => loadPuzzle(puzzleKey));
    $('verify-btn').addEventListener('click', startVerifier);
    $('sabotage-btn').addEventListener('click', sabotage);
    $('restore-btn').addEventListener('click', restore);
    $('solve-btn').addEventListener('click', startSolver);
    $('solve-reset-btn').addEventListener('click', () => {
      solver.reset();
      racing = false;
      setMsg('solve-msg', '', `Algoritmo: na próxima célula vazia, tente 1, 2, …, 9. Se nenhum dígito couber, apague e volte para a célula anterior. Este puzzle tem <strong>${solver.empties.length}</strong> células vazias.`);
      renderAll();
    });

    document.querySelectorAll('#puzzle-pills .pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#puzzle-pills .pill').forEach((b) => b.classList.toggle('active', b === btn));
        loadPuzzle(btn.dataset.puzzle);
      });
    });

    document.querySelectorAll('#challenge-pills .pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#challenge-pills .pill').forEach((b) => b.classList.toggle('active', b === btn));
        challenge.load(Number(btn.dataset.size));
      });
    });

    $('challenge-grid').addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT') challenge.onInput(e.target);
    });
    $('challenge-verify-btn').addEventListener('click', () => challenge.check());
    $('challenge-reveal-btn').addEventListener('click', () => challenge.reveal());
    $('challenge-reset-btn').addEventListener('click', () => challenge.clear());

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === ' ') {
        e.preventDefault();
        setPaused(!paused);
      } else if (e.key === 'r' || e.key === 'R') {
        startRace();
      }
    });

    loadPuzzle('classic');
    challenge.load(4);
    renderGrowth();
    requestAnimationFrame(loop);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
