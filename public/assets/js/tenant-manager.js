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
                        // Hardened Schema Validation
                        if (data && data.tenant && data.tenant.id && data.tenant.brand) {
                            this._tenant = data.tenant;
                            this.save();
                            this.applyBranding();
                            resolve(true);
                        } else {
                            reject('Invalid backup format: Missing core tenant data');
                        }
                    } catch (err) {
                        reject('JSON Parse Error: ' + err.message);
                    }
                };
                reader.readAsError = () => reject('File read error');
                reader.readAsText(file);
            });
        },

        /**
         * Get configuration for a specific site
         */
        getSiteConfig(siteId) {
            const site = this._tenant.sites.find(s => s.id === siteId) || this.getActiveSite();
            return {
                id: site.id,
                name: site.name,
                domain: site.domain,
                theme: site.theme || 'default',
                header: site.header || {},
                footer: site.footer || {},
                pages: site.pages || [],
                brand: this._tenant.brand
            };
        },

        /**
         * Check if a feature is enabled for the current plan
         */
        hasFeature(featureId) {
            const plan = this._tenant.plan || 'free';
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
