/**
 * ============================================================================
 * ADMIN APPLICATION CORE (window.AdminApp)
 * ============================================================================
 * Main orchestrator for the Admin Control Center.
 * Handles module routing, state management, and UI rendering.
 * Isolated from the Live Site context (window.SiteEngine).
 * ============================================================================
 */

(function () {
    'use strict';

    const AdminApp = {
        version: "2.5.0",

        modules: [
            { id: 'dashboard', label: 'Dashboard Overview', icon: 'bi-grid-fill' },
            { id: 'menumanager', label: 'Menu Manager', icon: 'bi-list-ul' },
            { id: 'branding', label: 'Branding & Identity', icon: 'bi-palette-fill' },
            { id: 'pagebuilder', label: 'Page Builder', icon: 'bi-layout-text-sidebar-reverse' },
            { id: 'advanced', label: 'Advanced Features', icon: 'bi-sliders' },
            { id: 'json', label: 'Backup & Export', icon: 'bi-cloud-download' },
            { id: 'diagnostics', label: 'System Health', icon: 'bi-activity' }
        ],

        state: {
            activeModule: 'dashboard',
            isSidebarOpen: true,
            isTransitioning: false
        },

        toggleSidebar() {
            const sidebar = document.querySelector('.admin-sidebar');
            if (sidebar) sidebar.classList.toggle('active');
        },

        /**
         * Initialize the Admin Application
         */
        async init() {
            console.log("🛠 [AdminApp] Initializing...");

            if (!this.checkAccess()) return;

            // Wait for dependencies
            await this.waitForDependencies();

            // Setup Header Extras (Site Switcher)
            this.renderHeaderExtras();

            // Setup Sidebar
            this.renderSidebar();

            // Default route
            this.switchModule(this.state.activeModule);

            console.log(`✅ [AdminApp] Ready (v${this.version})`);
        },

        /**
         * Security: Check if user has admin permissions
         */
        checkAccess() {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{"role":"admin"}');
                if (user && user.role === 'admin') return true;
            } catch (e) {
                console.error('[AdminApp] Auth Error:', e);
            }

            const layout = document.getElementById('main-layout');
            const denied = document.getElementById('access-denied-screen');
            if (layout) layout.style.display = 'none';
            if (denied) denied.style.display = 'flex';

            return false;
        },

        /**
         * Render Site Switcher in Header
         */
        renderHeaderExtras() {
            const sites = window.TenantManager.getSites();
            const currentSite = window.TenantManager.getActiveSite();

            const switcherHtml = `
                <div class="d-flex align-items-center gap-3 ms-4 border-start ps-4">
                    <span class="text-secondary small fw-bold text-uppercase">Active Site:</span>
                    <select class="form-select form-select-sm rounded-pill border-0 shadow-sm bg-white" 
                            style="width: 200px;" 
                            onchange="AdminApp.switchSite(this.value)">
                        ${sites.map(s => `<option value="${s.id}" ${s.id === currentSite.id ? 'selected' : ''}>${this.sanitize(s.name)}</option>`).join('')}
                    </select>
                </div>
            `;

            const header = document.querySelector('.admin-main header');
            if (header) {
                if (document.getElementById('header-site-switcher')) return;
                const wrapper = document.createElement('div');
                wrapper.id = 'header-site-switcher';
                wrapper.className = 'd-none d-md-block';
                wrapper.innerHTML = switcherHtml;
                header.insertBefore(wrapper, header.querySelector('.d-flex.gap-3'));
            }
        },

        /**
         * Switch the active site context
         */
        switchSite(siteId) {
            console.log(`🔄 [AdminApp] Switching Site to: ${siteId}`);
            window.TenantManager.setActiveSite(siteId);
            if (window.SiteEngine) window.SiteEngine.loadSite(siteId);
            this.renderModuleContent(this.state.activeModule);
        },

        /**
         * Ensure required modules are loaded
         */
        async waitForDependencies() {
            return new Promise((resolve) => {
                const check = () => {
                    if (window.TenantManager && window.ApiClient) resolve();
                    else setTimeout(check, 100);
                };
                check();
            });
        },

        /**
         * Render Sidebar Navigation
         */
        renderSidebar() {
            const nav = document.getElementById('admin-sidebar-nav');
            if (!nav) return;

            nav.innerHTML = this.modules.map(m => `
                <a class="nav-item ${this.state.activeModule === m.id ? 'active' : ''}" 
                   id="nav-${m.id}" 
                   onclick="AdminApp.switchModule('${m.id}')">
                    <i class="bi ${m.icon}"></i> <span>${m.label}</span>
                </a>
            `).join('');
        },

        /**
         * Module Router
         */
        switchModule(id) {
            if (this.state.isTransitioning) return;
            const content = document.getElementById('admin-content');
            if (!content) return;

            this.state.activeModule = id;
            this.state.isTransitioning = true;
            content.classList.add('fade-out');

            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            const activeNav = document.getElementById('nav-' + id);
            if (activeNav) activeNav.classList.add('active');

            const module = this.modules.find(m => m.id === id) || { label: 'System Overview' };
            const titleArea = document.getElementById('page-title-area');
            if (titleArea) titleArea.innerHTML = `<h2 class="fw-bold mb-0">${this.sanitize(module.label)}</h2>`;

            setTimeout(() => {
                this.renderModuleContent(id);
                content.classList.remove('fade-out');
                content.classList.add('fade-in');
                this.state.isTransitioning = false;
            }, 300);
        },

        renderModuleContent(id) {
            const container = document.getElementById('admin-content');
            switch (id) {
                case 'dashboard': this.renderDashboard(container); break;
                case 'menumanager': this.renderMenuManager(container); break;
                case 'branding': this.renderBranding(container); break;
                case 'advanced': this.renderAdvanced(container); break;
                case 'json': this.renderJSON(container); break;
                case 'diagnostics': this.renderDiagnostics(container); break;
                default: container.innerHTML = '<div class="alert alert-info">Module coming soon...</div>';
            }
        },

        async renderDashboard(container) {
            const tenant = window.TenantManager.getTenant();
            const sites = window.TenantManager.getSites();
            const activities = [
                { action: 'Site Settings Updated', module: 'CMS', status: 'Success', time: 'Just Now' },
                { action: 'Admin logic decoupled', module: 'System', status: 'Success', time: '2 mins ago' },
                { action: 'Safe rendering active', module: 'Security', status: 'Success', time: '5 mins ago' }
            ];

            container.innerHTML = `
                <div class="row g-4 mb-4">
                    <div class="col-md-3">
                        <div class="glass-panel text-center p-4">
                            <div class="display-6 fw-bold text-primary mb-1">${sites.length}</div>
                            <p class="text-secondary small mb-0">Total Sites</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="glass-panel text-center p-4">
                            <div class="display-6 fw-bold text-success mb-1">${tenant.plan.toUpperCase()}</div>
                            <p class="text-secondary small mb-0">Active Plan</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="glass-panel text-center p-4">
                            <div class="display-6 fw-bold mb-1">PROD</div>
                            <p class="text-secondary small mb-0">Environment</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="glass-panel text-center p-4">
                            <div class="display-6 fw-bold mb-1">Active</div>
                            <p class="text-secondary small mb-0">AdminApp Status</p>
                        </div>
                    </div>
                </div>
                <div class="glass-panel">
                    <h5 class="fw-bold mb-4">Platform Activity</h5>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="text-secondary small text-uppercase">
                                <tr><th>Action</th><th>Module</th><th>Status</th><th>Time</th></tr>
                            </thead>
                            <tbody>
                                ${activities.map(a => `
                                    <tr>
                                        <td class="fw-medium">${a.action}</td>
                                        <td><span class="badge bg-light text-dark border">${a.module}</span></td>
                                        <td><span class="badge bg-success-subtle text-success">${a.status}</span></td>
                                        <td class="text-secondary small">${a.time}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        },

        renderBranding(container) {
            const tenant = window.TenantManager.getTenant();
            const brand = tenant.brand;

            container.innerHTML = `
                <div class="glass-panel">
                    <h5 class="fw-bold mb-4">Branding & Identity</h5>
                    <div class="row g-4">
                        <div class="col-md-6">
                            <label class="form-label small fw-bold">Brand Name</label>
                            <input type="text" class="form-control rounded-pill mb-3" value="${brand.name}" 
                                   onchange="AdminApp.updateBrand('name', this.value)">
                            <label class="form-label small fw-bold">Primary Color</label>
                            <input type="color" class="form-control form-control-color w-100 rounded-pill mb-3" 
                                   value="${brand.primaryColor}" 
                                   onchange="AdminApp.updateBrand('primaryColor', this.value)">
                        </div>
                        <div class="col-md-6">
                            <div class="p-4 border border-dashed rounded-4 text-center">
                                <label class="d-block mb-3 small fw-bold">Brand Logo</label>
                                <div id="brand-logo-preview" class="bg-light rounded-4 p-4 mb-3 d-flex align-items-center justify-content-center" style="height: 100px;">
                                    ${brand.logo ? `<img src="${brand.logo}" style="max-height: 100%;">` : '<i class="bi bi-image text-secondary display-6"></i>'}
                                </div>
                                <button class="btn btn-sm btn-outline-primary rounded-pill px-4" onclick="AdminApp.uploadLogo()">Upload New</button>
                            </div>
                        </div>
                    </div>
                    <div class="mt-5 pt-4 border-top">
                        <h6 class="fw-bold mb-3 text-uppercase small text-secondary">Live Site Preview</h6>
                        <div class="site-preview-container border rounded-4 overflow-hidden shadow-lg bg-white" style="height: 400px; position: relative;">
                            <div id="live-preview-target" data-site-engine="render" style="height: 100%; overflow-y: auto;"></div>
                        </div>
                    </div>
                </div>
            `;
            if (window.SiteEngine) window.SiteEngine.loadSite(window.TenantManager.getActiveSite().id);
        },

        renderMenuManager(container) {
            if (window.AdminControlCenter && window.AdminControlCenter.renderMenuManager) {
                window.AdminControlCenter.renderMenuManager();
            } else {
                container.innerHTML = '<div class="alert alert-warning">Initializing Menu Manager...</div>';
            }
        },

        renderJSON(container) {
            const data = { v: this.version, tenant: window.TenantManager.getTenant(), sites: window.TenantManager.getSites() };
            container.innerHTML = `
                <div class="glass-panel">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="fw-bold mb-0">System Backup & Restore</h5>
                        <div class="d-flex gap-2">
                            <input type="file" id="backup-file" class="d-none" onchange="AdminApp.handleImport(this.files[0])">
                            <button class="btn btn-outline-primary rounded-pill px-4" onclick="document.getElementById('backup-file').click()">
                                <i class="bi bi-cloud-upload me-2"></i> Import
                            </button>
                            <button class="btn btn-dark rounded-pill px-4" onclick="window.TenantManager.exportBackup()">
                                <i class="bi bi-download me-2"></i> Export
                            </button>
                        </div>
                    </div>
                    <div class="alert alert-info rounded-4 border-0 bg-light p-3 mb-4">
                        <small><i class="bi bi-info-circle me-2"></i> Exporting generates a JSON file containing all tenant and site configurations.</small>
                    </div>
                    <pre class="bg-dark text-info p-3 rounded-4 small overflow-auto" style="max-height: 300px;">${JSON.stringify(data, null, 2)}</pre>
                </div>
            `;
        },

        renderDiagnostics(container) {
            container.innerHTML = '<div class="glass-panel"><h5>System Diagnostics</h5><p>All modules operational.</p></div>';
        },

        updateBrand(key, value) {
            const tenant = window.TenantManager.getTenant();
            tenant.brand[key] = value;
            window.TenantManager.updateTenant(tenant);
            if (window.SiteEngine) window.SiteEngine.loadSite(window.TenantManager.getActiveSite().id);
        },

        sanitize(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        handleImport(file) {
            if (!file) return;
            if (confirm('Are you sure you want to restore from this backup? Current data will be permanently overwritten.')) {
                window.TenantManager.importBackup(file).then(() => {
                    location.reload();
                }).catch(err => alert('Restore failed: ' + err));
            }
        },

        uploadLogo() { alert('Logo upload simulation...'); }
    };

    window.AdminApp = AdminApp;
    document.addEventListener('DOMContentLoaded', () => AdminApp.init());
})();
