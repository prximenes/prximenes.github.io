/**
 * SIMULADORES E DEMONSTRAÇÕES INTERATIVAS CANVAS 2D / DOM
 * Análise de Algoritmos - Aula 5 (Algoritmos Iterativos - Parte 2)
 * Autor: Pedro Ximenes (UNICAP)
 */

window.CanvasDemos = (function () {
  // Utilitário para Canvas High-DPI nítido
  function setupFixedCanvas(canvas) {
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width || 400;
    const height = rect.height || canvas.height || 180;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function isDarkMode() {
    return document.body.classList.contains('dark-mode');
  }

  /* ============================================================
     1. SELECTION SORT VISUALIZER
     ============================================================ */
  const SelectionSortDemo = {
    canvas: null,
    array: [7, 4, 5, 2, 8, 1, 6, 3],
    i: 0,
    j: 1,
    i_min: 0,
    state: 'idle', // 'idle', 'running', 'paused', 'done'
    timer: null,
    speed: 350,
    comparisons: 0,
    swaps: 0,
    explanation: 'Clique em "Iniciar" ou "Passo a Passo" para observar a busca pelo menor elemento.',

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.reset();
      this.draw();
    },

    reset(preset = 'default') {
      this.pause();
      if (preset === 'reversed') {
        this.array = [8, 7, 6, 5, 4, 3, 2, 1];
      } else if (preset === 'sorted') {
        this.array = [1, 2, 3, 4, 5, 6, 7, 8];
      } else if (preset === 'random') {
        this.array = Array.from({ length: 8 }, () => Math.floor(Math.random() * 9) + 1);
      } else {
        this.array = [7, 4, 5, 2, 8, 1, 6, 3];
      }
      this.i = 0;
      this.i_min = 0;
      this.j = 1;
      this.comparisons = 0;
      this.swaps = 0;
      this.state = 'idle';
      this.explanation = 'Vetor reiniciado. Pronto para ordenar.';
      this.updateUI();
      this.draw();
    },

    step() {
      const n = this.array.length;
      if (this.i >= n - 1) {
        this.state = 'done';
        this.explanation = `Ordenação concluída com ${this.comparisons} comparações e ${this.swaps} trocas! Complexidade: Θ(n²).`;
        this.updateUI();
        this.draw();
        return false;
      }

      if (this.j < n) {
        this.comparisons++;
        if (this.array[this.j] < this.array[this.i_min]) {
          this.i_min = this.j;
          this.explanation = `Novo menor encontrado: V[${this.j}] = ${this.array[this.j]}. Atualizado i_menor = ${this.j}.`;
        } else {
          this.explanation = `Comparando V[${this.j}]=${this.array[this.j]} com menor atual V[${this.i_min}]=${this.array[this.i_min]} (sem troca de índice).`;
        }
        this.j++;
      } else {
        // Fim da varredura da rodada i -> efetua a troca
        if (this.i !== this.i_min) {
          const temp = this.array[this.i];
          this.array[this.i] = this.array[this.i_min];
          this.array[this.i_min] = temp;
          this.swaps++;
          this.explanation = `Fim da rodada ${this.i + 1}: Troca V[${this.i}] (${temp}) com o menor V[${this.i_min}] (${this.array[this.i]}).`;
        } else {
          this.explanation = `Fim da rodada ${this.i + 1}: O menor já está na posição ${this.i} (nenhuma troca necessária).`;
        }
        this.i++;
        this.i_min = this.i;
        this.j = this.i + 1;
      }

      this.updateUI();
      this.draw();
      return true;
    },

    play() {
      if (this.state === 'running') return;
      this.state = 'running';
      this.updateUI();
      const loop = () => {
        if (this.state !== 'running') return;
        const hasMore = this.step();
        if (hasMore) {
          this.timer = setTimeout(loop, this.speed);
        } else {
          this.state = 'done';
          this.updateUI();
        }
      };
      loop();
    },

    pause() {
      this.state = 'paused';
      if (this.timer) clearTimeout(this.timer);
      this.updateUI();
    },

    updateUI() {
      const statsElem = document.getElementById('ssort-stats');
      if (statsElem) {
        statsElem.innerHTML = `<span>Rodada: <b>${Math.min(this.i + 1, this.array.length)}/${this.array.length}</b></span> ` +
          `<span>Comparações: <b>${this.comparisons}</b></span> ` +
          `<span>Trocas: <b>${this.swaps}</b></span>`;
      }
      const expElem = document.getElementById('ssort-explanation');
      if (expElem) expElem.textContent = this.explanation;

      const playBtn = document.getElementById('ssort-play-btn');
      if (playBtn) {
        playBtn.textContent = this.state === 'running' ? '⏸ Pausar' : '▶ Iniciar';
      }
    },

    draw() {
      const info = setupFixedCanvas(this.canvas);
      if (!info) return;
      const { ctx, width, height } = info;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const n = this.array.length;
      const margin = 16;
      const availWidth = width - margin * 2;
      const barWidth = Math.max(18, Math.floor(availWidth / n) - 8);
      const gap = Math.floor((availWidth - barWidth * n) / (n - 1));
      const maxVal = Math.max(...this.array, 10);
      const maxBarH = height - 60;

      for (let idx = 0; idx < n; idx++) {
        const val = this.array[idx];
        const barH = (val / maxVal) * maxBarH;
        const x = margin + idx * (barWidth + gap);
        const y = height - 28 - barH;

        // Determina a cor do elemento
        let fillColor = dark ? '#3b82f6' : '#2563eb'; // Padrão

        if (idx < this.i || this.state === 'done') {
          fillColor = '#16a34a'; // Já ordenado
        } else if (idx === this.i_min && this.state !== 'done') {
          fillColor = '#dc2626'; // Menor atual encontrado
        } else if (idx === this.j - 1 && this.state === 'running') {
          fillColor = '#eab308'; // Sendo comparado agora
        } else if (idx === this.i) {
          fillColor = '#8b5cf6'; // Posição atual sendo preenchida
        }

        // Desenha a barra com cantos levemente arredondados
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Valor no topo
        ctx.fillStyle = dark ? '#f1f5f9' : '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + barWidth / 2, y - 6);

        // Índice embaixo
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b';
        ctx.font = '11px monospace';
        ctx.fillText(`[${idx}]`, x + barWidth / 2, height - 10);

        // Marcador do ponteiro
        if (idx === this.i && this.state !== 'done') {
          ctx.fillStyle = '#8b5cf6';
          ctx.fillText('i', x + barWidth / 2, height - 1);
        } else if (idx === this.i_min && this.state !== 'done') {
          ctx.fillStyle = '#dc2626';
          ctx.fillText('min', x + barWidth / 2, height - 1);
        }
      }
    }
  };

  /* ============================================================
     2. BUBBLE SORT VISUALIZER (OTIMIZADO VS PADRÃO)
     ============================================================ */
  const BubbleSortDemo = {
    canvas: null,
    array: [5, 3, 4, 1, 8, 2, 7, 6],
    i: 0,
    j: 0,
    optimized: true,
    swappedThisPass: false,
    state: 'idle',
    timer: null,
    speed: 300,
    comparisons: 0,
    swaps: 0,
    explanation: 'Selecione o modo e execute para ver o efeito do flag de parada antecipada no melhor caso.',

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.reset();
      this.draw();
    },

    reset(preset = 'default') {
      this.pause();
      if (preset === 'sorted') {
        this.array = [1, 2, 3, 4, 5, 6, 7, 8];
        this.explanation = 'Vetor já ordenado! No modo otimizado, fará apenas 1 passada de n-1 comparações (Θ(n)).';
      } else if (preset === 'reversed') {
        this.array = [8, 7, 6, 5, 4, 3, 2, 1];
        this.explanation = 'Pior caso (decrescente): fará n(n-1)/2 comparações e trocas (Θ(n²)).';
      } else {
        this.array = [5, 3, 4, 1, 8, 2, 7, 6];
        this.explanation = 'Vetor reiniciado. Pronto para executar.';
      }
      this.i = 0;
      this.j = 0;
      this.swappedThisPass = false;
      this.comparisons = 0;
      this.swaps = 0;
      this.state = 'idle';
      this.updateUI();
      this.draw();
    },

    setOptimized(val) {
      this.optimized = val;
      this.reset();
    },

    step() {
      const n = this.array.length;
      if (this.i >= n - 1) {
        this.state = 'done';
        this.explanation = `Ordenação concluída com ${this.comparisons} comparações e ${this.swaps} trocas.`;
        this.updateUI();
        this.draw();
        return false;
      }

      if (this.j < n - 1 - this.i) {
        this.comparisons++;
        if (this.array[this.j] > this.array[this.j + 1]) {
          const tmp = this.array[this.j];
          this.array[this.j] = this.array[this.j + 1];
          this.array[this.j + 1] = tmp;
          this.swaps++;
          this.swappedThisPass = true;
          this.explanation = `Troca: V[${this.j}] (${tmp}) > V[${this.j + 1}] (${this.array[this.j]}). Flag trocou = VERDADEIRO.`;
        } else {
          this.explanation = `Mantém: V[${this.j}] (${this.array[this.j]}) ≤ V[${this.j + 1}] (${this.array[this.j + 1]}).`;
        }
        this.j++;
      } else {
        // Fim da passada
        if (this.optimized && !this.swappedThisPass) {
          this.state = 'done';
          this.explanation = `🚀 PARADA ANTECIPADA! Nenhuma troca na passada ${this.i + 1}. Vetor já está ordenado em ${this.comparisons} comparações = Θ(n)!`;
          this.updateUI();
          this.draw();
          return false;
        }
        this.i++;
        this.j = 0;
        this.swappedThisPass = false;
        this.explanation = `Iniciando passada ${this.i + 1}. Elemento maior foi fixado na posição ${n - this.i}.`;
      }

      this.updateUI();
      this.draw();
      return true;
    },

    play() {
      if (this.state === 'running') return;
      this.state = 'running';
      this.updateUI();
      const loop = () => {
        if (this.state !== 'running') return;
        const hasMore = this.step();
        if (hasMore) {
          this.timer = setTimeout(loop, this.speed);
        } else {
          this.state = 'done';
          this.updateUI();
        }
      };
      loop();
    },

    pause() {
      this.state = 'paused';
      if (this.timer) clearTimeout(this.timer);
      this.updateUI();
    },

    updateUI() {
      const statsElem = document.getElementById('bsort-stats');
      if (statsElem) {
        statsElem.innerHTML = `<span>Passada: <b>${this.i + 1}/${this.array.length - 1}</b></span> ` +
          `<span>Comparações: <b>${this.comparisons}</b></span> ` +
          `<span>Trocas: <b>${this.swaps}</b></span> ` +
          `<span>Modo: <b>${this.optimized ? 'Otimizado (com flag)' : 'Padrão'}</b></span>`;
      }
      const expElem = document.getElementById('bsort-explanation');
      if (expElem) expElem.textContent = this.explanation;

      const playBtn = document.getElementById('bsort-play-btn');
      if (playBtn) {
        playBtn.textContent = this.state === 'running' ? '⏸ Pausar' : '▶ Iniciar';
      }
    },

    draw() {
      const info = setupFixedCanvas(this.canvas);
      if (!info) return;
      const { ctx, width, height } = info;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const n = this.array.length;
      const margin = 16;
      const availWidth = width - margin * 2;
      const barWidth = Math.max(18, Math.floor(availWidth / n) - 8);
      const gap = Math.floor((availWidth - barWidth * n) / (n - 1));
      const maxVal = Math.max(...this.array, 10);
      const maxBarH = height - 60;

      for (let idx = 0; idx < n; idx++) {
        const val = this.array[idx];
        const barH = (val / maxVal) * maxBarH;
        const x = margin + idx * (barWidth + gap);
        const y = height - 28 - barH;

        let fillColor = dark ? '#3b82f6' : '#2563eb';

        if (idx >= n - this.i || this.state === 'done') {
          fillColor = '#16a34a'; // Fixado no topo/ordenado
        } else if ((idx === this.j || idx === this.j + 1) && this.state === 'running') {
          fillColor = '#eab308'; // Par sendo comparado
        }

        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
        ctx.fill();

        ctx.fillStyle = dark ? '#f1f5f9' : '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + barWidth / 2, y - 6);

        ctx.fillStyle = dark ? '#94a3b8' : '#64748b';
        ctx.font = '11px monospace';
        ctx.fillText(`[${idx}]`, x + barWidth / 2, height - 10);
      }
    }
  };

  /* ============================================================
     3. BUSCA LINEAR & MELHOR/PIOR CASO
     ============================================================ */
  const LinearSearchDemo = {
    array: [8, 4, 3, 1, 9, 2, 7, 5],
    target: 8,
    currIndex: -1,
    found: false,
    timer: null,

    init(containerId) {
      this.container = document.getElementById(containerId);
      this.render();
    },

    setCase(type) {
      if (this.timer) clearTimeout(this.timer);
      this.currIndex = -1;
      this.found = false;
      if (type === 'best') {
        this.target = 8; // Na 1ª posição -> Theta(1)
      } else if (type === 'average') {
        this.target = 1; // Na 4ª posição -> Theta(n/2) = Theta(n)
      } else if (type === 'worst') {
        this.target = 5; // Na última posição -> Theta(n)
      } else if (type === 'absent') {
        this.target = 99; // Não existe -> Theta(n)
      }
      this.runSearch();
    },

    runSearch() {
      const expElem = document.getElementById('lsearch-exp');
      let idx = 0;
      const step = () => {
        this.currIndex = idx;
        if (idx < this.array.length) {
          if (this.array[idx] === this.target) {
            this.found = true;
            this.render();
            if (expElem) {
              expElem.innerHTML = `✅ <b>Encontrado na posição ${idx}</b> após <b>${idx + 1}</b> comparações! ${idx === 0 ? 'Melhor Caso: Θ(1).' : 'Complexidade: Θ(n).'}`;
            }
            return;
          }
          this.render();
          if (expElem) {
            expElem.innerHTML = `Comparando V[${idx}] = ${this.array[idx]} com alvo ${this.target} (diferente)...`;
          }
          idx++;
          this.timer = setTimeout(step, 450);
        } else {
          this.found = false;
          this.render();
          if (expElem) {
            expElem.innerHTML = `❌ <b>Valor ${this.target} não encontrado</b> após percorrer todo o vetor (${this.array.length} comparações). Pior Caso: Θ(n).`;
          }
        }
      };
      step();
    },

    render() {
      if (!this.container) return;
      let html = '<div style="display:flex; gap:8px; justify-content:center; margin:14px 0;">';
      this.array.forEach((val, i) => {
        let bg = 'var(--code-bg)';
        let border = 'var(--border-color)';
        let text = 'var(--text-main)';
        if (i === this.currIndex) {
          if (this.found) {
            bg = '#22c55e'; border = '#16a34a'; text = '#ffffff';
          } else {
            bg = '#eab308'; border = '#ca8a04'; text = '#000000';
          }
        }
        html += `<div style="border:2px solid ${border}; background:${bg}; color:${text}; border-radius:6px; padding:10px 14px; text-align:center; min-width:36px; font-weight:bold; transition:all 0.2s;">
          <div style="font-size:18px;">${val}</div>
          <div style="font-size:11px; opacity:0.7; font-family:monospace; margin-top:2px;">[${i}]</div>
        </div>`;
      });
      html += '</div>';
      this.container.innerHTML = html;
    }
  };

  /* ============================================================
     4. BUSCA EM MATRIZ N x M VISUALIZER
     ============================================================ */
  const MatrixSearchDemo = {
    canvas: null,
    n: 3, // Linhas
    m: 4, // Colunas
    matrix: [
      [1, 4, 7, 10],
      [2, 5, 8, 11],
      [3, 6, 9, 12]
    ],
    target: 9,
    currI: 0,
    currJ: 0,
    visitedCount: 0,
    timer: null,
    state: 'idle',

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.reset();
    },

    reset() {
      if (this.timer) clearTimeout(this.timer);
      this.currI = -1;
      this.currJ = -1;
      this.visitedCount = 0;
      this.state = 'idle';
      this.draw();
      this.updateUI('Clique em "Escanear Matriz" para observar a visita de cada célula (n · m).');
    },

    scan() {
      if (this.timer) clearTimeout(this.timer);
      let r = 0;
      let c = 0;
      this.visitedCount = 0;
      this.state = 'running';

      const step = () => {
        this.currI = r;
        this.currJ = c;
        this.visitedCount++;
        const val = this.matrix[r][c];

        this.draw();

        if (val === this.target) {
          this.state = 'found';
          this.draw();
          this.updateUI(`🎯 Alvo ${this.target} encontrado em M[${r}][${c}] após ${this.visitedCount} visitas.`);
          return;
        }

        c++;
        if (c >= this.m) {
          c = 0;
          r++;
        }

        if (r < this.n) {
          this.updateUI(`Visitando M[${this.currI}][${this.currJ}] = ${val} (Total visitado: ${this.visitedCount}/${this.n * this.m}).`);
          this.timer = setTimeout(step, 300);
        } else {
          this.state = 'done';
          this.draw();
          this.updateUI(`Varredura completa: todas as ${this.n} × ${this.m} = ${this.n * this.m} células foram visitadas. Custo: O(n · m).`);
        }
      };
      step();
    },

    updateUI(msg) {
      const exp = document.getElementById('matrix-explanation');
      if (exp) exp.textContent = msg;
      const stats = document.getElementById('matrix-stats');
      if (stats) {
        stats.innerHTML = `Dimensão: <b>${this.n} × ${this.m}</b> | Células Visitadas: <b>${this.visitedCount}</b> / <b>${this.n * this.m}</b>`;
      }
    },

    draw() {
      const info = setupFixedCanvas(this.canvas);
      if (!info) return;
      const { ctx, width, height } = info;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const cellW = 54;
      const cellH = 38;
      const startX = (width - this.m * (cellW + 6)) / 2;
      const startY = (height - this.n * (cellH + 6)) / 2;

      for (let r = 0; r < this.n; r++) {
        for (let c = 0; c < this.m; c++) {
          const x = startX + c * (cellW + 6);
          const y = startY + r * (cellH + 6);
          const val = this.matrix[r][c];

          let bg = dark ? '#1e293b' : '#f1f5f9';
          let border = dark ? '#334155' : '#cbd5e1';
          let text = dark ? '#f1f5f9' : '#0f172a';

          // Células já visitadas antes
          if (r < this.currI || (r === this.currI && c < this.currJ)) {
            bg = dark ? '#133529' : '#dcfce7';
            border = '#22c55e';
          }

          // Célula atual
          if (r === this.currI && c === this.currJ) {
            if (this.state === 'found') {
              bg = '#16a34a'; border = '#15803d'; text = '#ffffff';
            } else {
              bg = '#eab308'; border = '#ca8a04'; text = '#000000';
            }
          }

          ctx.fillStyle = bg;
          ctx.strokeStyle = border;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(x, y, cellW, cellH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = text;
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val, x + cellW / 2, y + cellH / 2);
        }
      }
    }
  };

  /* ============================================================
     5. PRIMALIDADE & CURVA O(RAIZ DE N) SIMULATOR
     ============================================================ */
  const PrimalityDemo = {
    canvas: null,
    n: 29,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.test(29);
    },

    test(n) {
      this.n = parseInt(n, 10);
      const rootN = Math.floor(Math.sqrt(this.n));
      const expElem = document.getElementById('prime-exp');
      const statsElem = document.getElementById('prime-stats');

      let isPrime = this.n >= 2;
      let testedDividers = [];
      let foundDivisor = null;

      for (let i = 2; i * i <= this.n; i++) {
        testedDividers.push(i);
        if (this.n % i === 0) {
          isPrime = false;
          foundDivisor = i;
          break;
        }
      }

      const naiveIter = Math.max(0, this.n - 2);
      const optimizedIter = testedDividers.length;
      const savings = naiveIter > 0 ? (((naiveIter - optimizedIter) / naiveIter) * 100).toFixed(1) : 0;

      if (statsElem) {
        statsElem.innerHTML = `Número $n$: <b>${this.n}</b> | $\\lfloor\\sqrt{n}\\rfloor$: <b>${rootN}</b> | ` +
          `Iterações O($\\sqrt{n}$): <b>${optimizedIter}</b> vs Ingênuo O(n): <b>${naiveIter}</b> ` +
          `(<b>${savings}%</b> de redução!)`;
        if (window.renderMathInElement) {
          window.renderMathInElement(statsElem, { delimiters: [{ left: '$', right: '$', display: false }] });
        }
      }

      if (expElem) {
        if (this.n < 2) {
          expElem.innerHTML = `<span style="color:#ef4444; font-weight:bold;">${this.n} não é primo (menor que 2).</span>`;
        } else if (isPrime) {
          expElem.innerHTML = `✅ <b>${this.n} É PRIMO!</b> Verificou apenas $i \\in [${testedDividers.join(', ')}]$ e parou porque $(6^2 = 36 > 29)$. ` +
            `Nenhum teste além de $\\sqrt{${this.n}} \\approx ${Math.sqrt(this.n).toFixed(2)}$ foi necessário!`;
        } else {
          expElem.innerHTML = `❌ <b>${this.n} NÃO É PRIMO!</b> Divisível por <b>${foundDivisor}</b> (${foundDivisor} × ${this.n / foundDivisor} = ${this.n}). ` +
            `Encontrado já no teste $i = ${foundDivisor} \\le \\sqrt{${this.n}}$.`;
        }
        if (window.renderMathInElement) {
          window.renderMathInElement(expElem, { delimiters: [{ left: '$', right: '$', display: false }] });
        }
      }

      this.drawChart();
    },

    drawChart() {
      const info = setupFixedCanvas(this.canvas);
      if (!info) return;
      const { ctx, width, height } = info;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      // Desenha gráfico comparativo de f(n) = n vs f(n) = sqrt(n)
      const padding = 34;
      const graphW = width - padding * 2;
      const graphH = height - padding * 2;

      // Eixos
      ctx.strokeStyle = dark ? '#475569' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      // Curva O(n) - Linear (Vermelho)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(width - padding, padding + 10);
      ctx.stroke();

      // Curva O(sqrt(n)) - Raiz (Azul)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x <= graphW; x += 4) {
        const normX = x / graphW;
        const normY = Math.sqrt(normX);
        const plotX = padding + x;
        const plotY = height - padding - normY * graphH;
        if (x === 0) ctx.moveTo(plotX, plotY);
        else ctx.lineTo(plotX, plotY);
      }
      ctx.stroke();

      // Legendas no Canvas
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('f(n) = n (Busca Ingênua)', width - padding - 140, padding + 22);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText('f(n) = √n (Otimizado)', width - padding - 140, height - padding - graphH * 0.7);
    }
  };

  /* ============================================================
     6. TWO POINTERS (PALÍNDROMO & TWO SUM)
     ============================================================ */
  const TwoPointersDemo = {
    // Demo Palíndromo
    word: 'radar',
    left: 0,
    right: 4,
    palTimer: null,
    palState: 'idle',

    initPal(containerId) {
      this.palContainer = document.getElementById(containerId);
      this.resetPal('radar');
    },

    resetPal(word) {
      if (this.palTimer) clearTimeout(this.palTimer);
      this.word = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      this.left = 0;
      this.right = this.word.length - 1;
      this.palState = 'idle';
      this.renderPal();
      this.updatePalExp(`Palavra: "${this.word}". Clique em "Verificar" para observar os dois ponteiros convergindo ao centro.`);
    },

    stepPal() {
      if (this.left >= this.right) {
        this.palState = 'done';
        this.renderPal();
        this.updatePalExp(`✅ "${this.word}" <b>É PALÍNDROMO!</b> Todos os pares coincidem. Custo total: $\\le n/2$ passos = $O(n)$.`);
        return false;
      }

      if (this.word[this.left] !== this.word[this.right]) {
        this.palState = 'mismatch';
        this.renderPal();
        this.updatePalExp(`❌ Não é palíndromo! Diferença encontrada: S[${this.left}] ('${this.word[this.left]}') ≠ S[${this.right}] ('${this.word[this.right]}').`);
        return false;
      }

      this.updatePalExp(`Comparando S[${this.left}] ('${this.word[this.left]}') com S[${this.right}] ('${this.word[this.right]}') -> Iguais! Avança esq e recua dir.`);
      this.left++;
      this.right--;
      this.renderPal();
      return true;
    },

    playPal() {
      this.palState = 'running';
      const loop = () => {
        const hasMore = this.stepPal();
        if (hasMore) {
          this.palTimer = setTimeout(loop, 600);
        }
      };
      loop();
    },

    updatePalExp(msg) {
      const el = document.getElementById('pal-exp');
      if (el) {
        el.innerHTML = msg;
        if (window.renderMathInElement) {
          window.renderMathInElement(el, { delimiters: [{ left: '$', right: '$', display: false }] });
        }
      }
    },

    renderPal() {
      if (!this.palContainer) return;
      let html = '<div style="display:flex; gap:8px; justify-content:center; margin:12px 0;">';
      for (let i = 0; i < this.word.length; i++) {
        const char = this.word[i];
        let bg = 'var(--code-bg)';
        let border = 'var(--border-color)';
        let text = 'var(--text-main)';

        if (i === this.left || i === this.right) {
          if (this.palState === 'mismatch') {
            bg = '#dc2626'; border = '#b91c1c'; text = '#ffffff';
          } else {
            bg = '#2563eb'; border = '#1d4ed8'; text = '#ffffff';
          }
        } else if (i < this.left && i > this.right) {
          bg = '#16a34a'; border = '#15803d'; text = '#ffffff';
        }

        html += `<div style="border:2px solid ${border}; background:${bg}; color:${text}; border-radius:6px; padding:10px 14px; text-align:center; min-width:32px; font-weight:bold; transition:all 0.2s;">
          <div style="font-size:20px; text-transform:uppercase;">${char}</div>
          <div style="font-size:11px; opacity:0.8; font-family:monospace; margin-top:2px;">[${i}]</div>
          ${i === this.left ? '<div style="font-size:10px; color:#38bdf8; font-weight:bold;">esq</div>' : ''}
          ${i === this.right ? '<div style="font-size:10px; color:#f59e0b; font-weight:bold;">dir</div>' : ''}
        </div>`;
      }
      html += '</div>';
      this.palContainer.innerHTML = html;
    },

    // Demo Two Sum
    twoSumArray: [1, 3, 5, 7, 9, 11, 14, 18],
    twoSumTarget: 16,
    tsLeft: 0,
    tsRight: 7,
    tsTimer: null,
    tsState: 'idle',

    initTwoSum(containerId) {
      this.tsContainer = document.getElementById(containerId);
      this.resetTwoSum(16);
    },

    resetTwoSum(k = 16) {
      if (this.tsTimer) clearTimeout(this.tsTimer);
      this.twoSumTarget = parseInt(k, 10);
      this.tsLeft = 0;
      this.tsRight = this.twoSumArray.length - 1;
      this.tsState = 'idle';
      this.renderTwoSum();
      this.updateTwoSumExp(`Vetor ordenado. Alvo $k = ${this.twoSumTarget}$. Clique em "Buscar Par" para iniciar a convergência dos dois ponteiros.`);
    },

    stepTwoSum() {
      if (this.tsLeft >= this.tsRight) {
        this.tsState = 'done';
        this.renderTwoSum();
        this.updateTwoSumExp(`❌ Nenhum par com soma igual a <b>${this.twoSumTarget}</b> existe no vetor.`);
        return false;
      }

      const sum = this.twoSumArray[this.tsLeft] + this.twoSumArray[this.tsRight];
      if (sum === this.twoSumTarget) {
        this.tsState = 'found';
        this.renderTwoSum();
        this.updateTwoSumExp(`🎯 <b>PAR ENCONTRADO!</b> V[${this.tsLeft}] (${this.twoSumArray[this.tsLeft]}) + V[${this.tsRight}] (${this.twoSumArray[this.tsRight]}) = <b>${sum}</b>.`);
        return false;
      } else if (sum < this.twoSumTarget) {
        this.updateTwoSumExp(`Soma atual $V[${this.tsLeft}] + V[${this.tsRight}] = ${this.twoSumArray[this.tsLeft]} + ${this.twoSumArray[this.tsRight]} = ${sum} < ${this.twoSumTarget}$ (muito pequena) $\\implies$ <b>esq++</b>.`);
        this.tsLeft++;
      } else {
        this.updateTwoSumExp(`Soma atual $V[${this.tsLeft}] + V[${this.tsRight}] = ${this.twoSumArray[this.tsLeft]} + ${this.twoSumArray[this.tsRight]} = ${sum} > ${this.twoSumTarget}$ (muito grande) $\\implies$ <b>dir--</b>.`);
        this.tsRight--;
      }

      this.renderTwoSum();
      return true;
    },

    playTwoSum() {
      this.tsState = 'running';
      const loop = () => {
        const hasMore = this.stepTwoSum();
        if (hasMore) {
          this.tsTimer = setTimeout(loop, 700);
        }
      };
      loop();
    },

    updateTwoSumExp(msg) {
      const el = document.getElementById('twosum-exp');
      if (el) {
        el.innerHTML = msg;
        if (window.renderMathInElement) {
          window.renderMathInElement(el, { delimiters: [{ left: '$', right: '$', display: false }] });
        }
      }
    },

    renderTwoSum() {
      if (!this.tsContainer) return;
      let html = '<div style="display:flex; gap:8px; justify-content:center; margin:12px 0;">';
      for (let i = 0; i < this.twoSumArray.length; i++) {
        const val = this.twoSumArray[i];
        let bg = 'var(--code-bg)';
        let border = 'var(--border-color)';
        let text = 'var(--text-main)';

        if (i === this.tsLeft || i === this.tsRight) {
          if (this.tsState === 'found') {
            bg = '#16a34a'; border = '#15803d'; text = '#ffffff';
          } else {
            bg = i === this.tsLeft ? '#2563eb' : '#d97706';
            border = i === this.tsLeft ? '#1d4ed8' : '#b45309';
            text = '#ffffff';
          }
        }

        html += `<div style="border:2px solid ${border}; background:${bg}; color:${text}; border-radius:6px; padding:10px 14px; text-align:center; min-width:32px; font-weight:bold; transition:all 0.2s;">
          <div style="font-size:19px;">${val}</div>
          <div style="font-size:11px; opacity:0.8; font-family:monospace; margin-top:2px;">[${i}]</div>
          ${i === this.tsLeft ? '<div style="font-size:10px; color:#38bdf8; font-weight:bold;">esq</div>' : ''}
          ${i === this.tsRight ? '<div style="font-size:10px; color:#fbbf24; font-weight:bold;">dir</div>' : ''}
        </div>`;
      }
      html += '</div>';
      this.tsContainer.innerHTML = html;
    }
  };

  /* ============================================================
     7. COMPARADOR GRÁFICO DE CLASSES DE COMPLEXIDADE
     ============================================================ */
  const ComplexityChart = {
    canvas: null,
    n: 16,

    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.setN(16);
    },

    setN(val) {
      this.n = parseInt(val, 10);
      this.draw();
      this.updateTable();
    },

    updateTable() {
      const tableBody = document.getElementById('comp-table-body');
      if (!tableBody) return;
      const n = this.n;

      const funcs = [
        { name: 'O(1)', val: 1, color: '#22c55e' },
        { name: 'O(log n)', val: Math.log2(n).toFixed(2), color: '#06b6d4' },
        { name: 'O(√n)', val: Math.sqrt(n).toFixed(2), color: '#38bdf8' },
        { name: 'O(n)', val: n, color: '#3b82f6' },
        { name: 'O(n log n)', val: (n * Math.log2(n)).toFixed(2), color: '#eab308' },
        { name: 'O(n²)', val: n * n, color: '#f97316' },
        { name: 'O(n³)', val: n * n * n, color: '#ef4444' }
      ];

      tableBody.innerHTML = funcs.map(f => `<tr>
        <td style="font-weight:bold; color:${f.color};">${f.name}</td>
        <td style="font-family:monospace; font-weight:bold;">${f.val}</td>
      </tr>`).join('');
    },

    draw() {
      const info = setupFixedCanvas(this.canvas);
      if (!info) return;
      const { ctx, width, height } = info;
      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);

      const padding = 36;
      const w = width - padding * 2;
      const h = height - padding * 2;

      // Eixos
      ctx.strokeStyle = dark ? '#475569' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      const maxN = 30;
      const maxY = 250;

      const curves = [
        { fn: n => 1, color: '#22c55e', name: 'O(1)' },
        { fn: n => Math.log2(n), color: '#06b6d4', name: 'O(log n)' },
        { fn: n => Math.sqrt(n), color: '#38bdf8', name: 'O(√n)' },
        { fn: n => n, color: '#3b82f6', name: 'O(n)' },
        { fn: n => n * Math.log2(n), color: '#eab308', name: 'O(n log n)' },
        { fn: n => n * n, color: '#f97316', name: 'O(n²)' },
        { fn: n => Math.min(maxY, n * n * n), color: '#ef4444', name: 'O(n³)' }
      ];

      curves.forEach(c => {
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = 1; x <= maxN; x += 0.5) {
          const y = c.fn(x);
          const px = padding + (x / maxN) * w;
          const py = height - padding - Math.min(1, y / maxY) * h;
          if (x === 1) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });

      // Linha vertical do n atual
      const curX = padding + (this.n / maxN) * w;
      ctx.strokeStyle = dark ? '#f1f5f9' : '#0f172a';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(curX, padding);
      ctx.lineTo(curX, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = dark ? '#f1f5f9' : '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`n = ${this.n}`, curX, padding - 8);
    }
  };

  return {
    SelectionSortDemo,
    BubbleSortDemo,
    LinearSearchDemo,
    MatrixSearchDemo,
    PrimalityDemo,
    TwoPointersDemo,
    ComplexityChart
  };
})();
