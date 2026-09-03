/**
 * canvas-demos.js
 * Módulos interativos em Canvas 2D para Transformações Geométricas 2D (Parte 2)
 * Suporte a Alta Densidade de Pixels (High-DPI / retina), Tema Claro e Escuro,
 * Álgebra Linear 3x3 e Demonstrações Visuais em Tempo Real.
 */

// =========================================================================
// 1. Paleta de Cores adaptativa ao Tema Claro e Escuro
// =========================================================================
function getThemeColors() {
  const isDark = document.body.classList.contains('theme-dark');
  if (isDark) {
    return {
      bg: '#070d1a',
      grid: 'rgba(255, 255, 255, 0.08)',
      axes: 'rgba(96, 165, 250, 0.7)',
      axisLabels: '#94a3b8',
      origPoint: '#3b82f6',
      origFill: 'rgba(59, 130, 246, 0.25)',
      origStroke: '#60a5fa',
      origText: '#93c5fd',
      transPoint: '#f43f5e',
      transFill: 'rgba(244, 63, 94, 0.28)',
      transStroke: '#fb7185',
      transText: '#fda4af',
      pivotPoint: '#ec4899',
      pivotText: '#f472b6',
      vector: '#f59e0b',
      vectorText: '#fbbf24',
      guideLines: 'rgba(245, 158, 11, 0.45)',
      accentGreen: '#10b981',
      accentPurple: '#8b5cf6',
      ghostStroke: 'rgba(148, 163, 184, 0.4)',
      ghostFill: 'rgba(148, 163, 184, 0.1)'
    };
  } else {
    return {
      bg: '#ffffff',
      grid: 'rgba(0, 0, 0, 0.07)',
      axes: '#003366',
      axisLabels: '#475569',
      origPoint: '#1d4ed8',
      origFill: 'rgba(29, 78, 216, 0.18)',
      origStroke: '#1d4ed8',
      origText: '#1e3a8a',
      transPoint: '#b91c1c',
      transFill: 'rgba(185, 28, 28, 0.20)',
      transStroke: '#b91c1c',
      transText: '#991b1b',
      pivotPoint: '#db2777',
      pivotText: '#be185d',
      vector: '#d97706',
      vectorText: '#b45309',
      guideLines: 'rgba(217, 119, 6, 0.5)',
      accentGreen: '#15803d',
      accentPurple: '#6d28d9',
      ghostStroke: 'rgba(100, 116, 139, 0.45)',
      ghostFill: 'rgba(100, 116, 139, 0.1)'
    };
  }
}

// =========================================================================
// 2. Configuração de Canvas com suporte High-DPI (Retina)
// =========================================================================
function setupFixedCanvas(canvas, logicalWidth, logicalHeight) {
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  return { ctx, width: logicalWidth, height: logicalHeight };
}

// =========================================================================
// 3. Desenho de Grade Cartesiana e Eixos
// =========================================================================
function drawGrid(ctx, width, height, originX, originY, scale = 36, xRange = [-5, 8], yRange = [-3, 7]) {
  const colors = getThemeColors();
  ctx.save();
  
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  // Linhas de grade
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

  // Rótulos e marcas
  ctx.font = '10px "Fira Code", monospace';
  ctx.fillStyle = colors.axisLabels;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let i = xRange[0]; i <= xRange[1]; i++) {
    if (i === 0) continue;
    const px = originX + i * scale;
    if (px > 8 && px < width - 8) {
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
  for (let j = yRange[0]; j <= yRange[1]; j++) {
    if (j === 0) continue;
    const py = originY - j * scale;
    if (py > 8 && py < height - 8) {
      ctx.fillText(j.toString(), originX - 5, py);
      ctx.beginPath();
      ctx.moveTo(originX - 3, py);
      ctx.lineTo(originX + 3, py);
      ctx.strokeStyle = colors.axes;
      ctx.stroke();
    }
  }

  // Origem (0,0)
  ctx.fillText('0', originX - 4, originY + 4);
  ctx.restore();
}

// =========================================================================
// 4. Utilitários de Geometria e Álgebra Linear 3x3
// =========================================================================
function toScreen(x, y, originX, originY, scale) {
  return {
    px: originX + x * scale,
    py: originY - y * scale
  };
}

function identity3() {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
}

function multiply3(A, B) {
  const C = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        C[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return C;
}

function multiplyVector3(M, v) {
  return [
    M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
    M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
    M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]
  ];
}

function transformPoint(M, p) {
  const v = multiplyVector3(M, [p.x, p.y, 1]);
  return { x: v[0], y: v[1] };
}

function transformPolygon(M, points) {
  return points.map(p => transformPoint(M, p));
}

function translationMatrix3(tx, ty) {
  return [
    [1, 0, tx],
    [0, 1, ty],
    [0, 0, 1]
  ];
}

function rotationMatrix3(deg) {
  const rad = (deg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1]
  ];
}

function scaleMatrix3(sx, sy) {
  return [
    [sx, 0, 0],
    [0, sy, 0],
    [0, 0, 1]
  ];
}

function reflectionXMatrix3() {
  return [
    [1, 0, 0],
    [0, -1, 0],
    [0, 0, 1]
  ];
}

