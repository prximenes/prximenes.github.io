/**
 * canvas-demos.js
 * Módulos de ilustrações interativas em Canvas 2D para a aula de Transformações 2D
 * Desenvolvido com suporte a Tema Claro (Warsaw Beamer) e Tema Escuro
 */

// Obter paleta de cores de acordo com o tema atual
function getThemeColors() {
  const isDark = document.body.classList.contains('theme-dark');
  if (isDark) {
    return {
      bg: '#070c18',
      grid: 'rgba(255, 255, 255, 0.08)',
      axes: 'rgba(96, 165, 250, 0.6)',
      axisLabels: '#94a3b8',
      origPoint: '#3b82f6',
      origFill: 'rgba(59, 130, 246, 0.25)',
      origText: '#93c5fd',
      transPoint: '#f43f5e',
      transFill: 'rgba(244, 63, 94, 0.3)',
      transText: '#fda4af',
      vector: '#f59e0b',
      vectorText: '#fbbf24',
      guideLines: 'rgba(245, 158, 11, 0.4)',
      accentGreen: '#10b981',
      accentPurple: '#8b5cf6'
    };
  } else {
    return {
      bg: '#ffffff',
      grid: 'rgba(0, 0, 0, 0.08)',
      axes: '#1b356b',
      axisLabels: '#475569',
      origPoint: '#1d4ed8',
      origFill: 'rgba(29, 78, 216, 0.18)',
      origText: '#1e3a8a',
      transPoint: '#b91c1c',
      transFill: 'rgba(185, 28, 28, 0.2)',
      transText: '#991b1b',
      vector: '#d97706',
      vectorText: '#b45309',
      guideLines: 'rgba(217, 119, 6, 0.5)',
      accentGreen: '#15803d',
      accentPurple: '#6d28d9'
    };
  }
}

// Configuração robusta de canvas com dimensões lógicas fixas (evita bug de tamanho 0 em slides ocultos)
function setupFixedCanvas(canvas, logicalWidth, logicalHeight) {
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
  ctx.scale(dpr, dpr);
  return { ctx, width: logicalWidth, height: logicalHeight };
}

// Desenho de grade cartesiana precisa
function drawGrid(ctx, width, height, originX, originY, scale = 36, xRange = [-5, 8], yRange = [-3, 7]) {
  const colors = getThemeColors();
  ctx.save();
  
  // Fundo
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  // Linhas da grade secundárias
  ctx.lineWidth = 1;
  ctx.strokeStyle = colors.grid;
  
  const startX = originX % scale;
  for (let x = startX; x < width; x += scale) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  const startY = originY % scale;
  for (let y = startY; y < height; y += scale) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Eixos X e Y
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = colors.axes;
  
  // Eixo X
  ctx.beginPath();
  ctx.moveTo(0, originY);
  ctx.lineTo(width, originY);
  ctx.stroke();
  
  // Seta X
  ctx.fillStyle = colors.axes;
  ctx.beginPath();
  ctx.moveTo(width - 8, originY - 4);
  ctx.lineTo(width, originY);
  ctx.lineTo(width - 8, originY + 4);
  ctx.fill();

  // Eixo Y
  ctx.beginPath();
  ctx.moveTo(originX, 0);
  ctx.lineTo(originX, height);
  ctx.stroke();
  
  // Seta Y
  ctx.beginPath();
  ctx.moveTo(originX - 4, 8);
  ctx.lineTo(originX, 0);
  ctx.lineTo(originX + 4, 8);
  ctx.fill();

  // Rótulos numéricos nos eixos
  ctx.font = '10px "Fira Code", monospace';
  ctx.fillStyle = colors.axisLabels;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let i = xRange[0]; i <= xRange[1]; i++) {
    if (i === 0) continue;
    const px = originX + i * scale;
    if (px > 10 && px < width - 10) {
      ctx.fillText(i.toString(), px, originY + 4);
      ctx.beginPath();
      ctx.moveTo(px, originY - 3);
      ctx.lineTo(px, originY + 3);
      ctx.strokeStyle = colors.axes;
      ctx.stroke();
    }
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = yRange[0]; i <= yRange[1]; i++) {
    if (i === 0) continue;
    const py = originY - i * scale;
    if (py > 10 && py < height - 10) {
      ctx.fillText(i.toString(), originX - 6, py);
      ctx.beginPath();
      ctx.moveTo(originX - 3, py);
      ctx.lineTo(originX + 3, py);
      ctx.strokeStyle = colors.axes;
      ctx.stroke();
    }
  }

  // Origem 0
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('0', originX - 4, originY + 4);

  // Rótulos dos eixos X e Y
  ctx.fillStyle = colors.axes;
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('X', width - 12, originY - 14);
  ctx.textAlign = 'left';
  ctx.fillText('Y', originX + 8, 12);

  ctx.restore();
}

// Desenho de seta
function drawArrow(ctx, fromX, fromY, toX, toY, color = '#d97706', width = 2, headLen = 8) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Helper seguro para renderizar fórmulas KaTeX
function safeRenderKaTeX(mathString, targetElement) {
  if (!targetElement) return;
  if (window.katex) {
    try {
      window.katex.render(mathString, targetElement, { displayMode: true, throwOnError: false });
    } catch (e) {
      targetElement.textContent = mathString;
    }
  } else {
    targetElement.textContent = mathString;
  }
}

