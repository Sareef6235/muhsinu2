/**
 * FooterSystem.js
 * SaaS Platform Dynamic Multi-tenant Footer Engine
 */

(function () {
    'use strict';

    const FooterSystem = {
        config: {
            containerId: 'site-footer'
        },

        init() {
            console.log("⚙️ [FooterSystem] Initializing...");
            this.render();
            this.setupListeners();
        },

        render() {
            const footer = document.getElementById(this.config.containerId);
            if (!footer) return;

            const siteConfig = window.TenantManager ? window.TenantManager.getActiveSite() : null;
            const footerData = (siteConfig && siteConfig.footer) ? siteConfig.footer : this.getDefaultData();

            footer.innerHTML = '';
            footer.className = 'footer';

            const container = document.createElement('div');
            container.className = 'footer-container container';

            const brandArea = this.renderBrand(footerData.brandText || 'ProPlatform');
            container.appendChild(brandArea);

            const menuArea = this.renderColumns(footerData.columns || []);
            container.appendChild(menuArea);

            const bottomArea = this.renderBottom(footerData.copyright || `© ${new Date().getFullYear()} ProPlatform`);
            container.appendChild(bottomArea);

            footer.appendChild(container);
        },

        renderBrand(text) {
            const brand = document.createElement('div');
            brand.className = 'footer-brand';
            const logo = document.createElement('div');
            logo.className = 'footer-logo';
            logo.textContent = this.escapeHTML(text);
            brand.appendChild(logo);
            return brand;
        },

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

        renderBottom(copyrightText) {
            const bottom = document.createElement('div');
            bottom.className = 'footer-bottom';
            const cp = document.createElement('div');
            cp.className = 'copyright';
            cp.textContent = this.escapeHTML(copyrightText);
            bottom.appendChild(cp);
            return bottom;
        },

        escapeHTML(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        validateLink(url) {
            if (!url) return '#';
            if (url.toLowerCase().startsWith('javascript:')) return '#';
            return url;
        },

        setupListeners() {
            window.addEventListener('storage', (e) => {
                if (e.key === 'saas_active_tenant_id' || e.key === 'active_site_id') {
                    this.render();
                }
            });
            window.addEventListener('site-switched', () => this.render());
        },

        getDefaultData() {
            return {
                brandText: "ProPlatform",
                copyright: "© 2026 Admin Panel. Multi-tenant Optimized.",
                columns: [
                    {
                        title: "Solutions",
                        links: [
                            { label: "Marketing", link: "#" },
                            { label: "Analytics", link: "#" }
                        ]
                    },
                    {
                        title: "Support",
                        links: [
                            { label: "Pricing", link: "#" },
                            { label: "Documentation", link: "#" }
                        ]
                    }
                ]
            };
        }
    };

    window.FooterSystem = FooterSystem;

})();
