const toggleButton = document.getElementById('toggle-button');
const themeLink = document.getElementById('theme-link');

toggleButton.addEventListener('click', () => {
    if (themeLink.getAttribute('href') === 'style-dark.css') {
        themeLink.setAttribute('href', 'style-light.css');
        toggleButton.textContent = '🌙 Dark Mode';
    } else {
        themeLink.setAttribute('href', 'style-dark.css');
        toggleButton.textContent = '☀️ Light Mode';
    }
});