// ==========================================================================
// 1. DEMO: Visão Geral das Transformações (Slide 4)
// ==========================================================================
function initOverviewDemo() {
  const canvas = document.getElementById('canvas-overview');
  if (!canvas) return;

  const setup = setupFixedCanvas(canvas, 480, 260);
  if (!setup) return;
  const { ctx, width, height } = setup;

  let currentMode = window._ov_mode || 'all';

  const btnOrig = document.getElementById('btn-ov-orig');
  const btnTrans = document.getElementById('btn-ov-trans');
  const btnRot = document.getElementById('btn-ov-rot');
  const btnScale = document.getElementById('btn-ov-scale');
  const btnAll = document.getElementById('btn-ov-all');
  const codeBox = document.getElementById('code-ov-preview');

  function updateCode(mode) {
    if (!codeBox) return;
    switch(mode) {
      case 'orig':
        codeBox.innerHTML = `<span class="cmt">// 1. Sem transformação</span>\n<span class="fn">ctx</span>.<span class="fn">fillStyle</span> = <span class="str">'#1d4ed8'</span>;\n<span class="fn">ctx</span>.<span class="fn">fillRect</span>(<span class="num">0</span>, <span class="num">0</span>, <span class="num">50</span>, <span class="num">40</span>);`;
        break;
      case 'trans':
        codeBox.innerHTML = `<span class="cmt">// 2. Translação (move o objeto)</span>\n<span class="fn">ctx</span>.<span class="fn">save</span>();\n<span class="fn">ctx</span>.<span class="fn">translate</span>(<span class="num">120</span>, <span class="num">40</span>); <span class="cmt">// tx=120, ty=40</span>\n<span class="fn">desenharObjeto</span>(ctx);\n<span class="fn">ctx</span>.<span class="fn">restore</span>();`;
        break;
      case 'rot':
        codeBox.innerHTML = `<span class="cmt">// 3. Rotação (gira em radianos)</span>\n<span class="fn">ctx</span>.<span class="fn">save</span>();\n<span class="fn">ctx</span>.<span class="fn">rotate</span>(<span class="num">30</span> * <span class="num">Math.PI</span> / <span class="num">180</span>); <span class="cmt">// 30°</span>\n<span class="fn">desenharObjeto</span>(ctx);\n<span class="fn">ctx</span>.<span class="fn">restore</span>();`;
        break;
      case 'scale':
        codeBox.innerHTML = `<span class="cmt">// 4. Escala (altera dimensões)</span>\n<span class="fn">ctx</span>.<span class="fn">save</span>();\n<span class="fn">ctx</span>.<span class="fn">scale</span>(<span class="num">1.6</span>, <span class="num">1.3</span>); <span class="cmt">// sx=1.6, sy=1.3</span>\n<span class="fn">desenharObjeto</span>(ctx);\n<span class="fn">ctx</span>.<span class="fn">restore</span>();`;
        break;
      case 'all':
        codeBox.innerHTML = `<span class="cmt">// 5. Composição de Transformações</span>\n<span class="fn">ctx</span>.<span class="fn">save</span>();\n<span class="fn">ctx</span>.<span class="fn">translate</span>(<span class="num">110</span>, <span class="num">30</span>);\n<span class="fn">ctx</span>.<span class="fn">rotate</span>(<span class="num">25</span> * <span class="num">Math.PI</span> / <span class="num">180</span>);\n<span class="fn">ctx</span>.<span class="fn">scale</span>(<span class="num">1.3</span>, <span class="num">1.3</span>);\n<span class="fn">desenharObjeto</span>(ctx);\n<span class="fn">ctx</span>.<span class="fn">restore</span>();`;
        break;
    }
  }

  function setMode(mode, btn) {
    currentMode = mode;
    window._ov_mode = mode;
    document.querySelectorAll('.btn-ov-group .btn').forEach(b => b.classList.remove('btn-active'));
    if (btn) btn.classList.add('btn-active');
    updateCode(mode);
    render();
  }

  if (btnOrig) btnOrig.onclick = () => setMode('orig', btnOrig);
  if (btnTrans) btnTrans.onclick = () => setMode('trans', btnTrans);
  if (btnRot) btnRot.onclick = () => setMode('rot', btnRot);
  if (btnScale) btnScale.onclick = () => setMode('scale', btnScale);
  if (btnAll) btnAll.onclick = () => setMode('all', btnAll);

  function drawShape(c, strokeColor, fillColor) {
    c.save();
    c.fillStyle = fillColor;
    c.strokeStyle = strokeColor;
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(50, 0);
    c.lineTo(50, 40);
    c.lineTo(25, 60);
    c.lineTo(0, 40);
    c.closePath();
    c.fill();
    c.stroke();

    // Detalhe
    c.fillStyle = strokeColor;
    c.fillRect(16, 12, 18, 16);
    c.restore();
  }

  function render() {
    const colors = getThemeColors();
    const originX = 130;
    const originY = 175;
    drawGrid(ctx, width, height, originX, originY, 36, [-2, 8], [-2, 5]);

    // Fantasma original
    ctx.save();
    ctx.translate(originX, originY);
    ctx.setLineDash([4, 4]);
    drawShape(ctx, colors.axisLabels, 'rgba(148, 163, 184, 0.1)');
    ctx.fillStyle = colors.axisLabels;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Original', 4, -6);
    ctx.restore();

    // Transformado
    ctx.save();
    ctx.translate(originX, originY);

    if (currentMode === 'trans') {
      const tx = 130;
      const ty = -50;
      drawArrow(ctx, 25, 20, 25 + tx, 20 + ty, colors.vector, 2);
      ctx.translate(tx, ty);
      drawShape(ctx, colors.transPoint, colors.transFill);
      ctx.fillStyle = colors.transText;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('Translação', 4, -6);
    } else if (currentMode === 'rot') {
      const angle = 30 * Math.PI / 180;
      ctx.rotate(-angle);
      drawShape(ctx, colors.vector, colors.transFill);
      ctx.fillStyle = colors.vectorText;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('Rotação (30°)', 4, -6);
    } else if (currentMode === 'scale') {
      ctx.scale(1.5, 1.3);
      drawShape(ctx, colors.accentGreen, 'rgba(16, 185, 129, 0.25)');
      ctx.fillStyle = colors.accentGreen;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('Escala (1.5x, 1.3x)', 4, -6);
    } else if (currentMode === 'all') {
      const tx = 110;
      const ty = -40;
      const angle = 25 * Math.PI / 180;
      ctx.translate(tx, ty);
      ctx.rotate(-angle);
      ctx.scale(1.25, 1.25);
      drawShape(ctx, colors.accentPurple, 'rgba(139, 92, 246, 0.25)');
      ctx.fillStyle = colors.accentPurple;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('T + R + S', 4, -6);
    } else {
      drawShape(ctx, colors.origPoint, colors.origFill);
    }

    ctx.restore();
  }

  updateCode(currentMode);
  render();
}