function reflectionYMatrix3() {
  return [
    [-1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
}

function reflectionOriginMatrix3() {
  return [
    [-1, 0, 0],
    [0, -1, 0],
    [0, 0, 1]
  ];
}

function shearXMatrix3(shx) {
  return [
    [1, shx, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
}

function shearYMatrix3(shy) {
  return [
    [1, 0, 0],
    [shy, 1, 0],
    [0, 0, 1]
  ];
}

function drawPolygon(ctx, originX, originY, scale, points, fillColor, strokeColor, strokeWidth = 2, dashed = false) {
  if (points.length < 2) return;
  ctx.save();
  ctx.beginPath();
  if (dashed) ctx.setLineDash([4, 4]);
  
  const p0 = toScreen(points[0].x, points[0].y, originX, originY, scale);
  ctx.moveTo(p0.px, p0.py);
  for (let i = 1; i < points.length; i++) {
    const pi = toScreen(points[i].x, points[i].y, originX, originY, scale);
    ctx.lineTo(pi.px, pi.py);
  }
  ctx.closePath();
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
  ctx.restore();
}

function drawPointLabel(ctx, originX, originY, scale, x, y, label, color = '#2563eb', radius = 3.5, align = 'top-right') {
  const { px, py } = toScreen(x, y, originX, originY, scale);
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '11px "Fira Code", monospace';
  ctx.fillStyle = color;
  let ox = 6, oy = -6;
  if (align === 'bottom') { ox = 0; oy = 14; ctx.textAlign = 'center'; }
  else if (align === 'left') { ox = -8; oy = 0; ctx.textAlign = 'right'; }
  else if (align === 'top') { ox = 0; oy = -10; ctx.textAlign = 'center'; }
  else { ctx.textAlign = 'left'; }
  
  ctx.fillText(label, px + ox, py + oy);
  ctx.restore();
}

function drawArrow(ctx, fromX, fromY, toX, toY, color, width = 2, headLen = 8) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// =========================================================================
// 5. DEMO 1: Translação Inversa TikZ (Slide 4)
// =========================================================================
function initTransInversaDemo() {
  const canvas = document.getElementById('canvas-trans-inversa');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 420, 240);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const originX = 50;
  const originY = 200;
  const scale = 40;

  drawGrid(ctx, width, height, originX, originY, scale, [-1, 7], [-1, 5]);

  // Original: (1,1)
  const p1 = toScreen(1, 1, originX, originY, scale);
  // Transladado T(2,2): (3,3)
  const p2 = toScreen(3, 3, originX, originY, scale);

  // Seta T(2,2) - vermelho
  drawArrow(ctx, p1.px + 4, p1.py - 4, p2.px - 4, p2.py + 4, '#ef4444', 2.5);
  ctx.font = '11px "Fira Code", monospace';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('T(2, 2)', (p1.px + p2.px) / 2 - 28, (p1.py + p2.py) / 2 - 12);

  // Seta Inversa T^(-1)(-2,-2) - verde
  drawArrow(ctx, p2.px + 6, p2.py + 6, p1.px + 6, p1.py + 6, '#10b981', 2.5);
  ctx.fillStyle = '#10b981';
  ctx.fillText('T⁻¹(-2, -2)', (p1.px + p2.px) / 2 + 10, (p1.py + p2.py) / 2 + 16);

  // Pontos
  drawPointLabel(ctx, originX, originY, scale, 1, 1, 'Original (1,1)', '#2563eb', 4.5, 'bottom');
  drawPointLabel(ctx, originX, originY, scale, 3, 3, 'T(1,1)=(3,3)', '#ef4444', 4.5, 'top');
}

// =========================================================================
// 6. DEMO 2: Inversas Interativo Geral (Slide 7)
// =========================================================================
let inversasState = {
  type: 'T', // 'T', 'R', 'S'
  valX: 2,
  valY: 2,
  valDeg: 45,
  appliedInverse: false
};

function initInversasInterativo() {
  const canvas = document.getElementById('canvas-inversas-lab');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 480, 360);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const originX = width / 2;
  const originY = height / 2 + 20;
  const scale = 32;

  drawGrid(ctx, width, height, originX, originY, scale, [-7, 7], [-5, 5]);

  // Polígono original (bandeira ou triângulo)
  const basePolygon = [
    { x: 1, y: 1 },
    { x: 3, y: 1 },
    { x: 2, y: 3 }
  ];

  // Matriz direta e inversa
  let M_dir = identity3();
  let M_inv = identity3();
  let labelDir = '';
  let labelInv = '';

  if (inversasState.type === 'T') {
    M_dir = translationMatrix3(inversasState.valX, inversasState.valY);
    M_inv = translationMatrix3(-inversasState.valX, -inversasState.valY);
    labelDir = `T(${inversasState.valX}, ${inversasState.valY})`;
    labelInv = `T⁻¹(${-inversasState.valX}, ${-inversasState.valY})`;
  } else if (inversasState.type === 'R') {
    M_dir = rotationMatrix3(inversasState.valDeg);
    M_inv = rotationMatrix3(-inversasState.valDeg);
    labelDir = `R(${inversasState.valDeg}°)`;
    labelInv = `R⁻¹(${-inversasState.valDeg}°)`;
  } else if (inversasState.type === 'S') {
    const sx = Math.max(0.2, inversasState.valX);
    const sy = Math.max(0.2, inversasState.valY);
    M_dir = scaleMatrix3(sx, sy);
    M_inv = scaleMatrix3(1 / sx, 1 / sy);
    labelDir = `S(${sx.toFixed(1)}, ${sy.toFixed(1)})`;
    labelInv = `S⁻¹(${(1/sx).toFixed(2)}, ${(1/sy).toFixed(2)})`;
  }

  // Desenhar original fantasma
  drawPolygon(ctx, originX, originY, scale, basePolygon, colors.origFill, colors.origStroke, 1.8, true);

  // Polígono transformado
  let curPoly = basePolygon;
  let statusText = 'Objeto Original';

  if (!inversasState.appliedInverse) {
    // Aplicada direta
    curPoly = transformPolygon(M_dir, basePolygon);
    drawPolygon(ctx, originX, originY, scale, curPoly, colors.transFill, colors.transStroke, 2.5);
    statusText = `Aplicada: ${labelDir}`;
  } else {
    // Aplicada direta depois inversa: M_inv * M_dir = I
    const M_total = multiply3(M_inv, M_dir);
    curPoly = transformPolygon(M_total, basePolygon);
    drawPolygon(ctx, originX, originY, scale, curPoly, 'rgba(16, 185, 129, 0.25)', '#10b981', 2.5);
    statusText = `Inversa Aplicada: ${labelInv} ➔ Voltou à origem! (M · M⁻¹ = I)`;
  }

  // Legenda de status no Canvas
  ctx.font = '12px "Inter", sans-serif';
  ctx.fillStyle = colors.origText;
  ctx.fillText('Azul Tracejado: Original', 16, 22);

  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = inversasState.appliedInverse ? '#10b981' : '#ef4444';
  ctx.fillText(statusText, 16, 40);

  // Atualizar painel de fórmulas KaTeX / texto
  const mathOutput = document.getElementById('inversas-math-output');
  if (mathOutput) {
    if (inversasState.type === 'T') {
      mathOutput.innerHTML = `Matriz Direta $T(${inversasState.valX}, ${inversasState.valY})$ e Inversa $T^{-1}(${-inversasState.valX}, ${-inversasState.valY})$:<br>
      $$T \\cdot T^{-1} = \\begin{pmatrix} 1 & 0 & ${inversasState.valX} \\\\ 0 & 1 & ${inversasState.valY} \\\\ 0 & 0 & 1 \\end{pmatrix} \\begin{pmatrix} 1 & 0 & ${-inversasState.valX} \\\\ 0 & 1 & ${-inversasState.valY} \\\\ 0 & 0 & 1 \\end{pmatrix} = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix} = I$$`;
    } else if (inversasState.type === 'R') {
      mathOutput.innerHTML = `Matriz Direta $R(${inversasState.valDeg}^\\circ)$ e Inversa $R^{-1}(${-inversasState.valDeg}^\\circ) = R^T$:<br>
      $$R(\\theta) \\cdot R(-\\theta) = R(\\theta - \\theta) = R(0^\\circ) = I$$`;
    } else {
      mathOutput.innerHTML = `Matriz Direta $S(${inversasState.valX}, ${inversasState.valY})$ e Inversa $S^{-1}(${(1/inversasState.valX).toFixed(2)}, ${(1/inversasState.valY).toFixed(2)})$:<br>
      $$S(s_x, s_y) \\cdot S(1/s_x, 1/s_y) = \\begin{pmatrix} s_x \\cdot \\frac{1}{s_x} & 0 & 0 \\\\ 0 & s_y \\cdot \\frac{1}{s_y} & 0 \\\\ 0 & 0 & 1 \\end{pmatrix} = I$$`;
    }
    if (window.renderMathInElement) {
      window.renderMathInElement(mathOutput, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ]
      });
    }
  }
}

