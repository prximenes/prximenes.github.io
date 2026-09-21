/**
 * AULA 7: ANÁLISE DE ALGORITMOS RECURSIVOS
 * Controlador do Visualizador de Slides PDF (PDF.js + Tema Warsaw Beamer)
 * Autor: Prof. Pedro Ximenes (UNICAP)
 */

document.addEventListener('DOMContentLoaded', () => {
  const pdfUrl = 'aula6_analise_algoritmos_recursivos.pdf';

  // Configuração do Worker do PDF.js
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // Estado do Visualizador
  let pdfDoc = null;
  let currentPage = 1;
  let totalPages = 0;
  let pageRendering = false;
  let pageNumPending = null;
  let currentRenderTask = null;
  let zoomScale = 1.0;
  let isFitMode = true;

  // Elementos da Interface
  const canvas = document.getElementById('pdf-canvas');
  const ctx = canvas.getContext('2d');
  const loadingOverlay = document.getElementById('loading-overlay');
  const fallbackContainer = document.getElementById('pdf-fallback');
  const canvasWrapper = document.getElementById('canvas-wrapper');
  const pageNumInput = document.getElementById('page-num-input');
  const pageCountSpan = document.getElementById('page-count');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const sidePrevBtn = document.getElementById('side-prev-btn');
  const sideNextBtn = document.getElementById('side-next-btn');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomLabel = document.getElementById('zoom-label');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const viewerContainer = document.getElementById('viewer-container');

  // Inicializar Tema
  initTheme();

  // Carregar Documento PDF
  loadPDF();

  function loadPDF() {
    if (!window.pdfjsLib) {
      showFallback('Biblioteca PDF.js não encontrada.');
      return;
    }

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true
    });

    loadingTask.promise.then(pdf => {
      pdfDoc = pdf;
      totalPages = pdf.numPages;
      pageCountSpan.textContent = totalPages;
      pageNumInput.max = totalPages;

      hideLoading();
      renderPage(currentPage);
    }).catch(err => {
      console.error('Erro ao carregar o PDF:', err);
      showFallback('Não foi possível carregar o arquivo PDF no navegador.');
    });
  }

  /**
   * Renderiza uma página específica no Canvas com suporte a Retina / HiDPI
   */
  function renderPage(num) {
    pageRendering = true;
    updateControls();

    // Cancelar renderização anterior se estiver ativa
    if (currentRenderTask) {
      currentRenderTask.cancel();
    }

    pdfDoc.getPage(num).then(page => {
      const containerWidth = viewerContainer.clientWidth - 32;
      const containerHeight = viewerContainer.clientHeight - 32;

      // Obter viewport original não escalado
      const unscaledViewport = page.getViewport({ scale: 1.0 });

      // Calcular escala para caber na tela mantendo proporção Beamer 4:3
      const scaleX = containerWidth / unscaledViewport.width;
      const scaleY = containerHeight / unscaledViewport.height;
      const fitScale = Math.min(scaleX, scaleY);

      const effectiveScale = isFitMode ? (fitScale * zoomScale) : zoomScale;
      const viewport = page.getViewport({ scale: effectiveScale });

      // Otimização para telas Retina / HiDPI
      const pixelRatio = Math.max(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = Math.floor(viewport.width) + 'px';
      canvas.style.height = Math.floor(viewport.height) + 'px';

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        transform: [pixelRatio, 0, 0, pixelRatio, 0, 0]
      };

      currentRenderTask = page.render(renderContext);

      currentRenderTask.promise.then(() => {
        pageRendering = false;
        currentRenderTask = null;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      }).catch(err => {
        if (err && err.name === 'RenderingCancelledException') {
          // Renderização cancelada intencionalmente
        } else {
          console.error('Erro de renderização:', err);
        }
        pageRendering = false;
      });
    });

    pageNumInput.value = num;
  }

  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  function goToPage(num) {
    const targetPage = Math.max(1, Math.min(totalPages, num));
    if (targetPage !== currentPage) {
      currentPage = targetPage;
      queueRenderPage(currentPage);
    }
  }

  function prevPage() {
    if (currentPage <= 1) return;
    currentPage--;
    queueRenderPage(currentPage);
  }

  function nextPage() {
    if (currentPage >= totalPages) return;
    currentPage++;
    queueRenderPage(currentPage);
  }

  function updateControls() {
    prevBtn.disabled = (currentPage <= 1);
    sidePrevBtn.disabled = (currentPage <= 1);
    nextBtn.disabled = (currentPage >= totalPages);
    sideNextBtn.disabled = (currentPage >= totalPages);
  }

  // Controles de Zoom
  function updateZoomLabel() {
    zoomLabel.textContent = Math.round(zoomScale * 100) + '%';
  }

  zoomInBtn.addEventListener('click', () => {
    if (zoomScale < 2.0) {
      zoomScale = Math.min(2.0, zoomScale + 0.15);
      updateZoomLabel();
      queueRenderPage(currentPage);
    }
  });

  zoomOutBtn.addEventListener('click', () => {
    if (zoomScale > 0.6) {
      zoomScale = Math.max(0.6, zoomScale - 0.15);
      updateZoomLabel();
      queueRenderPage(currentPage);
    }
  });

  zoomLabel.addEventListener('click', () => {
    zoomScale = 1.0;
    updateZoomLabel();
    queueRenderPage(currentPage);
  });

  // Navegação pelos botões
  prevBtn.addEventListener('click', prevPage);
  sidePrevBtn.addEventListener('click', prevPage);
  nextBtn.addEventListener('click', nextPage);
  sideNextBtn.addEventListener('click', nextPage);

  // Jump direto para página
  pageNumInput.addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      goToPage(val);
    } else {
      e.target.value = currentPage;
    }
  });

  pageNumInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  });

  // Atalhos de Teclado
  document.addEventListener('keydown', (e) => {
    // Ignora atalhos se o foco estiver no input numérico
    if (document.activeElement === pageNumInput) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
      case 'n':
      case 'N':
        e.preventDefault();
        nextPage();
        break;

      case 'ArrowLeft':
      case 'PageUp':
      case 'p':
      case 'P':
      case 'Backspace':
        e.preventDefault();
        prevPage();
        break;

      case 'Home':
        e.preventDefault();
        goToPage(1);
        break;

      case 'End':
        e.preventDefault();
        goToPage(totalPages);
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
    }
  });

  // Suporte a Gestos de Deslize (Swipe) em Dispositivos Móveis
  let touchStartX = 0;
  let touchStartY = 0;

  viewerContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  viewerContainer.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;

      // Se o movimento for predominantemente horizontal e maior que 40px
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          nextPage();
        } else {
          prevPage();
        }
      }
    }
  }, { passive: true });

  // Redimensionamento de Janela
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (pdfDoc) {
        queueRenderPage(currentPage);
      }
    }, 150);
  });

  // Tela Cheia
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Não foi possível entrar em modo tela cheia:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Alternador de Tema (Claro / Escuro)
  function initTheme() {
    const savedTheme = localStorage.getItem('beamer_theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('theme-light');
      themeToggleBtn.textContent = '☀️ Claro';
    } else {
      document.body.classList.remove('theme-light');
      themeToggleBtn.textContent = '🌙 Escuro';
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('theme-light');
    if (isLight) {
      themeToggleBtn.textContent = '☀️ Claro';
      localStorage.setItem('beamer_theme', 'light');
    } else {
      themeToggleBtn.textContent = '🌙 Escuro';
      localStorage.setItem('beamer_theme', 'dark');
    }
  });

  function hideLoading() {
    if (loadingOverlay) {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 300);
    }
  }

  function showFallback(message) {
    hideLoading();
    canvasWrapper.style.display = 'none';
    fallbackContainer.style.display = 'flex';
    if (message) {
      const p = fallbackContainer.querySelector('p');
      if (p) p.textContent = message;
    }
  }
});
