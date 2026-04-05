// Navigation Dropdown Toggle for Mobile
(function() {
    'use strict';

    // Only activate on mobile/tablet devices
    function isMobileView() {
        return window.innerWidth <= 768;
    }

    function initHamburger() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const navMenu = document.querySelector('.navbar-nav');

        if (!hamburgerBtn || !navMenu) return;

        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            hamburgerBtn.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        // Close menu when a nav link (non-dropdown) is clicked
        navMenu.querySelectorAll('.nav-item:not(.nav-dropdown) .nav-link').forEach(function(link) {
            link.addEventListener('click', function() {
                hamburgerBtn.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });

        // Close menu on outside click
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.navbar')) {
                hamburgerBtn.classList.remove('open');
                navMenu.classList.remove('open');
            }
        });
    }

    function initDropdowns() {
        const dropdowns = document.querySelectorAll('.nav-dropdown');

        dropdowns.forEach(dropdown => {
            const parentLink = dropdown.querySelector('.nav-link');

            if (!parentLink) return;

            // Remove existing event listeners to prevent duplicates
            const newParentLink = parentLink.cloneNode(true);
            parentLink.parentNode.replaceChild(newParentLink, parentLink);

            // Add click handler
            newParentLink.addEventListener('click', function(e) {
                if (isMobileView()) {
                    e.preventDefault();

                    // Close other open dropdowns
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('open');
                        }
                    });

                    // Toggle current dropdown
                    dropdown.classList.toggle('open');
                }
                // On desktop, allow default link behavior
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (isMobileView() && !e.target.closest('.nav-dropdown')) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('open');
                });
            }
        });
    }

    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initHamburger();
            initDropdowns();
        });
    } else {
        initHamburger();
        initDropdowns();
    }

    // Reinitialize on window resize (mobile ↔ desktop)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Close all dropdowns and hamburger on resize
            const hamburgerBtn = document.getElementById('hamburger-btn');
            const navMenu = document.querySelector('.navbar-nav');
            if (hamburgerBtn) hamburgerBtn.classList.remove('open');
            if (navMenu) navMenu.classList.remove('open');
            document.querySelectorAll('.nav-dropdown').forEach(function(dropdown) {
                dropdown.classList.remove('open');
            });
        }, 250);
    });
})();
