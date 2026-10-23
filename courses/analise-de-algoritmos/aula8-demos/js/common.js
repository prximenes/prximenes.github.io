/* ============================================================
   AULA 8 — DEMOS: utilitários compartilhados
   Tema claro/escuro (mesma chave do visualizador da Aula 8),
   tela cheia e formatação de números.
   ============================================================ */

(function () {
  'use strict';

  const THEME_KEY = 'beamer_theme';

  function readTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) { /* armazenamento indisponível: segue sem persistir */ }
  }

  function updateThemeButton() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    const isLight = document.body.classList.contains('theme-light');
    btn.innerHTML = isLight
      ? '<span>☀️</span> <span>Claro</span>'
      : '<span>🌙</span> <span>Escuro</span>';
  }

  function initChrome() {
    if (readTheme() === 'light') document.body.classList.add('theme-light');
    updateThemeButton();

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('theme-light');
        saveTheme(isLight ? 'light' : 'dark');
        updateThemeButton();
        document.dispatchEvent(new CustomEvent('themechange'));
      });
    }

    const fsBtn = document.getElementById('fullscreen-btn');
    if (fsBtn) {
      fsBtn.addEventListener('click', toggleFullscreen);
    }

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    });
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  const SUPERSCRIPTS = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

  function sup(n) {
    return String(n).split('').map((ch) => SUPERSCRIPTS[ch] || ch).join('');
  }

  // Inteiro com separador de milhar pt-BR; notação científica quando enorme
  function fmtInt(n) {
    if (!isFinite(n)) return '∞';
    if (Math.abs(n) < 1e9) return Math.round(n).toLocaleString('pt-BR');
    return fmtSci(n);
  }

  function fmtSci(n) {
    const exp = Math.floor(Math.log10(n));
    const mant = n / Math.pow(10, exp);
    return mant.toFixed(1).replace('.', ',') + ' × 10' + sup(exp);
  }

  // Duração legível a partir de segundos
  function fmtDuration(seconds) {
    if (seconds < 1e-6) return (seconds * 1e9).toFixed(0) + ' ns';
    if (seconds < 1e-3) return (seconds * 1e6).toFixed(1).replace('.', ',') + ' µs';
    if (seconds < 1) return (seconds * 1e3).toFixed(1).replace('.', ',') + ' ms';
    if (seconds < 60) return seconds.toFixed(1).replace('.', ',') + ' s';
    if (seconds < 3600) return (seconds / 60).toFixed(1).replace('.', ',') + ' min';
    if (seconds < 86400) return (seconds / 3600).toFixed(1).replace('.', ',') + ' h';
    const years = seconds / (365.25 * 86400);
    if (seconds < 365.25 * 86400) return (seconds / 86400).toFixed(1).replace('.', ',') + ' dias';
    if (years < 1e6) return fmtInt(years) + ' anos';
    return fmtSci(years) + ' anos';
  }

  window.Demo = { initChrome, fmtInt, fmtSci, fmtDuration, sup };

  document.addEventListener('DOMContentLoaded', initChrome);
})();