// Eventos de controles de inversas
function bindInversasControls() {
  const sel = document.getElementById('inv-type-select');
  const sX = document.getElementById('inv-slider-x');
  const sY = document.getElementById('inv-slider-y');
  const valX = document.getElementById('inv-val-x');
  const valY = document.getElementById('inv-val-y');
  const btnDir = document.getElementById('inv-btn-dir');
  const btnInv = document.getElementById('inv-btn-inv');

  if (sel) {
    sel.onchange = (e) => {
      inversasState.type = e.target.value;
      inversasState.appliedInverse = false;
      const lblX = document.getElementById('inv-lbl-x');
      const lblY = document.getElementById('inv-lbl-y');
      if (inversasState.type === 'R') {
        if (lblX) lblX.textContent = 'Ângulo θ:';
        if (sY && sY.parentElement) sY.parentElement.style.display = 'none';
        sX.min = -180; sX.max = 180; sX.step = 5; sX.value = 45;
        inversasState.valDeg = 45;
        if (valX) valX.textContent = '45°';
      } else if (inversasState.type === 'S') {
        if (lblX) lblX.textContent = 'Fator sx:';
        if (lblY) lblY.textContent = 'Fator sy:';
        if (sY && sY.parentElement) sY.parentElement.style.display = 'flex';
        sX.min = 0.5; sX.max = 3.0; sX.step = 0.1; sX.value = 2.0;
        sY.min = 0.5; sY.max = 3.0; sY.step = 0.1; sY.value = 2.0;
        inversasState.valX = 2.0; inversasState.valY = 2.0;
        if (valX) valX.textContent = '2.0';
        if (valY) valY.textContent = '2.0';
      } else {
        if (lblX) lblX.textContent = 'tx:';
        if (lblY) lblY.textContent = 'ty:';
        if (sY && sY.parentElement) sY.parentElement.style.display = 'flex';
        sX.min = -4; sX.max = 4; sX.step = 1; sX.value = 2;
        sY.min = -4; sY.max = 4; sY.step = 1; sY.value = 2;
        inversasState.valX = 2; inversasState.valY = 2;
        if (valX) valX.textContent = '2';
        if (valY) valY.textContent = '2';
      }
      initInversasInterativo();
    };
  }

  if (sX) {
    sX.oninput = (e) => {
      if (inversasState.type === 'R') {
        inversasState.valDeg = parseFloat(e.target.value);
        if (valX) valX.textContent = `${inversasState.valDeg}°`;
      } else {
        inversasState.valX = parseFloat(e.target.value);
        if (valX) valX.textContent = inversasState.valX.toString();
      }
      inversasState.appliedInverse = false;
      initInversasInterativo();
    };
  }

  if (sY) {
    sY.oninput = (e) => {
      inversasState.valY = parseFloat(e.target.value);
      if (valY) valY.textContent = inversasState.valY.toString();
      inversasState.appliedInverse = false;
      initInversasInterativo();
    };
  }

  if (btnDir) {
    btnDir.onclick = () => {
      inversasState.appliedInverse = false;
      initInversasInterativo();
    };
  }

  if (btnInv) {
    btnInv.onclick = () => {
      inversasState.appliedInverse = true;
      initInversasInterativo();
    };
  }
}

// =========================================================================
// 7. DEMO 3: Diagrama TikZ dos 4 passos de Rotação com Pivô (Slide 14)
// =========================================================================
function drawStepRotation(canvasId, stepNum) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 200, 160);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const originX = 65;
  const originY = 115;
  const scale = 26;

  drawGrid(ctx, width, height, originX, originY, scale, [-2, 4], [-2, 4]);

  const xr = 2.0, yr = 2.0;
  // Triângulo original com pivô em (2,2)
  const origTri = [
    { x: 1.5, y: 1.0 },
    { x: 3.2, y: 1.0 },
    { x: 2.0, y: 3.5 }
  ];

  if (stepNum === 1) {
    // (a) Posição original com pivô (xr, yr)
    drawPolygon(ctx, originX, originY, scale, origTri, 'rgba(59, 130, 246, 0.35)', '#2563eb', 2);
    drawPointLabel(ctx, originX, originY, scale, xr, yr, '(xr, yr)', '#ec4899', 4, 'top-right');
  } else if (stepNum === 2) {
    // (b) Transladado para a origem: T(-xr, -yr)
    const M = translationMatrix3(-xr, -yr);
    const tri = transformPolygon(M, origTri);
    drawPolygon(ctx, originX, originY, scale, origTri, colors.ghostFill, colors.ghostStroke, 1, true);
    drawPolygon(ctx, originX, originY, scale, tri, 'rgba(59, 130, 246, 0.35)', '#2563eb', 2);
    drawPointLabel(ctx, originX, originY, scale, 0, 0, '(0,0)', '#ec4899', 4, 'bottom');
  } else if (stepNum === 3) {
    // (c) Rotacionado em torno da origem: R(90) * T(-xr, -yr)
    const M1 = translationMatrix3(-xr, -yr);
    const M2 = rotationMatrix3(90);
    const tri = transformPolygon(multiply3(M2, M1), origTri);
    drawPolygon(ctx, originX, originY, scale, origTri, colors.ghostFill, colors.ghostStroke, 1, true);
    drawPolygon(ctx, originX, originY, scale, tri, 'rgba(239, 68, 68, 0.35)', '#ef4444', 2);
    drawPointLabel(ctx, originX, originY, scale, 0, 0, '(0,0)', '#ec4899', 4, 'bottom');
  } else if (stepNum === 4) {
    // (d) Transladado de volta: T(xr, yr) * R(90) * T(-xr, -yr)
    const M1 = translationMatrix3(-xr, -yr);
    const M2 = rotationMatrix3(90);
    const M3 = translationMatrix3(xr, yr);
    const M_total = multiply3(M3, multiply3(M2, M1));
    const tri = transformPolygon(M_total, origTri);
    drawPolygon(ctx, originX, originY, scale, origTri, colors.ghostFill, colors.ghostStroke, 1, true);
    drawPolygon(ctx, originX, originY, scale, tri, 'rgba(16, 185, 129, 0.40)', '#10b981', 2);
    drawPointLabel(ctx, originX, originY, scale, xr, yr, '(xr, yr)', '#ec4899', 4, 'top-right');
  }
}

function initFourStepsRotation() {
  drawStepRotation('canvas-step-rot-1', 1);
  drawStepRotation('canvas-step-rot-2', 2);
  drawStepRotation('canvas-step-rot-3', 3);
  drawStepRotation('canvas-step-rot-4', 4);
}

// =========================================================================
// 8. DEMO 4: Rotação com Ponto Arbitrário Interativa (Slide 16)
// =========================================================================
let rotPivoState = {
  xr: 2,
  yr: 2,
  deg: 45,
  currentStep: 4 // 1: original, 2: T(-xr), 3: R(deg)*T, 4: final
};

