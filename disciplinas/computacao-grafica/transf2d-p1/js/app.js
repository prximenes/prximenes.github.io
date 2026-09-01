/**
 * app.js
 * Gerenciador da Apresentação Reveal.js, Tema Claro/Escuro e KaTeX
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Gerenciamento de Tema (Claro / Escuro)
  const savedTheme = localStorage.getItem('beamer-theme') || 'theme-light'; // Tema claro como padrão Beamer
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
      if (document.body.classList.contains('theme-dark')) {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
        localStorage.setItem('beamer-theme', 'theme-light');
      } else {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
        localStorage.setItem('beamer-theme', 'theme-dark');
      }
      updateThemeButtonText();
      
      // Redesenhar todos os canvases com a nova paleta de cores
      if (window.initAllCanvasDemos) {
        window.initAllCanvasDemos();
      }
    };
  }

  // 2. Inicialização do Reveal.js (Proporção 4:3 idêntica ao LaTeX Beamer original)
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

  // 3. Estrutura de Seções e Subseções estilo Beamer Warsaw
  const slideSections = [
    { title: 'Capa', section: '', subsection: '' },
    { title: 'Sumário', section: 'Sumário', subsection: 'Visão Geral' },
    { title: 'Introdução', section: 'Introdução', subsection: 'O que são Transformações?' },
    { title: 'Ilustração das Transformações', section: 'Introdução', subsection: 'Ilustração' },
    { title: 'Translação — Equações', section: 'Transformações Básicas', subsection: 'Translação' },
    { title: 'Translação — Notação Matricial', section: 'Transformações Básicas', subsection: 'Translação' },
    { title: 'Translação — Exemplo Numérico', section: 'Transformações Básicas', subsection: 'Translação' },
    { title: 'Translação — Aplicando a Objetos', section: 'Transformações Básicas', subsection: 'Translação' },
    { title: 'Rotação — Conceitos Básicos', section: 'Transformações Básicas', subsection: 'Rotação' },
    { title: 'Rotação — Dedução (Parte 1)', section: 'Transformações Básicas', subsection: 'Rotação' },
    { title: 'Rotação — Dedução (Polares)', section: 'Transformações Básicas', subsection: 'Rotação' },
    { title: 'Rotação — Identidades Trigonométricas', section: 'Transformações Básicas', subsection: 'Rotação' },
    { title: 'Rotação — Forma Matricial (2x2)', section: 'Transformações Básicas', subsection: 'Rotação' },
    { title: 'Rotação — Exemplo Numérico', section: 'Transformações Básicas', subsection: 'Rotação' },
    { title: 'Rotação — Ponto Arbitrário', section: 'Transformações Básicas', subsection: 'Rotação' },
    { title: 'Transformações de Corpo Rígido', section: 'Transformações Básicas', subsection: 'Corpo Rígido' },
    { title: 'Escala — Equações e Parâmetros', section: 'Transformações Básicas', subsection: 'Escala' },
    { title: 'Escala — Regras dos Fatores', section: 'Transformações Básicas', subsection: 'Escala' },
    { title: 'Escala — Exemplo Numérico', section: 'Transformações Básicas', subsection: 'Escala' },
    { title: 'Escala — Ponto Fixo', section: 'Transformações Básicas', subsection: 'Escala' },
    { title: 'Por que Coordenadas Homogêneas?', section: 'Coordenadas Homogêneas', subsection: 'Motivação' },
    { title: 'Coordenadas Homogêneas — Definição', section: 'Coordenadas Homogêneas', subsection: 'Definição e Uso' },
    { title: 'Translação em Coord. Homogêneas (Dedução)', section: 'Coordenadas Homogêneas', subsection: 'Translação' },
    { title: 'Translação em Coord. Homogêneas (Matriz 3x3)', section: 'Coordenadas Homogêneas', subsection: 'Translação' },
    { title: 'Rotação em Coordenadas Homogêneas', section: 'Coordenadas Homogêneas', subsection: 'Rotação' },
    { title: 'Escala em Coordenadas Homogêneas', section: 'Coordenadas Homogêneas', subsection: 'Escala' },
    { title: 'Resumo — As Três Matrizes 3x3', section: 'Coordenadas Homogêneas', subsection: 'Resumo' },
    { title: 'Laboratório Interativo & Matriz 3x3', section: 'Coordenadas Homogêneas', subsection: 'Playground' },
    { title: 'Vantagem: Sequências de Transformações', section: 'Coordenadas Homogêneas', subsection: 'Vantagens' },
    { title: 'Ferramentas e Material Complementar', section: 'Material Complementar', subsection: 'Dicas de Estudo' },
    { title: 'Referências Bibliográficas', section: 'Material Complementar', subsection: 'Referências' }
  ];

  function updateWarsawHeadline(slideIndex) {
    const secEl = document.getElementById('headline-section-text');
    const subsecEl = document.getElementById('headline-subsection-text');
    const data = slideSections[slideIndex] || { section: 'Transformações 2D', subsection: '' };

    if (secEl) secEl.textContent = data.section || 'Transformações Geométricas 2D';
    if (subsecEl) subsecEl.textContent = data.subsection ? `› ${data.subsection}` : '';
  }

  // 4. Renderização KaTeX automática
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

  // Quando Reveal.js estiver pronto
  Reveal.on('ready', event => {
    renderAllMath();
    if (window.initAllCanvasDemos) {
      window.initAllCanvasDemos();
    }
    updateWarsawHeadline(event.indexh);
  });

  // Quando mudar de slide
  Reveal.on('slidechanged', event => {
    updateWarsawHeadline(event.indexh);
    
    // Redesenhar o canvas do slide ativo
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
