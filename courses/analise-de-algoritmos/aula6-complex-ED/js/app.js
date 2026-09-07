/**
 * AULA 6: COMPLEXIDADE DE ESTRUTURAS DE DADOS
 * Controlador Principal Reveal.js, Header Warsaw, Zoom de Fonte, Dark Mode e KaTeX
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
    controls: false, // Controles customizados na barra Beamer Warsaw
    progress: true,
    history: true,
    keyboard: true,
    overview: true,
    transition: 'fade',
    transitionSpeed: 'fast',
    slideNumber: false // Customizado no rodapé Warsaw
  }).then(() => {
    initKaTeX();
    initWarsawNavigation();
    initThemeManager();
    initFontZoomManager();
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
    { id: 'revisao', name: '0. Revisão' },
    { id: 'intro', name: '1. Introdução' },
    { id: 'arraylist', name: '2. Arrays e ArrayList' },
    { id: 'linkedlist', name: '3. LinkedList' },
    { id: 'pilha', name: '4. Pilha (Stack)' },
    { id: 'fila', name: '5. Fila (Queue)' },
    { id: 'bst', name: '6. BST' },
    { id: 'heap', name: '7. Heap' },
    { id: 'hash', name: '8. Tabela Hash' },
    { id: 'comparacao', name: '9. Comparação Geral' },
    { id: 'exercicios-res', name: '10. Ex. Resolvidos' },
    { id: 'exercicios-prop', name: '11. Ex. Propostos' },
    { id: 'gabarito', name: '12. Gabarito' },
    { id: 'conclusao', name: '13. Conclusão' }
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
      subSecBar.textContent = subSecTitle || (secId ? `Seção: ${secId.toUpperCase()}` : 'Análise de Algoritmos — Aula 6');
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
    const savedTheme = localStorage.getItem('lecture_theme') || localStorage.getItem('aa_slide_theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      updateThemeButtonText(themeBtn);
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('lecture_theme', isDark ? 'dark' : 'light');
        localStorage.setItem('aa_slide_theme', isDark ? 'dark' : 'light');
        updateThemeButtonText(themeBtn);
        redrawActiveDemos();
      });
    }
  }

  function updateThemeButtonText(btn) {
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = isDark ? '☀️ Claro' : '🌙 Escuro';
  }

  /* ============================================================
     FONT ZOOM MANAGER ([ A- | 100% | A+ ])
     ============================================================ */
  function initFontZoomManager() {
    let zoomLevel = parseFloat(localStorage.getItem('lecture_font_zoom')) || 1.0;
    applyFontZoom(zoomLevel);

    const decBtn = document.getElementById('font-decrease-btn');
    const incBtn = document.getElementById('font-increase-btn');

    if (decBtn) {
      decBtn.addEventListener('click', () => {
        zoomLevel = Math.max(0.75, Math.round((zoomLevel - 0.1) * 10) / 10);
        applyFontZoom(zoomLevel);
      });
    }

    if (incBtn) {
      incBtn.addEventListener('click', () => {
        zoomLevel = Math.min(1.5, Math.round((zoomLevel + 0.1) * 10) / 10);
        applyFontZoom(zoomLevel);
      });
    }

    // Atalhos de teclado '+' e '-'
    window.addEventListener('keydown', e => {
      // Ignora se estiver digitando em um input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.key === '+' || e.key === '=') {
        zoomLevel = Math.min(1.5, Math.round((zoomLevel + 0.1) * 10) / 10);
        applyFontZoom(zoomLevel);
      } else if (e.key === '-' || e.key === '_') {
        zoomLevel = Math.max(0.75, Math.round((zoomLevel - 0.1) * 10) / 10);
        applyFontZoom(zoomLevel);
      }
    });
  }

  function applyFontZoom(val) {
    document.documentElement.style.setProperty('--font-zoom', val);
    localStorage.setItem('lecture_font_zoom', val.toString());
    const label = document.getElementById('font-zoom-label');
    if (label) {
      label.textContent = `${Math.round(val * 100)}%`;
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
     DEMOS AUTO-INITIALIZATION & REDRAW
     ============================================================ */
  function initDemos() {
    if (!window.CanvasDemos) return;
    window.CanvasDemos.ArrayListDemo.init('arraylist-canvas');
    window.CanvasDemos.LinkedListDemo.init('linkedlist-canvas');
    window.CanvasDemos.StackDemo.init('stack-canvas');
    window.CanvasDemos.QueueDemo.init('queue-canvas');
    window.CanvasDemos.BSTDemo.init('bst-canvas');
    window.CanvasDemos.HeapDemo.init('heap-canvas');
    window.CanvasDemos.HashTableDemo.init('hash-canvas');
    window.CanvasDemos.ComplexityChart.init('complexity-canvas');
  }

  function redrawActiveDemos() {
    if (!window.CanvasDemos) return;
    if (window.CanvasDemos.ArrayListDemo.canvas) window.CanvasDemos.ArrayListDemo.draw();
    if (window.CanvasDemos.LinkedListDemo.canvas) window.CanvasDemos.LinkedListDemo.draw();
    if (window.CanvasDemos.StackDemo.canvas) window.CanvasDemos.StackDemo.draw();
    if (window.CanvasDemos.QueueDemo.canvas) window.CanvasDemos.QueueDemo.draw();
    if (window.CanvasDemos.BSTDemo.canvas) window.CanvasDemos.BSTDemo.draw();
    if (window.CanvasDemos.HeapDemo.canvas) window.CanvasDemos.HeapDemo.draw();
    if (window.CanvasDemos.HashTableDemo.canvas) window.CanvasDemos.HashTableDemo.draw();
    if (window.CanvasDemos.ComplexityChart.canvas) window.CanvasDemos.ComplexityChart.draw();
  }

  function triggerSlideDemo(slideElem) {
    if (!slideElem || !window.CanvasDemos) return;
    if (slideElem.querySelector('#arraylist-canvas')) window.CanvasDemos.ArrayListDemo.draw();
    if (slideElem.querySelector('#linkedlist-canvas')) window.CanvasDemos.LinkedListDemo.draw();
    if (slideElem.querySelector('#stack-canvas')) window.CanvasDemos.StackDemo.draw();
    if (slideElem.querySelector('#queue-canvas')) window.CanvasDemos.QueueDemo.draw();
    if (slideElem.querySelector('#bst-canvas')) window.CanvasDemos.BSTDemo.draw();
    if (slideElem.querySelector('#heap-canvas')) window.CanvasDemos.HeapDemo.draw();
    if (slideElem.querySelector('#hash-canvas')) window.CanvasDemos.HashTableDemo.draw();
    if (slideElem.querySelector('#complexity-canvas')) window.CanvasDemos.ComplexityChart.draw();
  }
});
