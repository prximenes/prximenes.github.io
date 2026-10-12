/**
 * SIMULADOR INTERATIVO: POLINOMIAL VS EXPONENCIAL
 * Análise de Algoritmos • Aula 7 (Slide 16) • UNICAP
 * Autor: Prof. Pedro Ximenes
 */

(function () {
  'use strict';

  // Configurações e Estado
  const state = {
    n: 10,
    maxN: 35,
    scaleMode: 'linear', // 'linear' ou 'log'
    activeCurves: {
      exp: true,     // 2^n
      cube: true,    // n^3
      quad: true,    // n^2
      lin: false,    // n
      quartic: false // n^4
    },
    isPlaying: false,
    playTimer: null,
    playSpeed: 450, // ms por incremento
    hoveredPoint: null
  };

  // Funções Matemáticas
  const functions = {
    lin: {
      id: 'lin',
      name: 'n',
      label: 'n (linear)',
      latex: 'n',
      color: '#a855f7',
      eval: (n) => n,
      type: 'polinomial'
    },
    quad: {
      id: 'quad',
      name: 'n²',
      label: 'n² (polinomial)',
      latex: 'n^2',
      color: '#3b82f6',
      eval: (n) => Math.pow(n, 2),
      type: 'polinomial'
    },
    cube: {
      id: 'cube',
      name: 'n³',
      label: 'n³ (polinomial)',
      latex: 'n^3',
      color: '#10b981',
      eval: (n) => Math.pow(n, 3),
      type: 'polinomial'
    },
    quartic: {
      id: 'quartic',
      name: 'n⁴',
      label: 'n⁴ (polinomial)',
      latex: 'n^4',
      color: '#f59e0b',
      eval: (n) => Math.pow(n, 4),
      type: 'polinomial'
    },
    exp: {
      id: 'exp',
      name: '2ⁿ',
      label: '2ⁿ (exponencial)',
      latex: '2^n',
      color: '#ef4444',
      eval: (n) => Math.pow(2, n),
      type: 'exponencial'
    }
  };

  // Conversão de Operações em Tempo Humano (em CPU de 1 GHz = 10^9 ops/s)
  function formatHumanTime(ops) {
    if (!isFinite(ops) || ops > 1e100) return 'Inconcebível (> 10¹⁰⁰ ops)';
    const sec = ops / 1e9; // 1 GHz

    if (sec < 1e-9) return `${(sec * 1e12).toFixed(1)} ps`;
    if (sec < 1e-6) return `${(sec * 1e9).toFixed(2)} ns`;
    if (sec < 1e-3) return `${(sec * 1e6).toFixed(2)} µs`;
    if (sec < 1) return `${(sec * 1e3).toFixed(2)} ms`;
    if (sec < 60) return `${sec.toFixed(2)} s`;
    if (sec < 3600) return `${(sec / 60).toFixed(1)} min`;
    if (sec < 86400) return `${(sec / 3600).toFixed(1)} h`;
    if (sec < 31536000) return `${(sec / 86400).toFixed(1)} dias`;
    const anos = sec / 31536000;
    if (anos < 1e6) return `${anos.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} anos`;
    const idadeUniverso = anos / 1.38e10; // 13.8 bilhões de anos
    if (idadeUniverso < 1) return `${anos.toExponential(2)} anos`;
    return `${idadeUniverso.toExponential(2)}× a Idade do Universo! 🌌`;
  }

  function formatBigNumber(val) {
    if (!isFinite(val)) return '∞';
    if (val >= 1e12) {
      return val.toExponential(3);
    }
    return val.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  }

  // Elementos do DOM
  let canvas, ctx;
  let nSlider, nValDisplay, playBtn;
  let canvasTooltip;

  function init() {
    canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    nSlider = document.getElementById('nSlider');
    nValDisplay = document.getElementById('nValDisplay');
    playBtn = document.getElementById('playBtn');
    canvasTooltip = document.getElementById('canvasTooltip');

    setupEventListeners();
    updateThemeUI();
    render();
  }

  function setupEventListeners() {
    window.addEventListener('resize', () => {
      render();
    });

    // Slider de n
    if (nSlider) {
      nSlider.addEventListener('input', (e) => {
        state.n = parseInt(e.target.value, 10);
        updateTelemetry();
        render();
      });
    }

    // Botões Step (-1, +1, etc)
    const stepBtns = document.querySelectorAll('.step-btn');
    stepBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const delta = parseInt(btn.getAttribute('data-delta'), 10);
        setN(state.n + delta);
      });
    });

    // Play / Pause
    if (playBtn) {
      playBtn.addEventListener('click', togglePlay);
    }

    // Escala (Linear vs Log)
    const scaleBtns = document.querySelectorAll('.scale-btn');
    scaleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        scaleBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.scaleMode = btn.getAttribute('data-scale');
        render();
      });
    });

    // Chips de Ativação de Curvas
    const chips = document.querySelectorAll('.curve-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const fn = chip.getAttribute('data-fn');
        state.activeCurves[fn] = !state.activeCurves[fn];
        chip.classList.toggle('active', state.activeCurves[fn]);
        updateTelemetry();
        render();
      });
    });

    // Botões de Cenários Pré-programados
    const scenarioBtns = document.querySelectorAll('.scenario-btn');
    scenarioBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetN = parseInt(btn.getAttribute('data-n'), 10);
        const forceScale = btn.getAttribute('data-scale');
        if (forceScale) {
          state.scaleMode = forceScale;
          document.querySelectorAll('.scale-btn').forEach((b) => {
            b.classList.toggle('active', b.getAttribute('data-scale') === forceScale);
          });
        }
        setN(targetN);
      });
    });

    // Mouse Move sobre o Canvas para Hover e Tooltip
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseleave', () => {
      if (canvasTooltip) canvasTooltip.style.display = 'none';
      state.hoveredPoint = null;
      render();
    });

    // Click no Canvas para definir n diretamente
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const padding = getPadding(rect.width, rect.height);
      const graphW = rect.width - padding.left - padding.right;

      if (mouseX >= padding.left && mouseX <= padding.left + graphW) {
        const ratio = (mouseX - padding.left) / graphW;
        const clickedN = Math.round(1 + ratio * (state.maxN - 1));
        setN(clickedN);
      }
    });

    // Tema Claro / Escuro
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        const isLight = document.body.classList.contains('theme-light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateThemeUI();
        render();
      });
    }

    // Fullscreen
    const fsBtn = document.getElementById('fullscreen-btn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Atalhos de Teclado
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') setN(state.n + 1);
      else if (e.key === 'ArrowLeft') setN(state.n - 1);
      else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'l' || e.key === 'L') {
        const nextScale = state.scaleMode === 'linear' ? 'log' : 'linear';
        document.querySelector(`.scale-btn[data-scale="${nextScale}"]`).click();
      }
    });
  }

  function setN(newN) {
    state.n = Math.max(1, Math.min(newN, state.maxN));
    if (nSlider) nSlider.value = state.n;
    if (nValDisplay) nValDisplay.textContent = state.n;
    updateTelemetry();
    render();
  }

  function togglePlay() {
    state.isPlaying = !state.isPlaying;
    if (playBtn) {
      playBtn.innerHTML = state.isPlaying
        ? '<span>⏸</span> <span>Pausar</span>'
        : '<span>▶</span> <span>Animar</span>';
      playBtn.style.background = state.isPlaying ? '#ef4444' : '#10b981';
    }

    if (state.isPlaying) {
      state.playTimer = setInterval(() => {
        if (state.n >= state.maxN) {
          setN(1);
        } else {
          setN(state.n + 1);
        }
      }, state.playSpeed);
    } else {
      clearInterval(state.playTimer);
      state.playTimer = null;
    }
  }

  function updateThemeUI() {
    const isLight = document.body.classList.contains('theme-light');
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = isLight
        ? '<span>☀️</span> <span>Claro</span>'
        : '<span>🌙</span> <span>Escuro</span>';
    }
  }

  function getPadding(w, h) {
    return {
      left: 70,
      right: 120,
      top: 40,
      bottom: 50
    };
  }

  // Renderização Completa do Gráfico no Canvas
  function render() {
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isLight = document.body.classList.contains('theme-light');
    const padding = getPadding(width, height);
    const graphW = width - padding.left - padding.right;
    const graphH = height - padding.top - padding.bottom;

    // Fundo do Canvas
    ctx.fillStyle = isLight ? '#ffffff' : '#0a0f1d';
    ctx.fillRect(0, 0, width, height);

    // Determinar Limites do Eixo Y
    let minY = 0;
    let maxY;

    if (state.scaleMode === 'linear') {
      // No modo linear, calculamos o valor máximo baseado no n atual (com teto adaptativo)
      // Para manter a proporção pedagógica do slide 16
      const currentMaxExp = Math.pow(2, Math.min(state.n, 20));
      const currentMaxCube = Math.pow(state.n, 3);
      maxY = Math.max(currentMaxExp * 1.15, currentMaxCube * 1.25, 100);
      minY = 0;
    } else {
      // Modo Logarítmico (log10)
      minY = 0; // 10^0 = 1
      maxY = 12; // 10^12
    }

    // Funções de Projeção (Coordenadas Matemáticas -> Pixels na Tela)
    function mapX(nVal) {
      return padding.left + ((nVal - 1) / (state.maxN - 1)) * graphW;
    }

    function mapY(val) {
      if (state.scaleMode === 'linear') {
        const clamped = Math.max(0, Math.min(val, maxY));
        return padding.top + graphH - (clamped / maxY) * graphH;
      } else {
        const logVal = val <= 1 ? 0 : Math.log10(val);
        const clamped = Math.max(minY, Math.min(logVal, maxY));
        return padding.top + graphH - (clamped / maxY) * graphH;
      }
    }

    // 1. Grade de Fundo e Linhas de Referência
    drawGrid(padding, graphW, graphH, width, height, minY, maxY, isLight);

    // 2. Indicadores de Limiar / Threshold (n=4 e n=10)
    drawThresholds(mapX, padding, graphH, isLight);

    // 3. Desenhar Curvas Ativas
    drawCurves(mapX, mapY, isLight);

    // 4. Desenhar Eixos X e Y estilo TikZ (Idênticos ao Slide 16)
    drawAxes(padding, graphW, graphH, isLight);

    // 5. Linha Indicadora do n Atual com Pontos Luminosos
    drawCurrentNMarker(mapX, mapY, padding, graphH, isLight);
  }

  // Grade e Rótulos dos Eixos
  function drawGrid(padding, graphW, graphH, w, h, minY, maxY, isLight) {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';
    ctx.fillStyle = isLight ? '#64748b' : '#64748b';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    // Linhas Verticais de n
    const stepN = state.maxN <= 20 ? 2 : 5;
    for (let nVal = 1; nVal <= state.maxN; nVal += (nVal === 1 ? stepN - 1 : stepN)) {
      const x = padding.left + ((nVal - 1) / (state.maxN - 1)) * graphW;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + graphH);
      ctx.stroke();

      // Rótulo de n no eixo
      ctx.fillText(nVal.toString(), x, padding.top + graphH + 18);
    }

    // Linhas Horizontais de T(n)
    ctx.textAlign = 'right';
    if (state.scaleMode === 'linear') {
      const ticks = 5;
      for (let i = 0; i <= ticks; i++) {
        const val = (maxY / ticks) * i;
        const y = padding.top + graphH - (i / ticks) * graphH;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + graphW, y);
        ctx.stroke();

        ctx.fillText(formatBigNumber(val), padding.left - 10, y + 4);
      }
    } else {
      // Modo Log10 (10^0 até 10^12)
      for (let exp = 0; exp <= 12; exp += 2) {
        const y = padding.top + graphH - (exp / 12) * graphH;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + graphW, y);
        ctx.stroke();

        ctx.fillText(`10^${exp}`, padding.left - 10, y + 4);
      }
    }
    ctx.restore();
  }

  // Eixos Principais TikZ com Setas
  function drawAxes(padding, graphW, graphH, isLight) {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isLight ? '#0f172a' : '#cbd5e1';
    ctx.fillStyle = isLight ? '#0f172a' : '#cbd5e1';

    const originX = padding.left;
    const originY = padding.top + graphH;

    // Eixo X: (0,0) -> (7,0) node[right] {$n$}
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + graphW + 20, originY);
    ctx.stroke();

    // Seta Eixo X
    drawArrowHead(originX + graphW + 20, originY, 'right');

    // Rótulo Eixo X "$n$"
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillText('n', originX + graphW + 30, originY + 5);

    // Eixo Y: (0,0) -> (0,4.5) node[above] {$T(n)$}
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, padding.top - 15);
    ctx.stroke();

    // Seta Eixo Y
    drawArrowHead(originX, padding.top - 15, 'up');

    // Rótulo Eixo Y "$T(n)$"
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('T(n)', originX, padding.top - 25);

    ctx.restore();
  }

  function drawArrowHead(x, y, dir) {
    const size = 6;
    ctx.beginPath();
    if (dir === 'right') {
      ctx.moveTo(x, y);
      ctx.lineTo(x - size * 1.5, y - size);
      ctx.lineTo(x - size * 1.5, y + size);
    } else if (dir === 'up') {
      ctx.moveTo(x, y);
      ctx.lineTo(x - size, y + size * 1.5);
      ctx.lineTo(x + size, y + size * 1.5);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Pontos Críticos / Limiares
  function drawThresholds(mapX, padding, graphH, isLight) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.2;
    ctx.font = '10px "Inter", sans-serif';

    // Limiar 1: n = 4 (2^n cruza n^2)
    const x4 = mapX(4);
    ctx.strokeStyle = isLight ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.35)';
    ctx.beginPath();
    ctx.moveTo(x4, padding.top);
    ctx.lineTo(x4, padding.top + graphH);
    ctx.stroke();

    // Limiar 2: n = 10 (2^n cruza n^3: 1024 > 1000)
    const x10 = mapX(10);
    ctx.strokeStyle = isLight ? 'rgba(239, 68, 68, 0.45)' : 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.moveTo(x10, padding.top);
    ctx.lineTo(x10, padding.top + graphH);
    ctx.stroke();

    ctx.restore();
  }

  // Desenhar Curvas Matemáticas
  function drawCurves(mapX, mapY, isLight) {
    const keys = Object.keys(functions);

    keys.forEach((key) => {
      if (!state.activeCurves[key]) return;
      const fnObj = functions[key];

      ctx.save();
      ctx.lineWidth = key === 'exp' ? 3.5 : 2.8;
      ctx.strokeStyle = fnObj.color;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Glow suave nas curvas
      if (!isLight) {
        ctx.shadowColor = fnObj.color;
        ctx.shadowBlur = key === 'exp' ? 12 : 6;
      }

      ctx.beginPath();
      let first = true;
      const step = 0.2; // Alta resolução de traçado
      let lastX = 0, lastY = 0;

      for (let nVal = 1; nVal <= state.maxN; nVal += step) {
        const val = fnObj.eval(nVal);
        const px = mapX(nVal);
        const py = mapY(val);

        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
        lastX = px;
        lastY = py;

        // Se sair muito do topo no modo linear, encerra o traçado
        if (state.scaleMode === 'linear' && py < getPadding(0, 0).top - 10) {
          break;
        }
      }
      ctx.stroke();
      ctx.restore();

      // Rótulo da Curva no Final (Ex: "2^n (exponencial)", idêntico ao Slide 16)
      ctx.save();
      ctx.font = 'bold 12.5px "Inter", sans-serif';
      ctx.fillStyle = fnObj.color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const labelText = fnObj.label;
      const labelX = Math.min(lastX + 8, canvas.getBoundingClientRect().width - 110);
      const labelY = Math.max(30, Math.min(lastY, canvas.getBoundingClientRect().height - 40));

      ctx.fillText(labelText, labelX, labelY);
      ctx.restore();
    });
  }

  // Indicador de n Atual
  function drawCurrentNMarker(mapX, mapY, padding, graphH, isLight) {
    const currentX = mapX(state.n);

    ctx.save();
    // Linha vertical de foco
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = isLight ? '#0284c7' : '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(currentX, padding.top);
    ctx.lineTo(currentX, padding.top + graphH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ponto em cada curva ativa no n atual
    Object.keys(functions).forEach((key) => {
      if (!state.activeCurves[key]) return;
      const fnObj = functions[key];
      const val = fnObj.eval(state.n);
      const currentY = mapY(val);

      // Ponto luminoso
      ctx.beginPath();
      ctx.arc(currentX, currentY, key === 'exp' ? 6 : 5, 0, Math.PI * 2);
      ctx.fillStyle = fnObj.color;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isLight ? '#ffffff' : '#0a0f1d';
      ctx.stroke();
    });

    ctx.restore();
  }

  // Hover do Mouse sobre o Canvas
  function handleCanvasMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const padding = getPadding(rect.width, rect.height);
    const graphW = rect.width - padding.left - padding.right;

    if (mouseX >= padding.left && mouseX <= padding.left + graphW) {
      const ratio = (mouseX - padding.left) / graphW;
      const hoveredN = Math.round(1 + ratio * (state.maxN - 1));

      // Tooltip flutuante
      if (canvasTooltip) {
        let html = `<strong>n = ${hoveredN}</strong><br>`;
        Object.keys(functions).forEach((key) => {
          if (!state.activeCurves[key]) return;
          const fn = functions[key];
          const val = fn.eval(hoveredN);
          html += `<span style="color:${fn.color}">●</span> ${fn.name}: <b>${formatBigNumber(val)}</b><br>`;
        });
        canvasTooltip.innerHTML = html;
        canvasTooltip.style.display = 'block';

        // Posição inteligente
        const tooltipX = mouseX + 15 > rect.width - 150 ? mouseX - 160 : mouseX + 15;
        const tooltipY = Math.max(10, mouseY - 20);
        canvasTooltip.style.left = `${tooltipX}px`;
        canvasTooltip.style.top = `${tooltipY}px`;
      }
    } else {
      if (canvasTooltip) canvasTooltip.style.display = 'none';
    }
  }

  // Atualizar Telemetria e Comparativos em Tempo Real no Painel
  function updateTelemetry() {
    const n = state.n;

    // Valores Numéricos
    const valExp = functions.exp.eval(n);
    const valCube = functions.cube.eval(n);
    const valQuad = functions.quad.eval(n);
    const valLin = functions.lin.eval(n);
    const valQuartic = functions.quartic.eval(n);

    updateValElement('val-exp-num', formatBigNumber(valExp));
    updateValElement('val-exp-time', formatHumanTime(valExp));

    updateValElement('val-cube-num', formatBigNumber(valCube));
    updateValElement('val-cube-time', formatHumanTime(valCube));

    updateValElement('val-quad-num', formatBigNumber(valQuad));
    updateValElement('val-quad-time', formatHumanTime(valQuad));

    updateValElement('val-lin-num', formatBigNumber(valLin));
    updateValElement('val-lin-time', formatHumanTime(valLin));

    updateValElement('val-quartic-num', formatBigNumber(valQuartic));
    updateValElement('val-quartic-time', formatHumanTime(valQuartic));

    // Razão 2^n / n^3
    const ratio = valExp / (valCube || 1);
    const ratioEl = document.getElementById('ratioDisplay');
    if (ratioEl) {
      if (ratio < 1) {
        ratioEl.innerHTML = `Para <strong>n = ${n}</strong>, o polinômio <strong>n³ (${formatBigNumber(valCube)})</strong> ainda é maior que <strong>2ⁿ (${formatBigNumber(valExp)})</strong>.`;
      } else if (ratio === 1) {
        ratioEl.innerHTML = `Ponto de cruzamento exato! <strong>2ⁿ = n³</strong>.`;
      } else {
        const times = ratio >= 1e6 ? ratio.toExponential(1) : Math.round(ratio).toLocaleString('pt-BR');
        ratioEl.innerHTML = `Para <strong>n = ${n}</strong>, <strong>2ⁿ</strong> é <strong style="color:#ef4444">${times}×</strong> maior que <strong>n³</strong>!`;
      }
    }
  }

  function updateValElement(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Iniciar após DOM pronto
  document.addEventListener('DOMContentLoaded', init);

})();
