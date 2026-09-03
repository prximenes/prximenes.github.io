/**
 * app.js - Configuração do Reveal.js, Sincronização do Cabeçalho Beamer Warsaw e Tema Claro/Escuro
 * Aula: Nomeação em Sistemas Distribuídos (DNS)
 * Autor: Pedro Ximenes | UNICAP
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicialização do Reveal.js com Proporção Autêntica 4:3 (1024x768)
  Reveal.initialize({
    width: 1024,
    height: 768,
    margin: 0.03,
    minScale: 0.2,
    maxScale: 2.0,
    center: false,
    controls: true,
    progress: true,
    history: true,
    slideNumber: false, // Usamos o contador do rodapé Beamer
    transition: 'slide',
    transitionSpeed: 'fast',
    keyboard: true,
    touch: true,
    overview: true,
    help: true
  }).then(() => {
    updateBeamerFrame(Reveal.getCurrentSlide());
    if (window.DNSDemos) {
      window.DNSDemos.initAll();
    }
  });

  // 2. Mapeamento das Seções de Cabeçalho Warsaw
  const sectionIndices = {
    1: 'sec-1-slide-1', // Nomeação Estruturada
    2: 'sec-2-slide-1', // DNS e Camadas
    3: 'sec-3-slide-1', // Resolução de Nomes
    4: 'sec-4-slide-1'  // DNS em Operação
  };

  // 3. Atualização Dinâmica da Moldura Beamer Warsaw
  function updateBeamerFrame(currentSlide) {
    if (!currentSlide) return;

    const sectionId = currentSlide.getAttribute('data-section') || '0';
    const subsection = currentSlide.getAttribute('data-subsection') || '';

    // Atualiza Abas do Cabeçalho Superior
    document.querySelectorAll('.nav-section-item').forEach(item => {
      const itemSection = item.getAttribute('data-sec');
      if (itemSection === sectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Atualiza Subseção no Cabeçalho Secundário
    const subLabel = document.getElementById('active-subsection-name');
    if (subLabel) {
      if (subsection) {
        subLabel.textContent = `§ ${subsection}`;
      } else {
        const titleEl = currentSlide.querySelector('.slide-header h2');
        subLabel.textContent = titleEl ? `§ ${titleEl.textContent.trim()}` : '§ Introdução';
      }
    }

    // Atualiza Contador de Slides no Rodapé Beamer
    const indices = Reveal.getIndices();
    const totalSlides = Reveal.getTotalSlides();
    const currentNum = indices.v !== undefined ? Reveal.getSlidePastCount() + 1 : 1;

    const curEl = document.getElementById('footline-current-slide');
    const totEl = document.getElementById('footline-total-slides');
    if (curEl) curEl.textContent = currentNum;
    if (totEl) totEl.textContent = totalSlides;

    // Se o slide possuir demo interativa visível, redesenha imediatamente e após a transição
    if (window.DNSDemos) {
      if (currentSlide.querySelector('#dnsSimCanvas')) {
        window.DNSDemos.resizeAndDrawSim();
        setTimeout(() => window.DNSDemos.resizeAndDrawSim(), 60);
        setTimeout(() => window.DNSDemos.resizeAndDrawSim(), 250);
      }
      if (currentSlide.querySelector('#dnsTreeCanvas')) {
        window.DNSDemos.resizeAndDrawTree();
        setTimeout(() => window.DNSDemos.resizeAndDrawTree(), 60);
        setTimeout(() => window.DNSDemos.resizeAndDrawTree(), 250);
      }
    }
  }

  // 4. Eventos do Reveal.js
  Reveal.on('slidechanged', event => {
    updateBeamerFrame(event.currentSlide);
  });

  // Navegação direta clicando nas abas do cabeçalho
  document.querySelectorAll('.nav-section-item').forEach(item => {
    item.addEventListener('click', () => {
      const sec = item.getAttribute('data-sec');
      const targetId = sectionIndices[sec];
      if (targetId) {
        const targetSlide = document.getElementById(targetId);
        if (targetSlide) {
          const index = Reveal.getIndices(targetSlide);
          Reveal.slide(index.h, index.v);
        }
      }
    });
  });

  // Botões do Roteiro (Agenda)
  document.querySelectorAll('.agenda-card').forEach(card => {
    card.addEventListener('click', () => {
      const sec = card.getAttribute('data-goto');
      const targetId = sectionIndices[sec];
      if (targetId) {
        const targetSlide = document.getElementById(targetId);
        if (targetSlide) {
          const index = Reveal.getIndices(targetSlide);
          Reveal.slide(index.h, index.v);
        }
      }
    });
  });

  // Botão "Iniciar Apresentação" na capa
  const startBtn = document.getElementById('btnStartPresentation');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      Reveal.next();
    });
  }

  // 5. Alternador de Tema Claro / Escuro (Dark/Light Mode)
  const themeBtn = document.getElementById('btnThemeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('beamer-theme');

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-theme');
    updateThemeIcon(true);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');
      localStorage.setItem('beamer-theme', isDark ? 'dark' : 'light');
      updateThemeIcon(isDark);
      if (window.DNSDemos) {
        window.DNSDemos.redrawAll();
      }
    });
  }

  function updateThemeIcon(isDark) {
    if (!themeBtn) return;
    themeBtn.innerHTML = isDark
      ? '<i class="fa-solid fa-sun"></i> Claro'
      : '<i class="fa-solid fa-moon"></i> Escuro';
  }

  // 6. Botão de Tela Cheia (Fullscreen)
  const fullscreenBtn = document.getElementById('btnFullscreen');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('Erro ao entrar em tela cheia:', err);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // 7. Controle de Zoom de Fonte [ A- | 100% | A+ ]
  initFontZoomControl();

  // 8. Componente Interativo de Leitura Reversa do FQDN
  initFQDNInteractive();
});

/**
 * Controle de Zoom de Fonte com persistência e atalhos de teclado (+ e -)
 */
