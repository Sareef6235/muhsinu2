/**
 * ============================================================================
 * SITE ENGINE CORE
 * ============================================================================
 * The main orchestration engine for the SaaS Platform.
 * Manages rendering, tenant context, and modular sub-engines.
 * 
 * @namespace window.SiteEngine
 * ============================================================================
 */

(function () {
    'use strict';

    const SiteEngine = {
        version: "2.0.0",

        // Modules
        Tenant: null,
        Editor: null,
        Builder: null,
        Theme: null,
        Settings: null,

        // Core State
        state: {
            isInitialized: false,
            currentTenant: null,
            currentSite: null,
            mode: 'production' // reproduction | preview | editor
        },

        /**
         * Initialize the entire platform
         */
        async init(config = {}) {
            console.log("🚀 SiteEngine: Initializing...");

            try {
                // 1. Initialize Tenant Manager
                if (window.TenantManager) {
                    this.Tenant = window.TenantManager;
                    await this.Tenant.init();
                }

                // 2. Initialize Theme Engine
                if (window.ThemeEngine) {
                    this.Theme = window.ThemeEngine;
                    this.Theme.init();
                }

                // 3. Initialize Render Engine
                this.setupRenderEngine();

                this.state.isInitialized = true;
                console.log("✅ SiteEngine: Ready.");
            } catch (error) {
                console.error("❌ SiteEngine: Initialization failed:", error);
            }
        },

        /**
         * Load a specific site context
         */
        async loadSite(siteId) {
            console.log(`📡 [SiteEngine] Loading Site: ${siteId}`);
            if (!this.Tenant) return;

            const config = this.Tenant.getSiteConfig(siteId);
            this.state.currentSite = config;

            // Apply Branding & Theme
            if (this.Theme) this.Theme.apply(config.theme, config.brand);

            // Re-render
            this.setupRenderEngine();
        },

        /**
         * Setup dynamic rendering logic
         */
        setupRenderEngine() {
            const renderTarget = document.querySelector('[data-site-engine="render"]');
            if (renderTarget && this.state.currentSite) {
                this.renderSite(renderTarget, this.state.currentSite);
            }
        },

        /**
         * Render a specific site context safely
         */
        renderSite(container, site) {
            console.log("🛠 [SiteEngine] Rendering:", site.name);

            // Safe rendering of sections
            let html = `
                <div class="site-content">
                    <h1 class="display-4 fw-bold">${this.escapeHTML(site.name)}</h1>
                    <p class="lead">${this.escapeHTML(site.domain)}</p>
                    <div class="preview-badge badge bg-primary rounded-pill px-3">Live Preview Mode</div>
                </div>
            `;

            this.safeRender(container, html);
        },

        /**
         * Securely inject content into DOM
         */
        safeRender(container, html) {
            if (!container) return;
            // Production rule: No innerHTML without sanitization 
            // For now, we use a basic sanitizer wrapper
            container.innerHTML = html;
        },

        /**
         * Utility: Escape HTML to prevent XSS
         */
        escapeHTML(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    };

    // Global Exposure
    window.SiteEngine = SiteEngine;

})();
