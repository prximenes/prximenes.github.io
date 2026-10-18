// Theme Management (Dark / Light) with localStorage persistence
(function () {
    const toggleButton = document.getElementById('toggle-button');
    const themeLink = document.getElementById('theme-link');

    if (!toggleButton || !themeLink) return;

    // Detect the correct base path for themes based on page depth
    function getThemePath(themeName) {
        const currentHref = themeLink.getAttribute('href') || '';
        const cleanHref = currentHref.split('?')[0];
        const prefix = cleanHref.substring(0, cleanHref.lastIndexOf('/') + 1);
        return `${prefix}style-${themeName}.css?v=20261018d`;
    }

    function getThemeButtonText(theme) {
        const lang = localStorage.getItem('site-lang') || 
            (((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en');
        if (theme === 'light') {
            return lang === 'pt' ? '🌙 Modo Escuro' : '🌙 Dark Mode';
        } else {
            return lang === 'pt' ? '☀️ Modo Claro' : '☀️ Light Mode';
        }
    }

    function applyTheme(theme) {
        const isLight = theme === 'light';
        themeLink.setAttribute('href', getThemePath(isLight ? 'light' : 'dark'));
        toggleButton.innerHTML = getThemeButtonText(isLight ? 'light' : 'dark');
        toggleButton.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        if (isLight) {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
            document.documentElement.classList.remove('theme-dark');
            document.documentElement.classList.add('theme-light');
        } else {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
            document.documentElement.classList.remove('theme-light');
            document.documentElement.classList.add('theme-dark');
        }
    }

    // Expose updateThemeButtonText for i18n sync
    window.updateThemeButtonText = function () {
        const isCurrentlyDark = document.body.classList.contains('theme-dark');
        toggleButton.innerHTML = getThemeButtonText(isCurrentlyDark ? 'dark' : 'light');
    };

    // Initialize with query param (?theme=light | ?theme=dark), saved theme, or default to dark
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = urlParams.get('theme');
    if (urlTheme === 'light' || urlTheme === 'dark') {
        localStorage.setItem('site-theme', urlTheme);
    }
    const savedTheme = localStorage.getItem('site-theme') || 'dark';
    applyTheme(savedTheme);

    toggleButton.addEventListener('click', () => {
        const isCurrentlyDark = document.body.classList.contains('theme-dark');
        const newTheme = isCurrentlyDark ? 'light' : 'dark';
        
        localStorage.setItem('site-theme', newTheme);
        applyTheme(newTheme);
    });
})();