function initRotPivoInterativo() {
  const canvas = document.getElementById('canvas-rot-pivo-lab');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 480, 360);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const originX = 140;
  const originY = 240;
  const scale = 32;

  drawGrid(ctx, width, height, originX, originY, scale, [-3, 9], [-3, 7]);

  const xr = rotPivoState.xr;
  const yr = rotPivoState.yr;
  const deg = rotPivoState.deg;

  // Triângulo de referência
  const baseTri = [
    { x: xr - 0.8, y: yr - 1.0 },
    { x: xr + 1.4, y: yr - 1.0 },
    { x: xr, y: yr + 1.6 }
  ];

  const M1 = translationMatrix3(-xr, -yr);
  const M2 = rotationMatrix3(deg);
  const M3 = translationMatrix3(xr, yr);
  const M_comp = multiply3(M3, multiply3(M2, M1));

  // Original fantasma
  drawPolygon(ctx, originX, originY, scale, baseTri, colors.ghostFill, colors.ghostStroke, 1.5, true);

  let curTri = baseTri;
  let statusText = 'Passo 0: Posição Original';

  if (rotPivoState.currentStep === 1) {
    curTri = baseTri;
    statusText = '1. Posição Original com Pivô (xr, yr)';
  } else if (rotPivoState.currentStep === 2) {
    curTri = transformPolygon(M1, baseTri);
    statusText = `2. Passo 1: Translada pivô para a origem T(${-xr}, ${-yr})`;
  } else if (rotPivoState.currentStep === 3) {
    curTri = transformPolygon(multiply3(M2, M1), baseTri);
    statusText = `3. Passo 2: Rotaciona ${deg}° em torno da origem R(${deg}°)`;
  } else if (rotPivoState.currentStep === 4) {
    curTri = transformPolygon(M_comp, baseTri);
    statusText = `4. Passo 3: Translada de volta T(${xr}, ${yr}) ➔ Rotação Completa!`;
  }

  // Desenhar triângulo atual
  drawPolygon(ctx, originX, originY, scale, curTri, colors.transFill, colors.transStroke, 2.5);

  // Desenhar pivô
  if (rotPivoState.currentStep === 2 || rotPivoState.currentStep === 3) {
    drawPointLabel(ctx, originX, originY, scale, 0, 0, 'Pivô na Origem (0,0)', '#ec4899', 5, 'bottom');
  } else {
    drawPointLabel(ctx, originX, originY, scale, xr, yr, `Pivô (${xr}, ${yr})`, '#ec4899', 5, 'top-right');
  }

  // Legenda no Canvas
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = colors.origText;
  ctx.fillText(statusText, 14, 24);

  // Atualizar painel de fórmulas
  const outEl = document.getElementById('rot-pivo-math-output');
  if (outEl) {
    const rad = (deg * Math.PI) / 180;
    const c = Math.cos(rad).toFixed(4);
    const s = Math.sin(rad).toFixed(4);
    const m02 = (xr * (1 - Math.cos(rad)) + yr * Math.sin(rad)).toFixed(4);
    const m12 = (yr * (1 - Math.cos(rad)) - xr * Math.sin(rad)).toFixed(4);

    outEl.innerHTML = `Matriz Composta $R(${xr}, ${yr}, ${deg}^\\circ) = T(${xr}, ${yr}) \\cdot R(${deg}^\\circ) \\cdot T(${-xr}, ${-yr})$:<br>
    $$M = \\begin{pmatrix} ${c} & ${(-s)} & ${m02} \\\\ ${s} & ${c} & ${m12} \\\\ 0 & 0 & 1 \\end{pmatrix}$$`;
    if (window.renderMathInElement) {
      window.renderMathInElement(outEl, {
        delimiters: [{ left: '$$', right: '$$', display: true }]
      });
    }
  }
}

function bindRotPivoControls() {
  const sXr = document.getElementById('rot-slider-xr');
  const sYr = document.getElementById('rot-slider-yr');
  const sDeg = document.getElementById('rot-slider-deg');
  const valXr = document.getElementById('rot-val-xr');
  const valYr = document.getElementById('rot-val-yr');
  const valDeg = document.getElementById('rot-val-deg');

  if (sXr) {
    sXr.oninput = (e) => {
      rotPivoState.xr = parseFloat(e.target.value);
      if (valXr) valXr.textContent = rotPivoState.xr.toString();
      initRotPivoInterativo();
    };
  }
  if (sYr) {
    sYr.oninput = (e) => {
      rotPivoState.yr = parseFloat(e.target.value);
      if (valYr) valYr.textContent = rotPivoState.yr.toString();
      initRotPivoInterativo();
    };
  }
  if (sDeg) {
    sDeg.oninput = (e) => {
      rotPivoState.deg = parseFloat(e.target.value);
      if (valDeg) valDeg.textContent = `${rotPivoState.deg}°`;
      initRotPivoInterativo();
    };
  }

  // Botões de passo
  [1, 2, 3, 4].forEach(step => {
    const btn = document.getElementById(`btn-rot-step-${step}`);
    if (btn) {
      btn.onclick = () => {
        rotPivoState.currentStep = step;
        document.querySelectorAll('.rot-step-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        initRotPivoInterativo();
      };
    }
  });
}

// =========================================================================
// 9. DEMO 5: Diagrama TikZ dos 4 passos de Escala com Ponto Fixo (Slide 17)
// =========================================================================
function drawStepScale(canvasId, stepNum) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 200, 160);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const originX = 65;
  const originY = 115;
  const scale = 26;

  drawGrid(ctx, width, height, originX, originY, scale, [-2, 4], [-2, 4]);

  const xf = 1.8, yf = 1.8;
  const origTri = [
    { x: 0.8, y: 0.9 },
    { x: 2.8, y: 0.9 },
    { x: 1.8, y: 3.0 }
  ];

  if (stepNum === 1) {
    drawPolygon(ctx, originX, originY, scale, origTri, 'rgba(59, 130, 246, 0.35)', '#2563eb', 2);
    drawPointLabel(ctx, originX, originY, scale, xf, yf, '(xf, yf)', '#ec4899', 4, 'bottom');
  } else if (stepNum === 2) {
    const M = translationMatrix3(-xf, -yf);
    const tri = transformPolygon(M, origTri);
    drawPolygon(ctx, originX, originY, scale, origTri, colors.ghostFill, colors.ghostStroke, 1, true);
    drawPolygon(ctx, originX, originY, scale, tri, 'rgba(59, 130, 246, 0.35)', '#2563eb', 2);
    drawPointLabel(ctx, originX, originY, scale, 0, 0, '(0,0)', '#ec4899', 4, 'bottom');
  } else if (stepNum === 3) {
    const M1 = translationMatrix3(-xf, -yf);
    const M2 = scaleMatrix3(0.5, 0.5);
    const tri = transformPolygon(multiply3(M2, M1), origTri);
    drawPolygon(ctx, originX, originY, scale, origTri, colors.ghostFill, colors.ghostStroke, 1, true);
    drawPolygon(ctx, originX, originY, scale, tri, 'rgba(16, 185, 129, 0.35)', '#10b981', 2);
    drawPointLabel(ctx, originX, originY, scale, 0, 0, '(0,0)', '#ec4899', 4, 'bottom');
  } else if (stepNum === 4) {
    const M1 = translationMatrix3(-xf, -yf);
    const M2 = scaleMatrix3(0.5, 0.5);
    const M3 = translationMatrix3(xf, yf);
    const tri = transformPolygon(multiply3(M3, multiply3(M2, M1)), origTri);
    drawPolygon(ctx, originX, originY, scale, origTri, colors.ghostFill, colors.ghostStroke, 1, true);
    drawPolygon(ctx, originX, originY, scale, tri, 'rgba(16, 185, 129, 0.45)', '#10b981', 2);
    drawPointLabel(ctx, originX, originY, scale, xf, yf, '(xf, yf)', '#ec4899', 4, 'bottom');
  }
}

