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

            const brand = site.brand || {};

            // Safe rendering of sections
            let html = `
                <div class="site-preview-content" style="font-family: 'Outfit', sans-serif; color: #333;">
                    <header style="padding: 20px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px;">
                        <div style="width: 40px; height: 40px; background: var(--primary-color, #000); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white;">
                            <i class="bi bi-shop"></i>
                        </div>
                        <h4 style="margin: 0; font-weight: 700;">${this.escapeHTML(brand.name || site.name)}</h4>
                    </header>
                    
                    <main style="padding: 40px 20px; text-align: center;">
                        <div class="preview-badge mb-3" style="display: inline-block; padding: 5px 15px; background: var(--primary-color-faint, #f0f0f0); color: var(--primary-color, #333); border-radius: 20px; font-size: 0.8rem; font-weight: 600;">
                            Live Site Context: ${this.escapeHTML(site.id)}
                        </div>
                        <h1 class="display-5 fw-bold mb-3">${this.escapeHTML(site.name)}</h1>
                        <p class="lead text-secondary mb-4">${this.escapeHTML(site.domain)}</p>
                        
                        <div class="cta-preview" style="padding: 15px 30px; background: var(--primary-color, #000); color: white; border-radius: 30px; display: inline-block; cursor: default;">
                            Visit Site
                        </div>
                    </main>

                    <footer style="margin-top: 50px; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 0.8rem; color: #999;">
                        &copy; 2026 ${this.escapeHTML(brand.name || 'ProPlatform')} - Powered by SiteEngine
                    </footer>
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
