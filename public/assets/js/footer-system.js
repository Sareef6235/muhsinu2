/**
 * FooterSystem.js
 * SaaS Platform Dynamic Multi-tenant Footer Engine
 * 
 * Features:
 * - Direct integration with TenantManager
 * - Safe DOM creation (no innerHTML for user data)
 * - Multi-column responsive layout support
 * - XSS Protection and URL Validation
 * - Automatic re-rendering on site switch
 */

(function () {
    'use strict';

    const FooterSystem = {
        config: {
            containerId: 'site-footer',
            mobileBreakpoint: 768
        },

        init() {
            console.log("⚙️ [FooterSystem] Initializing...");
            this.render();
            this.setupListeners();
        },

        /**
         * Main render entry point
         */
        render() {
            const footer = document.getElementById(this.config.containerId);
            if (!footer) {
                console.warn(`[FooterSystem] Container #${this.config.containerId} not found.`);
                return;
            }

            // Fetch dynamic data from TenantManager
            const siteConfig = window.TenantManager ? window.TenantManager.getActiveSite() : null;
            const footerData = (siteConfig && siteConfig.footer) ? siteConfig.footer : this.getDefaultData();

            // Clear previous content
            footer.innerHTML = '';
            footer.className = 'footer';

            const container = document.createElement('div');
            container.className = 'footer-container container';

            // 1. Render Brand Section
            const brandArea = this.renderBrand(footerData.brandText || 'ProPlatform');
            container.appendChild(brandArea);

            // 2. Render Menus (Columns)
            const menuArea = this.renderColumns(footerData.columns || []);
            container.appendChild(menuArea);

            // 3. Render Bottom Section
            const bottomArea = this.renderBottom(footerData.copyright || `© ${new Date().getFullYear()} ProPlatform`);
            container.appendChild(bottomArea);

            footer.appendChild(container);
        },

        /**
         * Render Brand/Logo section
         */
        renderBrand(text) {
            const brand = document.createElement('div');
            brand.className = 'footer-brand';

            const logo = document.createElement('div');
            logo.className = 'footer-logo';
            logo.textContent = this.escapeHTML(text);

            brand.appendChild(logo);
            return brand;
        },

        /**
         * Render Multi-column Menu area
         */
        renderColumns(columns) {
            const menusArea = document.createElement('div');
            menusArea.className = 'footer-menus';

            columns.forEach(col => {
                const column = document.createElement('div');
                column.className = 'footer-column';

                const title = document.createElement('h4');
                title.textContent = this.escapeHTML(col.title);
                column.appendChild(title);

                const ul = document.createElement('ul');
                (col.links || []).forEach(linkItem => {
                    if (linkItem.enabled === false) return;

                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.textContent = this.escapeHTML(linkItem.label);
                    a.href = this.validateLink(linkItem.link);

                    li.appendChild(a);
                    ul.appendChild(li);
                });

                column.appendChild(ul);
                menusArea.appendChild(column);
            });

            return menusArea;
        },

        /**
         * Render Copyright and Bottom links
         */
        renderBottom(copyrightText) {
            const bottom = document.createElement('div');
            bottom.className = 'footer-bottom';

            const cp = document.createElement('div');
            cp.className = 'copyright';
            cp.textContent = this.escapeHTML(copyrightText);

            bottom.appendChild(cp);
            return bottom;
        },

        /**
         * Production Safety: Escape HTML
         */
        escapeHTML(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        /**
         * Production Safety: Validate Links
         */
        validateLink(url) {
            if (!url) return '#';
            if (url.toLowerCase().startsWith('javascript:')) {
                console.warn(`[FooterSystem] Blocked potentially unsafe link: ${url}`);
                return '#';
            }
            return url;
        },

        /**
         * Re-render on site switching
         */
        setupListeners() {
            // Listen for site switch events if available
            window.addEventListener('storage', (e) => {
                if (e.key === 'saas_active_tenant_id' || e.key === 'active_site_id') {
                    this.render();
                }
            });

            // Fallback for internal events
            window.addEventListener('site-switched', () => this.render());
        },

        /**
         * Default Fallback Data
         */
        getDefaultData() {
            return {
                brandText: "ProPlatform",
                copyright: "© 2026 Admin Panel. Multi-tenant Optimized.",
                columns: [
                    {
                        title: "Solutions",
                        links: [
                            { label: "Marketing", link: "#" },
                            { label: "Analytics", link: "#" },
                            { label: "Commerce", link: "#" }
                        ]
                    },
                    {
                        title: "Support",
                        links: [
                            { label: "Pricing", link: "#" },
                            { label: "Documentation", link: "#" },
                            { label: "Guides", link: "#" }
                        ]
                    },
                    {
                        title: "Company",
                        links: [
                            { label: "About", link: "#" },
                            { label: "Blog", link: "#" },
                            { label: "Contact", link: "#" }
                        ]
                    }
                ]
            };
        }
    };

    // Global Exposure
    window.FooterSystem = FooterSystem;

})();
