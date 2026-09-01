// Theme Management (Dark / Light) with localStorage persistence
(function () {
    const toggleButton = document.getElementById('toggle-button');
    const themeLink = document.getElementById('theme-link');

    if (!toggleButton || !themeLink) return;

    // Detect the correct base path for themes based on page depth
    function getThemePath(themeName) {
        const currentHref = themeLink.getAttribute('href');
        const prefix = currentHref.includes('assets/css/') ? 'assets/css/' : 
                       currentHref.includes('../') ? '../assets/css/' : 'assets/css/';
        return `${prefix}style-${themeName}.css`;
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            themeLink.setAttribute('href', getThemePath('light'));
            toggleButton.innerHTML = '🌙 Dark Mode';
            toggleButton.setAttribute('aria-label', 'Switch to Dark Mode');
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
        } else {
            themeLink.setAttribute('href', getThemePath('dark'));
            toggleButton.innerHTML = '☀️ Light Mode';
            toggleButton.setAttribute('aria-label', 'Switch to Light Mode');
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
        }
    }

    // Initialize with saved theme or default to dark
    const savedTheme = localStorage.getItem('site-theme') || 'dark';
    applyTheme(savedTheme);

    toggleButton.addEventListener('click', () => {
        const currentHref = themeLink.getAttribute('href');
        const isCurrentlyDark = currentHref.includes('style-dark.css');
        const newTheme = isCurrentlyDark ? 'light' : 'dark';
        
        localStorage.setItem('site-theme', newTheme);
        applyTheme(newTheme);
    });
})();
