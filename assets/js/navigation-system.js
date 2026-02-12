/**
 * NavigationSystem.js
 * Production-Safe, Responsive, Multi-tenant Navigation Engine
 */

(function () {
    'use strict';

    const NavigationSystem = {
        state: {
            isInitialized: false,
            currentMenu: null,
            isMobileMenuOpen: false
        },

        config: {
            headerId: 'site-header',
            breakpoints: {
                desktop: 992
            }
        },

        init(data) {
            console.log("🚀 [NavigationSystem] Initializing...");
            this.state.currentMenu = data;
            this.render();
            this.setupListeners();
            this.state.isInitialized = true;
            window.dispatchEvent(new CustomEvent('navigation-ready'));
        },

        render() {
            if (!this.state.currentMenu) return;
            this.renderHeader(this.state.currentMenu.headerMenu || []);
            if (window.FooterSystem) {
                window.FooterSystem.render();
            }
        },

        renderHeader(menuItems) {
            const header = document.getElementById(this.config.headerId);
            if (!header) return;

            const enabledItems = menuItems.filter(item => item.enabled !== false);

            let html = `
                <div class="nav-container">
                    <div class="logo-area">
                        <a href="/" class="site-logo">
                            PRO<span class="accent">PLATFORM</span>
                        </a>
                    </div>
                    
                    <nav class="main-nav" id="main-nav">
                        <ul class="root-menu">
                            ${enabledItems.map(item => this.createMenuItem(item)).join('')}
                        </ul>
                    </nav>

                    <div class="nav-actions">
                        <button class="hamburger-toggle" aria-label="Toggle Menu" id="hamburger-btn">
                            <span class="bar"></span>
                            <span class="bar"></span>
                            <span class="bar"></span>
                        </button>
                    </div>
                </div>
                <div class="mobile-overlay" id="mobile-overlay"></div>
            `;

            header.innerHTML = html;
        },

        createMenuItem(item) {
            const hasChildren = item.children && item.children.length > 0;
            const label = this.escapeHTML(item.label);
            const link = this.validateUrl(item.link);
            const activeClass = window.location.pathname === item.link ? 'active' : '';

            if (hasChildren) {
                return `
                    <li class="menu-item dropdown ${activeClass}" data-id="${label}">
                        <div class="dropdown-trigger">
                            <a href="${link}" class="menu-link">${label}</a>
                            <span class="arrow-icon"></span>
                        </div>
                        <ul class="dropdown-menu">
                            ${item.children.filter(c => c.enabled !== false).map(child => `
                                <li class="sub-item">
                                    <a href="${this.validateUrl(child.link)}" class="sub-link">${this.escapeHTML(child.label)}</a>
                                </li>
                            `).join('')}
                        </ul>
                    </li>
                `;
            }

            return `
                <li class="menu-item ${activeClass}">
                    <a href="${link}" class="menu-link">${label}</a>
                </li>
            `;
        },

        setupListeners() {
            document.body.addEventListener('click', (e) => {
                const hamburger = e.target.closest('#hamburger-btn');
                const overlay = e.target.closest('#mobile-overlay');

                if (hamburger) {
                    this.toggleMobileMenu();
                } else if (overlay) {
                    this.closeMobileMenu();
                }

                const ddTrigger = e.target.closest('.dropdown-trigger');
                if (ddTrigger && window.innerWidth < this.config.breakpoints.desktop) {
                    e.preventDefault();
                    const item = ddTrigger.closest('.menu-item');
                    item.classList.toggle('expanded');
                }
            });

            document.body.addEventListener('click', (e) => {
                if (e.target.closest('.menu-link') && !e.target.closest('.dropdown-trigger')) {
                    this.closeMobileMenu();
                }
            });

            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if (window.innerWidth >= this.config.breakpoints.desktop) {
                        this.closeMobileMenu();
                    }
                }, 250);
            });
        },

        toggleMobileMenu() {
            this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;
            document.body.classList.toggle('menu-open', this.state.isMobileMenuOpen);
            const btn = document.getElementById('hamburger-btn');
            if (btn) btn.classList.toggle('active', this.state.isMobileMenuOpen);
        },

        closeMobileMenu() {
            this.state.isMobileMenuOpen = false;
            document.body.classList.remove('menu-open');
            const btn = document.getElementById('hamburger-btn');
            if (btn) btn.classList.remove('active');
        },

        escapeHTML(str) {
            if (!str) return '';
            return str.replace(/[&<>"']/g, function (m) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[m];
            });
        },

        validateUrl(url) {
            if (!url) return '#';
            if (url.toLowerCase().startsWith('javascript:')) return '#';
            return url;
        }
    };

    window.NavigationSystem = NavigationSystem;

})();
