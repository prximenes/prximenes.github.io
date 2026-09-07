/**
 * app.js
 * Gerenciador da Apresentação Reveal.js (Warsaw Beamer 4:3)
 * Tema Claro/Escuro, Controle de Zoom de Fonte (+/-), Sincronização de Cabeçalho Warsaw e KaTeX
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
  // 4. Estrutura de Seções e Subseções Beamer Warsaw (Mapeamento dos 31 Slides)
  // =========================================================================
  const slideSections = [
    { title: 'Capa', section: '', subsection: '' },
    { title: 'Sumário', section: 'Sumário', subsection: 'Visão Geral' },
    { title: 'Por que Transformar entre Sistemas de Coordenadas?', section: 'Transformações entre Sistemas 2D', subsection: 'Motivação' },
    { title: 'Enunciado do Problema', section: 'Transformações entre Sistemas 2D', subsection: 'Motivação' },
    { title: 'Visualização do Problema', section: 'Transformações entre Sistemas 2D', subsection: 'Motivação' },
    { title: 'Método 1 — Usando o Ângulo θ', section: 'Transformações entre Sistemas 2D', subsection: 'Método 1: Com Ângulo θ' },
    { title: 'Exemplo — Método 1', section: 'Transformações entre Sistemas 2D', subsection: 'Método 1: Exemplo Completo' },
    { title: 'Exemplo — Método 1 (Notas sobre R(-θ))', section: 'Transformações entre Sistemas 2D', subsection: 'Método 1: Notas Analíticas' },
    { title: 'Laboratório Interativo — Método 1', section: 'Transformações entre Sistemas 2D', subsection: 'Laboratório Interativo' },
    { title: 'Propriedade Ortonormal da Submatriz 2×2', section: 'Transformações entre Sistemas 2D', subsection: 'Propriedade Ortonormal' },
    { title: 'Método 2 — Orientação pelo Vetor V (P0 e P1)', section: 'Transformações entre Sistemas 2D', subsection: 'Método 2: Sem Ângulo θ' },
    { title: 'Método 2 — Vetor Diretor e Normalização (Passos 1 e 2)', section: 'Transformações entre Sistemas 2D', subsection: 'Método 2: Normalização' },
    { title: 'Método 2 — Construindo a Matriz de Rotação (Passos 3 a 5)', section: 'Transformações entre Sistemas 2D', subsection: 'Método 2: Matriz Composta' },
    { title: 'Exemplo — Método 2 (Passos 1 a 4)', section: 'Transformações entre Sistemas 2D', subsection: 'Método 2: Exemplo Passo a Passo' },
    { title: 'Exemplo — Método 2 (Passos 5 e 6)', section: 'Transformações entre Sistemas 2D', subsection: 'Método 2: Exemplo Passo a Passo' },
    { title: 'Comparação dos Dois Métodos', section: 'Transformações entre Sistemas 2D', subsection: 'Comparação dos Métodos' },
    { title: 'Laboratório Interativo — Método 2', section: 'Transformações entre Sistemas 2D', subsection: 'Laboratório Interativo' },
    { title: 'Transformações no Canvas 2D — Introdução', section: 'Transformações em JS / Canvas', subsection: 'Canvas 2D — Funções Nativas' },
    { title: 'ctx.translate — Translação', section: 'Transformações em JS / Canvas', subsection: 'Canvas 2D — Funções Nativas' },
    { title: 'ctx.rotate e ctx.scale', section: 'Transformações em JS / Canvas', subsection: 'Canvas 2D — Funções Nativas' },
    { title: 'ctx.setTransform e ctx.save/restore', section: 'Transformações em JS / Canvas', subsection: 'Gerenciamento de Matrizes' },
    { title: 'A Importância do Reset da Matriz', section: 'Transformações em JS / Canvas', subsection: 'Ordem das Transformações' },
    { title: 'Ordem das Transformações — De Baixo para Cima', section: 'Transformações em JS / Canvas', subsection: 'Ordem das Transformações' },
    { title: 'Exemplo: Rotação com Ponto Arbitrário + Translação', section: 'Transformações em JS / Canvas', subsection: 'Ordem das Transformações' },
    { title: 'Exemplo Completo — Escala com Ponto Fixo', section: 'Transformações em JS / Canvas', subsection: 'Exemplos Práticos' },
    { title: 'Laboratório Interativo — Pipeline Canvas 2D', section: 'Transformações em JS / Canvas', subsection: 'Laboratório Interativo' },
    { title: 'Composição com Matrizes no WebGL', section: 'Transformações em JS / Canvas', subsection: 'WebGL & Three.js' },
    { title: 'Transformações 3D com Three.js', section: 'Transformações em JS / Canvas', subsection: 'WebGL & Three.js' },
    { title: 'Resumo Geral & Tabela de Equivalências', section: 'Resumo Geral', subsection: 'Síntese Teórica & Prática' },
    { title: 'Referências Bibliográficas', section: 'Material Complementar', subsection: 'Referências' }
  ];

  function updateWarsawHeadline(slideIndex) {
    const secEl = document.getElementById('headline-section-text');
    const subsecEl = document.getElementById('headline-subsection-text');
    const data = slideSections[slideIndex] || { section: 'Transformações Geométricas 2D — Parte 3', subsection: '' };

    if (secEl) secEl.textContent = data.section || 'Transformações Geométricas 2D — Parte 3';
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
