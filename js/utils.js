/**
 * Utility functions for Charity Store
 */

// DOM utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format date
function formatDate(timestamp, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return new Date(timestamp).toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

// Format relative time
function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;

    return formatDate(timestamp);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existing = $('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    // Add styles if not already added
    if (!$('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: white;
                border-left: 4px solid;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            .notification-success { border-left-color: #2ecc71; }
            .notification-error { border-left-color: #e74c3c; }
            .notification-warning { border-left-color: #f39c12; }
            .notification-info { border-left-color: #3498db; }
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #7f8c8d;
                margin-left: auto;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Close button functionality
    notification.querySelector('.notification-close').onclick = () => {
        notification.remove();
    };

    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
}

// Loading spinner
function showLoading(element) {
    if (typeof element === 'string') element = $(element);
    if (!element) return;

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = '<div class="spinner"></div>';

    // Add spinner styles
    if (!$('#spinner-styles')) {
        const styles = document.createElement('style');
        styles.id = 'spinner-styles';
        styles.textContent = `
            .loading-spinner {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #e74c3c;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styles);
    }

    element.style.position = 'relative';
    element.appendChild(spinner);
}

function hideLoading(element) {
    if (typeof element === 'string') element = $(element);
    if (!element) return;

    const spinner = element.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone
function isValidPhone(phone) {
    const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    return phoneRegex.test(phone);
}

// Form validation
function validateForm(form) {
    const errors = [];
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            errors.push(`${field.name || field.id || 'Field'} is required`);
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }

        // Email validation
        if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
            errors.push('Please enter a valid email address');
            field.classList.add('error');
        }

        // Phone validation
        if (field.type === 'tel' && field.value && !isValidPhone(field.value)) {
            errors.push('Please enter a valid phone number');
            field.classList.add('error');
        }
    });

    return errors;
}

// Add field validation styles
if (!$('#validation-styles')) {
    const styles = document.createElement('style');
    styles.id = 'validation-styles';
    styles.textContent = `
        .error {
            border-color: #e74c3c !important;
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
        }
        .form-error {
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(styles);
}

// Modal functions
function openModal(modalId) {
    const modal = $(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }
}

function closeModal(modalId) {
    const modal = $(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }
}

// Setup modal close handlers
function setupModals() {
    $$('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => closeModal(`#${modal.id}`);
        }

        // Close on backdrop click
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal(`#${modal.id}`);
            }
        };
    });
}

// Shopping cart functions
function updateCartCount() {
    const cartCount = dataManager.getCartCount();
    const cartCountElements = $$('.cart-count');

    cartCountElements.forEach(element => {
        element.textContent = cartCount;
        element.style.display = cartCount > 0 ? 'flex' : 'none';
    });
}

function addToCartAnimation(button) {
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.disabled = true;
    button.style.background = '#2ecc71';

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.style.background = '';
    }, 1500);
}

// Image placeholder
function createImagePlaceholder(text, width = 400, height = 300) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    return canvas.toDataURL();
}

// Generate placeholder image URL
function getPlaceholderUrl(text, width = 400, height = 300, bgColor = '4a90e2', textColor = 'ffffff') {
    return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
}

// Pagination helper
function paginate(items, page, itemsPerPage) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
        items: items.slice(startIndex, endIndex),
        currentPage: page,
        totalPages: Math.ceil(items.length / itemsPerPage),
        totalItems: items.length,
        hasNext: endIndex < items.length,
        hasPrev: startIndex > 0
    };
}

// Create pagination HTML
function createPaginationHTML(paginationData, onPageChange) {
    const { currentPage, totalPages, hasNext, hasPrev } = paginationData;

    let html = '<div class="pagination">';

    // Previous button
    html += `<button ${!hasPrev ? 'disabled' : ''} onclick="(${onPageChange.toString()})(${currentPage - 1})">‹ Prev</button>`;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        html += `<button onclick="(${onPageChange.toString()})(1)">1</button>`;
        if (startPage > 2) html += '<span>...</span>';
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="(${onPageChange.toString()})(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += '<span>...</span>';
        html += `<button onclick="(${onPageChange.toString()})(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    html += `<button ${!hasNext ? 'disabled' : ''} onclick="(${onPageChange.toString()})(${currentPage + 1})">Next ›</button>`;

    html += '</div>';
    return html;
}

// Local storage helpers
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear();
        location.reload();
    }
}

// Export data as JSON
function exportDataAsJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export data as CSV
function exportDataAsCSV(data, filename) {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes
                return typeof value === 'string' && (value.includes(',') || value.includes('"'))
                    ? `"${value.replace(/"/g, '""')}"`
                    : value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Session management
function setSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

function getSession(key) {
    try {
        return JSON.parse(sessionStorage.getItem(key));
    } catch {
        return null;
    }
}

function clearSession(key) {
    sessionStorage.removeItem(key);
}

// Admin authentication check
function isAuthenticated() {
    return getSession('admin_user') !== null;
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    clearSession('admin_user');
    window.location.href = 'login.html';
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup modals
    setupModals();

    // Update cart count
    updateCartCount();

    // Setup ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = $('.modal.show');
            if (openModal) {
                closeModal(`#${openModal.id}`);
            }
        }
    });
});

// Expose utilities globally
window.utils = {
    $,
    $$,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    debounce,
    showNotification,
    showLoading,
    hideLoading,
    isValidEmail,
    isValidPhone,
    validateForm,
    openModal,
    closeModal,
    setupModals,
    updateCartCount,
    addToCartAnimation,
    createImagePlaceholder,
    getPlaceholderUrl,
    paginate,
    createPaginationHTML,
    clearAllData,
    exportDataAsJSON,
    exportDataAsCSV,
    setSession,
    getSession,
    clearSession,
    isAuthenticated,
    requireAuth,
    logout
};