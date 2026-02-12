/**
 * NavigationSystem.js
 * Production-Safe, Responsive, Multi-tenant Navigation Engine
 * 
 * Features:
 * - Dynamic Header & Footer rendering
 * - Multi-tenant data support
 * - Clean CSS Grid/Flexbox layouts
 * - Smooth Vanilla JS interactions
 * - XSS Protection & URL Validation
 */

(function () {
    'use strict';

    const NavigationSystem = {
        state: {
            isInitialized: false,
            currentMenu: null,
            isMobileMenuOpen: false,
            openDropdownId: null
        },

        config: {
            headerId: 'site-header',
            footerId: 'site-footer',
            breakpoints: {
                desktop: 992,
                tablet: 768
            }
        },

        /**
         * Initialize the Navigation System
         * @param {Object} data - Menu data object { headerMenu: [], footerMenu: [] }
         */
        init(data) {
            console.log("🚀 [NavigationSystem] Initializing...");
            this.state.currentMenu = data;

            this.render();
            this.setupListeners();

            this.state.isInitialized = true;
            window.dispatchEvent(new CustomEvent('navigation-ready'));
        },

        /**
         * Re-render based on new data (Multi-tenant switch)
         * @param {Object} data - New menu data
         */
        update(data) {
            this.state.currentMenu = data;
            this.render();
        },

        /**
         * Main render orchestration
         */
        render() {
            if (!this.state.currentMenu) return;

            this.renderHeader(this.state.currentMenu.headerMenu || []);

            // Delegate Footer rendering to the specialized FooterSystem if available
            if (window.FooterSystem) {
                window.FooterSystem.render();
            } else {
                this.renderFooter(this.state.currentMenu.footerMenu || []);
            }
        },

        /**
         * Render Responsive Header
         */
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

        /**
         * Create individual menu item (Header)
         */
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

        /**
         * Render Responsive Footer
         */
        renderFooter(menuItems) {
            const footer = document.getElementById(this.config.footerId);
            if (!footer) return;

            const enabledItems = menuItems.filter(item => item.enabled !== false);

            let html = `
                <div class="footer-container">
                    <div class="footer-grid">
                        <div class="footer-brand">
                            <div class="footer-logo">PRO<span class="accent">PLATFORM</span></div>
                            <p>Premium multi-tenant SaaS infrastructure for modern educational institutions.</p>
                            <div class="footer-social">
                                <a href="#" class="social-icon" aria-label="Twitter"><i class="ph-bold ph-twitter-logo"></i></a>
                                <a href="#" class="social-icon" aria-label="LinkedIn"><i class="ph-bold ph-linkedin-logo"></i></a>
                                <a href="#" class="social-icon" aria-label="GitHub"><i class="ph-bold ph-github-logo"></i></a>
                            </div>
                        </div>

                        <div class="footer-menu">
                            <h4>Quick Links</h4>
                            <ul>
                                ${enabledItems.map(item => `
                                    <li><a href="${this.validateUrl(item.link)}">${this.escapeHTML(item.label)}</a></li>
                                `).join('')}
                            </ul>
                        </div>

                        <div class="footer-contact">
                            <h4>Contact Us</h4>
                            <p><i class="ph-bold ph-envelope"></i> support@proplatform.com</p>
                            <p><i class="ph-bold ph-phone"></i> +91 6235989198</p>
                            <p><i class="ph-bold ph-map-pin"></i> Vengara, Kerala, India</p>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <div class="copyright">&copy; 2026 ProPlatform Media. All rights reserved.</div>
                    </div>
                </div>
            `;

            footer.innerHTML = html;
        },

        /**
         * Interaction Listeners
         */
        setupListeners() {
            // Hamburger Toggle
            document.body.addEventListener('click', (e) => {
                const hamburger = e.target.closest('#hamburger-btn');
                const overlay = e.target.closest('#mobile-overlay');

                if (hamburger) {
                    this.toggleMobileMenu();
                } else if (overlay) {
                    this.closeMobileMenu();
                }

                // Dropdown Toggle (Mobile Only or Click Trigger)
                const ddTrigger = e.target.closest('.dropdown-trigger');
                if (ddTrigger && window.innerWidth < this.config.breakpoints.desktop) {
                    e.preventDefault();
                    const item = ddTrigger.closest('.menu-item');
                    item.classList.toggle('expanded');
                }
            });

            // Close on Link Click
            document.body.addEventListener('click', (e) => {
                if (e.target.closest('.menu-link') && !e.target.closest('.dropdown-trigger')) {
                    this.closeMobileMenu();
                }
            });

            // Debounced Resize
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

        /**
         * Security: Escape HTML
         */
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

        /**
         * Security: Validate URL
         */
        validateUrl(url) {
            if (!url) return '#';
            if (url.toLowerCase().startsWith('javascript:')) return '#';
            return url;
        }
    };

    // Global Exposure
    window.NavigationSystem = NavigationSystem;

})();
