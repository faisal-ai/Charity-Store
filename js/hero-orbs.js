document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.hero, .hero-section').forEach(function (el) {
        if (el.classList.contains('hero-spline')) return;
        if (el.querySelector('.hero-orbs')) return;
        var orbs = document.createElement('div');
        orbs.className = 'hero-orbs';
        orbs.innerHTML =
            '<div class="hero-orb hero-orb-1"></div>' +
            '<div class="hero-orb hero-orb-2"></div>' +
            '<div class="hero-orb hero-orb-3"></div>';
        el.insertBefore(orbs, el.firstChild);
    });
});
