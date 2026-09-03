/**
 * app.js
 * Gerenciador da Apresentação Reveal.js (Warsaw Beamer 4:3)
 * Tema Claro/Escuro, Controle de Zoom de Fonte (+/-), Sincronização de Cabeçalho e KaTeX
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Gerenciamento de Tema (Claro / Escuro)
  // =========================================================================
  const savedTheme = localStorage.getItem('lecture_theme') || 
                     localStorage.getItem('beamer-theme') || 
                     'theme-light';
  document.body.className = savedTheme;

  const btnThemeToggle = document.getElementById('theme-toggle-btn');
  function updateThemeButtonText() {
    if (!btnThemeToggle) return;
    const isDark = document.body.classList.contains('theme-dark');
    btnThemeToggle.innerHTML = isDark 
      ? `<span>☀️</span> <span>Tema Claro</span>` 
      : `<span>🌙</span> <span>Tema Escuro</span>`;
  }
  updateThemeButtonText();

  if (btnThemeToggle) {
    btnThemeToggle.onclick = () => {
      const isDark = document.body.classList.contains('theme-dark');
      const newTheme = isDark ? 'theme-light' : 'theme-dark';
      document.body.classList.remove(isDark ? 'theme-dark' : 'theme-light');
      document.body.classList.add(newTheme);
      localStorage.setItem('lecture_theme', newTheme);
      localStorage.setItem('beamer-theme', newTheme);
      updateThemeButtonText();
      
      // Redesenhar todos os canvases ativos com nova paleta
      if (window.initAllCanvasDemos) {
        window.initAllCanvasDemos();
      }
    };
  }

  // =========================================================================
  // 2. Controle de Zoom de Fonte (--font-zoom, localStorage e atalhos + / -)
  // =========================================================================
  let currentFontZoom = parseFloat(localStorage.getItem('lecture_font_zoom')) || 1.0;
  // Limitar entre 0.75 (75%) e 1.40 (140%) para garantir preservação do layout
  currentFontZoom = Math.max(0.75, Math.min(1.40, currentFontZoom));

  const fontZoomLabel = document.getElementById('font-zoom-label');
  const fontDecBtn = document.getElementById('font-decrease-btn');
  const fontIncBtn = document.getElementById('font-increase-btn');

  function applyFontZoom(zoom) {
    currentFontZoom = Math.round(zoom * 100) / 100;
    currentFontZoom = Math.max(0.75, Math.min(1.40, currentFontZoom));
    document.documentElement.style.setProperty('--font-zoom', currentFontZoom);
    document.body.style.setProperty('--font-zoom', currentFontZoom);
    if (fontZoomLabel) {
      fontZoomLabel.textContent = `${Math.round(currentFontZoom * 100)}%`;
    }
    localStorage.setItem('lecture_font_zoom', currentFontZoom);
  }

  applyFontZoom(currentFontZoom);

  if (fontDecBtn) {
    fontDecBtn.onclick = () => applyFontZoom(currentFontZoom - 0.05);
  }
  if (fontIncBtn) {
    fontIncBtn.onclick = () => applyFontZoom(currentFontZoom + 0.05);
  }

  // Atalhos de teclado para zoom: '+' (ou '=') para aumentar, '-' para diminuir
  window.addEventListener('keydown', (e) => {
    // Não interceptar se o foco estiver em campo de texto ou slider
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    if (e.key === '+' || e.key === '=') {
      applyFontZoom(currentFontZoom + 0.05);
    } else if (e.key === '-' || e.key === '_') {
      applyFontZoom(currentFontZoom - 0.05);
    }
  });

  // =========================================================================
  // 3. Inicialização do Reveal.js (Proporção autêntica 4:3 do LaTeX Beamer)
  // =========================================================================
  Reveal.initialize({
    controls: true,
    progress: true,
    center: false,
    hash: true,
    slideNumber: 'c/t',
    transition: 'slide',
    transitionSpeed: 'default',
    backgroundTransition: 'fade',
    width: 1024,
    height: 768,
    margin: 0.03,
    minScale: 0.2,
    maxScale: 2.0,
    keyboard: {
      70: function() { // 'F' para tela cheia
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    }
  });

  // =========================================================================
  // 4. Estrutura de Seções e Subseções Beamer Warsaw
  // =========================================================================
  const slideSections = [
    { title: 'Capa', section: '', subsection: '' },
    { title: 'Sumário', section: 'Sumário', subsection: 'Visão Geral' },
    { title: 'Transformações Inversas — Introdução', section: 'Transformações Inversas', subsection: 'Visão Geral' },
    { title: 'Translação Inversa', section: 'Transformações Inversas', subsection: 'Translação Inversa' },
    { title: 'Rotação Inversa', section: 'Transformações Inversas', subsection: 'Rotação Inversa' },
    { title: 'Escala Inversa', section: 'Transformações Inversas', subsection: 'Escala Inversa' },
    { title: 'Laboratório Interativo — Inversas', section: 'Transformações Inversas', subsection: 'Demonstração Interativa' },
    { title: 'Transformações Compostas — Por quê?', section: 'Transformações Compostas', subsection: 'Motivação' },
    { title: 'Ordem das Matrizes — De Trás para Frente', section: 'Transformações Compostas', subsection: 'Ordem das Matrizes' },
    { title: 'Associatividade — Cuidado com a Ordem!', section: 'Transformações Compostas', subsection: 'Ordem das Matrizes' },
    { title: 'Sequência de Translações', section: 'Transformações Compostas', subsection: 'Mesma Operação' },
    { title: 'Sequência de Rotações', section: 'Transformações Compostas', subsection: 'Mesma Operação' },
    { title: 'Sequência de Escalas', section: 'Transformações Compostas', subsection: 'Mesma Operação' },
    { title: 'Rotação com Ponto Arbitrário — 3 Passos', section: 'Transformações Compostas', subsection: 'Rotação com Ponto Arbitrário' },
    { title: 'Rotação com Ponto Arbitrário — Matriz Composta', section: 'Transformações Compostas', subsection: 'Rotação com Ponto Arbitrário' },
    { title: 'Laboratório Interativo — Rotação com Pivô', section: 'Transformações Compostas', subsection: 'Rotação com Ponto Arbitrário' },
    { title: 'Escala com Ponto Fixo — Diagrama dos 4 Passos', section: 'Transformações Compostas', subsection: 'Escala com Ponto Fixo' },
    { title: 'Escala com Ponto Fixo — Formulação e Matriz', section: 'Transformações Compostas', subsection: 'Escala com Ponto Fixo' },
    { title: 'Laboratório Interativo — Escala com Âncora', section: 'Transformações Compostas', subsection: 'Escala com Ponto Fixo' },
    { title: 'Multiplicação NÃO é Comutativa — Caso da Casa', section: 'Transformações Compostas', subsection: 'Não-Comutatividade' },
    { title: 'Laboratório Interativo — Não-Comutatividade da Casinha', section: 'Transformações Compostas', subsection: 'Não-Comutatividade' },
    { title: 'Exemplo — Rotação de um Quadrado', section: 'Transformações Compostas', subsection: 'Exemplo Completo' },
    { title: 'Exemplo — Montando as Matrizes', section: 'Transformações Compostas', subsection: 'Exemplo Completo' },
    { title: 'Exemplo — Matriz Composta e Vértices', section: 'Transformações Compostas', subsection: 'Exemplo Completo' },
    { title: 'Exemplo — Resultado Gráfico e Análise', section: 'Transformações Compostas', subsection: 'Exemplo Completo' },
    { title: 'Propriedade Importante no OpenGL / WebGL', section: 'Transformações Compostas', subsection: 'OpenGL & WebGL' },
    { title: 'Reflexão — Conceito e Casos Básicos', section: 'Outras Transformações 2D', subsection: 'Reflexão' },
    { title: 'Reflexão no Eixo x (y = 0)', section: 'Outras Transformações 2D', subsection: 'Reflexão' },
    { title: 'Reflexão no Eixo y (x = 0)', section: 'Outras Transformações 2D', subsection: 'Reflexão' },
    { title: 'Reflexão em Relação à Origem', section: 'Outras Transformações 2D', subsection: 'Reflexão' },
    { title: 'Laboratório Interativo — Reflexões 2D', section: 'Outras Transformações 2D', subsection: 'Reflexão' },
    { title: 'Cisalhamento (Shear) — Conceito', section: 'Outras Transformações 2D', subsection: 'Cisalhamento' },
    { title: 'Cisalhamento na Direção x', section: 'Outras Transformações 2D', subsection: 'Cisalhamento' },
    { title: 'Cisalhamento na Direção y', section: 'Outras Transformações 2D', subsection: 'Cisalhamento' },
    { title: 'Laboratório Interativo — Cisalhamento', section: 'Outras Transformações 2D', subsection: 'Cisalhamento' },
    { title: 'Resumo — Todas as Matrizes 2D', section: 'Resumo Geral', subsection: 'Matrizes 3x3' },
    { title: 'Playground Completo de Transformações Compostas', section: 'Laboratório & Prática', subsection: 'Playground 2D' },
    { title: 'Referências Bibliográficas', section: 'Material Complementar', subsection: 'Referências' }
  ];

  function updateWarsawHeadline(slideIndex) {
    const secEl = document.getElementById('headline-section-text');
    const subsecEl = document.getElementById('headline-subsection-text');
    const data = slideSections[slideIndex] || { section: 'Transformações Geométricas 2D', subsection: '' };

    if (secEl) secEl.textContent = data.section || 'Transformações Geométricas 2D — Parte 2';
    if (subsecEl) subsecEl.textContent = data.subsection ? `› ${data.subsection}` : '';

    // Atualizar classe ativa nas seções principais do topo
    document.querySelectorAll('.headline-section-nav span').forEach(item => {
      const targetSec = item.getAttribute('data-section');
      if (targetSec && data.section && data.section.toLowerCase().includes(targetSec.toLowerCase())) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // =========================================================================
  // 5. Renderização KaTeX automática
  // =========================================================================
  function renderAllMath() {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  // Eventos do Reveal.js
  Reveal.on('ready', event => {
    renderAllMath();
    if (window.initAllCanvasDemos) {
      window.initAllCanvasDemos();
    }
    updateWarsawHeadline(event.indexh);
  });

  Reveal.on('slidechanged', event => {
    updateWarsawHeadline(event.indexh);
    
    // Atualizar demos do slide ativo com pequeno delay para garantir layout
    setTimeout(() => {
      if (window.initAllCanvasDemos) {
        window.initAllCanvasDemos();
      }
    }, 40);
  });

  window.addEventListener('resize', () => {
    if (window.initAllCanvasDemos) {
      window.initAllCanvasDemos();
    }
  });
});