function initFontZoomControl() {
  const decreaseBtn = document.getElementById('font-decrease-btn');
  const zoomLabel = document.getElementById('font-zoom-label');
  const increaseBtn = document.getElementById('font-increase-btn');

  const MIN_ZOOM = 0.7;
  const MAX_ZOOM = 1.6;
  const STEP = 0.1;

  // Carregar valor persistido em localStorage('lecture_font_zoom')
  let currentZoom = parseFloat(localStorage.getItem('lecture_font_zoom'));
  if (isNaN(currentZoom) || currentZoom < MIN_ZOOM || currentZoom > MAX_ZOOM) {
    currentZoom = 1.0;
  }

  function applyZoom(zoom) {
    currentZoom = Math.round(zoom * 10) / 10;
    if (currentZoom < MIN_ZOOM) currentZoom = MIN_ZOOM;
    if (currentZoom > MAX_ZOOM) currentZoom = MAX_ZOOM;

    document.documentElement.style.setProperty('--font-zoom', currentZoom);
    if (zoomLabel) {
      zoomLabel.textContent = `${Math.round(currentZoom * 100)}%`;
    }
    localStorage.setItem('lecture_font_zoom', currentZoom.toFixed(1));

    // Redesenha os módulos Canvas caso precisem ajustar escala
    if (window.DNSDemos) {
      window.DNSDemos.redrawAll();
    }
  }

  // Inicializa o zoom
  applyZoom(currentZoom);

  // Botões [ A- | A+ ]
  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      applyZoom(currentZoom - STEP);
    });
  }

  if (increaseBtn) {
    increaseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      applyZoom(currentZoom + STEP);
    });
  }

  // Clique no rótulo reseta para 100%
  if (zoomLabel) {
    zoomLabel.addEventListener('click', (e) => {
      e.stopPropagation();
      applyZoom(1.0);
    });
  }

  // Atalhos de teclado: '+' (aumentar), '-' (diminuir)
  window.addEventListener('keydown', (e) => {
    // Não interceptar caso o foco esteja em campo de formulário
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
      applyZoom(currentZoom + STEP);
    } else if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
      applyZoom(currentZoom - STEP);
    }
  });
}

/**
 * Componente didático para demonstrar a leitura reversa de domínios FQDN
 */
function initFQDNInteractive() {
  const chips = document.querySelectorAll('.fqdn-chip');
  const descEl = document.getElementById('fqdnDescText');
  if (!chips.length || !descEl) return;

  const descriptions = {
    br: "<strong>1º Nível (TLD Nacional - .br):</strong> Administrado pelo Registro.br (CGI.br). Identifica o país e pertence à <em>Camada Global</em>.",
    unicap: "<strong>2º Nível (Domínio Organizacional - unicap):</strong> Identifica a instituição (Universidade Católica de Pernambuco). Pertence à <em>Camada Administrativa</em>.",
    c3: "<strong>3º Nível (Subdomínio - c3):</strong> Centro ou departamento interno da instituição (ex.: Centro de Ciências e Tecnologia / Coordenação).",
    www: "<strong>4º Nível (Nome do Host / Serviço - www):</strong> Máquina folha ou serviço web específico que atende a requisição HTTP. Pertence à <em>Camada Gerencial</em>."
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const part = chip.getAttribute('data-part');
      if (descriptions[part]) {
        descEl.innerHTML = descriptions[part];
      }
    });
  });
}
