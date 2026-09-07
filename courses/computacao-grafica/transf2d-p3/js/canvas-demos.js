/**
 * canvas-demos.js
 * Módulos interativos em Canvas 2D para Transformações Geométricas 2D (Parte 3)
 * Suporte a Alta Densidade de Pixels (High-DPI / retina), Tema Claro e Escuro,
 * Álgebra Matricial 3x3 e Simulações em Tempo Real.
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
      axes: 'rgba(96, 165, 250, 0.75)',
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
      vector: '#ef4444',
      vectorU: '#10b981',
      vectorText: '#f87171',
      guideLines: 'rgba(245, 158, 11, 0.45)',
      cyanAxis: '#38bdf8',
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
      vector: '#dc2626',
      vectorU: '#059669',
      vectorText: '#b91c1c',
      guideLines: 'rgba(217, 119, 6, 0.5)',
      cyanAxis: '#0284c7',
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
// 3. Utilitários Matemáticos de Matrizes 3x3
// =========================================================================
const Mat3 = {
  identity() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  },
  translation(tx, ty) {
    return [
      1, 0, tx,
      0, 1, ty,
      0, 0, 1
    ];
  },
  rotation(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return [
      c, -s, 0,
      s,  c, 0,
      0,  0, 1
    ];
  },
  scale(sx, sy) {
    return [
      sx, 0,  0,
      0,  sy, 0,
      0,  0,  1
    ];
  },
  multiply(A, B) {
    const C = new Array(9).fill(0);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        C[r * 3 + c] = 
          A[r * 3 + 0] * B[0 * 3 + c] +
          A[r * 3 + 1] * B[1 * 3 + c] +
          A[r * 3 + 2] * B[2 * 3 + c];
      }
    }
    return C;
  },
  apply(M, pt) {
    const x = pt[0], y = pt[1], w = pt.length > 2 ? pt[2] : 1;
    const nx = M[0] * x + M[1] * y + M[2] * w;
    const ny = M[3] * x + M[4] * y + M[5] * w;
    const nw = M[6] * x + M[7] * y + M[8] * w;
    return [nx / nw, ny / nw];
  }
};

// =========================================================================
// 4. Desenho de Grade e Eixos
// =========================================================================
function drawCartesianGrid(ctx, width, height, originX, originY, scale = 36, xRange = [-5, 7], yRange = [-4, 6]) {
  const colors = getThemeColors();
  ctx.save();
  
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  // Linhas da grade
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

  // Eixo X
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = colors.axes;
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

  // Rótulos dos eixos e marcas numéricas
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = colors.axisLabels;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let i = xRange[0]; i <= xRange[1]; i++) {
    if (i === 0) continue;
    const px = originX + i * scale;
    if (px > 10 && px < width - 10) {
      ctx.beginPath();
      ctx.moveTo(px, originY - 3);
      ctx.lineTo(px, originY + 3);
      ctx.stroke();
      ctx.fillText(`${i}`, px, originY + 5);
    }
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let j = yRange[0]; j <= yRange[1]; j++) {
    if (j === 0) continue;
    const py = originY - j * scale;
    if (py > 10 && py < height - 10) {
      ctx.beginPath();
      ctx.moveTo(originX - 3, py);
      ctx.lineTo(originX + 3, py);
      ctx.stroke();
      ctx.fillText(`${j}`, originX - 6, py);
    }
  }

  ctx.fillText('0', originX - 6, originY + 10);
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = colors.axes;
  ctx.fillText('x', width - 12, originY + 12);
  ctx.fillText('y', originX - 12, 14);

  ctx.restore();
}

/**
 * Desenha um marcador de ângulo reto (90 graus) perfeito e rigoroso.
 * (cx, cy): vértice do ângulo reto
 * (d1x, d1y): vetor direção da primeira reta (partindo de cx, cy)
 * (d2x, d2y): vetor direção da segunda reta (partindo de cx, cy)
 */
function drawPerpendicularMarker(ctx, cx, cy, d1x, d1y, d2x, d2y, size = 8, color = '#f59e0b') {
  const len1 = Math.hypot(d1x, d1y) || 1;
  const len2 = Math.hypot(d2x, d2y) || 1;
  const u1x = (d1x / len1) * size;
  const u1y = (d1y / len1) * size;
  const u2x = (d2x / len2) * size;
  const u2y = (d2y / len2) * size;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(cx + u1x, cy + u1y);
  ctx.lineTo(cx + u1x + u2x, cy + u1y + u2y);
  ctx.lineTo(cx + u2x, cy + u2y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Desenha uma badge matemática elegante com suporte a subscritos (ex: v_x, u_y = -v_x).
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text - Ex: "v_x", "u_x = v_y", "u_y = -v_x", "v = (v_x, v_y)"
 * @param {number} cx - Coordenada X central da badge
 * @param {number} cy - Coordenada Y central da badge
 * @param {object} opts - { textColor, borderColor, bgColor, fontSize, hasArrow, isBold, drawBadge, padX, padY }
 */
function drawMathBadge(ctx, text, cx, cy, opts = {}) {
  const isDark = document.body.classList.contains('dark-theme');
  const fontSize = opts.fontSize || 10;
  const subFontSize = Math.max(7, Math.round(fontSize * 0.72));
  const textColor = opts.textColor || (isDark ? '#e2e8f0' : '#1e293b');
  const borderColor = opts.borderColor || 'rgba(148, 163, 184, 0.4)';
  const bgColor = opts.bgColor || (isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)');
  const padX = opts.padX !== undefined ? opts.padX : 5;
  const padY = opts.padY !== undefined ? opts.padY : 2;
  const fontWeight = opts.isBold !== false ? 'bold ' : '';
  const fontFamily = 'Inter, -apple-system, sans-serif';

  // Parser de tokens matemáticos para subscritos '_'
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === '_' && i + 1 < text.length) {
      let subText = '';
      i++;
      if (text[i] === '{') {
        i++;
        while (i < text.length && text[i] !== '}') {
          subText += text[i++];
        }
        if (i < text.length) i++;
      } else {
        subText = text[i++];
      }
      tokens.push({ type: 'sub', text: subText });
    } else {
      let normal = text[i++];
      while (i < text.length && text[i] !== '_') {
        normal += text[i++];
      }
      tokens.push({ type: 'normal', text: normal });
    }
  }

  // Medir largura total dos tokens
  ctx.save();
  let totalWidth = 0;
  const metrics = [];

  for (const token of tokens) {
    if (token.type === 'sub') {
      ctx.font = `${fontWeight}${subFontSize}px ${fontFamily}`;
      const w = ctx.measureText(token.text).width;
      metrics.push({ width: w, font: `${fontWeight}${subFontSize}px ${fontFamily}`, dy: Math.round(fontSize * 0.3) });
      totalWidth += w;
    } else {
      ctx.font = `${fontWeight}${fontSize}px ${fontFamily}`;
      const w = ctx.measureText(token.text).width;
      metrics.push({ width: w, font: `${fontWeight}${fontSize}px ${fontFamily}`, dy: 0 });
      totalWidth += w;
    }
  }

  const badgeW = totalWidth + padX * 2;
  const badgeH = fontSize + padY * 2 + 4;
  const rx = Math.round(cx - badgeW / 2);
  const ry = Math.round(cy - badgeH / 2);

  // Fundo com borda arredondada (pill)
  if (opts.drawBadge !== false) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(rx, ry, badgeW, badgeH, 4);
    } else {
      ctx.rect(rx, ry, badgeW, badgeH);
    }
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
  }

  // Desenhar cada caractere
  let curX = rx + padX;
  const baseTextY = Math.round(cy + fontSize * 0.34);

  for (let k = 0; k < tokens.length; k++) {
    const token = tokens[k];
    const m = metrics[k];
    ctx.font = m.font;
    ctx.fillStyle = textColor;
    ctx.fillText(token.text, curX, baseTextY + m.dy);

    // Se tiver seta de vetor no início
    if (opts.hasArrow && k === 0 && (token.text.startsWith('v') || token.text.startsWith('u'))) {
      ctx.save();
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      const arrowY = baseTextY - fontSize + 1;
      ctx.moveTo(curX, arrowY);
      ctx.lineTo(curX + 6, arrowY);
      ctx.lineTo(curX + 4.5, arrowY - 2);
      ctx.stroke();
      ctx.restore();
    }

    curX += m.width;
  }

  ctx.restore();
  return { width: badgeW, height: badgeH, left: rx, top: ry, right: rx + badgeW, bottom: ry + badgeH };
}

// =========================================================================
// 5. DEMO 1: Método 1 — Transformação com Ângulo θ (demo-coord-metodo1)
// =========================================================================
let demo1State = {
  x0: 3,
  y0: 2,
  thetaDeg: 45,
  px: 4,
  py: 5
};