function initFourStepsScale() {
  drawStepScale('canvas-step-scale-1', 1);
  drawStepScale('canvas-step-scale-2', 2);
  drawStepScale('canvas-step-scale-3', 3);
  drawStepScale('canvas-step-scale-4', 4);
}

// =========================================================================
// 10. DEMO 6: Escala com Ponto Fixo Interativa (Slide 19)
// =========================================================================
let scalePivoState = {
  xf: 2,
  yf: 2,
  sx: 1.5,
  sy: 1.5,
  compareOrigin: false
};

function initScalePivoInterativo() {
  const canvas = document.getElementById('canvas-scale-pivo-lab');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 480, 360);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const originX = 90;
  const originY = 270;
  const scale = 32;

  drawGrid(ctx, width, height, originX, originY, scale, [-2, 10], [-2, 8]);

  const xf = scalePivoState.xf;
  const yf = scalePivoState.yf;
  const sx = scalePivoState.sx;
  const sy = scalePivoState.sy;

  // Objeto original: retângulo ao redor de (xf, yf)
  const baseRect = [
    { x: xf - 1, y: yf - 1 },
    { x: xf + 1, y: yf - 1 },
    { x: xf + 1, y: yf + 1 },
    { x: xf - 1, y: yf + 1 }
  ];

  // Matriz com ponto fixo: T(xf,yf) * S(sx,sy) * T(-xf,-yf)
  const M_fixed = [
    [sx, 0, xf * (1 - sx)],
    [0, sy, yf * (1 - sy)],
    [0, 0, 1]
  ];

  // Matriz de escala básica na origem para comparação
  const M_origin = scaleMatrix3(sx, sy);

  // Original fantasma
  drawPolygon(ctx, originX, originY, scale, baseRect, colors.ghostFill, colors.ghostStroke, 1.5, true);

  if (scalePivoState.compareOrigin) {
    // Escala na origem (objeto se afasta)
    const rectOrigin = transformPolygon(M_origin, baseRect);
    drawPolygon(ctx, originX, originY, scale, rectOrigin, 'rgba(239, 68, 68, 0.25)', '#ef4444', 2, true);
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Vermelho Tracejado: Escala na Origem (Afastou-se!)', 14, 42);
  }

  // Escala com Ponto Fixo (verde)
  const rectFixed = transformPolygon(M_fixed, baseRect);
  drawPolygon(ctx, originX, originY, scale, rectFixed, 'rgba(16, 185, 129, 0.35)', '#10b981', 2.5);

  // Ponto fixo desenhado como âncora
  drawPointLabel(ctx, originX, originY, scale, xf, yf, `Âncora (${xf}, ${yf})`, '#ec4899', 5.5, 'top-right');

  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`Escala com Âncora: Objeto cresce/encolhe sem sair de (${xf}, ${yf})`, 14, 24);

  // Atualizar painel de fórmulas
  const outEl = document.getElementById('scale-pivo-math-output');
  if (outEl) {
    const tx_res = (xf * (1 - sx)).toFixed(2);
    const ty_res = (yf * (1 - sy)).toFixed(2);
    outEl.innerHTML = `Fórmula Fechada da Matriz Composta $S(${xf}, ${yf}, ${sx}, ${sy})$:<br>
    $$S_{âncora} = \\begin{pmatrix} s_x & 0 & x_f(1-s_x) \\\\ 0 & s_y & y_f(1-s_y) \\\\ 0 & 0 & 1 \\end{pmatrix} = \\begin{pmatrix} ${sx} & 0 & ${tx_res} \\\\ 0 & ${sy} & ${ty_res} \\\\ 0 & 0 & 1 \\end{pmatrix}$$`;
    if (window.renderMathInElement) {
      window.renderMathInElement(outEl, {
        delimiters: [{ left: '$$', right: '$$', display: true }]
      });
    }
  }
}

function bindScalePivoControls() {
  const sXf = document.getElementById('scale-slider-xf');
  const sYf = document.getElementById('scale-slider-yf');
  const sSx = document.getElementById('scale-slider-sx');
  const sSy = document.getElementById('scale-slider-sy');
  const valXf = document.getElementById('scale-val-xf');
  const valYf = document.getElementById('scale-val-yf');
  const valSx = document.getElementById('scale-val-sx');
  const valSy = document.getElementById('scale-val-sy');
  const chkComp = document.getElementById('scale-chk-compare');

  if (sXf) {
    sXf.oninput = (e) => {
      scalePivoState.xf = parseFloat(e.target.value);
      if (valXf) valXf.textContent = scalePivoState.xf.toString();
      initScalePivoInterativo();
    };
  }
  if (sYf) {
    sYf.oninput = (e) => {
      scalePivoState.yf = parseFloat(e.target.value);
      if (valYf) valYf.textContent = scalePivoState.yf.toString();
      initScalePivoInterativo();
    };
  }
  if (sSx) {
    sSx.oninput = (e) => {
      scalePivoState.sx = parseFloat(e.target.value);
      if (valSx) valSx.textContent = scalePivoState.sx.toString();
      initScalePivoInterativo();
    };
  }
  if (sSy) {
    sSy.oninput = (e) => {
      scalePivoState.sy = parseFloat(e.target.value);
      if (valSy) valSy.textContent = scalePivoState.sy.toString();
      initScalePivoInterativo();
    };
  }
  if (chkComp) {
    chkComp.onchange = (e) => {
      scalePivoState.compareOrigin = e.target.checked;
      initScalePivoInterativo();
    };
  }
}

// =========================================================================
// 11. DEMO 7: Não-Comutatividade da Casinha (Slide 21)
// =========================================================================
let houseAnimState = {
  activePath: 'both', // 'A', 'B', 'both'
  tx: 2.5,
  deg: 45
};