// ==========================================================================
// 2. DEMO: Translação Numérica Interativa (Slide 7)
// ==========================================================================
function initTranslationDemo() {
  const canvas = document.getElementById('canvas-translation');
  if (!canvas) return;

  const setup = setupFixedCanvas(canvas, 460, 280);
  if (!setup) return;
  const { ctx, width, height } = setup;

  const sliderTx = document.getElementById('tx-slider');
  const sliderTy = document.getElementById('ty-slider');
  const valTx = document.getElementById('val-tx');
  const valTy = document.getElementById('val-ty');
  const mathOutput = document.getElementById('math-trans-calc');

  const px = 3;
  const py = 2;

  function update() {
    const tx = sliderTx ? parseFloat(sliderTx.value) : 1;
    const ty = sliderTy ? parseFloat(sliderTy.value) : 3;

    if (valTx) valTx.textContent = tx >= 0 ? `+${tx}` : `${tx}`;
    if (valTy) valTy.textContent = ty >= 0 ? `+${ty}` : `${ty}`;

    const pxPrime = (px + tx).toFixed(1);
    const pyPrime = (py + ty).toFixed(1);

    if (mathOutput) {
      safeRenderKaTeX(
        `\\begin{aligned}
        \\begin{pmatrix} x' \\\\ y' \\end{pmatrix} &= \\begin{pmatrix} x \\\\ y \\end{pmatrix} + \\begin{pmatrix} t_x \\\\ t_y \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix} + \\begin{pmatrix} ${tx} \\\\ ${ty} \\end{pmatrix} \\\\
        &= \\begin{pmatrix} 3 + (${tx}) \\\\ 2 + (${ty}) \\end{pmatrix} = \\begin{pmatrix} \\mathbf{${pxPrime}} \\\\ \\mathbf{${pyPrime}} \\end{pmatrix} \\implies P' = (${pxPrime},\\, ${pyPrime})
        \\end{aligned}`,
        mathOutput
      );
    }

    render(tx, ty, parseFloat(pxPrime), parseFloat(pyPrime));
  }

  function render(tx, ty, pxP, pyP) {
    const colors = getThemeColors();
    const scale = 36;
    const originX = 55;
    const originY = height - 40;

    drawGrid(ctx, width, height, originX, originY, scale, [0, 8], [0, 6]);

    const origCanvasX = originX + px * scale;
    const origCanvasY = originY - py * scale;
    const transCanvasX = originX + pxP * scale;
    const transCanvasY = originY - pyP * scale;

    // Linhas pontilhadas do original
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = colors.origFill;
    ctx.beginPath();
    ctx.moveTo(origCanvasX, origCanvasY);
    ctx.lineTo(origCanvasX, originY);
    ctx.moveTo(origCanvasX, origCanvasY);
    ctx.lineTo(originX, origCanvasY);
    ctx.stroke();

    // Linhas pontilhadas do transladado
    ctx.strokeStyle = colors.transFill;
    ctx.beginPath();
    ctx.moveTo(transCanvasX, transCanvasY);
    ctx.lineTo(transCanvasX, originY);
    ctx.moveTo(transCanvasX, transCanvasY);
    ctx.lineTo(originX, transCanvasY);
    ctx.stroke();
    ctx.restore();

    // Vetor de translação
    if (tx !== 0 || ty !== 0) {
      drawArrow(ctx, origCanvasX, origCanvasY, transCanvasX, transCanvasY, colors.vector, 2.5, 8);
      ctx.fillStyle = colors.vectorText;
      ctx.font = 'bold 11px "Fira Code", monospace';
      ctx.textAlign = 'center';
      const midX = (origCanvasX + transCanvasX) / 2;
      const midY = (origCanvasY + transCanvasY) / 2 - 8;
      ctx.fillText(`T(${tx}, ${ty})`, midX, midY);
    }

    // Ponto Original (3, 2)
    ctx.fillStyle = colors.origPoint;
    ctx.beginPath();
    ctx.arc(origCanvasX, origCanvasY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = colors.origText;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`P (3, 2)`, origCanvasX - 8, origCanvasY - 4);

    // Ponto Transladado P'
    ctx.fillStyle = colors.transPoint;
    ctx.beginPath();
    ctx.arc(transCanvasX, transCanvasY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = colors.transText;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`P' (${pxP}, ${pyP})`, transCanvasX + 8, transCanvasY - 4);
  }

  if (sliderTx) sliderTx.oninput = update;
  if (sliderTy) sliderTy.oninput = update;
  update();
}

