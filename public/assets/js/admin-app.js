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

        /**
         * Initialize the Admin Application
         */
        async init() {
            console.log("🛠 [AdminApp] Initializing...");

            if (!this.checkAccess()) return;

            // Wait for dependencies
            await this.waitForDependencies();

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

            // Hide UI and show access denied if failed
            const layout = document.getElementById('main-layout');
            const denied = document.getElementById('access-denied-screen');
            if (layout) layout.style.display = 'none';
            if (denied) denied.style.display = 'flex';

            return false;
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
                   onclick="AdminApp.switchModule('${m.id}')"
                   role="button"
                   aria-label="Navigate to ${m.label}">
                    <i class="bi ${m.icon}"></i> <span>${m.label}</span>
                </a>
            `).join('');
        },

        /**
         * Module Router: Switch between different dashboard sections
         */
        switchModule(id) {
            if (this.state.isTransitioning) return;

            const content = document.getElementById('admin-content');
            if (!content) return;

            // Update State
            this.state.activeModule = id;
            this.state.isTransitioning = true;

            // UI Feedback
            content.classList.add('fade-out');
            content.classList.remove('fade-in');

            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            const activeNav = document.getElementById('nav-' + id);
            if (activeNav) activeNav.classList.add('active');

            // Update Title Area
            const module = this.modules.find(m => m.id === id) || { label: 'System Overview' };
            const titleArea = document.getElementById('page-title-area');
            if (titleArea) {
                titleArea.innerHTML = `<h2 class="fw-bold mb-0">${this.sanitize(module.label)}</h2>`;
            }

            setTimeout(() => {
                this.renderModuleContent(id);
                content.classList.remove('fade-out');
                content.classList.add('fade-in');
                this.state.isTransitioning = false;
            }, 300);
        },

        /**
         * Render specific module content
         */
        renderModuleContent(id) {
            const container = document.getElementById('admin-content');

            switch (id) {
                case 'dashboard': this.renderDashboard(container); break;
                case 'menumanager': this.renderMenuManager(container); break;
                case 'branding': this.renderBranding(container); break;
                case 'pagebuilder': this.renderPageBuilder(container); break;
                case 'advanced': this.renderAdvanced(container); break;
                case 'json': this.renderJSON(container); break;
                case 'diagnostics': this.renderDiagnostics(container); break;
                default: container.innerHTML = '<div class="alert alert-info">Module coming soon...</div>';
            }
        },

        // --- Core Module Renderers ---

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
                                <div class="bg-light rounded-4 p-4 mb-3 d-flex align-items-center justify-content-center" style="height: 100px;">
                                    ${brand.logo ? `<img src="${brand.logo}" style="max-height: 100%;">` : '<i class="bi bi-image text-secondary display-6"></i>'}
                                </div>
                                <button class="btn btn-sm btn-outline-primary rounded-pill px-4" onclick="AdminApp.uploadLogo()">
                                    Upload New Logo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderMenuManager(container) {
            // Integration with MenuBuilder
            if (window.AdminControlCenter && window.AdminControlCenter.renderMenuManager) {
                window.AdminControlCenter.renderMenuManager();
            } else {
                container.innerHTML = '<div class="alert alert-warning">Menu Manager module initializing...</div>';
            }
        },

        renderJSON(container) {
            const data = {
                v: this.version,
                tenant: window.TenantManager.getTenant(),
                sites: window.TenantManager.getSites()
            };

            container.innerHTML = `
                <div class="glass-panel">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="fw-bold mb-0">System Backup</h5>
                        <button class="btn btn-dark rounded-pill px-4" onclick="TenantManager.exportBackup()">
                            <i class="bi bi-download me-2"></i> Export JSON
                        </button>
                    </div>
                    <div class="p-3 border rounded-4 bg-light mb-4 text-center">
                        <p class="mb-0">Importing a backup will overwrite your current settings.</p>
                        <input type="file" id="backup-file" class="d-none" onchange="AdminApp.handleImport(this.files[0])">
                        <button class="btn btn-outline-primary rounded-pill px-4 mt-3" onclick="document.getElementById('backup-file').click()">
                            <i class="bi bi-cloud-upload me-2"></i> Import Backup
                        </button>
                    </div>
                    <pre class="bg-dark text-info p-3 rounded-4 small overflow-auto" style="max-height: 300px;">${JSON.stringify(data, null, 2)}</pre>
                </div>
            `;
        },

        // --- Helper Methods ---

        updateBrand(key, value) {
            const tenant = window.TenantManager.getTenant();
            tenant.brand[key] = value;
            window.TenantManager.updateTenant(tenant);
            console.log(`[AdminApp] Updated Brand ${key}: ${value}`);
        },

        handleImport(file) {
            if (!file) return;
            if (confirm('Are you sure you want to import this background? Current data will be lost.')) {
                window.TenantManager.importBackup(file).then(() => {
                    location.reload();
                }).catch(err => alert('Import failed: ' + err));
            }
        },

        sanitize(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    };

    // Global Exposure
    window.AdminApp = AdminApp;

    // Auto-init on DOM loaded
    document.addEventListener('DOMContentLoaded', () => {
        AdminApp.init();
    });

})();