function initDemo1() {
  const canvas = document.getElementById('canvas-demo-metodo1');
  if (!canvas) return;

  const res = setupFixedCanvas(canvas, 470, 390);
  if (!res) return;
  const { ctx, width, height } = res;

  const originX = 110;
  const originY = 280;
  const scale = 36;

  // 1. Grade canônica
  drawCartesianGrid(ctx, width, height, originX, originY, scale, [-2, 8], [-2, 7]);
  const colors = getThemeColors();

  const x0 = demo1State.x0;
  const y0 = demo1State.y0;
  const thetaDeg = demo1State.thetaDeg;
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const px = demo1State.px;
  const py = demo1State.py;

  // Origem do sistema destino (x0, y0) na tela
  const destOriginX = originX + x0 * scale;
  const destOriginY = originY - y0 * scale;

  // Linhas tracejadas de referência para x0 e y0
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = colors.guideLines;
  ctx.lineWidth = 1.2;

  // Vertical para x0
  ctx.beginPath();
  ctx.moveTo(destOriginX, originY);
  ctx.lineTo(destOriginX, destOriginY);
  ctx.stroke();

  // Horizontal para y0
  ctx.beginPath();
  ctx.moveTo(originX, destOriginY);
  ctx.lineTo(destOriginX, destOriginY);
  ctx.stroke();

  // Linha de referência horizontal para o ângulo a partir de (x0, y0)
  ctx.strokeStyle = colors.axisLabels;
  ctx.beginPath();
  ctx.moveTo(destOriginX, destOriginY);
  ctx.lineTo(destOriginX + 3.2 * scale, destOriginY);
  ctx.stroke();
  ctx.restore();

  // Desenhar eixos do sistema X'Y' rotacionado
  ctx.save();
  ctx.translate(destOriginX, destOriginY);
  // Em Canvas, o eixo Y aponta para baixo, portanto uma rotação matemática anti-horária de theta
  // equivale a -thetaRad no canvas
  ctx.rotate(-thetaRad);

  const axisLen = 3.5 * scale;
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = colors.cyanAxis;

  // Eixo x'
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(axisLen, 0);
  ctx.stroke();

  // Seta x'
  ctx.fillStyle = colors.cyanAxis;
  ctx.beginPath();
  ctx.moveTo(axisLen - 7, -4);
  ctx.lineTo(axisLen + 2, 0);
  ctx.lineTo(axisLen - 7, 4);
  ctx.fill();

  // Eixo y'
  ctx.beginPath();
  ctx.moveTo(0, 15);
  ctx.lineTo(0, -axisLen);
  ctx.stroke();

  // Seta y'
  ctx.beginPath();
  ctx.moveTo(-4, -axisLen + 7);
  ctx.lineTo(0, -axisLen - 2);
  ctx.lineTo(4, -axisLen + 7);
  ctx.fill();

  // Rótulos x' e y'
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillText("x'", axisLen + 8, 4);
  ctx.fillText("y'", -4, -axisLen - 8);

  ctx.restore();

  // Desenhar arco do ângulo theta
  ctx.save();
  ctx.strokeStyle = colors.pivotPoint;
  ctx.fillStyle = colors.pivotPoint;
  ctx.lineWidth = 1.5;
  const arcRadius = 1.2 * scale;
  ctx.beginPath();
  // No canvas: 0 rad é para a direita, ângulo negativo é para cima (anti-horário matemático)
  if (thetaRad >= 0) {
    ctx.arc(destOriginX, destOriginY, arcRadius, 0, -thetaRad, true);
  } else {
    ctx.arc(destOriginX, destOriginY, arcRadius, 0, -thetaRad, false);
  }
  ctx.stroke();

  // Texto do ângulo
  const midAngle = -thetaRad / 2;
  const textR = arcRadius + 14;
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${thetaDeg}°`, destOriginX + Math.cos(midAngle) * textR, destOriginY + Math.sin(midAngle) * textR);
  ctx.restore();

  // Origem P0 (x0, y0)
  ctx.save();
  ctx.fillStyle = colors.cyanAxis;
  ctx.beginPath();
  ctx.arc(destOriginX, destOriginY, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = colors.axes;
  ctx.fillText(`P₀(${x0}, ${y0})`, destOriginX + 8, destOriginY + 16);
  ctx.restore();

  // Ponto P(px, py)
  const screenPx = originX + px * scale;
  const screenPy = originY - py * scale;

  // Projeções canônicas de P (em XY)
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(screenPx, originY);
  ctx.lineTo(screenPx, screenPy);
  ctx.lineTo(originX, screenPy);
  ctx.stroke();
  ctx.restore();

  // Cálculo matemático exato da transformação de XY para X'Y':
  // M = R(-theta) * T(-x0, -y0)
  const T = Mat3.translation(-x0, -y0);
  const R = Mat3.rotation(-thetaRad); // rotação horária de -theta
  const M = Mat3.multiply(R, T);
  const Pprime = Mat3.apply(M, [px, py]);

  const pPrimeX = Pprime[0];
  const pPrimeY = Pprime[1];

  // Projeções de P nos eixos X' e Y'
  ctx.save();
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
  ctx.lineWidth = 1.2;

  // Projeção em x'
  const projX_screenX = destOriginX + Math.cos(-thetaRad) * (pPrimeX * scale);
  const projX_screenY = destOriginY + Math.sin(-thetaRad) * (pPrimeX * scale);

  ctx.beginPath();
  ctx.moveTo(screenPx, screenPy);
  ctx.lineTo(projX_screenX, projX_screenY);
  ctx.stroke();

  // Projeção em y'
  const projY_screenX = destOriginX - Math.sin(-thetaRad) * (pPrimeY * scale);
  const projY_screenY = destOriginY + Math.cos(-thetaRad) * (pPrimeY * scale);

  ctx.beginPath();
  ctx.moveTo(screenPx, screenPy);
  ctx.lineTo(projY_screenX, projY_screenY);
  ctx.stroke();
  ctx.restore();

  // Desenho do ponto P
  ctx.save();
  ctx.fillStyle = colors.transPoint;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(screenPx, screenPy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = colors.transPoint;
  ctx.fillText(`P(${px}, ${py})`, screenPx + 8, screenPy - 8);
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = colors.transText;
  ctx.fillText(`P' ≈ (${pPrimeX.toFixed(2)}, ${pPrimeY.toFixed(2)})`, screenPx + 8, screenPy + 12);
  ctx.restore();

  // Atualizar painel de fórmulas matemáticas com KaTeX
  updateDemo1Math(x0, y0, thetaDeg, px, py, M, pPrimeX, pPrimeY);
}

function updateDemo1Math(x0, y0, thetaDeg, px, py, M, pPrimeX, pPrimeY) {
  const mathEl = document.getElementById('demo1-math-output');
  if (!mathEl || !window.katex) return;

  const rad = (thetaDeg * Math.PI) / 180;
  const c = Math.cos(rad).toFixed(3);
  const s = Math.sin(rad).toFixed(3);
  const m00 = M[0].toFixed(3), m01 = M[1].toFixed(3), m02 = M[2].toFixed(3);
  const m10 = M[3].toFixed(3), m11 = M[4].toFixed(3), m12 = M[5].toFixed(3);

  const latex = `
\\begin{aligned}
M_{XY \\to X'Y'} &= R(-${thetaDeg}^\\circ) \\cdot T(-${x0}, -${y0}) \\\\[3pt]
&= \\begin{pmatrix} ${c} & ${s} & 0 \\\\ -${s} & ${c} & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}
\\begin{pmatrix} 1 & 0 & -${x0} \\\\ 0 & 1 & -${y0} \\\\ 0 & 0 & 1 \\end{pmatrix} 
= \\begin{pmatrix} ${m00} & ${m01} & ${m02} \\\\ ${m10} & ${m11} & ${m12} \\\\ 0 & 0 & 1 \\end{pmatrix} \\\\[5pt]
P' &= M \\cdot \\begin{pmatrix} ${px} \\\\ ${py} \\\\ 1 \\end{pmatrix} = 
\\begin{pmatrix} \\mathbf{${pPrimeX.toFixed(4)}} \\\\[2pt] \\mathbf{${pPrimeY.toFixed(4)}} \\\\[2pt] 1 \\end{pmatrix}
\\end{aligned}
  `;

  try {
    katex.render(latex, mathEl, { displayMode: true, throwOnError: false });
  } catch (e) {
    console.error(e);
  }
}

