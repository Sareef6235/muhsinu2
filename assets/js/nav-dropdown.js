/**
 * Reusable Navigation Dropdown Component
 * Supports multiple dropdowns with event delegation, auto-close, and ARIA accessibility
 * @namespace NavDropdown
 */
window.NavDropdown = (function () {
    'use strict';

    // State management
    let currentOpenDropdown = null;

    /**
     * Initialize all dropdowns with event delegation
     */
    function init() {
        // Event delegation on document for dropdown toggles
        document.addEventListener('click', handleDropdownToggle);

        // Close dropdowns when clicking outside
        document.addEventListener('click', handleOutsideClick);

        // Keyboard navigation support
        document.addEventListener('keydown', handleKeyboardNav);

        console.log('✅ NavDropdown initialized');
    }

    /**
     * Handle dropdown toggle clicks using event delegation
     * @param {Event} e - Click event
     */
    function handleDropdownToggle(e) {
        const toggle = e.target.closest('[data-dropdown-toggle]');
        if (!toggle) return;

        e.preventDefault();
        e.stopPropagation();

        const dropdownId = toggle.getAttribute('data-dropdown-toggle');
        const dropdown = document.getElementById(dropdownId);

        if (!dropdown) {
            console.warn(`Dropdown with id "${dropdownId}" not found`);
            return;
        }

        // Close other dropdowns first
        if (currentOpenDropdown && currentOpenDropdown !== dropdown) {
            closeDropdown(currentOpenDropdown);
        }

        // Toggle current dropdown
        if (dropdown.classList.contains('active')) {
            closeDropdown(dropdown);
        } else {
            openDropdown(dropdown, toggle);
        }
    }

    /**
     * Open a dropdown
     * @param {HTMLElement} dropdown - Dropdown element
     * @param {HTMLElement} toggle - Toggle button element
     */
    function openDropdown(dropdown, toggle) {
        dropdown.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.classList.add('active');
        currentOpenDropdown = dropdown;

        // Animate dropdown items
        const items = dropdown.querySelectorAll('.dropdown-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.03}s`;
        });
    }

    /**
     * Close a dropdown
     * @param {HTMLElement} dropdown - Dropdown element
     */
    function closeDropdown(dropdown) {
        if (!dropdown) return;

        dropdown.classList.remove('active');

        // Find associated toggle button
        const toggleId = dropdown.id;
        const toggle = document.querySelector(`[data-dropdown-toggle="${toggleId}"]`);

        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.classList.remove('active');
        }

        if (currentOpenDropdown === dropdown) {
            currentOpenDropdown = null;
        }
    }

    /**
     * Close all dropdowns
     */
    function closeAllDropdowns() {
        const allDropdowns = document.querySelectorAll('.nav-dropdown.active');
        allDropdowns.forEach(dropdown => closeDropdown(dropdown));
    }

    /**
     * Handle clicks outside dropdowns
     * @param {Event} e - Click event
     */
    function handleOutsideClick(e) {
        // Don't close if clicking on a toggle or inside a dropdown
        if (e.target.closest('[data-dropdown-toggle]') ||
            e.target.closest('.nav-dropdown')) {
            return;
        }

        closeAllDropdowns();
    }

    /**
     * Handle keyboard navigation
     * @param {Event} e - Keyboard event
     */
    function handleKeyboardNav(e) {
        // Close on Escape key
        if (e.key === 'Escape') {
            closeAllDropdowns();
        }

        // Arrow key navigation within dropdown
        if (currentOpenDropdown && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            navigateDropdownItems(e.key);
        }
    }

    /**
     * Navigate dropdown items with arrow keys
     * @param {string} direction - 'ArrowDown' or 'ArrowUp'
     */
    function navigateDropdownItems(direction) {
        if (!currentOpenDropdown) return;

        const items = Array.from(currentOpenDropdown.querySelectorAll('.dropdown-item'));
        const activeItem = document.activeElement;
        const currentIndex = items.indexOf(activeItem);

        let nextIndex;
        if (direction === 'ArrowDown') {
            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }

        items[nextIndex].focus();
    }

    /**
     * Create a dropdown programmatically
     * @param {Object} config - Dropdown configuration
     * @returns {Object} HTML elements for toggle and dropdown
     */
    function createDropdown(config) {
        const {
            id,
            title,
            icon = 'ph-folder',
            items = [],
            insertAfter = null
        } = config;

        // Create toggle button
        const toggle = document.createElement('div');
        toggle.className = 'nav-item nav-dropdown-toggle';
        toggle.setAttribute('data-dropdown-toggle', id);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-haspopup', 'true');
        toggle.innerHTML = `
            <i class="ph ${icon}"></i>
            <span>${title}</span>
            <i class="ph ph-caret-down dropdown-arrow"></i>
        `;

        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.id = id;
        dropdown.className = 'nav-dropdown';
        dropdown.setAttribute('role', 'menu');

        // Add items
        items.forEach(item => {
            const dropdownItem = document.createElement('div');
            dropdownItem.className = 'dropdown-item';
            dropdownItem.setAttribute('role', 'menuitem');
            dropdownItem.setAttribute('tabindex', '0');

            if (item.onclick) {
                dropdownItem.onclick = item.onclick;
            }

            dropdownItem.innerHTML = `
                <i class="ph ${item.icon || 'ph-circle'}"></i>
                <span>${item.label}</span>
            `;

            dropdown.appendChild(dropdownItem);
        });

        // Insert into navigation
        if (insertAfter) {
            insertAfter.after(toggle);
            toggle.after(dropdown);
        }

        return { toggle, dropdown };
    }

    // Public API
    return {
        init,
        createDropdown,
        closeAllDropdowns,
        openDropdown,
        closeDropdown
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', NavDropdown.init);
} else {
    NavDropdown.init();
}
