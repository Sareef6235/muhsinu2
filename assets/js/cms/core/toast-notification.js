/**
 * Toast Notification System
 * Provides user feedback for CMS operations
 * @namespace Toast
 */
window.Toast = (function () {
    'use strict';

    let toastContainer = null;
    let toastQueue = [];
    let activeToasts = 0;
    const MAX_TOASTS = 3;

    /**
     * Initialize toast container
     */
    function init() {
        if (toastContainer) return;

        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);

        console.log('✅ Toast system initialized');
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type: success, error, warning, info
     * @param {number} duration - Duration in milliseconds (0 = no auto-dismiss)
     */
    function show(message, type = 'info', duration = 4000) {
        if (!toastContainer) init();

        // Queue if too many active toasts
        if (activeToasts >= MAX_TOASTS) {
            toastQueue.push({ message, type, duration });
            return;
        }

        const toast = createToast(message, type, duration);
        toastContainer.appendChild(toast);
        activeToasts++;

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => dismiss(toast), duration);
        }
    }

    /**
     * Create toast element
     * @private
     */
    function createToast(message, type, duration) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = getIcon(type);
        const hasClose = duration === 0; // Only show close button for persistent toasts

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            ${hasClose ? '<button class="toast-close" aria-label="Close">&times;</button>' : ''}
        `;

        // Close button handler
        if (hasClose) {
            toast.querySelector('.toast-close').onclick = () => dismiss(toast);
        }

        return toast;
    }

    /**
     * Get icon for toast type
     * @private
     */
    function getIcon(type) {
        const icons = {
            success: '<i class="ph-bold ph-check-circle"></i>',
            error: '<i class="ph-bold ph-x-circle"></i>',
            warning: '<i class="ph-bold ph-warning-circle"></i>',
            info: '<i class="ph-bold ph-info"></i>'
        };
        return icons[type] || icons.info;
    }

    /**
     * Dismiss a toast
     * @private
     */
    function dismiss(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            activeToasts--;

            // Process queue
            if (toastQueue.length > 0) {
                const next = toastQueue.shift();
                show(next.message, next.type, next.duration);
            }
        }, 300);
    }

    /**
     * Dismiss all toasts
     */
    function dismissAll() {
        const toasts = toastContainer.querySelectorAll('.toast');
        toasts.forEach(toast => dismiss(toast));
        toastQueue = [];
    }

    // Public API
    return {
        init,
        show,
        success: (msg, duration = 4000) => show(msg, 'success', duration),
        error: (msg, duration = 6000) => show(msg, 'error', duration),
        warning: (msg, duration = 5000) => show(msg, 'warning', duration),
        info: (msg, duration = 4000) => show(msg, 'info', duration),
        dismissAll
    };
})();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Toast.init);
} else {
    Toast.init();
}
