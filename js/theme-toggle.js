(function () {
    var KEY = 'theme';
    var root = document.documentElement;

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
            btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        });
    }

    function toggle() {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem(KEY, next);
        apply(next);
    }

    // Apply immediately (before DOMContentLoaded) to avoid flash
    apply(localStorage.getItem(KEY) || 'light');

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
            btn.addEventListener('click', toggle);
        });
    });
})();
