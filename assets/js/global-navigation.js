/**
 * ============================================
 * GLOBAL NAVIGATION SYSTEM - JavaScript
 * Dynamic menu injection, active page detection, mobile toggle
 * ============================================
 */

class GlobalNavigation {
    constructor(config = {}) {
        // Configuration with defaults
        this.config = {
            containerId: config.containerId || 'global-nav',
            logoText: config.logoText || 'Your Brand',
            logoHref: config.logoHref || '/',
            logoIcon: config.logoIcon || null,
            menuItems: config.menuItems || [],
            sticky: config.sticky !== false,
            hideOnScroll: config.hideOnScroll || false,
            activeDetection: config.activeDetection || 'auto', // 'auto', 'manual', 'path'
            theme: config.theme || 'light', // 'light', 'dark', 'auto'
            ...config
        };

        this.isMenuOpen = false;
        this.lastScrollY = 0;
        this.init();
    }

    /**
     * Initialize the navigation system
     */
    init() {
        this.render();
        this.bindEvents();
        this.detectActivePage();
        this.applyTheme();

        // Auto-hide on scroll if enabled
        if (this.config.hideOnScroll) {
            this.initScrollBehavior();
        }
    }

    /**
     * Render the complete navigation HTML
     */
    render() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error(`Navigation container #${this.config.containerId} not found`);
            return;
        }

        const headerClass = this.config.sticky ? 'global-nav-header' : 'global-nav-header static';

        container.innerHTML = `
      <a href="#main-content" class="skip-to-content">Skip to content</a>
      <header class="${headerClass}" role="banner">
        <nav class="nav-container" role="navigation" aria-label="Main navigation">
          <!-- Logo -->
          <a href="${this.config.logoHref}" class="nav-logo" aria-label="Home">
            ${this.config.logoIcon ? `<img src="${this.config.logoIcon}" alt="" class="nav-logo-icon">` : ''}
            <span>${this.config.logoText}</span>
          </a>

          <!-- Desktop Menu -->
          <ul class="nav-menu" role="menubar">
            ${this.renderMenuItems(this.config.menuItems)}
          </ul>

          <!-- Mobile Toggle -->
          <button class="nav-mobile-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </header>

      <!-- Mobile Overlay -->
      <div class="nav-mobile-overlay"></div>
    `;
    }

    /**
     * Render menu items recursively
     */
    renderMenuItems(items, isDropdown = false) {
        return items.map(item => {
            const hasDropdown = item.children && item.children.length > 0;
            const icon = item.icon ? `<i class="${item.icon}"></i>` : '';
            const badge = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
            const dropdownClass = hasDropdown ? 'has-dropdown' : '';
            const itemClass = isDropdown ? 'nav-dropdown-item' : 'nav-link';

            if (hasDropdown) {
                return `
          <li class="nav-item" role="none">
            <a href="${item.href || '#'}" 
               class="${itemClass} ${dropdownClass}" 
               data-page-id="${item.id || ''}"
               role="menuitem"
               aria-haspopup="true"
               ${item.target ? `target="${item.target}"` : ''}>
              ${icon}
              <span>${item.label}</span>
              ${badge}
            </a>
            <ul class="nav-dropdown" role="menu" aria-label="${item.label} submenu">
              ${this.renderMenuItems(item.children, true)}
            </ul>
          </li>
        `;
            }

            if (isDropdown) {
                return `
          <li role="none">
            <a href="${item.href}" 
               class="${itemClass}" 
               data-page-id="${item.id || ''}"
               role="menuitem"
               ${item.target ? `target="${item.target}"` : ''}>
              ${icon}
              <span>${item.label}</span>
              ${badge}
            </a>
          </li>
        `;
            }

            return `
        <li class="nav-item" role="none">
          <a href="${item.href}" 
             class="${itemClass}" 
             data-page-id="${item.id || ''}"
             role="menuitem"
             ${item.target ? `target="${item.target}"` : ''}>
            ${icon}
            <span>${item.label}</span>
            ${badge}
          </a>
        </li>
      `;
        }).join('');
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Mobile toggle
        const toggle = document.querySelector('.nav-mobile-toggle');
        const menu = document.querySelector('.nav-menu');
        const overlay = document.querySelector('.nav-mobile-overlay');

        if (toggle && menu && overlay) {
            toggle.addEventListener('click', () => this.toggleMobileMenu());
            overlay.addEventListener('click', () => this.closeMobileMenu());

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        }

        // Mobile dropdown toggles
        this.bindMobileDropdowns();

        // Scroll behavior
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                this.closeAllDropdowns();
            }
        });
    }

    /**
     * Handle mobile dropdown toggles
     */
    bindMobileDropdowns() {
        const dropdownLinks = document.querySelectorAll('.nav-link.has-dropdown');

        dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Only prevent default on mobile
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    const parent = link.closest('.nav-item');
                    parent.classList.toggle('dropdown-open');
                }
            });
        });

        // Submenu toggles
        const submenuItems = document.querySelectorAll('.nav-dropdown-item.has-submenu');
        submenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    item.classList.toggle('submenu-open');
                }
            });
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        const toggle = document.querySelector('.nav-mobile-toggle');
        const menu = document.querySelector('.nav-menu');
        const overlay = document.querySelector('.nav-mobile-overlay');

        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        toggle.setAttribute('aria-expanded', this.isMenuOpen);

        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (!this.isMenuOpen) return;

        this.isMenuOpen = false;
        document.querySelector('.nav-mobile-toggle').classList.remove('active');
        document.querySelector('.nav-menu').classList.remove('active');
        document.querySelector('.nav-mobile-overlay').classList.remove('active');
        document.querySelector('.nav-mobile-toggle').setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    /**
     * Close all open dropdowns
     */
    closeAllDropdowns() {
        document.querySelectorAll('.nav-item.dropdown-open').forEach(item => {
            item.classList.remove('dropdown-open');
        });
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const header = document.querySelector('.global-nav-header');
        if (!header) return;

        const currentScrollY = window.scrollY;

        // Add scrolled class for shadow effect
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide on scroll down, show on scroll up
        if (this.config.hideOnScroll) {
            if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }
        }

        this.lastScrollY = currentScrollY;
    }

    /**
     * Initialize scroll behavior
     */
    initScrollBehavior() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Detect and highlight active page
     */
    detectActivePage() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        const links = document.querySelectorAll('.nav-link, .nav-dropdown-item');

        links.forEach(link => {
            const href = link.getAttribute('href');
            const pageId = link.getAttribute('data-page-id');

            // Remove existing active class
            link.classList.remove('active');

            // Detection methods
            if (this.config.activeDetection === 'auto') {
                // Match by full path
                if (href === currentPath || href === currentPath + currentHash) {
                    link.classList.add('active');
                }
                // Match by page ID
                else if (pageId && document.body.dataset.pageId === pageId) {
                    link.classList.add('active');
                }
                // Match by filename
                else if (href && currentPath.endsWith(href.split('/').pop())) {
                    link.classList.add('active');
                }
            } else if (this.config.activeDetection === 'path') {
                if (href === currentPath) {
                    link.classList.add('active');
                }
            } else if (this.config.activeDetection === 'manual') {
                if (pageId && document.body.dataset.pageId === pageId) {
                    link.classList.add('active');
                }
            }
        });
    }

    /**
     * Apply theme
     */
    applyTheme() {
        if (this.config.theme === 'auto') {
            // Detect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', this.config.theme);
        }
    }

    /**
     * Update menu items dynamically
     */
    updateMenu(newItems) {
        this.config.menuItems = newItems;
        this.render();
        this.bindEvents();
        this.detectActivePage();
    }

    /**
     * Add a single menu item
     */
    addMenuItem(item, position = null) {
        if (position !== null) {
            this.config.menuItems.splice(position, 0, item);
        } else {
            this.config.menuItems.push(item);
        }
        this.updateMenu(this.config.menuItems);
    }

    /**
     * Remove a menu item by ID
     */
    removeMenuItem(id) {
        this.config.menuItems = this.config.menuItems.filter(item => item.id !== id);
        this.updateMenu(this.config.menuItems);
    }

    /**
     * Set active page manually
     */
    setActivePage(pageId) {
        const links = document.querySelectorAll('.nav-link, .nav-dropdown-item');
        links.forEach(link => {
            if (link.getAttribute('data-page-id') === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Destroy the navigation (cleanup)
     */
    destroy() {
        const container = document.getElementById(this.config.containerId);
        if (container) {
            container.innerHTML = '';
        }
        document.body.style.overflow = '';
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalNavigation;
}

// Make available globally
window.GlobalNavigation = GlobalNavigation;
