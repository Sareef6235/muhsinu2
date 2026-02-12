/**
 * ============================================================================
 * TENANT MANAGER
 * ============================================================================
 * Handles multitenancy, white-labeling, and plans.
 * Tracks current tenant context and applies branding.
 * 
 * @namespace window.TenantManager
 * ============================================================================
 */

(function () {
    'use strict';

    const STORAGE_KEY = "saas_tenant_data";
    const ACTIVE_TENANT_KEY = "saas_active_tenant_id";

    const DEFAULT_TENANT = {
        id: "default_tenant",
        role: "owner",
        plan: "enterprise",
        brand: {
            name: "ProPlatform",
            logo: "",
            primaryColor: "#4f46e5",
            secondaryColor: "#1e1b4b",
            whiteLabel: true
        },
        sites: [
            { id: "site_1", name: "Main Website", domain: "main.local", theme: "default" }
        ],
        activeSiteId: "site_1"
    };

    const TenantManager = {
        _tenant: null,

        async init() {
            console.log("🏢 TenantManager: Initializing...");
            this.load();
            this.applyBranding();
        },

        load() {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this._tenant = JSON.parse(stored);
            } else {
                this._tenant = DEFAULT_TENANT;
                this.save();
            }
        },

        save() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this._tenant));
        },

        getTenant() {
            return this._tenant;
        },

        getSites() {
            return this._tenant.sites || [];
        },

        addSite(name) {
            const id = 'site_' + Date.now();
            this._tenant.sites.push({ id, name, domain: id + '.local', theme: 'default' });
            this.save();
            return id;
        },

        setActiveSite(id) {
            this._tenant.activeSiteId = id;
            this.save();
        },

        getActiveSite() {
            return this._tenant.sites.find(s => s.id === this._tenant.activeSiteId) || this._tenant.sites[0];
        },

        /**
         * Update tenant settings
         */
        updateTenant(data) {
            this._tenant = { ...this._tenant, ...data };
            this.save();
            this.applyBranding();
        },

        /**
         * Apply White-Label Branding to UI
         */
        applyBranding() {
            const brand = this._tenant.brand;
            const root = document.documentElement;

            // Apply CSS Variables
            root.style.setProperty('--brand-primary', brand.primaryColor);
            root.style.setProperty('--brand-secondary', brand.secondaryColor);

            // Update Logo placeholders
            const logos = document.querySelectorAll('[data-brand="logo"]');
            logos.forEach(el => {
                if (brand.logo) {
                    if (el.tagName === 'IMG') el.src = brand.logo;
                    else el.style.backgroundImage = `url(${brand.logo})`;
                }
            });

            // Update Name placeholders
            const names = document.querySelectorAll('[data-brand="name"]');
            names.forEach(el => el.textContent = brand.name);

            console.log(`✨ Branding Applied: ${brand.name}`);
        },

        /**
         * Export Full Tenant Context (Backup)
         */
        exportBackup() {
            const data = {
                timestamp: new Date().toISOString(),
                tenant: this._tenant,
                // In a real app, we'd include PageBuilder sections for all sites here
                // For now, we export the tenant structure
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${this._tenant.id}-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },

        /**
         * Import Full Tenant Context
         */
        async importBackup(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.tenant) {
                            this._tenant = data.tenant;
                            this.save();
                            this.applyBranding();
                            resolve(true);
                        } else {
                            reject('Invalid backup format');
                        }
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.readAsText(file);
            });
        },

        /**
         * Export Standalone Static Site
         */
        exportStaticSite() {
            const site = this.getActiveSite();
            const tenant = this._tenant;
            const sections = window.PageBuilder ? window.PageBuilder.getSections() : [];

            const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${site.name} | Powered by ProPlatform</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        :root { --brand-primary: ${tenant.brand.primaryColor}; --brand-secondary: ${tenant.brand.secondaryColor}; }
        body { font-family: sans-serif; }
        .section-hero { color: white; padding: 100px 0; text-align: center; }
        .glassmorphism { backdrop-filter: blur(10px); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }
    </style>
</head>
<body data-theme="light">
    <div id="render-target"></div>
    <script src="https://pro-platform-cdn.com/engine/v2/site-engine.min.js"></script>
    <script>
        window.siteData = {
            tenant: ${JSON.stringify(tenant)},
            site: ${JSON.stringify(site)},
            sections: ${JSON.stringify(sections)}
        };
        // In a real export, we would bundle the renderer logic here
        // For this demo, we simulate the rendering
        document.getElementById('render-target').innerHTML = '<h1>' + window.siteData.site.name + '</h1><p>Static Export Active</p>';
    </script>
</body>
</html>`;

            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `static-export-${site.id}.html`;
            a.click();
            URL.revokeObjectURL(url);
        },

        /**
         * Check if a feature is enabled for the current plan
         */
        hasFeature(featureId) {
            const plan = this._tenant.plan;
            const features = {
                free: ['basic_editor'],
                pro: ['basic_editor', 'drag_drop_builder', 'seo_tools'],
                agency: ['basic_editor', 'drag_drop_builder', 'seo_tools', 'multi_site'],
                enterprise: ['basic_editor', 'drag_drop_builder', 'seo_tools', 'multi_site', 'white_label', 'custom_domain']
            };

            return (features[plan] || []).includes(featureId);
        }
    };

    // Global Exposure
    window.TenantManager = TenantManager;

})();
