/**
 * Core Utilities
 * Helper functions for the entire system
 */

export const Utils = {
    // Generate unique ID
    generateId: (prefix = 'id') => {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    },

    // Format Date
    formatDate: (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Safe DOM Element Creator
    createElement: (tag, className, text = '', innerHTML = '') => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text) el.textContent = text;
        if (innerHTML) el.innerHTML = innerHTML;
        return el;
    }
};