function initHouseComutatividadeDemo() {
  const canvas = document.getElementById('canvas-house-demo');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 560, 340);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const originX = 60;
  const originY = 280;
  const scale = 36;

  drawGrid(ctx, width, height, originX, originY, scale, [-1, 12], [-1, 8]);

  // Vértices clássicos da casinha (do TikZ Beamer)
  const baseHouse = [
    { x: 0.45, y: 0.45 },
    { x: 1.25, y: 0.45 },
    { x: 1.25, y: 1.15 },
    { x: 0.85, y: 1.55 },
    { x: 0.45, y: 1.15 }
  ];

  // Desenhar casa original
  drawPolygon(ctx, originX, originY, scale, baseHouse, colors.ghostFill, colors.ghostStroke, 1.5, true);
  ctx.font = '10px "Inter", sans-serif';
  ctx.fillStyle = colors.origText;
  ctx.fillText('Original', toScreen(0.45, 0.45, originX, originY, scale).px, toScreen(0.45, 0.45, originX, originY, scale).py + 14);

  const tx = houseAnimState.tx;
  const deg = houseAnimState.deg;
  const T = translationMatrix3(tx, 0);
  const R = rotationMatrix3(deg);

  // Caminho A: Primeiro T depois R ➔ M_A = R * T
  const M_A = multiply3(R, T);
  // Caminho B: Primeiro R depois T ➔ M_B = T * R
  const M_B = multiply3(T, R);

  // Intermediário A: Apenas T
  const house_T = transformPolygon(T, baseHouse);
  // Intermediário B: Apenas R
  const house_R = transformPolygon(R, baseHouse);

  // Final A: R * T
  const house_FinalA = transformPolygon(M_A, baseHouse);
  // Final B: T * R
  const house_FinalB = transformPolygon(M_B, baseHouse);

  if (houseAnimState.activePath === 'A' || houseAnimState.activePath === 'both') {
    // Desenhar intermediário A (tracejado)
    drawPolygon(ctx, originX, originY, scale, house_T, 'rgba(59, 130, 246, 0.15)', '#3b82f6', 1, true);
    // Desenhar final A (azul sólido)
    drawPolygon(ctx, originX, originY, scale, house_FinalA, 'rgba(59, 130, 246, 0.45)', '#1d4ed8', 2.5);
    const pA = toScreen(house_FinalA[3].x, house_FinalA[3].y, originX, originY, scale);
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText('Final (a): Translada ➔ Gira', pA.px - 20, pA.py - 8);
  }

  if (houseAnimState.activePath === 'B' || houseAnimState.activePath === 'both') {
    // Desenhar intermediário B (tracejado)
    drawPolygon(ctx, originX, originY, scale, house_R, 'rgba(239, 68, 68, 0.15)', '#ef4444', 1, true);
    // Desenhar final B (vermelho sólido)
    drawPolygon(ctx, originX, originY, scale, house_FinalB, 'rgba(239, 68, 68, 0.45)', '#b91c1c', 2.5);
    const pB = toScreen(house_FinalB[3].x, house_FinalB[3].y, originX, originY, scale);
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('Final (b): Gira ➔ Translada', pB.px - 20, pB.py - 8);
  }

  // Título e resumo
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = colors.origText;
  ctx.fillText('Demonstração: R · T ≠ T · R (Ordem Altera Completamente o Resultado!)', 14, 22);

  // Atualizar painel de fórmulas
  const outEl = document.getElementById('house-math-output');
  if (outEl) {
    outEl.innerHTML = `
      <div style="display:flex;gap:14px;font-size:0.78rem;">
        <div style="flex:1;background:rgba(59,130,246,0.1);padding:6px;border-radius:4px;border:1px solid #3b82f6;">
          <strong>(a) $M_A = R(45^\\circ) \\cdot T(${tx}, 0)$:</strong><br>
          Primeiro translada na horizontal, depois o objeto e seu eixo giram $45^\\circ$ em torno da origem (sobe pelo arco!).
        </div>
        <div style="flex:1;background:rgba(239,68,68,0.1);padding:6px;border-radius:4px;border:1px solid #ef4444;">
          <strong>(b) $M_B = T(${tx}, 0) \\cdot R(45^\\circ)$:</strong><br>
          Primeiro gira $45^\\circ$ no lugar, depois desliza horizontalmente para a direita.
        </div>
      </div>
    `;
    if (window.renderMathInElement) {
      window.renderMathInElement(outEl, {
        delimiters: [{ left: '$', right: '$', display: false }]
      });
    }
  }
}

function bindHouseControls() {
  const btnA = document.getElementById('btn-house-path-a');
  const btnB = document.getElementById('btn-house-path-b');
  const btnBoth = document.getElementById('btn-house-path-both');

  if (btnA) {
    btnA.onclick = () => {
      houseAnimState.activePath = 'A';
      document.querySelectorAll('.house-btn').forEach(b => b.classList.remove('active'));
      btnA.classList.add('active');
      initHouseComutatividadeDemo();
    };
  }
  if (btnB) {
    btnB.onclick = () => {
      houseAnimState.activePath = 'B';
      document.querySelectorAll('.house-btn').forEach(b => b.classList.remove('active'));
      btnB.classList.add('active');
      initHouseComutatividadeDemo();
    };
  }
  if (btnBoth) {
    btnBoth.onclick = () => {
      houseAnimState.activePath = 'both';
      document.querySelectorAll('.house-btn').forEach(b => b.classList.remove('active'));
      btnBoth.classList.add('active');
      initHouseComutatividadeDemo();
    };
  }
}

// =========================================================================
// 12. DEMO 8: Exemplo do Quadrado (Slide 25)
// =========================================================================
function initSquareExampleDemo() {
  const canvas = document.getElementById('canvas-square-example');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 480, 360);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const originX = 50;
  const originY = 310;
  const scale = 36;

  drawGrid(ctx, width, height, originX, originY, scale, [0, 9], [0, 9]);

  // Quadrado original: P1(4,4), P2(6,4), P4(6,6), P3(4,6)
  const origSquare = [
    { x: 4, y: 4, label: 'P₁ (4,4)' },
    { x: 6, y: 4, label: 'P₂ (6,4)' },
    { x: 6, y: 6, label: 'P₄ (6,6)' },
    { x: 4, y: 6, label: 'P₃ (4,6)' }
  ];

  // Centroide: (5,5)
  const cx = 5, cy = 5;

  // Matriz composta calculada no slide:
  // M = T(5,5) * R(45°) * T(-5,-5)
  const c = 0.7071;
  const s = 0.7071;
  const M_comp = [
    [c, -s, 5.0],
    [s, c, -2.0711],
    [0, 0, 1]
  ];

  // Quadrado original desenhado
  drawPolygon(ctx, originX, originY, scale, origSquare, 'rgba(59, 130, 246, 0.25)', '#2563eb', 2);
  origSquare.forEach(p => {
    drawPointLabel(ctx, originX, originY, scale, p.x, p.y, p.label, '#2563eb', 3.5, 'bottom');
  });

  // Centroide (5,5)
  drawPointLabel(ctx, originX, originY, scale, cx, cy, 'Centroide (5,5)', '#ec4899', 5.5, 'top-right');

  // Quadrado rotacionado
  const rotSquare = origSquare.map(p => {
    const pt = transformPoint(M_comp, p);
    return { x: pt.x, y: pt.y };
  });

  drawPolygon(ctx, originX, originY, scale, rotSquare, 'rgba(239, 68, 68, 0.35)', '#ef4444', 2.5);

  const rotLabels = ['P₁\'(5.00, 3.59)', 'P₂\'(6.41, 5.00)', 'P₄\'(5.00, 6.41)', 'P₃\'(3.59, 5.00)'];
  rotSquare.forEach((p, idx) => {
    drawPointLabel(ctx, originX, originY, scale, p.x, p.y, rotLabels[idx], '#ef4444', 4, idx % 2 === 0 ? 'top' : 'right');
  });

  // Título e anotações no canvas
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = colors.origText;
  ctx.fillText('Azul: Original | Vermelho: Rotacionado 45° em torno do Centroide (5,5)', 14, 22);
}