// Controles do Demo 1
function setupDemo1Listeners() {
  const sX0 = document.getElementById('d1-x0');
  const sY0 = document.getElementById('d1-y0');
  const sTheta = document.getElementById('d1-theta');
  const sPx = document.getElementById('d1-px');
  const sPy = document.getElementById('d1-py');

  const lX0 = document.getElementById('d1-val-x0');
  const lY0 = document.getElementById('d1-val-y0');
  const lTheta = document.getElementById('d1-val-theta');
  const lPx = document.getElementById('d1-val-px');
  const lPy = document.getElementById('d1-val-py');

  function update() {
    if (sX0) { demo1State.x0 = parseFloat(sX0.value); if (lX0) lX0.textContent = sX0.value; }
    if (sY0) { demo1State.y0 = parseFloat(sY0.value); if (lY0) lY0.textContent = sY0.value; }
    if (sTheta) { demo1State.thetaDeg = parseFloat(sTheta.value); if (lTheta) lTheta.textContent = `${sTheta.value}°`; }
    if (sPx) { demo1State.px = parseFloat(sPx.value); if (lPx) lPx.textContent = sPx.value; }
    if (sPy) { demo1State.py = parseFloat(sPy.value); if (lPy) lPy.textContent = sPy.value; }
    initDemo1();
  }

  [sX0, sY0, sTheta, sPx, sPy].forEach(input => {
    if (input) input.addEventListener('input', update);
  });

  const resetBtn = document.getElementById('d1-reset-btn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      demo1State = { x0: 3, y0: 2, thetaDeg: 45, px: 4, py: 5 };
      if (sX0) sX0.value = 3;
      if (sY0) sY0.value = 2;
      if (sTheta) sTheta.value = 45;
      if (sPx) sPx.value = 4;
      if (sPy) sPy.value = 5;
      update();
    };
  }
}

// =========================================================================
// 6. DEMO 2: Método 2 — Dois Pontos e Vetor Diretor (demo-coord-metodo2)
// =========================================================================
let demo2State = {
  p0x: 4,
  p0y: 3,
  p1x: 3,
  p1y: 4,
  px: 3,
  py: 6
};

