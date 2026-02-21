// Navigation Dropdown Toggle for Mobile
(function() {
    'use strict';

    // Only activate on mobile/tablet devices
    function isMobileView() {
        return window.innerWidth <= 768;
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
        document.addEventListener('DOMContentLoaded', initDropdowns);
    } else {
        initDropdowns();
    }

    // Reinitialize on window resize (mobile ↔ desktop)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Close all dropdowns on resize
            document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }, 250);
    });
})();