// =========================================================================
// 13. DEMO 9: Reflexões 2D Interativas (Slide 31)
// =========================================================================
let reflexaoState = {
  axis: 'x' // 'x', 'y', 'origin'
};

function initReflexaoDemo() {
  const canvas = document.getElementById('canvas-reflexao-demo');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 480, 340);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const originX = width / 2;
  const originY = height / 2;
  const scale = 32;

  drawGrid(ctx, width, height, originX, originY, scale, [-6, 6], [-5, 5]);

  // Triângulo no 1º quadrante
  const baseTri = [
    { x: 1.5, y: 1.0 },
    { x: 4.0, y: 1.0 },
    { x: 2.5, y: 3.5 }
  ];

  let M_ref = identity3();
  let axisLabel = '';

  if (reflexaoState.axis === 'x') {
    M_ref = reflectionXMatrix3();
    axisLabel = 'Eixo de Reflexão: Eixo X (y = 0)';
    // Destacar eixo X em verde
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
  } else if (reflexaoState.axis === 'y') {
    M_ref = reflectionYMatrix3();
    axisLabel = 'Eixo de Reflexão: Eixo Y (x = 0)';
    // Destacar eixo Y em verde
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();
  } else if (reflexaoState.axis === 'origin') {
    M_ref = reflectionOriginMatrix3();
    axisLabel = 'Ponto de Reflexão: Origem (0, 0)';
    // Destacar ponto da origem em verde
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(originX, originY, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Triângulo original
  drawPolygon(ctx, originX, originY, scale, baseTri, colors.origFill, colors.origStroke, 2);
  baseTri.forEach(p => drawPointLabel(ctx, originX, originY, scale, p.x, p.y, `(${p.x},${p.y})`, colors.origStroke, 3.5, 'top-right'));

  // Triângulo refletido
  const refTri = transformPolygon(M_ref, baseTri);
  drawPolygon(ctx, originX, originY, scale, refTri, colors.transFill, colors.transStroke, 2.5);
  refTri.forEach(p => drawPointLabel(ctx, originX, originY, scale, p.x, p.y, `(${p.x},${p.y})`, colors.transStroke, 3.5, 'bottom'));

  // Traçar linhas guia entre pontos correspondentes
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = colors.guideLines;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < baseTri.length; i++) {
    const p1 = toScreen(baseTri[i].x, baseTri[i].y, originX, originY, scale);
    const p2 = toScreen(refTri[i].x, refTri[i].y, originX, originY, scale);
    ctx.beginPath();
    ctx.moveTo(p1.px, p1.py);
    ctx.lineTo(p2.px, p2.py);
    ctx.stroke();
  }
  ctx.restore();

  // Rótulo
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText(axisLabel, 14, 22);

  // Painel de fórmula
  const outEl = document.getElementById('reflexao-math-output');
  if (outEl) {
    if (reflexaoState.axis === 'x') {
      outEl.innerHTML = `$$F_x = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & -1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}, \\quad x' = x, \\; y' = -y$$`;
    } else if (reflexaoState.axis === 'y') {
      outEl.innerHTML = `$$F_y = \\begin{pmatrix} -1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}, \\quad x' = -x, \\; y' = y$$`;
    } else {
      outEl.innerHTML = `$$F_o = \\begin{pmatrix} -1 & 0 & 0 \\\\ 0 & -1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}, \\quad x' = -x, \\; y' = -y \\quad (\\text{Equivalente a } R(180^\\circ))$$`;
    }
    if (window.renderMathInElement) {
      window.renderMathInElement(outEl, {
        delimiters: [{ left: '$$', right: '$$', display: true }]
      });
    }
  }
}

function bindReflexaoControls() {
  ['x', 'y', 'origin'].forEach(ax => {
    const btn = document.getElementById(`btn-ref-${ax}`);
    if (btn) {
      btn.onclick = () => {
        reflexaoState.axis = ax;
        document.querySelectorAll('.ref-axis-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        initReflexaoDemo();
      };
    }
  });
}

// =========================================================================
// 14. DEMO 10: Cisalhamento (Shear) Interativo (Slide 35)
// =========================================================================
let shearState = {
  shx: 1.5,
  shy: 0.0
};

function initShearDemo() {
  const canvas = document.getElementById('canvas-shear-demo');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 480, 340);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const originX = 70;
  const originY = 270;
  const scale = 40;

  drawGrid(ctx, width, height, originX, originY, scale, [-1, 9], [-1, 6]);

  // Quadrado unitário [0,0] a [2,2]
  const baseSquare = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 2 },
    { x: 0, y: 2 }
  ];

  const shx = shearState.shx;
  const shy = shearState.shy;

  // Matriz de cisalhamento combinada
  const M_sh = [
    [1, shx, 0],
    [shy, 1, 0],
    [0, 0, 1]
  ];

  // Original tracejado
  drawPolygon(ctx, originX, originY, scale, baseSquare, colors.ghostFill, colors.ghostStroke, 1.5, true);

  // Deformado
  const shearedPoly = transformPolygon(M_sh, baseSquare);
  drawPolygon(ctx, originX, originY, scale, shearedPoly, colors.transFill, colors.transStroke, 2.5);

  shearedPoly.forEach((p, idx) => {
    drawPointLabel(ctx, originX, originY, scale, p.x, p.y, `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`, colors.transStroke, 4, 'top-right');
  });

  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = colors.origText;
  ctx.fillText(`Cisalhamento: shx = ${shx.toFixed(1)}, shy = ${shy.toFixed(1)} ➔ Quadrado vira Paralelogramo`, 14, 22);

  // Painel de fórmula
  const outEl = document.getElementById('shear-math-output');
  if (outEl) {
    outEl.innerHTML = `$$SH = \\begin{pmatrix} 1 & ${shx.toFixed(1)} & 0 \\\\ ${shy.toFixed(1)} & 1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}, \\quad \\begin{cases} x' = x + ${shx.toFixed(1)} \\cdot y \\\\ y' = y + ${shy.toFixed(1)} \\cdot x \\end{cases}$$`;
    if (window.renderMathInElement) {
      window.renderMathInElement(outEl, {
        delimiters: [{ left: '$$', right: '$$', display: true }]
      });
    }
  }
}