// ==========================================================================
// 3. DEMO: Translação de Objetos / Linha (Slide 8)
// ==========================================================================
function initTranslationObjectDemo() {
  const canvas = document.getElementById('canvas-trans-object');
  if (!canvas) return;

  const setup = setupFixedCanvas(canvas, 460, 280);
  if (!setup) return;
  const { ctx, width, height } = setup;

  const sliderTx = document.getElementById('obj-tx-slider');
  const sliderTy = document.getElementById('obj-ty-slider');
  const valTx = document.getElementById('obj-val-tx');
  const valTy = document.getElementById('obj-val-ty');
  const tableContainer = document.getElementById('trans-vertex-table');

  const p1 = { x: 1, y: 2 };
  const p2 = { x: 4, y: 3 };

  function update() {
    const tx = sliderTx ? parseFloat(sliderTx.value) : 2;
    const ty = sliderTy ? parseFloat(sliderTy.value) : 1;

    if (valTx) valTx.textContent = tx >= 0 ? `+${tx}` : `${tx}`;
    if (valTy) valTy.textContent = ty >= 0 ? `+${ty}` : `${ty}`;

    const p1P = { x: p1.x + tx, y: p1.y + ty };
    const p2P = { x: p2.x + tx, y: p2.y + ty };

    if (tableContainer) {
      tableContainer.innerHTML = `
        <table class="matrix-summary-table" style="font-size:0.85rem;">
          <thead>
            <tr>
              <th>Vértice</th>
              <th>Original (x, y)</th>
              <th>Translação</th>
              <th>Cálculo (x + t<sub>x</sub>, y + t<sub>y</sub>)</th>
              <th>Ponto Final P'</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>P₁</strong></td>
              <td>(1, 2)</td>
              <td>+ (${tx}, ${ty})</td>
              <td>(1 + ${tx >= 0 ? tx : `(${tx})`}, 2 + ${ty >= 0 ? ty : `(${ty})`})</td>
              <td><strong style="color:var(--text-main);">(${p1P.x}, ${p1P.y})</strong></td>
            </tr>
            <tr>
              <td><strong>P₂</strong></td>
              <td>(4, 3)</td>
              <td>+ (${tx}, ${ty})</td>
              <td>(4 + ${tx >= 0 ? tx : `(${tx})`}, 3 + ${ty >= 0 ? ty : `(${ty})`})</td>
              <td><strong style="color:var(--text-main);">(${p2P.x}, ${p2P.y})</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    }

    render(tx, ty, p1P, p2P);
  }

  function render(tx, ty, p1P, p2P) {
    const colors = getThemeColors();
    const scale = 36;
    const originX = 45;
    const originY = height - 35;

    drawGrid(ctx, width, height, originX, originY, scale, [0, 8], [0, 6]);

    const cP1 = { x: originX + p1.x * scale, y: originY - p1.y * scale };
    const cP2 = { x: originX + p2.x * scale, y: originY - p2.y * scale };
    const cP1P = { x: originX + p1P.x * scale, y: originY - p1P.y * scale };
    const cP2P = { x: originX + p2P.x * scale, y: originY - p2P.y * scale };

    // Linha original (Azul)
    ctx.save();
    ctx.strokeStyle = colors.origPoint;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cP1.x, cP1.y);
    ctx.lineTo(cP2.x, cP2.y);
    ctx.stroke();

    ctx.fillStyle = colors.origPoint;
    ctx.beginPath(); ctx.arc(cP1.x, cP1.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cP2.x, cP2.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = colors.origText;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('P₁(1,2)', cP1.x - 10, cP1.y + 14);
    ctx.fillText('P₂(4,3)', cP2.x + 6, cP2.y + 14);
    ctx.restore();

    // Vetores de translação
    if (tx !== 0 || ty !== 0) {
      drawArrow(ctx, cP1.x, cP1.y, cP1P.x, cP1P.y, colors.vector, 1.8, 7);
      drawArrow(ctx, cP2.x, cP2.y, cP2P.x, cP2P.y, colors.vector, 1.8, 7);
    }

    // Linha transladada (Vermelha)
    ctx.save();
    ctx.strokeStyle = colors.transPoint;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cP1P.x, cP1P.y);
    ctx.lineTo(cP2P.x, cP2P.y);
    ctx.stroke();

    ctx.fillStyle = colors.transPoint;
    ctx.beginPath(); ctx.arc(cP1P.x, cP1P.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cP2P.x, cP2P.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = colors.transText;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`P₁'(${p1P.x},${p1P.y})`, cP1P.x - 12, cP1P.y - 8);
    ctx.fillText(`P₂'(${p2P.x},${p2P.y})`, cP2P.x + 6, cP2P.y - 8);
    ctx.restore();
  }

  if (sliderTx) sliderTx.oninput = update;
  if (sliderTy) sliderTy.oninput = update;
  update();
}

// ==========================================================================
// 4. DEMO: Dedução da Rotação & Coordenadas Polares (Slide 10)
// ==========================================================================
function initRotationPolarDemo() {
  const canvas = document.getElementById('canvas-rot-polar');
  if (!canvas) return;

  const setup = setupFixedCanvas(canvas, 460, 280);
  if (!setup) return;
  const { ctx, width, height } = setup;

  const sliderPhi = document.getElementById('rot-phi-slider');
  const sliderTheta = document.getElementById('rot-theta-slider');
  const valPhi = document.getElementById('val-phi');
  const valTheta = document.getElementById('val-theta');

  function update() {
    const phiDeg = sliderPhi ? parseFloat(sliderPhi.value) : 20;
    const thetaDeg = sliderTheta ? parseFloat(sliderTheta.value) : 35;

    if (valPhi) valPhi.textContent = `${phiDeg}°`;
    if (valTheta) valTheta.textContent = `${thetaDeg}°`;

    render(phiDeg, thetaDeg);
  }

  function render(phiDeg, thetaDeg) {
    const colors = getThemeColors();
    const originX = 55;
    const originY = height - 40;
    const r = 150;

    drawGrid(ctx, width, height, originX, originY, 36, [0, 8], [0, 6]);

    const phiRad = phiDeg * Math.PI / 180;
    const thetaRad = thetaDeg * Math.PI / 180;
    const totalRad = (phiDeg + thetaDeg) * Math.PI / 180;

    // Círculo de raio r
    ctx.save();
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(originX, originY, r, 0, -Math.PI / 2, true);
    ctx.stroke();
    ctx.restore();

    // 1. Ponto P inicial (raio r, angulo phi)
    const pX = originX + r * Math.cos(phiRad);
    const pY = originY - r * Math.sin(phiRad);

    // Triângulo retângulo do P
    ctx.save();
    ctx.strokeStyle = colors.origFill;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.lineTo(pX, originY);
    ctx.stroke();
    ctx.restore();

    // Raio até P
    ctx.save();
    ctx.strokeStyle = colors.origPoint;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(pX, pY);
    ctx.stroke();
    ctx.restore();

    // Ponto P
    ctx.fillStyle = colors.origPoint;
    ctx.beginPath(); ctx.arc(pX, pY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.stroke();
    ctx.fillStyle = colors.origText;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('P(x, y)', pX + 8, pY - 4);

    // Arco phi
    ctx.save();
    ctx.strokeStyle = colors.origPoint;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(originX, originY, 35, 0, -phiRad, true);
    ctx.stroke();
    ctx.fillStyle = colors.origText;
    ctx.font = 'italic bold 12px "Times New Roman", serif';
    ctx.fillText('ϕ', originX + 42 * Math.cos(phiRad / 2), originY - 42 * Math.sin(phiRad / 2));
    ctx.restore();

    // 2. Ponto P' rotacionado (raio r, angulo phi + theta)
    if (thetaDeg !== 0) {
      const pPrimeX = originX + r * Math.cos(totalRad);
      const pPrimeY = originY - r * Math.sin(totalRad);

      // Triângulo retângulo do P'
      ctx.save();
      ctx.strokeStyle = colors.transFill;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(pPrimeX, pPrimeY);
      ctx.lineTo(pPrimeX, originY);
      ctx.stroke();
      ctx.restore();

      // Raio até P'
      ctx.save();
      ctx.strokeStyle = colors.transPoint;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(pPrimeX, pPrimeY);
      ctx.stroke();
      ctx.restore();

      // Ponto P'
      ctx.fillStyle = colors.transPoint;
      ctx.beginPath(); ctx.arc(pPrimeX, pPrimeY, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.stroke();
      ctx.fillStyle = colors.transText;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText("P'(x', y')", pPrimeX + 8, pPrimeY - 6);

      // Arco theta
      ctx.save();
      ctx.strokeStyle = colors.vector;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(originX, originY, 55, -phiRad, -totalRad, thetaDeg > 0);
      ctx.stroke();
      ctx.fillStyle = colors.vectorText;
      ctx.font = 'italic bold 12px "Times New Roman", serif';
      const midAngle = phiRad + thetaRad / 2;
      ctx.fillText('θ', originX + 65 * Math.cos(midAngle), originY - 65 * Math.sin(midAngle));
      ctx.restore();
    }
  }

  if (sliderPhi) sliderPhi.oninput = update;
  if (sliderTheta) sliderTheta.oninput = update;
  update();
}

// ==========================================================================
// 5. DEMO: Rotação Numérica Interativa (Slide 13)
// ==========================================================================
function initRotationNumericDemo() {
  const canvas = document.getElementById('canvas-rot-numeric');
  if (!canvas) return;

  const setup = setupFixedCanvas(canvas, 460, 280);
  if (!setup) return;
  const { ctx, width, height } = setup;

  const sliderTheta = document.getElementById('rot-num-theta-slider');
  const valTheta = document.getElementById('val-rot-num-theta');
  const mathOutput = document.getElementById('math-rot-calc');

  const px = 3;
  const py = 2;

  function update() {
    const thetaDeg = sliderTheta ? parseFloat(sliderTheta.value) : 30;
    if (valTheta) valTheta.textContent = `${thetaDeg}°`;

    const thetaRad = thetaDeg * Math.PI / 180;
    const cosT = Math.cos(thetaRad);
    const sinT = Math.sin(thetaRad);

    const xPrime = px * cosT - py * sinT;
    const yPrime = px * sinT + py * cosT;

    const term1x = (px * cosT).toFixed(2);
    const term2x = (py * sinT).toFixed(2);
    const term1y = (px * sinT).toFixed(2);
    const term2y = (py * cosT).toFixed(2);

    if (mathOutput) {
      safeRenderKaTeX(
        `\\begin{aligned}
        \\begin{pmatrix} x' \\\\ y' \\end{pmatrix} &= \\begin{pmatrix} \\cos(${thetaDeg}^\\circ) & -\\sin(${thetaDeg}^\\circ) \\\\ \\sin(${thetaDeg}^\\circ) & \\cos(${thetaDeg}^\\circ) \\end{pmatrix} \\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix} \\\\
        &= \\begin{pmatrix} ${cosT.toFixed(3)} & ${(-sinT).toFixed(3)} \\\\ ${sinT.toFixed(3)} & ${cosT.toFixed(3)} \\end{pmatrix} \\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix} \\\\
        &= \\begin{pmatrix} (3 \\cdot ${cosT.toFixed(3)}) + (2 \\cdot (${(-sinT).toFixed(3)})) \\\\ (3 \\cdot ${sinT.toFixed(3)}) + (2 \\cdot ${cosT.toFixed(3)}) \\end{pmatrix} \\\\
        &= \\begin{pmatrix} ${term1x} - ${term2x >= 0 ? term2x : `(${term2x})`} \\\\ ${term1y} + ${term2y} \\end{pmatrix} = \\begin{pmatrix} \\mathbf{${xPrime.toFixed(2)}} \\\\ \\mathbf{${yPrime.toFixed(2)}} \\end{pmatrix}
        \\end{aligned}`,
        mathOutput
      );
    }

    render(thetaDeg, thetaRad, xPrime, yPrime);
  }

  function render(thetaDeg, thetaRad, xP, yP) {
    const colors = getThemeColors();
    const scale = 38;
    const originX = 130;
    const originY = height - 40;

    drawGrid(ctx, width, height, originX, originY, scale, [-2, 6], [-1, 6]);

    const cPX = originX + px * scale;
    const cPY = originY - py * scale;
    const cXP = originX + xP * scale;
    const cYP = originY - yP * scale;

    const rPix = Math.sqrt(px * px + py * py) * scale;
    const phiRad = Math.atan2(py, px);

    // Trajetória circular
    ctx.save();
    ctx.strokeStyle = colors.transFill;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(originX, originY, rPix, 0, -Math.PI, true);
    ctx.stroke();
    ctx.restore();

    // Arco percorrido
    ctx.save();
    ctx.strokeStyle = colors.vector;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(originX, originY, 36, -phiRad, -(phiRad + thetaRad), thetaDeg > 0);
    ctx.stroke();
    ctx.restore();

    // Raio original
    ctx.save();
    ctx.strokeStyle = colors.origPoint;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(cPX, cPY);
    ctx.stroke();
    ctx.restore();

    // Raio rotacionado
    ctx.save();
    ctx.strokeStyle = colors.transPoint;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(cXP, cYP);
    ctx.stroke();
    ctx.restore();

    // Ponto Original (3, 2)
    ctx.fillStyle = colors.origPoint;
    ctx.beginPath(); ctx.arc(cPX, cPY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.stroke();
    ctx.fillStyle = colors.origText;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('(3, 2)', cPX + 8, cPY - 4);

    // Ponto Rotacionado P'
    ctx.fillStyle = colors.transPoint;
    ctx.beginPath(); ctx.arc(cXP, cYP, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.stroke();
    ctx.fillStyle = colors.transText;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`(${xP.toFixed(2)}, ${yP.toFixed(2)})`, cXP + 8, cYP - 6);
  }

  if (sliderTheta) sliderTheta.oninput = update;
  update();
}

// ==========================================================================
// 6. DEMO: Escala & Efeito Colateral da Origem (Slide 17)
// ==========================================================================
function initScaleDemo() {
  const canvas = document.getElementById('canvas-scale');
  if (!canvas) return;

  const setup = setupFixedCanvas(canvas, 460, 280);
  if (!setup) return;
  const { ctx, width, height } = setup;

  const sliderSx = document.getElementById('scale-sx-slider');
  const sliderSy = document.getElementById('scale-sy-slider');
  const valSx = document.getElementById('val-scale-sx');
  const valSy = document.getElementById('val-scale-sy');
  const btnUniform = document.getElementById('btn-scale-uniform');
  const btnDiff = document.getElementById('btn-scale-diff');
  const mathOutput = document.getElementById('math-scale-calc');

  const p1 = { x: 2, y: 4 };
  const p2 = { x: 4, y: 5 };

  function update() {
    const sx = sliderSx ? parseFloat(sliderSx.value) : 0.5;
    const sy = sliderSy ? parseFloat(sliderSy.value) : 0.5;

    if (valSx) valSx.textContent = `${sx.toFixed(2)}x`;
    if (valSy) valSy.textContent = `${sy.toFixed(2)}x`;

    const p1P = { x: p1.x * sx, y: p1.y * sy };
    const p2P = { x: p2.x * sx, y: p2.y * sy };

    if (mathOutput) {
      safeRenderKaTeX(
        `\\begin{aligned}
        P_1' &= \\begin{pmatrix} ${sx.toFixed(2)} & 0 \\\\ 0 & ${sy.toFixed(2)} \\end{pmatrix} \\begin{pmatrix} 2 \\\\ 4 \\end{pmatrix} = \\begin{pmatrix} (${sx.toFixed(2)} \\cdot 2) + (0 \\cdot 4) \\\\ (0 \\cdot 2) + (${sy.toFixed(2)} \\cdot 4) \\end{pmatrix} = \\begin{pmatrix} \\mathbf{${p1P.x.toFixed(2)}} \\\\ \\mathbf{${p1P.y.toFixed(2)}} \\end{pmatrix} \\\\[3pt]
        P_2' &= \\begin{pmatrix} ${sx.toFixed(2)} & 0 \\\\ 0 & ${sy.toFixed(2)} \\end{pmatrix} \\begin{pmatrix} 4 \\\\ 5 \\end{pmatrix} = \\begin{pmatrix} (${sx.toFixed(2)} \\cdot 4) + (0 \\cdot 5) \\\\ (0 \\cdot 4) + (${sy.toFixed(2)} \\cdot 5) \\end{pmatrix} = \\begin{pmatrix} \\mathbf{${p2P.x.toFixed(2)}} \\\\ \\mathbf{${p2P.y.toFixed(2)}} \\end{pmatrix}
        \\end{aligned}`,
        mathOutput
      );
    }

    render(sx, sy, p1P, p2P);
  }

  if (btnUniform) {
    btnUniform.onclick = () => {
      if (sliderSx) sliderSx.value = 0.5;
      if (sliderSy) sliderSy.value = 0.5;
      update();
    };
  }
  if (btnDiff) {
    btnDiff.onclick = () => {
      if (sliderSx) sliderSx.value = 1.5;
      if (sliderSy) sliderSy.value = 0.6;
      update();
    };
  }

  function render(sx, sy, p1P, p2P) {
    const colors = getThemeColors();
    const scale = 34;
    const originX = 45;
    const originY = height - 35;

    drawGrid(ctx, width, height, originX, originY, scale, [0, 8], [0, 7]);

    const cP1 = { x: originX + p1.x * scale, y: originY - p1.y * scale };
    const cP2 = { x: originX + p2.x * scale, y: originY - p2.y * scale };
    const cP1P = { x: originX + p1P.x * scale, y: originY - p1P.y * scale };
    const cP2P = { x: originX + p2P.x * scale, y: originY - p2P.y * scale };

    // Linhas Guia da Origem até os pontos
    ctx.save();
    ctx.strokeStyle = colors.guideLines;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(cP1.x, cP1.y);
    ctx.moveTo(originX, originY);
    ctx.lineTo(cP2.x, cP2.y);
    ctx.stroke();
    ctx.restore();

    // Reta original (Azul)
    ctx.save();
    ctx.strokeStyle = colors.origPoint;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cP1.x, cP1.y);
    ctx.lineTo(cP2.x, cP2.y);
    ctx.stroke();

    ctx.fillStyle = colors.origPoint;
    ctx.beginPath(); ctx.arc(cP1.x, cP1.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cP2.x, cP2.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = colors.origText;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('P₁(2,4)', cP1.x - 8, cP1.y - 8);
    ctx.fillText('P₂(4,5)', cP2.x + 6, cP2.y - 8);
    ctx.restore();

    // Reta escalada (Vermelha)
    ctx.save();
    ctx.strokeStyle = colors.transPoint;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cP1P.x, cP1P.y);
    ctx.lineTo(cP2P.x, cP2P.y);
    ctx.stroke();

    ctx.fillStyle = colors.transPoint;
    ctx.beginPath(); ctx.arc(cP1P.x, cP1P.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cP2P.x, cP2P.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = colors.transText;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`P₁'(${p1P.x.toFixed(1)}, ${p1P.y.toFixed(1)})`, cP1P.x - 12, cP1P.y + 14);
    ctx.fillText(`P₂'(${p2P.x.toFixed(1)}, ${p2P.y.toFixed(1)})`, cP2P.x + 6, cP2P.y + 14);
    ctx.restore();
  }

  if (sliderSx) sliderSx.oninput = update;
  if (sliderSy) sliderSy.oninput = update;
  update();
}

// ==========================================================================
// 7. DEMO: Playground Completo de Transformações & Matriz 3x3 (Slide 24)
// ==========================================================================
function initPlaygroundDemo() {
  const canvas = document.getElementById('canvas-playground');
  if (!canvas) return;

  const setup = setupFixedCanvas(canvas, 480, 230);
  if (!setup) return;
  const { ctx, width, height } = setup;

  const selectShape = document.getElementById('play-shape');
  const sliderTx = document.getElementById('play-tx');
  const sliderTy = document.getElementById('play-ty');
  const sliderRot = document.getElementById('play-rot');
  const sliderSx = document.getElementById('play-sx');
  const sliderSy = document.getElementById('play-sy');
  const btnReset = document.getElementById('play-reset');

  const valTx = document.getElementById('val-play-tx');
  const valTy = document.getElementById('val-play-ty');
  const valRot = document.getElementById('val-play-rot');
  const valSx = document.getElementById('val-play-sx');
  const valSy = document.getElementById('val-play-sy');

  const matrixOutput = document.getElementById('play-matrix-math');
  const codeOutput = document.getElementById('play-code-preview');

  function drawF(c) {
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(40, 0);
    c.lineTo(40, 10);
    c.lineTo(12, 10);
    c.lineTo(12, 24);
    c.lineTo(34, 24);
    c.lineTo(34, 34);
    c.lineTo(12, 34);
    c.lineTo(12, 60);
    c.lineTo(0, 60);
    c.closePath();
    c.fill();
    c.stroke();
  }

  function drawHouse(c) {
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(45, 0);
    c.lineTo(45, 40);
    c.lineTo(22.5, 60);
    c.lineTo(0, 40);
    c.closePath();
    c.fill();
    c.stroke();

    c.fillStyle = '#ffffff';
    c.fillRect(16, 0, 12, 22);
  }

  function drawStar(c) {
    const spikes = 5;
    const outerRadius = 30;
    const innerRadius = 14;
    let rot = Math.PI / 2 * 3;
    let x = 0;
    let y = 0;
    const step = Math.PI / spikes;

    c.beginPath();
    c.moveTo(0, -outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = Math.cos(rot) * outerRadius;
      y = Math.sin(rot) * outerRadius;
      c.lineTo(x, y);
      rot += step;

      x = Math.cos(rot) * innerRadius;
      y = Math.sin(rot) * innerRadius;
      c.lineTo(x, y);
      rot += step;
    }
    c.lineTo(0, -outerRadius);
    c.closePath();
    c.fill();
    c.stroke();
  }

  function update() {
    const tx = sliderTx ? parseFloat(sliderTx.value) : 0;
    const ty = sliderTy ? parseFloat(sliderTy.value) : 0;
    const rotDeg = sliderRot ? parseFloat(sliderRot.value) : 0;
    const sx = sliderSx ? parseFloat(sliderSx.value) : 1;
    const sy = sliderSy ? parseFloat(sliderSy.value) : 1;

    if (valTx) valTx.textContent = `${tx}px`;
    if (valTy) valTy.textContent = `${ty}px`;
    if (valRot) valRot.textContent = `${rotDeg}°`;
    if (valSx) valSx.textContent = `${sx.toFixed(1)}x`;
    if (valSy) valSy.textContent = `${sy.toFixed(1)}x`;

    const rad = rotDeg * Math.PI / 180;
    const cosT = Math.cos(rad);
    const sinT = Math.sin(rad);

    const m00 = (sx * cosT).toFixed(2);
    const m01 = (-sy * sinT).toFixed(2);
    const m02 = tx.toFixed(0);
    const m10 = (sx * sinT).toFixed(2);
    const m11 = (sy * cosT).toFixed(2);
    const m12 = ty.toFixed(0);

    if (matrixOutput) {
      safeRenderKaTeX(
        `M = \\begin{pmatrix}
          ${m00} & ${m01} & ${m02} \\\\
          ${m10} & ${m11} & ${m12} \\\\
          0 & 0 & 1
        \\end{pmatrix}`,
        matrixOutput
      );
    }

    if (codeOutput) {
      codeOutput.innerHTML = `<span class="fn">ctx</span>.<span class="fn">save</span>();\n<span class="fn">ctx</span>.<span class="fn">translate</span>(<span class="num">${tx}</span>, <span class="num">${ty}</span>);\n<span class="fn">ctx</span>.<span class="fn">rotate</span>((<span class="num">${rotDeg}</span> * <span class="num">Math.PI</span>) / <span class="num">180</span>);\n<span class="fn">ctx</span>.<span class="fn">scale</span>(<span class="num">${sx.toFixed(1)}</span>, <span class="num">${sy.toFixed(1)}</span>);\n<span class="fn">desenhar</span>(ctx);\n<span class="fn">ctx</span>.<span class="fn">restore</span>();`;
    }

    render(tx, ty, rad, sx, sy);
  }

  function render(tx, ty, rad, sx, sy) {
    const colors = getThemeColors();
    const originX = width / 2;
    const originY = height / 2;

    drawGrid(ctx, width, height, originX, originY, 36, [-6, 6], [-4, 4]);

    const shape = selectShape ? selectShape.value : 'f';

    // Fantasma original
    ctx.save();
    ctx.translate(originX, originY);
    ctx.setLineDash([3, 3]);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.strokeStyle = colors.axisLabels;
    ctx.lineWidth = 1.5;
    if (shape === 'f') drawF(ctx);
    else if (shape === 'house') drawHouse(ctx);
    else drawStar(ctx);
    ctx.restore();

    // Objeto transformado
    ctx.save();
    ctx.translate(originX, originY);

    ctx.translate(tx, -ty);
    ctx.rotate(-rad);
    ctx.scale(sx, sy);

    ctx.fillStyle = colors.origFill;
    ctx.strokeStyle = colors.origPoint;
    ctx.lineWidth = 2.5;

    if (shape === 'f') drawF(ctx);
    else if (shape === 'house') drawHouse(ctx);
    else drawStar(ctx);

    ctx.restore();
  }

  if (sliderTx) sliderTx.oninput = update;
  if (sliderTy) sliderTy.oninput = update;
  if (sliderRot) sliderRot.oninput = update;
  if (sliderSx) sliderSx.oninput = update;
  if (sliderSy) sliderSy.oninput = update;
  if (selectShape) selectShape.onchange = update;

  if (btnReset) {
    btnReset.onclick = () => {
      if (sliderTx) sliderTx.value = 0;
      if (sliderTy) sliderTy.value = 0;
      if (sliderRot) sliderRot.value = 0;
      if (sliderSx) sliderSx.value = 1;
      if (sliderSy) sliderSy.value = 1;
      update();
    };
  }

  update();
}

// ==========================================================================
// 8. DEMO: Rotação — Conceitos Básicos (Slide 9 - Ilustração Livro / Pivot xr, yr)
// ==========================================================================
function initRotationConceptsDemo() {
  const canvas = document.getElementById('canvas-rot-concepts');
  if (!canvas) return;

  const setup = setupFixedCanvas(canvas, 460, 280);
  if (!setup) return;
  const { ctx, width, height } = setup;

  const sliderTheta = document.getElementById('rot-concept-theta-slider');
  const valTheta = document.getElementById('val-rot-concept-theta');
  const btnAnim = document.getElementById('btn-anim-rot-concept');

  let isAnimating = false;
  let animId = null;

  function update() {
    const thetaDeg = sliderTheta ? parseFloat(sliderTheta.value) : 50;
    if (valTheta) valTheta.textContent = `${thetaDeg}°`;
    render(thetaDeg);
  }

  function render(thetaDeg) {
    const isDark = document.body.classList.contains('theme-dark');
    const colors = {
      bg: isDark ? '#070c18' : '#ffffff',
      axes: isDark ? '#60a5fa' : '#1b356b',
      axisLines: isDark ? 'rgba(255, 255, 255, 0.4)' : '#334155',
      labels: isDark ? '#94a3b8' : '#1e293b',
      pivot: isDark ? '#f1f5f9' : '#0f172a',
      pivotFill: isDark ? '#38bdf8' : '#0f172a',
      dashedLine: isDark ? 'rgba(255, 255, 255, 0.6)' : '#334155',
      arc: isDark ? '#fbbf24' : '#b45309',
      wedgeFill: isDark ? '#10b981' : '#3aa58e',
      wedgeStroke: isDark ? '#34d399' : '#1f7a65',
      origWedgeFill: isDark ? 'rgba(16, 185, 129, 0.45)' : 'rgba(58, 165, 142, 0.5)',
      origWedgeStroke: isDark ? 'rgba(52, 211, 153, 0.6)' : 'rgba(31, 122, 101, 0.7)'
    };

    ctx.save();
    // Fundo
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    // Posições dos eixos cartesianos
    const axisLeftX = 55;
    const axisBottomY = height - 30;

    // Coordenadas do ponto de rotação (xr, yr) na tela
    const pivX = 145;
    const pivY = height - 110;

    // 1. Desenhar Eixos X e Y
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = colors.axisLines;

    // Eixo Y
    ctx.beginPath();
    ctx.moveTo(axisLeftX, 20);
    ctx.lineTo(axisLeftX, height - 15);
    ctx.stroke();

    // Eixo X
    ctx.beginPath();
    ctx.moveTo(25, axisBottomY);
    ctx.lineTo(width - 25, axisBottomY);
    ctx.stroke();

    // 2. Ticks nos eixos com xr e yr
    ctx.fillStyle = colors.labels;
    ctx.font = 'italic bold 14px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Tick X (xr)
    ctx.beginPath();
    ctx.moveTo(pivX, axisBottomY - 4);
    ctx.lineTo(pivX, axisBottomY + 4);
    ctx.stroke();
    ctx.fillText('xᵣ', pivX, axisBottomY + 8);

    // Tick Y (yr)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.beginPath();
    ctx.moveTo(axisLeftX - 4, pivY);
    ctx.lineTo(axisLeftX + 4, pivY);
    ctx.stroke();
    ctx.fillText('yᵣ', axisLeftX - 8, pivY);

    // Projeções pontilhadas até (xr, yr)
    ctx.save();
    ctx.strokeStyle = colors.dashedLine;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(axisLeftX, pivY);
    ctx.lineTo(pivX, pivY);
    ctx.lineTo(pivX, axisBottomY);
    ctx.stroke();
    ctx.restore();

    // Raio e Cunha (Triângulo / Wedge verde como na ilustração)
    const R = 125; // comprimento do barbante
    const thetaRad = thetaDeg * Math.PI / 180;

    function drawGreenWedge(c, fill, stroke) {
      c.save();
      c.fillStyle = fill;
      c.strokeStyle = stroke;
      c.lineWidth = 2;
      c.beginPath();
      // O vértice pontiagudo começa em (0, 0) e a cunha se abre para a frente
      c.moveTo(0, 0);
      c.lineTo(48, -14);
      c.lineTo(48, 14);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    }

    // 3. Objeto Original (Horizontal - Ângulo 0°)
    ctx.save();
    ctx.strokeStyle = colors.dashedLine;
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(pivX, pivY);
    ctx.lineTo(pivX + R, pivY);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(pivX + R, pivY);
    drawGreenWedge(ctx, colors.origWedgeFill, colors.origWedgeStroke);
    ctx.restore();

    // 4. Objeto Rotacionado (Ângulo theta)
    const targetX = pivX + R * Math.cos(thetaRad);
    const targetY = pivY - R * Math.sin(thetaRad);

    ctx.save();
    ctx.strokeStyle = colors.dashedLine;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(pivX, pivY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(targetX, targetY);
    ctx.rotate(-thetaRad);
    drawGreenWedge(ctx, colors.wedgeFill, colors.wedgeStroke);
    ctx.restore();

    // 5. Arco do Ângulo theta
    const arcRadius = 46;
    if (Math.abs(thetaDeg) > 2) {
      ctx.save();
      ctx.strokeStyle = colors.arc;
      ctx.fillStyle = colors.arc;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(pivX, pivY, arcRadius, 0, -thetaRad, thetaDeg > 0);
      ctx.stroke();

      // Seta na ponta do arco
      const arrowAngle = -thetaRad;
      const arrowHeadLen = 8;
      const arrowTipX = pivX + arcRadius * Math.cos(arrowAngle);
      const arrowTipY = pivY + arcRadius * Math.sin(arrowAngle);
      const tangent = arrowAngle + (thetaDeg > 0 ? -Math.PI / 2 : Math.PI / 2);

      ctx.beginPath();
      ctx.moveTo(arrowTipX, arrowTipY);
      ctx.lineTo(
        arrowTipX - arrowHeadLen * Math.cos(tangent - Math.PI / 6),
        arrowTipY - arrowHeadLen * Math.sin(tangent - Math.PI / 6)
      );
      ctx.lineTo(
        arrowTipX - arrowHeadLen * Math.cos(tangent + Math.PI / 6),
        arrowTipY - arrowHeadLen * Math.sin(tangent + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Rótulo theta
      ctx.fillStyle = colors.labels;
      ctx.font = 'italic bold 15px "Times New Roman", serif';
      const midTheta = thetaRad / 2;
      const labelDist = arcRadius + 16;
      ctx.fillText('θ', pivX + labelDist * Math.cos(midTheta), pivY - labelDist * Math.sin(midTheta));
      ctx.restore();
    }

    // 6. Ponto de Rotação (Pivô preto no centro)
    ctx.fillStyle = colors.pivot;
    ctx.beginPath();
    ctx.arc(pivX, pivY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.bg;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  if (sliderTheta) {
    sliderTheta.oninput = () => {
      if (isAnimating) {
        cancelAnimationFrame(animId);
        isAnimating = false;
        if (btnAnim) btnAnim.textContent = '▶ Animar';
      }
      update();
    };
  }

  if (btnAnim) {
    btnAnim.onclick = () => {
      if (isAnimating) {
        cancelAnimationFrame(animId);
        isAnimating = false;
        btnAnim.textContent = '▶ Animar';
        return;
      }
      isAnimating = true;
      btnAnim.textContent = '⏸ Pausar';
      let startAngle = 0;
      let targetAngle = 60;
      let dir = 1;

      function step() {
        if (!isAnimating) return;
        startAngle += dir * 0.8;
        if (startAngle >= 90) dir = -1;
        if (startAngle <= -20) dir = 1;
        if (sliderTheta) sliderTheta.value = Math.round(startAngle);
        update();
        animId = requestAnimationFrame(step);
      }
      step();
    };
  }

  update();
}

// Inicializa todos os módulos
window.initAllCanvasDemos = function() {
  initOverviewDemo();
  initTranslationDemo();
  initTranslationObjectDemo();
  initRotationConceptsDemo();
  initRotationPolarDemo();
  initRotationNumericDemo();
  initScaleDemo();
  initPlaygroundDemo();
};