function initDemo2() {
  const canvas = document.getElementById('canvas-demo-metodo2');
  if (!canvas) return;

  const res = setupFixedCanvas(canvas, 470, 390);
  if (!res) return;
  const { ctx, width, height } = res;

  const originX = 170;
  const originY = 240;
  const scale = 32;

  // Grade canônica
  drawCartesianGrid(ctx, width, height, originX, originY, scale, [-4, 8], [-3, 6]);
  const colors = getThemeColors();

  const p0x = demo2State.p0x;
  const p0y = demo2State.p0y;
  const p1x = demo2State.p1x;
  const p1y = demo2State.p1y;
  const px = demo2State.px;
  const py = demo2State.py;

  const screenP0X = originX + p0x * scale;
  const screenP0Y = originY - p0y * scale;
  const screenP1X = originX + p1x * scale;
  const screenP1Y = originY - p1y * scale;

  // Vetor V = P1 - P0
  const Vx = p1x - p0x;
  const Vy = p1y - p0y;
  const normV = Math.hypot(Vx, Vy) || 0.0001;
  const vx = Vx / normV;
  const vy = Vy / normV;

  // Vetor ortogonal u = (vy, -vx)
  const ux = vy;
  const uy = -vx;

  // Eixo X' e Y' derivados dos vetores u e v
  const axisLen = 3.5 * scale;

  // Desenhar linhas guia de P0
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = colors.guideLines;
  ctx.beginPath();
  ctx.moveTo(screenP0X, originY);
  ctx.lineTo(screenP0X, screenP0Y);
  ctx.lineTo(originX, screenP0Y);
  ctx.stroke();
  ctx.restore();

  // Desenhar Eixos X' e Y'
  ctx.save();
  ctx.lineWidth = 2.0;
  ctx.strokeStyle = colors.cyanAxis;

  // Direção de X': (ux, uy)
  // Em coordenadas de tela: x cresce à direita, y cresce para baixo
  ctx.beginPath();
  ctx.moveTo(screenP0X - ux * 15, screenP0Y + uy * 15);
  ctx.lineTo(screenP0X + ux * axisLen, screenP0Y - uy * axisLen);
  ctx.stroke();

  // Direção de Y': (vx, vy)
  ctx.beginPath();
  ctx.moveTo(screenP0X - vx * 15, screenP0Y + vy * 15);
  ctx.lineTo(screenP0X + vx * axisLen, screenP0Y - vy * axisLen);
  ctx.stroke();

  // Rótulos x' e y'
  ctx.fillStyle = colors.cyanAxis;
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillText("x'", screenP0X + ux * axisLen + 8, screenP0Y - uy * axisLen);
  ctx.fillText("y'", screenP0X + vx * axisLen + 8, screenP0Y - vy * axisLen);
  ctx.restore();

  // Desenhar Vetor V (em Vermelho)
  ctx.save();
  ctx.strokeStyle = colors.vector;
  ctx.fillStyle = colors.vector;
  ctx.lineWidth = 2.8;

  ctx.beginPath();
  ctx.moveTo(screenP0X, screenP0Y);
  ctx.lineTo(screenP1X, screenP1Y);
  ctx.stroke();

  // Ponta da seta em P1
  const arrowAngle = Math.atan2(screenP1Y - screenP0Y, screenP1X - screenP0X);
  ctx.beginPath();
  ctx.moveTo(screenP1X, screenP1Y);
  ctx.lineTo(screenP1X - 9 * Math.cos(arrowAngle - Math.PI / 6), screenP1Y - 9 * Math.sin(arrowAngle - Math.PI / 6));
  ctx.lineTo(screenP1X - 9 * Math.cos(arrowAngle + Math.PI / 6), screenP1Y - 9 * Math.sin(arrowAngle + Math.PI / 6));
  ctx.fill();

  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillText(`V = P₁ - P₀`, (screenP0X + screenP1X) / 2 + 10, (screenP0Y + screenP1Y) / 2);
  ctx.restore();

  // Pontos P0 e P1
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(screenP0X, screenP0Y, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(screenP1X, screenP1Y, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = colors.axes;
  ctx.fillText(`P₀(${p0x}, ${p0y})`, screenP0X - 10, screenP0Y + 16);
  ctx.fillText(`P₁(${p1x}, ${p1y})`, screenP1X - 10, screenP1Y - 10);
  ctx.restore();

  // Ponto P e Projeção
  const screenPx = originX + px * scale;
  const screenPy = originY - py * scale;

  // Matriz de Rotação Método 2:
  // R = [vy, -vx, 0; vx, vy, 0; 0, 0, 1]
  const R = [
    vy, -vx, 0,
    vx,  vy, 0,
     0,   0, 1
  ];
  const T = Mat3.translation(-p0x, -p0y);
  const M = Mat3.multiply(R, T);
  const Pprime = Mat3.apply(M, [px, py]);

  const pPrimeX = Pprime[0];
  const pPrimeY = Pprime[1];

  // Projeções pontilhadas de P nos eixos X' e Y'
  ctx.save();
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
  ctx.lineWidth = 1.2;

  const projX_screenX = screenP0X + ux * (pPrimeX * scale);
  const projX_screenY = screenP0Y - uy * (pPrimeX * scale);
  ctx.beginPath();
  ctx.moveTo(screenPx, screenPy);
  ctx.lineTo(projX_screenX, projX_screenY);
  ctx.stroke();

  const projY_screenX = screenP0X + vx * (pPrimeY * scale);
  const projY_screenY = screenP0Y - vy * (pPrimeY * scale);
  ctx.beginPath();
  ctx.moveTo(screenPx, screenPy);
  ctx.lineTo(projY_screenX, projY_screenY);
  ctx.stroke();
  ctx.restore();

  // Ponto P
  ctx.save();
  ctx.fillStyle = colors.transPoint;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(screenPx, screenPy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = colors.transPoint;
  ctx.fillText(`P(${px}, ${py})`, screenPx + 8, screenPy - 8);
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = colors.transText;
  ctx.fillText(`P' ≈ (${pPrimeX.toFixed(2)}, ${pPrimeY.toFixed(2)})`, screenPx + 8, screenPy + 12);
  ctx.restore();

  // Atualizar fórmulas no KaTeX
  updateDemo2Math(p0x, p0y, p1x, p1y, px, py, Vx, Vy, normV, vx, vy, M, pPrimeX, pPrimeY);
}

function updateDemo2Math(p0x, p0y, p1x, p1y, px, py, Vx, Vy, normV, vx, vy, M, pPrimeX, pPrimeY) {
  const mathEl = document.getElementById('demo2-math-output');
  if (!mathEl || !window.katex) return;

  const m00 = M[0].toFixed(3), m01 = M[1].toFixed(3), m02 = M[2].toFixed(3);
  const m10 = M[3].toFixed(3), m11 = M[4].toFixed(3), m12 = M[5].toFixed(3);

  const latex = `
\\begin{aligned}
\\vec{V} &= P_1 - P_0 = (${p1x} - ${p0x}, \\, ${p1y} - ${p0y}) = (${Vx}, \\, ${Vy}) \\\\[2pt]
\\|\\vec{V}\\| &= \\sqrt{(${Vx})^2 + (${Vy})^2} = ${normV.toFixed(3)}, \\quad 
\\vec{v} = (${vx.toFixed(3)}, \\, ${vy.toFixed(3)}), \\; 
\\vec{u} = (${vy.toFixed(3)}, \\, ${(-vx).toFixed(3)}) \\\\[4pt]
R &= \\begin{pmatrix} v_y & -v_x & 0 \\\\[2pt] v_x & v_y & 0 \\\\[2pt] 0 & 0 & 1 \\end{pmatrix} = 
\\begin{pmatrix} ${vy.toFixed(3)} & ${(-vx).toFixed(3)} & 0 \\\\[2pt] ${vx.toFixed(3)} & ${vy.toFixed(3)} & 0 \\\\[2pt] 0 & 0 & 1 \\end{pmatrix} \\\\[4pt]
M &= R \\cdot T(-${p0x}, -${p0y}) = \\begin{pmatrix} ${m00} & ${m01} & ${m02} \\\\[2pt] ${m10} & ${m11} & ${m12} \\\\[2pt] 0 & 0 & 1 \\end{pmatrix} \\\\[4pt]
P' &= M \\cdot \\begin{pmatrix} ${px} \\\\ ${py} \\\\ 1 \\end{pmatrix} = 
\\begin{pmatrix} \\mathbf{${pPrimeX.toFixed(4)}} \\\\[2pt] \\mathbf{${pPrimeY.toFixed(4)}} \\\\[2pt] 1 \\end{pmatrix}
\\end{aligned}
  `;

  try {
    katex.render(latex, mathEl, { displayMode: true, throwOnError: false });
  } catch (e) {
    console.error(e);
  }
}

// Controles do Demo 2
function setupDemo2Listeners() {
  const sP0x = document.getElementById('d2-p0x');
  const sP0y = document.getElementById('d2-p0y');
  const sP1x = document.getElementById('d2-p1x');
  const sP1y = document.getElementById('d2-p1y');
  const sPx = document.getElementById('d2-px');
  const sPy = document.getElementById('d2-py');

  const lP0x = document.getElementById('d2-val-p0x');
  const lP0y = document.getElementById('d2-val-p0y');
  const lP1x = document.getElementById('d2-val-p1x');
  const lP1y = document.getElementById('d2-val-p1y');
  const lPx = document.getElementById('d2-val-px');
  const lPy = document.getElementById('d2-val-py');

  function update() {
    if (sP0x) { demo2State.p0x = parseFloat(sP0x.value); if (lP0x) lP0x.textContent = sP0x.value; }
    if (sP0y) { demo2State.p0y = parseFloat(sP0y.value); if (lP0y) lP0y.textContent = sP0y.value; }
    if (sP1x) { demo2State.p1x = parseFloat(sP1x.value); if (lP1x) lP1x.textContent = sP1x.value; }
    if (sP1y) { demo2State.p1y = parseFloat(sP1y.value); if (lP1y) lP1y.textContent = sP1y.value; }
    if (sPx) { demo2State.px = parseFloat(sPx.value); if (lPx) lPx.textContent = sPx.value; }
    if (sPy) { demo2State.py = parseFloat(sPy.value); if (lPy) lPy.textContent = sPy.value; }
    initDemo2();
  }

  [sP0x, sP0y, sP1x, sP1y, sPx, sPy].forEach(input => {
    if (input) input.addEventListener('input', update);
  });

  const resetBtn = document.getElementById('d2-reset-btn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      demo2State = { p0x: 4, p0y: 3, p1x: 3, p1y: 4, px: 3, py: 6 };
      if (sP0x) sP0x.value = 4;
      if (sP0y) sP0y.value = 3;
      if (sP1x) sP1x.value = 3;
      if (sP1y) sP1y.value = 4;
      if (sPx) sPx.value = 3;
      if (sPy) sPy.value = 6;
      update();
    };
  }
}

// =========================================================================
// 7. DEMO 3: Pipeline Canvas 2D — Ordem e Reset (demo-canvas-pipeline)
// =========================================================================
let demo3Pipeline = [
  { type: 'translate', x: 110, y: 50, label: 'ctx.translate(110, 50) [3ª volta]' },
  { type: 'scale', sx: 2, sy: 2, label: 'ctx.scale(2, 2) [2ª escala]' },
  { type: 'translate', x: -110, y: -50, label: 'ctx.translate(-110, -50) [1ª origem]' }
];

function drawHouse(ctx, fill = '#ef4444', stroke = '#b91c1c') {
  ctx.beginPath();
  ctx.moveTo(100, 100);
  ctx.lineTo(120, 100);
  ctx.lineTo(120, 50);
  ctx.lineTo(110, 30); // topo telhado
  ctx.lineTo(100, 50);
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Porta e Janela
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(107, 75, 6, 25); // porta
  ctx.fillRect(104, 55, 5, 8);   // janela 1
  ctx.fillRect(113, 55, 5, 8);   // janela 2
}

function initDemo3() {
  const canvas = document.getElementById('canvas-demo-pipeline');
  if (!canvas) return;

  const res = setupFixedCanvas(canvas, 480, 370);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();

  // 1. Limpar e desenhar grade pixelar com convenção do Canvas (origem no topo-esquerda)
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  const gridStep = 40;
  for (let x = 0; x < width; x += gridStep) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += gridStep) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  // Marcas e eixos do Canvas
  ctx.font = '9px Fira Code, monospace';
  ctx.fillStyle = colors.axisLabels;
  ctx.fillText("(0,0)", 6, 12);
  ctx.fillText("x →", width - 24, 14);
  ctx.fillText("y ↓", 6, height - 8);

  // 2. Desenhar Casinha Fantasma Original (sem transformações)
  ctx.save();
  ctx.setLineDash([3, 3]);
  drawHouse(ctx, colors.ghostFill, colors.ghostStroke);
  ctx.restore();

  // Marcador da posição original da casa
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = colors.origText;
  ctx.fillText("Original (100-120)", 80, 116);

  // Marcador do ponto pivô (110, 50)
  ctx.save();
  ctx.fillStyle = colors.pivotPoint;
  ctx.beginPath();
  ctx.arc(110, 50, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillText("Pivô (110, 50)", 116, 48);
  ctx.restore();

  // 3. Aplicar Pipeline do Canvas (em ordem direta de código JS, que internamente é pré-multiplicação/pós-multiplicação)
  ctx.save();
  // Aplicando operações na ordem que estão na lista:
  demo3Pipeline.forEach(op => {
    if (op.type === 'translate') {
      ctx.translate(op.x, op.y);
    } else if (op.type === 'rotate') {
      ctx.rotate(op.rad);
    } else if (op.type === 'scale') {
      ctx.scale(op.sx, op.sy);
    }
  });

  // Desenhar a casa no sistema transformado
  drawHouse(ctx, 'rgba(239, 68, 68, 0.85)', '#dc2626');

  // Desenhar eixos locais transformados
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#2563eb';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(40, 0); ctx.stroke();
  ctx.strokeStyle = '#16a34a';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.stroke();

  ctx.restore();

  updateDemo3UI();
}

function updateDemo3UI() {
  const codeEl = document.getElementById('demo3-code-display');
  if (!codeEl) return;

  let codeHtml = `<span class="token-comment">// Ordem no código JS (de BAIXO para CIMA na geometria):</span>\n`;
  codeHtml += `<span class="token-fn">ctx</span>.<span class="token-fn">setTransform</span>(<span class="token-num">1</span>, <span class="token-num">0</span>, <span class="token-num">0</span>, <span class="token-num">1</span>, <span class="token-num">0</span>, <span class="token-num">0</span>);\n`;

  demo3Pipeline.forEach((op, idx) => {
    const revIndex = demo3Pipeline.length - idx;
    if (op.type === 'translate') {
      codeHtml += `<span class="token-fn">ctx</span>.<span class="token-fn">translate</span>(<span class="token-num">${op.x}</span>, <span class="token-num">${op.y}</span>); <span class="token-comment">// ${revIndex}ª operacao</span>\n`;
    } else if (op.type === 'rotate') {
      const deg = Math.round((op.rad * 180) / Math.PI);
      codeHtml += `<span class="token-fn">ctx</span>.<span class="token-fn">rotate</span>(<span class="token-num">${deg}°</span>); <span class="token-comment">// ${revIndex}ª operacao</span>\n`;
    } else if (op.type === 'scale') {
      codeHtml += `<span class="token-fn">ctx</span>.<span class="token-fn">scale</span>(<span class="token-num">${op.sx}</span>, <span class="token-num">${op.sy}</span>); <span class="token-comment">// ${revIndex}ª operacao</span>\n`;
    }
  });

  codeHtml += `<span class="token-fn">desenhaCasa</span>(); <span class="token-comment">// objeto desenhado</span>`;
  codeEl.innerHTML = codeHtml;
}

// Presets do Demo 3
function setDemo3Preset(preset) {
  if (preset === 'scale-fixed') {
    demo3Pipeline = [
      { type: 'translate', x: 110, y: 50, label: 'ctx.translate(110, 50) [3ª volta]' },
      { type: 'scale', sx: 2, sy: 2, label: 'ctx.scale(2, 2) [2ª escala]' },
      { type: 'translate', x: -110, y: -50, label: 'ctx.translate(-110, -50) [1ª origem]' }
    ];
  } else if (preset === 'rotate-trans') {
    demo3Pipeline = [
      { type: 'translate', x: 50, y: 0, label: 'ctx.translate(50, 0) [4ª translação]' },
      { type: 'translate', x: 110, y: 50, label: 'ctx.translate(110, 50) [3ª volta]' },
      { type: 'rotate', rad: Math.PI / 2, label: 'ctx.rotate(90°) [2ª rotação]' },
      { type: 'translate', x: -110, y: -50, label: 'ctx.translate(-110, -50) [1ª origem]' }
    ];
  } else if (preset === 'wrong-order') {
    // Translação tx=50 movida para depois da rotação (antes de desenhar)
    demo3Pipeline = [
      { type: 'translate', x: 110, y: 50, label: 'ctx.translate(110, 50)' },
      { type: 'rotate', rad: Math.PI / 2, label: 'ctx.rotate(90°)' },
      { type: 'translate', x: -110, y: -50, label: 'ctx.translate(-110, -50)' },
      { type: 'translate', x: 50, y: 0, label: 'ctx.translate(50, 0) [Ordem Trocada!]' }
    ];
  }
  initDemo3();
}

function setupDemo3Listeners() {
  const p1 = document.getElementById('d3-preset-scale');
  const p2 = document.getElementById('d3-preset-rotate');
  const p3 = document.getElementById('d3-preset-wrong');

  if (p1) p1.onclick = () => setDemo3Preset('scale-fixed');
  if (p2) p2.onclick = () => setDemo3Preset('rotate-trans');
  if (p3) p3.onclick = () => setDemo3Preset('wrong-order');
}

// =========================================================================
// 8. Ilustrações Estáticas de Teoria em Canvas
// =========================================================================

// Slide 4 e 5: TikZ do Enunciado do Problema
function initFigureEnunciado() {
  const canvas = document.getElementById('canvas-fig-enunciado');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 420, 240);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  const ox = 70;
  const oy = 190;
  const scale = 38;

  // Eixos XY
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = colors.axes;
  ctx.beginPath();
  ctx.moveTo(ox - 30, oy);
  ctx.lineTo(ox + 7 * scale, oy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(ox, oy + 20);
  ctx.lineTo(ox, oy - 4.5 * scale);
  ctx.stroke();

  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = colors.axes;
  ctx.fillText("x axis", ox + 7 * scale - 30, oy + 18);
  ctx.fillText("y axis", ox - 40, oy - 4.2 * scale);
  ctx.fillText("0", ox - 14, oy + 14);

  // Marcas x0 e y0
  const x0 = 3;
  const y0 = 2;
  const sx0 = ox + x0 * scale;
  const sy0 = oy - y0 * scale;

  ctx.strokeStyle = colors.axisLabels;
  ctx.beginPath(); ctx.moveTo(sx0, oy - 4); ctx.lineTo(sx0, oy + 4); ctx.stroke();
  ctx.fillText("x₀", sx0 - 4, oy + 16);

  ctx.beginPath(); ctx.moveTo(ox - 4, sy0); ctx.lineTo(ox + 4, sy0); ctx.stroke();
  ctx.fillText("y₀", ox - 18, sy0 + 4);

  // Linha tracejada horizontal
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = colors.guideLines;
  ctx.beginPath();
  ctx.moveTo(sx0, sy0);
  ctx.lineTo(sx0 + 3.2 * scale, sy0);
  ctx.stroke();
  ctx.restore();

  // Eixos X'Y' rotacionados 35 graus
  const thetaRad = (35 * Math.PI) / 180;
  ctx.save();
  ctx.translate(sx0, sy0);
  ctx.rotate(-thetaRad);

  ctx.lineWidth = 2.2;
  ctx.strokeStyle = colors.cyanAxis;
  ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(3.2 * scale, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(0, -3.2 * scale); ctx.stroke();

  ctx.fillStyle = colors.cyanAxis;
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillText("x' axis", 3.2 * scale + 6, 4);
  ctx.fillText("y' axis", -4, -3.2 * scale - 6);
  ctx.restore();

  // Arco do ângulo theta
  ctx.save();
  ctx.strokeStyle = colors.pivotPoint;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(sx0, sy0, 42, 0, -thetaRad, true);
  ctx.stroke();
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillStyle = colors.pivotPoint;
  ctx.fillText("θ", sx0 + 48, sy0 - 14);
  ctx.restore();
}

// Slide 11: TikZ do Vetor V (P0 e P1)
function initFigureVetorV() {
  const canvas = document.getElementById('canvas-fig-vetor-v');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 350, 280);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  const ox = 50;
  const oy = 220;
  const scale = 36;

  // Eixos XY
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = colors.axes;
  ctx.beginPath(); ctx.moveTo(ox - 20, oy); ctx.lineTo(ox + 6.8 * scale, oy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox, oy + 20); ctx.lineTo(ox, oy - 4.8 * scale); ctx.stroke();

  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = colors.axes;
  ctx.fillText("x axis", ox + 6.8 * scale - 30, oy + 18);
  ctx.fillText("y axis", ox - 40, oy - 4.5 * scale);
  ctx.fillText("0", ox - 14, oy + 14);

  const x0 = 3;
  const y0 = 1;
  const sx0 = ox + x0 * scale;
  const sy0 = oy - y0 * scale;

  // Marcas
  ctx.strokeStyle = colors.axisLabels;
  ctx.beginPath(); ctx.moveTo(sx0, oy - 4); ctx.lineTo(sx0, oy + 4); ctx.stroke();
  ctx.fillText("x₀", sx0 - 4, oy + 16);
  ctx.beginPath(); ctx.moveTo(ox - 4, sy0); ctx.lineTo(ox + 4, sy0); ctx.stroke();
  ctx.fillText("y₀", ox - 18, sy0 + 4);

  // Linhas guia para P0
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = colors.guideLines;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(sx0, oy); ctx.lineTo(sx0, sy0); ctx.lineTo(ox, sy0);
  ctx.stroke();
  ctx.restore();

  // Eixos X'Y' rotacionados 35 graus
  const thetaRad = (35 * Math.PI) / 180;
  ctx.save();
  ctx.translate(sx0, sy0);
  ctx.rotate(-thetaRad);

  ctx.lineWidth = 2.0;
  ctx.strokeStyle = colors.cyanAxis;
  ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(3.2 * scale, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(0, -3.0 * scale); ctx.stroke();

  ctx.fillStyle = colors.cyanAxis;
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillText("x' axis", 3.2 * scale + 6, 4);
  ctx.fillText("y' axis", -4, -3.0 * scale - 6);

  // Vetor V ao longo de Y'
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = colors.vector;
  ctx.fillStyle = colors.vector;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -2.0 * scale);
  ctx.stroke();

  // Seta em P1
  ctx.beginPath();
  ctx.moveTo(-5, -2.0 * scale + 8);
  ctx.lineTo(0, -2.0 * scale);
  ctx.lineTo(5, -2.0 * scale + 8);
  ctx.fill();

  // Pontos P0 e P1
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -2.0 * scale, 4, 0, Math.PI * 2); ctx.fill();

  ctx.fillText("P₀", -18, 4);
  ctx.fillText("P₁", -18, -2.0 * scale);
  ctx.fillText("V = P₁ - P₀", 12, -1.0 * scale);

  ctx.restore();
}

// Slide 13: Visualização do Vetor Perpendicular u = (vy, -vx)
function initFigureVetorU() {
  const canvas = document.getElementById('canvas-fig-vetor-u');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 350, 310);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();
  const isDark = document.body.classList.contains('dark-theme');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  const ox = 145;
  const oy = 158;
  const scale = 102; // 1 unidade = 102px

  // Eixos canônicos X e Y
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = colors.axes;
  ctx.beginPath(); ctx.moveTo(20, oy); ctx.lineTo(width - 20, oy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox, height - 32); ctx.lineTo(ox, 18); ctx.stroke();

  // Setas e rótulos dos eixos principais
  ctx.fillStyle = colors.axes;
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillText("X", width - 15, oy + 13);
  ctx.fillText("Y", ox - 13, 15);
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText("0", ox - 10, oy + 12);

  // Círculo unitário tracejado
  ctx.save();
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = colors.ghostStroke;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(ox, oy, scale, 0, Math.PI * 2);
  ctx.stroke();

  // Rótulo do círculo unitário posicionado livremente no 2º quadrante (sem colisões com vetores!)
  ctx.fillStyle = colors.ghostStroke;
  ctx.font = '9px Fira Code, monospace';
  ctx.fillText("Círculo unitário (r = 1)", ox - scale + 5, oy - scale * 0.72);
  ctx.restore();

  // Ângulo de v (60 graus)
  const alphaRad = Math.PI / 3;
  const vx = Math.cos(alphaRad); // 0.50
  const vy = Math.sin(alphaRad); // ~0.866

  const svx = ox + vx * scale; // 145 + 51 = 196
  const svy = oy - vy * scale; // 158 - 88.3 = 69.7

  // Vetor ortogonal u = (vy, -vx) (-30 graus)
  const ux = vy; // ~0.866
  const uy = -vx; // -0.50
  const sux = ox + ux * scale; // 145 + 88.3 = 233.3
  const suy = oy - uy * scale; // 158 + 51 = 209

  // Segmentos coloridos de destaque nos eixos (mostram geometricamente que a altura vy vira largura ux!)
  ctx.save();
  // 1. Altura vy de v (vermelho no eixo Y)
  ctx.lineWidth = 3.0;
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, svy); ctx.stroke();

  // 2. Largura ux = vy de u (verde no eixo X, idêntico comprimento!)
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(sux, oy); ctx.stroke();

  // 3. Largura vx de v (vermelho no eixo X)
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(svx, oy); ctx.stroke();

  // 4. Profundidade uy = -vx de u (verde no eixo Y negativo, idêntico comprimento!)
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, suy); ctx.stroke();
  ctx.restore();

  // Eixos X' e Y' estendidos (ciano) com setas nas pontas
  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1.6;
  const axisExt = 1.34 * scale;
  // Eixo Y' (direção v)
  ctx.beginPath(); ctx.moveTo(ox - vx * 20, oy + vy * 20); ctx.lineTo(ox + vx * axisExt, oy - vy * axisExt); ctx.stroke();
  // Eixo X' (direção u)
  ctx.beginPath(); ctx.moveTo(ox - ux * 20, oy - uy * 20); ctx.lineTo(ox + ux * axisExt, oy - uy * axisExt); ctx.stroke();

  // Rótulos dos eixos transformados no final das linhas
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = colors.cyanAxis;
  ctx.fillText("Eixo Y'", ox + vx * axisExt + 5, oy - vy * axisExt + 2);
  ctx.fillText("Eixo X'", ox + ux * axisExt + 4, oy - uy * axisExt + 4);
  ctx.restore();

  // Marcador de ângulo reto (90 graus) perfeito entre v e u
  drawPerpendicularMarker(ctx, ox, oy, vx, -vy, ux, -uy, 14, colors.pivotPoint);

  ctx.save();
  ctx.fillStyle = colors.pivotPoint;
  ctx.beginPath();
  ctx.arc(ox + (vx + ux) * 5.5, oy + (-vy - uy) * 5.5, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillText("90°", ox + 18, oy - 18);
  ctx.restore();

  // Projeções tracejadas de v nos eixos canônicos
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
  ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(svx, oy); ctx.lineTo(svx, svy); ctx.lineTo(ox, svy); ctx.stroke();
  ctx.restore();

  // Pontos de contato de v nos eixos
  ctx.save();
  ctx.fillStyle = colors.vector;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(svx, oy, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(ox, svy, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();

  // Badges elegantes para as componentes de v:
  // No eixo Y: vy
  drawMathBadge(ctx, "v_y", ox - 24, svy, {
    fontSize: 10,
    textColor: colors.vector,
    borderColor: 'rgba(239, 68, 68, 0.65)',
    bgColor: isDark ? 'rgba(30, 20, 25, 0.94)' : 'rgba(254, 242, 242, 0.95)',
    padX: 5,
    padY: 2
  });

  // No eixo X: vx (abaixo do eixo)
  drawMathBadge(ctx, "v_x", svx, oy + 16, {
    fontSize: 10,
    textColor: colors.vector,
    borderColor: 'rgba(239, 68, 68, 0.65)',
    bgColor: isDark ? 'rgba(30, 20, 25, 0.94)' : 'rgba(254, 242, 242, 0.95)',
    padX: 5,
    padY: 2
  });

  // Projeções tracejadas de u nos eixos canônicos
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
  ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(sux, oy); ctx.lineTo(sux, suy); ctx.lineTo(ox, suy); ctx.stroke();
  ctx.restore();

  // Pontos de contato de u nos eixos
  ctx.save();
  ctx.fillStyle = colors.vectorU;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(sux, oy, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(ox, suy, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();

  // Badges elegantes para as componentes de u:
  // No eixo X: ux = vy (acima do eixo, livre de qualquer colisão)
  drawMathBadge(ctx, "u_x = v_y", sux, oy - 15, {
    fontSize: 10,
    textColor: colors.vectorU,
    borderColor: 'rgba(16, 185, 129, 0.65)',
    bgColor: isDark ? 'rgba(15, 30, 25, 0.94)' : 'rgba(240, 253, 244, 0.95)',
    padX: 6,
    padY: 2
  });

  // No eixo Y negativo: uy = -vx
  drawMathBadge(ctx, "u_y = -v_x", ox - 40, suy, {
    fontSize: 10,
    textColor: colors.vectorU,
    borderColor: 'rgba(16, 185, 129, 0.65)',
    bgColor: isDark ? 'rgba(15, 30, 25, 0.94)' : 'rgba(240, 253, 244, 0.95)',
    padX: 6,
    padY: 2
  });

  // Desenhar Vetor v (vermelho) com seta
  ctx.save();
  ctx.lineWidth = 2.8;
  ctx.strokeStyle = colors.vector;
  ctx.fillStyle = colors.vector;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(svx, svy); ctx.stroke();

  const angleV = Math.atan2(svy - oy, svx - ox);
  ctx.beginPath();
  ctx.moveTo(svx, svy);
  ctx.lineTo(svx - 9 * Math.cos(angleV - Math.PI / 6), svy - 9 * Math.sin(angleV - Math.PI / 6));
  ctx.lineTo(svx - 9 * Math.cos(angleV + Math.PI / 6), svy - 9 * Math.sin(angleV + Math.PI / 6));
  ctx.fill();
  ctx.restore();

  // Badge do Vetor v posicionado com clareza acima e à esquerda da ponta da seta
  drawMathBadge(ctx, "v = (v_x, v_y)", svx - 42, svy - 15, {
    fontSize: 11,
    hasArrow: true,
    isBold: true,
    textColor: colors.vector,
    borderColor: 'rgba(239, 68, 68, 0.75)',
    bgColor: isDark ? 'rgba(30, 20, 25, 0.96)' : 'rgba(254, 242, 242, 0.96)',
    padX: 7,
    padY: 3
  });

  // Desenhar Vetor u (verde) com seta
  ctx.save();
  ctx.lineWidth = 2.8;
  ctx.strokeStyle = colors.vectorU;
  ctx.fillStyle = colors.vectorU;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(sux, suy); ctx.stroke();

  const angleU = Math.atan2(suy - oy, sux - ox);
  ctx.beginPath();
  ctx.moveTo(sux, suy);
  ctx.lineTo(sux - 9 * Math.cos(angleU - Math.PI / 6), suy - 9 * Math.sin(angleU - Math.PI / 6));
  ctx.lineTo(sux - 9 * Math.cos(angleU + Math.PI / 6), suy - 9 * Math.sin(angleU + Math.PI / 6));
  ctx.fill();
  ctx.restore();

  // Badge do Vetor u posicionado com clareza abaixo e à direita da ponta da seta
  drawMathBadge(ctx, "u = (v_y, -v_x)", sux + 48, suy + 14, {
    fontSize: 11,
    hasArrow: true,
    isBold: true,
    textColor: colors.vectorU,
    borderColor: 'rgba(16, 185, 129, 0.75)',
    bgColor: isDark ? 'rgba(15, 30, 25, 0.96)' : 'rgba(240, 253, 244, 0.96)',
    padX: 7,
    padY: 3
  });

  // Badge da verificação analítica no rodapé da figura
  const bw = 320, bh = 22, bx = (width - bw) / 2, by = height - 26;
  ctx.save();
  ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(239, 246, 255, 0.9)';
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(bx, by, bw, bh, 4);
  } else {
    ctx.rect(bx, by, bw, bh);
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawMathBadge(ctx, "u · v = (v_y)(v_x) + (-v_x)(v_y) = 0  ✓ (Ortogonais)", width / 2, by + 11, {
    drawBadge: false,
    fontSize: 10,
    textColor: colors.axes,
    isBold: true
  });
}

// Slide 7: Exemplo 1 Completo e Rigoroso (x0=3, y0=2, theta=45°, P=(4,5))
function initFigureEx1() {
  const canvas = document.getElementById('canvas-fig-ex1');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 350, 310);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  const ox = 45;
  const oy = 265;
  const scale = 43;

  // Grade e eixos canônicos XY
  drawCartesianGrid(ctx, width, height, ox, oy, scale, [-1, 6], [-1, 6]);

  const x0 = 3, y0 = 2;
  const sx0 = ox + x0 * scale;
  const sy0 = oy - y0 * scale;

  // Destacar marcas numéricas do exemplo em negrito
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = colors.axes;
  ctx.textAlign = 'center';
  ctx.fillText("3", ox + 3 * scale, oy + 16);
  ctx.fillText("4", ox + 4 * scale, oy + 16);
  ctx.textAlign = 'right';
  ctx.fillText("2", ox - 8, oy - 2 * scale + 4);
  ctx.fillText("5", ox - 8, oy - 5 * scale + 4);

  // Linhas tracejadas de referência da origem do destino P0(3, 2)
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = colors.guideLines;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(sx0, oy); ctx.lineTo(sx0, sy0); ctx.lineTo(ox, sy0);
  ctx.stroke();

  // Linha horizontal tracejada para medição de theta = 45°
  ctx.strokeStyle = colors.axisLabels;
  ctx.beginPath();
  ctx.moveTo(sx0, sy0);
  ctx.lineTo(sx0 + 2.5 * scale, sy0);
  ctx.stroke();
  ctx.restore();

  // Arco do ângulo theta = 45 graus
  ctx.save();
  ctx.strokeStyle = colors.pivotPoint;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(sx0, sy0, 34, 0, -Math.PI / 4, true);
  ctx.stroke();
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = colors.pivotPoint;
  ctx.fillText("45°", sx0 + 42, sy0 - 10);
  ctx.restore();

  // Eixos rotacionados X' e Y' (45 graus)
  const thetaRad = Math.PI / 4;
  ctx.save();
  ctx.translate(sx0, sy0);
  ctx.rotate(-thetaRad);

  const axisLen = 3.0 * scale;
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = colors.cyanAxis;
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(axisLen, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -axisLen); ctx.stroke();

  // Setas
  ctx.fillStyle = colors.cyanAxis;
  ctx.beginPath();
  ctx.moveTo(axisLen - 7, -4); ctx.lineTo(axisLen + 2, 0); ctx.lineTo(axisLen - 7, 4); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-4, -axisLen + 7); ctx.lineTo(0, -axisLen - 2); ctx.lineTo(4, -axisLen + 7); ctx.fill();

  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillText("x'", axisLen + 8, 4);
  ctx.fillText("y'", -4, -axisLen - 8);
  ctx.restore();

  // Ponto de origem do destino P0(3, 2)
  ctx.save();
  ctx.fillStyle = colors.cyanAxis;
  ctx.beginPath(); ctx.arc(sx0, sy0, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = colors.axes;
  ctx.fillText("P₀(3, 2)", sx0 + 6, sy0 + 16);
  ctx.restore();

  // Ponto P(4, 5) no mundo
  const px = 4, py = 5;
  const spx = ox + px * scale;
  const spy = oy - py * scale;

  // Projeções canônicas de P (no sistema XY)
  ctx.save();
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(spx, oy); ctx.lineTo(spx, spy); ctx.lineTo(ox, spy);
  ctx.stroke();
  ctx.restore();

  // Projeções perpendiculares de P nos eixos X' e Y'
  // x' = 2*sqrt(2) ~ 2.8284 -> ponto (5, 4) no sistema cartesiano
  // y' = sqrt(2) ~ 1.4142 -> ponto (2, 3) no sistema cartesiano
  const projX_screenX = ox + 5 * scale;
  const projX_screenY = oy - 4 * scale;
  const projY_screenX = ox + 2 * scale;
  const projY_screenY = oy - 3 * scale;

  ctx.save();
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
  ctx.lineWidth = 1.3;

  // Projeção perpendicular em X'
  ctx.beginPath();
  ctx.moveTo(spx, spy);
  ctx.lineTo(projX_screenX, projX_screenY);
  ctx.stroke();

  // Projeção perpendicular em Y'
  ctx.beginPath();
  ctx.moveTo(spx, spy);
  ctx.lineTo(projY_screenX, projY_screenY);
  ctx.stroke();
  ctx.restore();

  // Pontos de contato na projeção
  ctx.save();
  ctx.fillStyle = colors.cyanAxis;
  ctx.beginPath(); ctx.arc(projX_screenX, projX_screenY, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(projY_screenX, projY_screenY, 3.5, 0, Math.PI * 2); ctx.fill();

  // Marcadores de ângulo reto exatos
  // em (5, 4): reta x' vai para P0 (-1, 1 na tela); projeção vai para P (-1, -1 na tela)
  drawPerpendicularMarker(ctx, projX_screenX, projX_screenY, -1, 1, -1, -1, 7, colors.pivotPoint);

  // em (2, 3): reta y' vai para P0 (1, 1 na tela); projeção vai para P (1, -1 na tela)
  drawPerpendicularMarker(ctx, projY_screenX, projY_screenY, 1, 1, 1, -1, 7, colors.pivotPoint);

  // Textos das coordenadas no novo sistema
  ctx.font = 'bold 9px Fira Code, monospace';
  ctx.fillStyle = colors.cyanAxis;
  ctx.fillText("x' ≈ 2,83", projX_screenX + 6, projX_screenY + 14);
  ctx.fillText("y' ≈ 1,41", projY_screenX - 52, projY_screenY - 6);
  ctx.restore();

  // Desenho do Ponto P(4, 5)
  ctx.save();
  ctx.fillStyle = colors.transPoint;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(spx, spy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = colors.transPoint;
  ctx.fillText("P(4, 5)", spx + 8, spy - 6);
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = colors.cyanAxis;
  ctx.fillText("P' ≈ (2,83 ; 1,41)", spx + 8, spy + 12);
  ctx.restore();
}

// Slide 14: Exemplo 2 (Parte 1: Construção dos Vetores e Base Ortonormal)
function initFigureEx2A() {
  const canvas = document.getElementById('canvas-fig-ex2a');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 350, 310);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  const ox = 80;
  const oy = 250;
  const scale = 34;

  // Grade canônica XY cobrindo de -1 a 7 em X e -1 a 7 em Y
  drawCartesianGrid(ctx, width, height, ox, oy, scale, [-1, 7], [-1, 7]);

  const p0x = 4, p0y = 3;
  const p1x = 3, p1y = 4;
  const px = 3, py = 6;
  const sp0x = ox + p0x * scale, sp0y = oy - p0y * scale;
  const sp1x = ox + p1x * scale, sp1y = oy - p1y * scale;
  const spx = ox + px * scale, spy = oy - py * scale;

  // Destacar marcas dos pontos nos eixos
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = colors.axes;
  ctx.textAlign = 'center';
  ctx.fillText("3", ox + 3 * scale, oy + 15);
  ctx.fillText("4", ox + 4 * scale, oy + 15);
  ctx.textAlign = 'right';
  ctx.fillText("3", ox - 6, oy - 3 * scale + 4);
  ctx.fillText("4", ox - 6, oy - 4 * scale + 4);
  ctx.fillText("6", ox - 6, oy - 6 * scale + 4);

  // Linhas guia de P0(4, 3)
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = colors.guideLines;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(sp0x, oy); ctx.lineTo(sp0x, sp0y); ctx.lineTo(ox, sp0y);
  ctx.stroke();

  // Linhas guia de P1(3, 4)
  ctx.beginPath();
  ctx.moveTo(sp1x, oy); ctx.lineTo(sp1x, sp1y); ctx.lineTo(ox, sp1y);
  ctx.stroke();

  // Linhas guia de P(3, 6)
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
  ctx.beginPath();
  ctx.moveTo(spx, oy); ctx.lineTo(spx, spy); ctx.lineTo(ox, spy);
  ctx.stroke();
  ctx.restore();

  // Eixos X' e Y' estendidos a partir de P0
  // Y' aponta na direção de V: (-1, 1)/sqrt(2) (135 graus)
  // X' aponta na direção de u: (1, 1)/sqrt(2) (45 graus)
  const vx = -1 / Math.SQRT2, vy = 1 / Math.SQRT2;
  const ux = 1 / Math.SQRT2, uy = 1 / Math.SQRT2;
  const axisLen = 2.8 * scale;

  ctx.save();
  ctx.lineWidth = 2.0;
  ctx.strokeStyle = colors.cyanAxis;

  // Eixo x' (45°)
  ctx.beginPath();
  ctx.moveTo(sp0x - ux * 15, sp0y + uy * 15);
  ctx.lineTo(sp0x + ux * axisLen, sp0y - uy * axisLen);
  ctx.stroke();

  // Eixo y' (135°)
  ctx.beginPath();
  ctx.moveTo(sp0x - vx * 15, sp0y + vy * 15);
  ctx.lineTo(sp0x + vx * axisLen, sp0y - vy * axisLen);
  ctx.stroke();

  ctx.fillStyle = colors.cyanAxis;
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillText("x'", sp0x + ux * axisLen + 6, sp0y - uy * axisLen);
  ctx.fillText("y'", sp0x + vx * axisLen - 12, sp0y - vy * axisLen - 6);
  ctx.restore();

  // Marcador de ângulo reto perfeito (90°) entre u e v em P0
  drawPerpendicularMarker(ctx, sp0x, sp0y, ux, -uy, vx, -vy, 11, colors.pivotPoint);

  // Vetor diretor V = P1 - P0 (vermelho)
  ctx.save();
  ctx.lineWidth = 2.8;
  ctx.strokeStyle = colors.vector;
  ctx.fillStyle = colors.vector;
  ctx.beginPath(); ctx.moveTo(sp0x, sp0y); ctx.lineTo(sp1x, sp1y); ctx.stroke();

  const angleV = Math.atan2(sp1y - sp0y, sp1x - sp0x);
  ctx.beginPath();
  ctx.moveTo(sp1x, sp1y);
  ctx.lineTo(sp1x - 8 * Math.cos(angleV - Math.PI / 6), sp1y - 8 * Math.sin(angleV - Math.PI / 6));
  ctx.lineTo(sp1x - 8 * Math.cos(angleV + Math.PI / 6), sp1y - 8 * Math.sin(angleV + Math.PI / 6));
  ctx.fill();

  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillText("V = (-1, 1)", (sp0x + sp1x) / 2 + 6, (sp0y + sp1y) / 2 - 8);
  ctx.restore();

  // Vetores unitários v e u desenhados a partir de P0
  ctx.save();
  const unitLen = scale; // 1 unidade de comprimento
  // Vetor unitário v (ao longo de Y')
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = colors.vector;
  ctx.fillStyle = colors.vector;
  ctx.beginPath(); ctx.moveTo(sp0x, sp0y); ctx.lineTo(sp0x + vx * unitLen, sp0y - vy * unitLen); ctx.stroke();
  ctx.font = 'bold 9px Fira Code, monospace';
  ctx.fillText("v", sp0x + vx * unitLen - 10, sp0y - vy * unitLen + 8);

  // Vetor unitário u (ao longo de X')
  ctx.strokeStyle = colors.vectorU;
  ctx.fillStyle = colors.vectorU;
  ctx.beginPath(); ctx.moveTo(sp0x, sp0y); ctx.lineTo(sp0x + ux * unitLen, sp0y - uy * unitLen); ctx.stroke();
  ctx.fillText("u", sp0x + ux * unitLen + 4, sp0y - uy * unitLen + 10);
  ctx.restore();

  // Pontos P0 e P1
  ctx.save();
  ctx.fillStyle = colors.cyanAxis;
  ctx.beginPath(); ctx.arc(sp0x, sp0y, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(sp1x, sp1y, 4.5, 0, Math.PI * 2); ctx.fill();

  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = colors.axes;
  ctx.fillText("P₀(4, 3)", sp0x + 6, sp0y + 16);
  ctx.fillText("P₁(3, 4)", sp1x - 28, sp1y + 14);
  ctx.restore();

  // Ponto P(3, 6) mostrado na cena para visualização do contexto global
  ctx.save();
  ctx.fillStyle = colors.transPoint;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(spx, spy, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillText("P(3, 6)", spx + 8, spy - 6);
  ctx.restore();
}

// Slide 15: Exemplo 2 (Parte 2: Projeções Perpendiculares e Coordenadas P')
function initFigureEx2B() {
  const canvas = document.getElementById('canvas-fig-ex2b');
  if (!canvas) return;
  const res = setupFixedCanvas(canvas, 350, 310);
  if (!res) return;
  const { ctx, width, height } = res;
  const colors = getThemeColors();

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  const ox = 80;
  const oy = 250;
  const scale = 34;

  drawCartesianGrid(ctx, width, height, ox, oy, scale, [-1, 7], [-1, 7]);

  const p0x = 4, p0y = 3;
  const sp0x = ox + p0x * scale, sp0y = oy - p0y * scale;

  // Eixos X' (45°) e Y' (135°)
  const vx = -1 / Math.SQRT2, vy = 1 / Math.SQRT2;
  const ux = 1 / Math.SQRT2, uy = 1 / Math.SQRT2;

  ctx.save();
  ctx.lineWidth = 2.0;
  ctx.strokeStyle = colors.cyanAxis;

  // Eixo x' (45°), passa por P0(4, 3) e pela projeção (5, 4)
  ctx.beginPath();
  ctx.moveTo(sp0x - ux * 0.8 * scale, sp0y + uy * 0.8 * scale);
  ctx.lineTo(sp0x + ux * 2.8 * scale, sp0y - uy * 2.8 * scale);
  ctx.stroke();

  // Eixo y' (135°), passa por P0(4, 3) e pela projeção (2, 5)
  ctx.beginPath();
  ctx.moveTo(sp0x - vx * 0.8 * scale, sp0y + vy * 0.8 * scale);
  ctx.lineTo(sp0x + vx * 3.6 * scale, sp0y - vy * 3.6 * scale);
  ctx.stroke();

  ctx.fillStyle = colors.cyanAxis;
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillText("x'", sp0x + ux * 2.8 * scale + 4, sp0y - uy * 2.8 * scale);
  ctx.fillText("y'", sp0x + vx * 3.6 * scale - 14, sp0y - vy * 3.6 * scale - 4);
  ctx.restore();

  // Ponto P0(4, 3)
  ctx.save();
  ctx.fillStyle = colors.cyanAxis;
  ctx.beginPath(); ctx.arc(sp0x, sp0y, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = colors.axes;
  ctx.fillText("P₀(4, 3)", sp0x + 6, sp0y + 16);
  ctx.restore();

  // Ponto P(3, 6)
  const px = 3, py = 6;
  const spx = ox + px * scale, spy = oy - py * scale;

  // Projeções analíticas exatas:
  // Projeção em X': P0 + x' * u = (4, 3) + (1, 1) = (5, 4)
  // Projeção em Y': P0 + y' * v = (4, 3) + (-2, 2) = (2, 5)
  const projX_screenX = ox + 5 * scale;
  const projX_screenY = oy - 4 * scale;
  const projY_screenX = ox + 2 * scale;
  const projY_screenY = oy - 5 * scale;

  ctx.save();
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
  ctx.lineWidth = 1.4;

  // Linha de projeção perpendicular em X' (de P(3, 6) para (5, 4))
  ctx.beginPath();
  ctx.moveTo(spx, spy);
  ctx.lineTo(projX_screenX, projX_screenY);
  ctx.stroke();

  // Linha de projeção perpendicular em Y' (de P(3, 6) para (2, 5))
  ctx.beginPath();
  ctx.moveTo(spx, spy);
  ctx.lineTo(projY_screenX, projY_screenY);
  ctx.stroke();
  ctx.restore();

  // Pontos de contato na projeção
  ctx.save();
  ctx.fillStyle = colors.cyanAxis;
  ctx.beginPath(); ctx.arc(projX_screenX, projX_screenY, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(projY_screenX, projY_screenY, 3.5, 0, Math.PI * 2); ctx.fill();

  // Marcadores de ângulo reto exatos:
  // em (5, 4): vetor para P0 (-1, 1 na tela) e vetor para P (-1, -1 na tela)
  drawPerpendicularMarker(ctx, projX_screenX, projX_screenY, -1, 1, -1, -1, 7, colors.pivotPoint);

  // em (2, 5): vetor para P0 (1, 1 na tela) e vetor para P (1, -1 na tela)
  drawPerpendicularMarker(ctx, projY_screenX, projY_screenY, 1, 1, 1, -1, 7, colors.pivotPoint);

  ctx.font = 'bold 9px Fira Code, monospace';
  ctx.fillStyle = colors.cyanAxis;
  ctx.fillText("x' = √2 ≈ 1,41", projX_screenX + 6, projX_screenY + 14);
  ctx.fillText("y' = 2√2 ≈ 2,83", projY_screenX - 70, projY_screenY - 6);
  ctx.restore();

  // Projeções canônicas em XY (linhas suaves)
  ctx.save();
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(spx, oy); ctx.lineTo(spx, spy); ctx.lineTo(ox, spy);
  ctx.stroke();
  ctx.restore();

  // Ponto P(3, 6)
  ctx.save();
  ctx.fillStyle = colors.transPoint;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(spx, spy, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = colors.transPoint;
  ctx.fillText("P(3, 6)", spx + 8, spy - 8);
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = colors.cyanAxis;
  ctx.fillText("P' ≈ (1,41 ; 2,83)", spx + 8, spy + 12);
  ctx.restore();
}

// =========================================================================
// 9. Inicializador Global de Todos os Módulos Canvas
// =========================================================================
window.initAllCanvasDemos = function() {
  initDemo1();
  initDemo2();
  initDemo3();
  initFigureEnunciado();
  initFigureVetorV();
  initFigureVetorU();
  initFigureEx1();
  initFigureEx2A();
  initFigureEx2B();
};

document.addEventListener('DOMContentLoaded', () => {
  setupDemo1Listeners();
  setupDemo2Listeners();
  setupDemo3Listeners();
  window.initAllCanvasDemos();
});