function bindShearControls() {
  const sShx = document.getElementById('shear-slider-shx');
  const sShy = document.getElementById('shear-slider-shy');
  const valShx = document.getElementById('shear-val-shx');
  const valShy = document.getElementById('shear-val-shy');

  if (sShx) {
    sShx.oninput = (e) => {
      shearState.shx = parseFloat(e.target.value);
      if (valShx) valShx.textContent = shearState.shx.toFixed(1);
      initShearDemo();
    };
  }
  if (sShy) {
    sShy.oninput = (e) => {
      shearState.shy = parseFloat(e.target.value);
      if (valShy) valShy.textContent = shearState.shy.toFixed(1);
      initShearDemo();
    };
  }
}

// =========================================================================
// 15. DEMO 11: Playground Completo de Transformações Compostas (Slide 37)
// =========================================================================
let playgroundStack = [
  { id: 1, type: 'T', name: 'Translação T(2, 1)', M: translationMatrix3(2, 1) },
  { id: 2, type: 'R', name: 'Rotação R(45°)', M: rotationMatrix3(45) }
];

function initPlaygroundDemo() {
  const canvas = document.getElementById('canvas-playground-demo');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 500, 360);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const originX = width / 2;
  const originY = height / 2 + 10;
  const scale = 30;

  drawGrid(ctx, width, height, originX, originY, scale, [-8, 8], [-5, 5]);

  const baseShape = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
    { x: 0, y: 1 }
  ];

  // Calcular matriz composta multiplicando da esquerda para a direita (pilha pós-multiplicada):
  // Ordem de execução: o primeiro da pilha é o primeiro a ser aplicado ao objeto:
  // M_total = Mn * ... * M2 * M1
  let M_total = identity3();
  for (let i = 0; i < playgroundStack.length; i++) {
    M_total = multiply3(playgroundStack[i].M, M_total);
  }

  // Desenhar original fantasma
  drawPolygon(ctx, originX, originY, scale, baseShape, colors.ghostFill, colors.ghostStroke, 1.5, true);

  // Desenhar transformado
  const transformedShape = transformPolygon(M_total, baseShape);
  drawPolygon(ctx, originX, originY, scale, transformedShape, colors.transFill, colors.transStroke, 2.5);

  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = colors.origText;
  ctx.fillText(`Pilha com ${playgroundStack.length} operações aplicadas`, 14, 22);

  // Atualizar lista da pilha no HTML
  renderPlaygroundStackList();

  // Exibir matriz resultante
  const matEl = document.getElementById('playground-matrix-output');
  if (matEl) {
    const f = (v) => (Math.abs(v) < 0.0001 ? '0.00' : v.toFixed(2));
    matEl.innerHTML = `
      $$M_{composta} = \\begin{pmatrix} 
      ${f(M_total[0][0])} & ${f(M_total[0][1])} & ${f(M_total[0][2])} \\\\ 
      ${f(M_total[1][0])} & ${f(M_total[1][1])} & ${f(M_total[1][2])} \\\\ 
      0.00 & 0.00 & 1.00 
      \\end{pmatrix}$$
    `;
    if (window.renderMathInElement) {
      window.renderMathInElement(matEl, {
        delimiters: [{ left: '$$', right: '$$', display: true }]
      });
    }
  }
}

function renderPlaygroundStackList() {
  const container = document.getElementById('playground-stack-items');
  if (!container) return;
  container.innerHTML = '';

  if (playgroundStack.length === 0) {
    container.innerHTML = '<div style="color:gray;font-size:0.75rem;padding:6px;">Nenhuma transformação na pilha (Identidade).</div>';
    return;
  }

  playgroundStack.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'stack-item';
    row.innerHTML = `
      <span class="order-badge">${index + 1}ª op:</span>
      <span style="flex:1;margin-left:6px;font-weight:600;">${item.name}</span>
      <button class="btn btn-secondary btn-sm" onclick="movePlaygroundStack(${index}, -1)" ${index === 0 ? 'disabled' : ''}>▲</button>
      <button class="btn btn-secondary btn-sm" onclick="movePlaygroundStack(${index}, 1)" ${index === playgroundStack.length - 1 ? 'disabled' : ''}>▼</button>
      <button class="btn btn-sm" style="background:#ef4444;" onclick="removePlaygroundStack(${index})">✕</button>
    `;
    container.appendChild(row);
  });
}

window.movePlaygroundStack = function(index, dir) {
  const target = index + dir;
  if (target < 0 || target >= playgroundStack.length) return;
  const temp = playgroundStack[index];
  playgroundStack[index] = playgroundStack[target];
  playgroundStack[target] = temp;
  initPlaygroundDemo();
};

window.removePlaygroundStack = function(index) {
  playgroundStack.splice(index, 1);
  initPlaygroundDemo();
};

window.addPlaygroundOp = function(type) {
  let name = '';
  let M = identity3();
  if (type === 'T') {
    name = 'Translação T(2, 1)';
    M = translationMatrix3(2, 1);
  } else if (type === 'R') {
    name = 'Rotação R(45°)';
    M = rotationMatrix3(45);
  } else if (type === 'S') {
    name = 'Escala S(1.5, 1.5)';
    M = scaleMatrix3(1.5, 1.5);
  } else if (type === 'Fx') {
    name = 'Reflexão Eixo X (y=0)';
    M = reflectionXMatrix3();
  } else if (type === 'Fy') {
    name = 'Reflexão Eixo Y (x=0)';
    M = reflectionYMatrix3();
  } else if (type === 'SHx') {
    name = 'Cisalhamento SHx(1.0)';
    M = shearXMatrix3(1.0);
  }

  playgroundStack.push({ id: Date.now(), type, name, M });
  initPlaygroundDemo();
};

window.clearPlaygroundStack = function() {
  playgroundStack = [];
  initPlaygroundDemo();
};

window.invertPlaygroundStack = function() {
  playgroundStack.reverse();
  initPlaygroundDemo();
};

// =========================================================================
// 16. Inicializador Global de todos os Módulos Canvas
// =========================================================================
window.initAllCanvasDemos = function() {
  initTransInversaDemo();
  initInversasInterativo();
  initFourStepsRotation();
  initRotPivoInterativo();
  initFourStepsScale();
  initScalePivoInterativo();
  initHouseComutatividadeDemo();
  initSquareExampleDemo();
  initReflexaoDemo();
  initShearDemo();
  initPlaygroundDemo();
};

// Inicialização imediata e amarração de eventos
document.addEventListener('DOMContentLoaded', () => {
  bindInversasControls();
  bindRotPivoControls();
  bindScalePivoControls();
  bindHouseControls();
  bindReflexaoControls();
  bindShearControls();

  // Primeira execução
  setTimeout(() => {
    window.initAllCanvasDemos();
  }, 50);
});
