/**
 * AULA 5: ANÁLISE DE ALGORITMOS ITERATIVOS - PARTE 2
 * Controlador Principal Reveal.js, Header Warsaw, Dark Mode e KaTeX
 * Autor: Pedro Ximenes (UNICAP)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Configuração e Inicialização do Reveal.js (Proporção 4:3)
  Reveal.initialize({
    width: 1024,
    height: 768,
    margin: 0.03,
    minScale: 0.2,
    maxScale: 2.0,
    center: false,
    controls: false, // Usamos os controles customizados da barra Beamer Warsaw
    progress: true,
    history: true,
    keyboard: true,
    overview: true,
    transition: 'fade',
    transitionSpeed: 'fast',
    slideNumber: false // Customizado no footline Warsaw
  }).then(() => {
    initKaTeX();
    initWarsawNavigation();
    initThemeManager();
    initExerciseToggles();
    initDemos();
    updateWarsawHeaderAndFootline();
  });

  // Atualização em cada transição de slide
  Reveal.on('slidechanged', event => {
    updateWarsawHeaderAndFootline();
    renderKaTeXInSlide(event.currentSlide);
    triggerSlideDemo(event.currentSlide);
  });

  /* ============================================================
     KATEX RENDERER
     ============================================================ */
  function initKaTeX() {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  function renderKaTeXInSlide(slideElem) {
    if (window.renderMathInElement && slideElem) {
      window.renderMathInElement(slideElem, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  /* ============================================================
     WARSAW HEADER E FOOTLINE CONTROLLER
     ============================================================ */
  const sectionsData = [
    { id: 'revisao', name: '1. Revisão' },
    { id: 'ordenacao', name: '2. Ordenação Quadrática' },
    { id: 'casos', name: '3. Casos' },
    { id: 'novos-padroes', name: '4. Novos Padrões' },
    { id: 'tecnicas', name: '5. Técnicas' },
    { id: 'resumo', name: '6. Resumo' },
    { id: 'exercicios', name: '7. Exercícios' },
    { id: 'gabarito', name: '8. Gabarito' },
    { id: 'desafio', name: '9. Desafio' },
    { id: 'fechamento', name: '10. Fechamento' }
  ];

  function initWarsawNavigation() {
    const secList = document.getElementById('warsaw-sections-list');
    if (!secList) return;

    secList.innerHTML = sectionsData.map(sec => `
      <a class="warsaw-sec-item" data-sec-id="${sec.id}">
        ${sec.name}
      </a>
    `).join('');

    secList.addEventListener('click', e => {
      const target = e.target.closest('.warsaw-sec-item');
      if (target) {
        const secId = target.getAttribute('data-sec-id');
        const targetSlide = document.querySelector(`.reveal .slides > section[data-section="${secId}"]`);
        if (targetSlide) {
          const allSlides = Array.from(document.querySelectorAll('.reveal .slides > section'));
          const idx = allSlides.indexOf(targetSlide);
          if (idx !== -1) Reveal.slide(idx);
        }
      }
    });

    // Controles do Rodapé
    const prevBtn = document.getElementById('foot-prev-btn');
    const nextBtn = document.getElementById('foot-next-btn');
    const fullBtn = document.getElementById('foot-fullscreen-btn');

    if (prevBtn) prevBtn.addEventListener('click', () => Reveal.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => Reveal.next());
    if (fullBtn) {
      fullBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      });
    }
  }

  function updateWarsawHeaderAndFootline() {
    const currentSlide = Reveal.getCurrentSlide();
    if (!currentSlide) return;

    const secId = currentSlide.getAttribute('data-section') || '';
    const subSecTitle = currentSlide.getAttribute('data-subsection') || '';

    // Atualiza links de seções no topo
    document.querySelectorAll('.warsaw-sec-item').forEach(item => {
      if (item.getAttribute('data-sec-id') === secId) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });

    // Atualiza subseção no topo
    const subSecBar = document.getElementById('warsaw-subsection-title');
    if (subSecBar) {
      subSecBar.textContent = subSecTitle || (secId ? `Seção: ${secId.toUpperCase()}` : 'Análise de Algoritmos');
    }

    // Atualiza contador de slides no rodapé
    const indices = Reveal.getIndices();
    const currentNum = indices.h + 1;
    const totalSlides = Reveal.getTotalSlides();
    const countElem = document.getElementById('slide-counter-text');
    if (countElem) {
      countElem.textContent = `${currentNum} / ${totalSlides}`;
    }
  }

  /* ============================================================
     THEME MANAGER (LIGHT / DARK)
     ============================================================ */
  function initThemeManager() {
    const savedTheme = localStorage.getItem('aa_slide_theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      updateThemeButtonText(themeBtn);
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('aa_slide_theme', isDark ? 'dark' : 'light');
        updateThemeButtonText(themeBtn);

        // Re-renderiza gráficos e simuladores ativos
        redrawActiveDemos();
      });
    }
  }

  function updateThemeButtonText(btn) {
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = isDark ? '☀️ Claro' : '🌙 Escuro';
  }

  function redrawActiveDemos() {
    if (window.CanvasDemos) {
      if (window.CanvasDemos.SelectionSortDemo.canvas) window.CanvasDemos.SelectionSortDemo.draw();
      if (window.CanvasDemos.BubbleSortDemo.canvas) window.CanvasDemos.BubbleSortDemo.draw();
      if (window.CanvasDemos.MatrixSearchDemo.canvas) window.CanvasDemos.MatrixSearchDemo.draw();
      if (window.CanvasDemos.PrimalityDemo.canvas) window.CanvasDemos.PrimalityDemo.drawChart();
      if (window.CanvasDemos.ComplexityChart.canvas) window.CanvasDemos.ComplexityChart.draw();
    }
  }

  /* ============================================================
     EXERCISE SOLUTIONS TOGGLE
     ============================================================ */
  function initExerciseToggles() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.toggle-solution-btn');
      if (btn) {
        const targetId = btn.getAttribute('data-target');
        const solBox = document.getElementById(targetId);
        if (solBox) {
          solBox.classList.toggle('show');
          const isOpen = solBox.classList.contains('show');
          btn.textContent = isOpen ? 'Ocultar Resolução' : 'Mostrar Resolução Passo a Passo';
          if (isOpen) renderKaTeXInSlide(solBox);
        }
      }
    });
  }

  /* ============================================================
     DEMOS AUTO-INITIALIZATION
     ============================================================ */
  function initDemos() {
    if (!window.CanvasDemos) return;
    window.CanvasDemos.SelectionSortDemo.init('ssort-canvas');
    window.CanvasDemos.BubbleSortDemo.init('bsort-canvas');
    window.CanvasDemos.LinearSearchDemo.init('lsearch-container');
    window.CanvasDemos.MatrixSearchDemo.init('matrix-canvas');
    window.CanvasDemos.PrimalityDemo.init('prime-canvas');
    window.CanvasDemos.TwoPointersDemo.initPal('pal-container');
    window.CanvasDemos.TwoPointersDemo.initTwoSum('twosum-container');
    window.CanvasDemos.ComplexityChart.init('complexity-canvas');
  }

  function triggerSlideDemo(slideElem) {
    if (!slideElem || !window.CanvasDemos) return;
    if (slideElem.querySelector('#ssort-canvas')) window.CanvasDemos.SelectionSortDemo.draw();
    if (slideElem.querySelector('#bsort-canvas')) window.CanvasDemos.BubbleSortDemo.draw();
    if (slideElem.querySelector('#matrix-canvas')) window.CanvasDemos.MatrixSearchDemo.draw();
    if (slideElem.querySelector('#prime-canvas')) window.CanvasDemos.PrimalityDemo.drawChart();
    if (slideElem.querySelector('#complexity-canvas')) window.CanvasDemos.ComplexityChart.draw();
  }
});
