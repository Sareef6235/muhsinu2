// ============================================
// DASHBOARD PANEL INTERACTIVE BEHAVIORS
// Handles active states, theme switching, and smooth interactions
// ============================================

/**
 * Panel Navigation System
 * Manages sidebar navigation active states and panel switching
 */
class DashboardNavigation {
    constructor() {
        this.activePanel = null;
        this.navItems = [];
        this.init();
    }

    init() {
        // Auto-detect nav items on page load
        this.navItems = document.querySelectorAll('.nav-item[onclick*="switchPanel"]');

        // Add event listeners for better control
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavClick(e.currentTarget);
            });
        });
    }

    /**
     * Handle navigation item click
     * Removes active class from all items and adds to clicked item
     */
    handleNavClick(clickedItem) {
        // Remove active from all nav items
        this.navItems.forEach(item => {
            item.classList.remove('active');
        });

        // Add active to clicked item
        clickedItem.classList.add('active');

        // Store active panel reference
        this.activePanel = clickedItem;

        // Add subtle haptic feedback (if supported)
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    /**
     * Programmatically set active panel
     * @param {string} panelId - ID or selector of panel to activate
     */
    setActivePanel(panelId) {
        const targetNav = document.querySelector(`.nav-item[onclick*="${panelId}"]`);
        if (targetNav) {
            this.handleNavClick(targetNav);
        }
    }
}

/**
 * Theme Switcher
 * Toggles between light and dark modes with smooth transitions
 */
class ThemeSwitcher {
    constructor() {
        this.currentTheme = this.getSavedTheme() || 'light';
        this.init();
    }

    init() {
        // Apply saved theme on load
        this.applyTheme(this.currentTheme);

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.getSavedTheme()) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.saveTheme(this.currentTheme);
    }

    /**
     * Apply theme to document
     * @param {string} theme - 'light' or 'dark'
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.body.classList.remove('dark-mode');
        }
        this.currentTheme = theme;
    }

    /**
     * Save theme preference to localStorage
     */
    saveTheme(theme) {
        localStorage.setItem('dashboard-theme', theme);
    }

    /**
     * Get saved theme from localStorage
     */
    getSavedTheme() {
        return localStorage.getItem('dashboard-theme');
    }
}

/**
 * Button Ripple Effect
 * Adds material design ripple effect to buttons
 */
function addRippleEffect(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * Enhanced Button Interactions
 * Adds advanced hover and click effects
 */
function initButtonEnhancements() {
    const buttons = document.querySelectorAll('.panel-header button, button.panel-action-btn');

    buttons.forEach(button => {
        // Add ripple on click
        button.addEventListener('click', function (e) {
            addRippleEffect(this, e);
        });

        // Add loading state helper
        button.addEventListener('click', function () {
            if (this.dataset.loading === 'true') return;

            // Can be triggered programmatically: button.dataset.loading = 'true'
            if (this.dataset.asyncAction) {
                this.classList.add('loading');
                this.disabled = true;
            }
        });
    });
}

/**
 * Panel Switching Function
 * Global function to switch between dashboard panels
 * @param {string} panelId - ID of panel to show
 * @param {HTMLElement} navElement - Navigation element that was clicked
 */
function switchPanel(panelId, navElement) {
    // Hide all panels
    const allPanels = document.querySelectorAll('[data-panel]');
    allPanels.forEach(panel => {
        panel.style.display = 'none';
        panel.classList.remove('active');
    });

    // Show selected panel with fade-in animation
    const targetPanel = document.querySelector(`[data-panel="${panelId}"]`);
    if (targetPanel) {
        targetPanel.style.display = 'block';

        // Trigger reflow for animation
        void targetPanel.offsetWidth;

        targetPanel.classList.add('active');
    }

    // Update navigation active state
    if (window.dashboardNav) {
        window.dashboardNav.handleNavClick(navElement);
    }
}

/**
 * Smooth Scroll to Panel
 * Smoothly scrolls to panel when switching (useful for mobile)
 */
function scrollToPanel(panelId) {
    const panel = document.querySelector(`[data-panel="${panelId}"]`);
    if (panel) {
        panel.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Initialize Dashboard on DOM Ready
 */
document.addEventListener('DOMContentLoaded', function () {
    // Initialize navigation system
    window.dashboardNav = new DashboardNavigation();

    // Initialize theme switcher
    window.themeSwitcher = new ThemeSwitcher();

    // Initialize button enhancements
    initButtonEnhancements();

    // Add panel fade-in animations
    const panels = document.querySelectorAll('[data-panel]');
    panels.forEach(panel => {
        panel.style.opacity = '0';
        panel.style.transition = 'opacity 0.3s ease-in-out';

        if (panel.classList.contains('active') || panel.style.display !== 'none') {
            setTimeout(() => {
                panel.style.opacity = '1';
            }, 50);
        }
    });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show loading state on button
 * @param {HTMLElement} button - Button element
 * @param {string} loadingText - Optional loading text
 */
function setButtonLoading(button, loadingText = 'Loading...') {
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> ${loadingText}`;
    button.disabled = true;
    button.dataset.loading = 'true';
}

/**
 * Remove loading state from button
 * @param {HTMLElement} button - Button element
 */
function removeButtonLoading(button) {
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
    }
    button.disabled = false;
    button.dataset.loading = 'false';
}

/**
 * Add CSS for spinner animation
 */
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  button.loading {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  [data-panel] {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DashboardNavigation,
        ThemeSwitcher,
        switchPanel,
        setButtonLoading,
        removeButtonLoading
    };
}
