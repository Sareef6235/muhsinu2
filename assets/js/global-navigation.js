/**
 * ============================================
 * GLOBAL NAVIGATION SYSTEM - JavaScript
 * Consolidated & CMS-Aware Navigation Engine
 * ============================================
 */

class GlobalNavigation {
    constructor(config = {}) {
        this.config = {
            containerId: config.containerId || 'global-nav',
            logoText: config.logoText || 'MHMV 2026',
            logoHref: config.logoHref || 'index.html',
            logoIcon: config.logoIcon || null,
            menuItems: config.menuItems || [],
            sticky: config.sticky !== false,
            hideOnScroll: config.hideOnScroll || false,
            activeDetection: config.activeDetection || 'auto',
            theme: config.theme || 'light',
            ...config
        };

        this.isMenuOpen = false;
        this.lastScrollY = 0;
        this.basePath = this.calculateBasePath();
        this.init();
    }

    /**
     * Calculate relative path to root based on current location
     */
    calculateBasePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            // Match depth to go back to root
            if (path.match(/\/pages\/[^/]+\/[^/]+\//)) return '../../../';
            if (path.match(/\/pages\/[^/]+\//)) return '../../';
            return '../';
        }
        if (path.includes('/hn/')) return '../';
        return '';
    }

    /**
     * Resolve path relative to root
     */
    resolvePath(href) {
        if (!href || href === '#' || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
            return href;
        }
        // Remove leading slash if present to avoid absolute root resolution on local files
        const cleanHref = href.startsWith('/') ? href.substring(1) : href;
        return this.basePath + cleanHref;
    }

    /**
     * Initialize the navigation system
     */
    async init() {
        // 1. Try to fetch menu from CMS if no items provided
        if (this.config.menuItems.length === 0) {
            await this.loadFromCMS();
        }

        this.render();
        this.bindEvents();
        this.detectActivePage();
        this.applyTheme();

        if (this.config.hideOnScroll) {
            this.initScrollBehavior();
        }

        // Listen for CMS updates
        window.addEventListener('nav-updated', () => this.loadFromCMS().then(() => this.render()));
    }

    /**
     * Load menu items from NavigationCMS
     */
    async loadFromCMS() {
        try {
            // Attempt to use global if available (e.g. from index.html module script)
            let cms = window.NavigationCMS;

            // Fallback to dynamic import if not global
            if (!cms) {
                const module = await import(this.resolvePath('assets/js/nav-cms.js'));
                cms = module.NavigationCMS || module.default;
            }

            if (cms) {
                const fullMenu = cms.getMenu();

                // Check authentication for admin-only links
                let isAdmin = false;
                try {
                    let auth = window.LocalAuth;
                    if (!auth) {
                        const authModule = await import(this.resolvePath('assets/js/local-auth.js'));
                        auth = authModule.LocalAuth || authModule.default;
                    }
                    isAdmin = auth && auth.isAuthenticated();
                } catch (e) {
                    console.warn('Auth check failed:', e);
                }

                this.config.menuItems = fullMenu.filter(item => {
                    if (item.visible === false) return false;
                    if (item.adminOnly && !isAdmin) return false;
                    return true;
                });
            }
        } catch (e) {
            console.warn('NavigationCMS integration skipped:', e);
        }
    }

    /**
     * Render the complete navigation HTML
     */
    render() {
        const container = document.getElementById(this.config.containerId);
        if (!container) return;

        const headerClass = this.config.sticky ? 'global-nav-header' : 'global-nav-header static';
        const absoluteLogoHref = this.resolvePath(this.config.logoHref);

        container.innerHTML = `
            <a href="#main-content" class="skip-to-content">Skip to content</a>
            <header class="${headerClass}" role="banner">
                <nav class="nav-container" role="navigation" aria-label="Main navigation">
                    <a href="${absoluteLogoHref}" class="nav-logo" aria-label="Home">
                        ${this.config.logoIcon ? `<img src="${this.resolvePath(this.config.logoIcon)}" alt="" class="nav-logo-icon">` : ''}
                        <span>${this.config.logoText}</span>
                    </a>

                    <ul class="nav-menu" role="menubar">
                        ${this.renderMenuItems(this.config.menuItems)}
                    </ul>

                    <button class="nav-mobile-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
                        <span></span><span></span><span></span>
                    </button>
                </nav>
            </header>
            <div class="nav-mobile-overlay"></div>
        `;
    }

    /**
     * Render menu items recursively
     */
    renderMenuItems(items, isDropdown = false) {
        return items.map(item => {
            const hasDropdown = item.children && item.children.length > 0;
            const resolvedHref = this.resolvePath(item.href);
            const icon = item.icon ? `<i class="${item.icon}"></i>` : '';
            const badge = item.badge ? `<span class="nav-badge" id="${item.id}-badge">${item.badge}</span>` : '';
            const dropdownClass = hasDropdown ? 'has-dropdown' : '';
            const itemClass = isDropdown ? 'nav-dropdown-item' : 'nav-link';

            if (hasDropdown) {
                return `
                    <li class="nav-item" role="none">
                        <a href="${resolvedHref}" 
                           class="${itemClass} ${dropdownClass}" 
                           data-page-id="${item.id}"
                           role="menuitem"
                           aria-haspopup="true">
                            ${icon}<span>${item.label}</span>${badge}
                        </a>
                        <ul class="nav-dropdown" role="menu" aria-label="${item.label} submenu">
                            ${this.renderMenuItems(item.children, true)}
                        </ul>
                    </li>
                `;
            }

            return `
                <li class="nav-item" role="none">
                    <a href="${resolvedHref}" 
                       class="${itemClass}" 
                       data-page-id="${item.id}"
                       role="menuitem"
                       ${item.target ? `target="${item.target}"` : ''}>
                        ${icon}<span>${item.label}</span>${badge}
                    </a>
                </li>
            `;
        }).join('');
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        const toggle = document.querySelector('.nav-mobile-toggle');
        const overlay = document.querySelector('.nav-mobile-overlay');

        if (toggle) toggle.onclick = () => this.toggleMobileMenu();
        if (overlay) overlay.onclick = () => this.closeMobileMenu();

        // Handle path clicks for SPA-like feel or just normal highlighting
        this.bindMobileDropdowns();
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) this.closeAllDropdowns();
        });
    }

    bindMobileDropdowns() {
        document.querySelectorAll('.nav-link.has-dropdown').forEach(link => {
            link.onclick = (e) => {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    link.closest('.nav-item').classList.toggle('dropdown-open');
                }
            };
        });
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        const toggle = document.querySelector('.nav-mobile-toggle');
        const menu = document.querySelector('.nav-menu');
        const overlay = document.querySelector('.nav-mobile-overlay');

        toggle?.classList.toggle('active');
        menu?.classList.toggle('active');
        overlay?.classList.toggle('active');
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        if (this.isMenuOpen) this.toggleMobileMenu();
    }

    closeAllDropdowns() {
        document.querySelectorAll('.nav-item.dropdown-open').forEach(el => el.classList.remove('dropdown-open'));
    }

    handleScroll() {
        const header = document.querySelector('.global-nav-header');
        if (!header) return;

        const currentScrollY = window.scrollY;
        header.classList.toggle('scrolled', currentScrollY > 50);

        if (this.config.hideOnScroll) {
            if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }
        }
        this.lastScrollY = currentScrollY;
    }

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

    detectActivePage() {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('.nav-link, .nav-dropdown-item');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            // Simplified active detection
            const isHome = (currentPath === '/' || currentPath.endsWith('index.html')) && (href.endsWith('index.html') || href === './');
            const matchExact = currentPath.endsWith(href.replace('../', '').replace('./', ''));

            if (isHome || (href !== 'index.html' && matchExact)) {
                link.classList.add('active');
                // Open parent dropdown if nested
                link.closest('.nav-item')?.classList.add('parent-active');
            }
        });
    }

    applyTheme() {
        const theme = this.config.theme === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : this.config.theme;
        document.documentElement.setAttribute('data-theme', theme);
    }
}

// Initialize on DOM load if container exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('global-nav')) {
        window.Navigation = new GlobalNavigation();
    }
});

window.GlobalNavigation = GlobalNavigation;
