/**
 * Admin Dashboard Central Controller (REBUILT FOR LOCAL CMS)
 * Manages panels, settings, and local data persistence.
 */

import StorageManager from './storage-manager.js';
import LocalAuth from './local-auth.js';
import UploadUtils from './upload-utils.js';
import ServicesCMS from './services-cms.js';
import GoogleSheetsFetcher from './google-sheets-fetcher.js';
import NavigationCMS from './nav-cms.js';

const AdminLogic = {
    state: {
        activePanel: 'dashboard',
        sidebarVisible: window.innerWidth > 992,
        selectedExamFilter: 'all'
    },

    // 1. Initialization
    init() {
        console.log('🚀 Admin Engine Starting (Local-Only Mode)...');

        // Check Auth
        if (!LocalAuth.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        this.renderLayout();
        this.bindEvents();
        this.loadPanelFromUrl();
        this.updateStats();

        // Initialize Specialized CMS Engines
        ServicesCMS.init();
        ResultsCMS.init();
        NavigationCMS.init();
    },

    // 2. DOM Rendering (Main Layout)
    renderLayout() {
        const body = document.body;
        // Apply Global Theme
        const theme = StorageManager.get('theme_config', { primary: '#00f3ff', secondary: '#bc13fe' });
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--secondary-color', theme.secondary);

        body.innerHTML = `
            <div class="admin-wrapper">
                <!-- Sidebar -->
                <aside class="admin-sidebar" id="admin-sidebar">
                    <div class="sidebar-header">
                        <div class="logo">MHMV <span style="color:var(--primary-color)">2026</span></div>
                        <button class="sidebar-close md-only"><i class="ph ph-x"></i></button>
                    </div>
                    <nav class="sidebar-nav">
                        <ul>
                            <li><a href="#dashboard" class="nav-link active" data-panel="dashboard"><i class="ph ph-layout"></i> Dashboard</a></li>
                            <li class="nav-divider">Management</li>
                            <li><a href="#services-cms" class="nav-link" data-panel="services-cms"><i class="ph ph-briefcase"></i> Services Engine</a></li>
                            <li><a href="#result-manager" class="nav-link" data-panel="result-manager"><i class="ph ph-exam"></i> Exam Results</a></li>
                            <li><a href="#fee-submissions" class="nav-link" data-panel="fee-submissions"><i class="ph ph-receipt"></i> Fee Management</a></li>
                            <li><a href="#news-manager" class="nav-link" data-panel="news-manager"><i class="ph ph-newspaper"></i> News & Events</a></li>
                            <li class="nav-divider">Site Control</li>
                            <li><a href="#menu-manager" class="nav-link" data-panel="menu-manager"><i class="ph ph-list-numbers"></i> Menu Control</a></li>
                            <li><a href="#site-settings" class="nav-link" data-panel="site-settings"><i class="ph ph-gear"></i> Page Config</a></li>
                            <li><a href="#theme-settings" class="nav-link" data-panel="theme-settings"><i class="ph ph-palette"></i> Theme & UI</a></li>
                            <li><a href="#security-settings" class="nav-link" data-panel="security-settings"><i class="ph ph-shield-check"></i> Security</a></li>
                        </ul>
                    </nav>
                    <div class="sidebar-footer">
                        <button id="admin-logout" class="btn-logout"><i class="ph ph-sign-out"></i> End Session</button>
                    </div>
                </aside>

                <!-- Main Content -->
                <main class="admin-main">
                    <header class="admin-header">
                        <button class="sidebar-toggle md-only" id="sidebar-toggle"><i class="ph ph-list"></i></button>
                        <div class="header-breadcrumb">
                            <span id="breadcrumb-parent">MHMV 2026</span> / <span id="breadcrumb-current">Dashboard</span>
                        </div>
                        <div class="header-actions">
                            <a href="../../index.html" class="btn-view-site" target="_blank"><i class="ph ph-planet"></i> Open Site</a>
                            <div class="admin-profile">
                                <i class="ph ph-user-circle"></i>
                                <span>Master Admin</span>
                            </div>
                        </div>
                    </header>

                    <content class="admin-content" id="admin-panel-container">
                        <!-- Dynamic Panels Injected Here -->
                    </content>
                </main>
            </div>
            
            <div id="admin-toast-container"></div>
        `;

        this.applyStyles();
    },

    // 3. Panel Switcher Logic
    async switchPanel(panelId) {
        this.state.activePanel = panelId;
        const container = document.getElementById('admin-panel-container');
        if (!container) return;

        // Toggle Active Class
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.panel === panelId);
        });

        document.getElementById('breadcrumb-current').innerText = panelId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

        // Routing Logic
        switch (panelId) {
            case 'dashboard': this.renderDashboard(container); break;
            case 'services-cms': this.renderServicesCMS(container); break;
            case 'result-manager': this.renderResultManager(container); break;
            case 'fee-submissions': this.renderFeeSubmissions(container); break;
            case 'menu-manager': this.renderMenuManager(container); break;
            case 'site-settings': this.renderSiteSettings(container); break;
            case 'theme-settings': this.renderThemeSettings(container); break;
            case 'security-settings': this.renderSecuritySettings(container); break;
            default: container.innerHTML = `<div class="admin-card"><h2><i class="ph ph-construction"></i> Panel ${panelId} is under development.</h2></div>`;
        }

        if (window.innerWidth <= 992) document.getElementById('admin-sidebar').classList.remove('visible');
        history.pushState(null, null, \`#\${panelId}\`);
    },

    // 4. Panel Renderers
    renderDashboard(container) {
        container.innerHTML = `
            < div class= "dashboard-stats-grid animate-fade-in" >
                <div class="stat-card">
                    <div class="stat-icon"><i class="ph ph-briefcase"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="stat-services-count">...</div>
                        <div class="stat-label">Active Services</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="color:var(--secondary-color)"><i class="ph ph-exam"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="stat-results-count">...</div>
                        <div class="stat-label">Exam Records</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="color:#ffa502"><i class="ph ph-receipt"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="stat-fees-count">...</div>
                        <div class="stat-label">Fee Records</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="color:#2ed573"><i class="ph ph-hard-drive"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="stat-storage-usage">...</div>
                        <div class="stat-label">Storage Usage</div>
                    </div>
                </div>
            </div >

    <div class="dashboard-recent-grid">
        <div class="admin-card">
            <h3>Quick Launch</h3>
            <div class="action-buttons">
                <button onclick="AdminLogic.switchPanel('services-cms')"><i class="ph ph-plus"></i> New Service</button>
                <button onclick="AdminLogic.switchPanel('result-manager')"><i class="ph ph-upload"></i> Upload Results</button>
                <button onclick="AdminLogic.switchPanel('menu-manager')"><i class="ph ph-list-numbers"></i> Edit Navigation</button>
            </div>
        </div>
        <div class="admin-card">
            <h3>System Health</h3>
            <ul class="status-list">
                <li><span>CMS Engines:</span> <span class="badge success">Active</span></li>
                <li><span>Local Auth:</span> <span class="badge success">Secure</span></li>
                <li><span>Media Optimizer:</span> <span class="badge success">Ready</span></li>
            </ul>
        </div>
    </div>
`;
        this.updateStats();
    },

    renderServicesCMS(container) {
        const services = ServicesCMS.getAll();
        container.innerHTML = `
    < div class="admin-card animate-fade-in" >
                <div class="card-header-flex">
                    <div>
                        <h2><i class="ph ph-briefcase"></i> Services CMS</h2>
                        <p>Manage 20+ services with multi-language support (EN/ML/AR).</p>
                    </div>
                    <button class="btn btn-primary" onclick="AdminLogic.showServiceModal()"><i class="ph ph-plus"></i> Add Service</button>
                </div>

                <div class="services-admin-grid">
                    ${services.map(s => `
                        <div class="service-admin-card glass-mhm">
                            <div class="card-options">
                                <span class="badge ${s.visible ? 'success' : 'danger'}">${s.visible ? 'Visible' : 'Hidden'}</span>
                            </div>
                            <i class="${s.icon || 'ph ph-app-window'} card-icon"></i>
                            <h3>${s.title.en}</h3>
                            <p>${s.desc.en.substring(0, 50)}...</p>
                            <div class="card-footer">
                                <div class="lang-indicators">
                                    <span title="English" class="active">EN</span>
                                    <span title="Malayalam" class="${s.title.ml ? 'active' : ''}">ML</span>
                                    <span title="Arabic" class="${s.title.ar ? 'active' : ''}">AR</span>
                                </div>
                                <div class="actions">
                                    <button class="btn-icon" onclick="AdminLogic.showServiceModal('${s.id}')"><i class="ph ph-pencil"></i></button>
                                    <button class="btn-icon danger" onclick="AdminLogic.deleteService('${s.id}')"><i class="ph ph-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div >
    `;
    },

    showServiceModal(id = null) {
        const service = id ? ServicesCMS.getById(id) : {
            title: { en: '', ml: '', ar: '' },
            desc: { en: '', ml: '', ar: '' },
            icon: 'ph ph-star',
            visible: true,
            image: ''
        };

        const modal = document.createElement('div');
        modal.className = 'admin-modal active';
        modal.innerHTML = `
    < div class="modal-content glass-mhm animate-pop-in" >
                <div class="modal-header">
                    <h3>${id ? 'Edit' : 'Create'} Service</h3>
                    <button class="modal-close"><i class="ph ph-x"></i></button>
                </div>
                <form id="service-form" class="admin-form">
                    <div class="form-tabs">
                        <button type="button" class="tab-btn active" data-tab="en">English</button>
                        <button type="button" class="tab-btn" data-tab="ml">Malayalam</button>
                        <button type="button" class="tab-btn" data-tab="ar">Arabic</button>
                    </div>

                    <div class="tab-content" id="tab-en">
                        <div class="form-group">
                            <label>Service Title (EN)</label>
                            <input type="text" name="title_en" value="${service.title.en}" required>
                        </div>
                        <div class="form-group">
                            <label>Description (EN)</label>
                            <textarea name="desc_en" required>${service.desc.en}</textarea>
                        </div>
                    </div>

                    <div class="tab-content hidden" id="tab-ml">
                        <div class="form-group">
                            <label>Service Title (ML)</label>
                            <input type="text" name="title_ml" value="${service.title.ml || ''}">
                        </div>
                        <div class="form-group">
                            <label>Description (ML)</label>
                            <textarea name="desc_ml">${service.desc.ml || ''}</textarea>
                        </div>
                    </div>

                    <div class="tab-content hidden" id="tab-ar">
                        <div class="form-group">
                            <label>Service Title (AR)</label>
                            <input type="text" name="title_ar" value="${service.title.ar || ''}" dir="rtl">
                        </div>
                        <div class="form-group">
                            <label>Description (AR)</label>
                            <textarea name="desc_ar" dir="rtl">${service.desc.ar || ''}</textarea>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Icon Class (Phosphor)</label>
                            <input type="text" name="icon" value="${service.icon}">
                        </div>
                        <div class="form-group">
                            <label>Visibility</label>
                            <select name="visible">
                                <option value="true" ${service.visible ? 'selected' : ''}>Active</option>
                                <option value="false" ${!service.visible ? 'selected' : ''}>Disabled</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Service Image</label>
                        <div class="image-upload-wrapper">
                            <input type="file" id="service-img-input" accept="image/*" hidden>
                            <div class="upload-area" onclick="document.getElementById('service-img-input').click()">
                                ${service.image ? `<img src="${service.image}" class="preview-img">` : '<i class="ph ph-image"></i> <span>Click to Upload</span>'}
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Save Service</button>
                </form>
            </div >
    `;

        document.body.appendChild(modal);

        // Tab Logic
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                modal.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
                btn.classList.add('active');
                modal.querySelector(`#tab - ${ btn.dataset.tab } `).classList.remove('hidden');
            };
        });

        // Image Handling
        let imageData = service.image;
        modal.querySelector('#service-img-input').onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const res = await UploadUtils.processImage(file);
                imageData = res.data;
                modal.querySelector('.upload-area').innerHTML = `< img src = "${res.data}" class="preview-img" > `;
                this.showToast(`✨ compressed to ${ UploadUtils.formatBytes(res.size) } `);
            } catch (err) {
                this.showToast(err.message, 'error');
            }
        };

        // Form Submit
        modal.querySelector('#service-form').onsubmit = (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalHtml = btn.innerHTML;

            const fd = new FormData(e.target);
            const data = {
                id: id,
                title: { en: fd.get('title_en'), ml: fd.get('title_ml'), ar: fd.get('title_ar') },
                desc: { en: fd.get('desc_en'), ml: fd.get('desc_ml'), ar: fd.get('desc_ar') },
                icon: fd.get('icon'),
                visible: fd.get('visible') === 'true',
                image: imageData
            };

            if (window.uiLock) window.uiLock(btn, true, originalHtml);

            try {
                ServicesCMS.save(data);
                this.showToast('✅ Service saved successfully!');
                modal.remove();
                this.switchPanel('services-cms');
            } catch (err) {
                this.showToast('❌ Error saving service: ' + err.message, 'danger');
                if (window.uiLock) window.uiLock(btn, false, originalHtml);
            }
        };

        modal.querySelector('.modal-close').onclick = () => modal.remove();
    },

    deleteService(id) {
        if (!confirm('Permanently delete this service?')) return;
        ServicesCMS.delete(id);
        this.showToast('🗑️ Service deleted');
        this.switchPanel('services-cms');
    },

    async renderResultManager(container) {
        container.innerHTML = `
    < div class="admin-card animate-fade-in" >
                <div class="card-header-flex">
                    <div>
                        <h2><i class="ph ph-exam"></i> Exam Result System (Google Sheets)</h2>
                        <p>Results are managed externally via Google Sheets. This view is read-only.</p>
                    </div>
                    <div class="action-group">
                        <button class="btn btn-primary" onclick="AdminLogic.refreshResultsWithoutReload()"><i class="ph ph-arrows-clockwise"></i> Sync Now</button>
                        <a href="https://docs.google.com/spreadsheets/d/1oG1NRnlekVEj8U6bAm-qNKL2N0LZj3kgNI1UMASvQKU/edit" target="_blank" class="btn btn-secondary"><i class="ph ph-arrow-square-out"></i> Open Sheet</a>
                    </div>
                </div>

                <div class="results-admin-layout">
                    <div class="results-panel animate-fade-in" style="width:100%">
                        <div class="panel-header">
                            <h3><i class="ph ph-database"></i> Cached Records</h3>
                            <select id="admin-exam-filter" onchange="AdminLogic.filterAdminResults(this.value)" style="padding:8px; border-radius:8px; background:rgba(255,255,255,0.05); color:#fff; border:1px solid #333;">
                                <option value="all">All Exams</option>
                            </select>
                        </div>
                        <div class="table-container">
                            <table class="data-table" id="admin-results-table">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Student Name</th>
                                        <th>Exam</th>
                                        <th>Class</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody id="admin-results-body">
                                    <tr><td colspan="6" style="text-align:center; padding:20px;">Loading data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div >
    `;

        // Load data properly
        try {
            const results = await GoogleSheetsFetcher.fetchResults(); // Fetch or get cached
            const exams = GoogleSheetsFetcher.getExamNames(results);
            
            // Populate Filter
            const filterDropdown = document.getElementById('admin-exam-filter');
            if(filterDropdown) {
                 exams.forEach(ex => {
                    const opt = document.createElement('option');
                    opt.value = ex;
                    opt.innerText = ex;
                    if(this.state.selectedExamFilter === ex) opt.selected = true;
                    filterDropdown.appendChild(opt);
                 });
            }

            this.renderAdminResultsTable(results);

        } catch (e) {
            document.getElementById('admin-results-body').innerHTML = `< tr > <td colspan="6" style="text-align:center; color:red;">Error loading results: ${e.message}</td></tr > `;
        }
    },

    renderAdminResultsTable(results) {
        const tbody = document.getElementById('admin-results-body');
        if (!tbody) return;

        const filtered = this.state.selectedExamFilter === 'all' 
            ? results 
            : results.filter(r => (r['Exam Name'] || r['ExamName'] || r['exam']) === this.state.selectedExamFilter);

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#666;">No records found.</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.slice(0, 100).map(r => `
    < tr >
                <td><b>${r['Roll Number'] || r['RollNumber'] || r['rollNo']}</b></td>
                <td>${r['Student Name'] || r['Name'] || r['name']}</td>
                <td>${r['Exam Name'] || r['ExamName'] || r['exam']}</td>
                <td>${r['Class'] || r['class']}</td>
                <td><span class="status-badge ${(r['Status'] || r['status'] || 'pass').toLowerCase() === 'pass' ? 'approved' : 'pending'}">${r['Status'] || r['status']}</span></td>
                <td>${r['Total'] || r['total']}</td>
            </tr >
    `).join('') + (filtered.length > 100 ? ` < tr > <td colspan="6" style="text-align:center; padding:10px; color:#888;">...and ${filtered.length - 100} more records</td></tr > ` : '');
    },

    filterAdminResults(examName) {
        this.state.selectedExamFilter = examName;
        // Re-fetch from cache is fast
        const results = GoogleSheetsFetcher.getCachedResults();
        this.renderAdminResultsTable(results);
    },

    async refreshResultsWithoutReload() {
        if(!confirm('This will clear the local cache and fetch fresh data from Google Sheets. Continue?')) return;
        
        GoogleSheetsFetcher.clearCache();
        this.showToast('🔄 Syncing with Google Sheets...');
        try {
            await GoogleSheetsFetcher.fetchResults(true);
            this.showToast('✅ Data Synced Successfully!');
            this.renderResultManager(document.getElementById('admin-panel-container'));
            this.updateStats();
        } catch(e) {
            this.showToast('❌ Sync Failed: ' + e.message, 'danger');
        }
    },


    renderMenuManager(container) {
    const config = NavigationCMS.getMenu();
    container.innerHTML = `
        < div class="admin-card animate-fade-in" >
            <div class="card-header-flex">
                <div>
                    <h2><i class="ph ph-list-numbers"></i> Menu Management</h2>
                    <p>Control site navigation links, dropdowns, and order.</p>
                </div>
                <button class="btn btn-primary" onclick="AdminLogic.showMenuItemModal()">
                    <i class="ph ph-plus"></i> Add Menu Item
                </button>
            </div>
            <div class="menu-list-container">
                ${config.map(item => `
                    <div class="menu-item-row glass-mhm">
                        <div class="item-info">
                            <i class="ph ph-dots-six-vertical"></i>
                            <div class="item-details">
                                <span class="label">${item.label}</span>
                                <small class="path">${item.href}</small>
                                ${item.type === 'dropdown' ? '<span class="badge info">Dropdown</span>' : ''}
                                ${item.adminOnly ? '<span class="badge danger">Admin Only</span>' : ''}
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="btn-icon" onclick="AdminLogic.showMenuItemModal('${item.id}')" title="Edit"><i class="ph ph-pencil"></i></button>
                            <button class="btn-icon danger" onclick="AdminLogic.deleteMenuItem('${item.id}')" title="Delete"><i class="ph ph-trash"></i></button>
                            <label class="switch">
                                <input type="checkbox" ${item.visible ? 'checked' : ''} onchange="AdminLogic.toggleMenu('${item.id}')">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div >
    `;
},

showMenuItemModal(id = null) {
    const item = id ? NavigationCMS.getMenu().find(m => m.id === id) : { label: '', href: '', type: 'link', visible: true, adminOnly: false };
    const modal = document.createElement('div');
    modal.className = 'admin-modal active';
    modal.innerHTML = `
    < div class="modal-content glass-mhm animate-slide-up" >
            <h3>${id ? 'Edit' : 'Add'} Menu Item</h3>
            <form id="menu-item-form">
                <input type="hidden" name="id" value="${id || ''}">
                <div class="form-group">
                    <label>Label</label>
                    <input type="text" name="label" value="${item.label}" placeholder="Link Text" required>
                </div>
                <div class="form-group">
                    <label>URL / Path</label>
                    <input type="text" name="href" value="${item.href}" placeholder="/pages/..." required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Type</label>
                        <select name="type">
                            <option value="link" ${item.type === 'link' ? 'selected' : ''}>Standard Link</option>
                            <option value="dropdown" ${item.type === 'dropdown' ? 'selected' : ''}>Dropdown Menu</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Order</label>
                        <input type="number" name="order" value="${item.order || 0}">
                    </div>
                </div>
                <div class="form-check-group">
                    <label class="check-container">
                        Visible to all
                        <input type="checkbox" name="visible" ${item.visible ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <label class="check-container">
                        Admin Only
                        <input type="checkbox" name="adminOnly" ${item.adminOnly ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.admin-modal').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Item</button>
                </div>
            </form>
        </div >
    `;
    document.body.appendChild(modal);

    modal.querySelector('form').onsubmit = (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalHtml = btn.innerHTML;

        const data = Object.fromEntries(new FormData(e.target).entries());
        data.visible = !!data.visible;
        data.adminOnly = !!data.adminOnly;
        data.order = parseInt(data.order) || 0;

        if (window.uiLock) window.uiLock(btn, true, originalHtml);

        try {
            if (data.id) {
                NavigationCMS.updateItem(data.id, data);
            } else {
                NavigationCMS.addItem(data);
            }
            modal.remove();
            this.switchPanel('menu-manager');
            this.showToast('Navigation updated! 🚀');
        } catch (err) {
            this.showToast('❌ Error saving menu: ' + err.message, 'danger');
            if (window.uiLock) window.uiLock(btn, false, originalHtml);
        }
    };
},

deleteMenuItem(id) {
    if (confirm('Delete this menu item?')) {
        NavigationCMS.deleteItem(id);
        this.switchPanel('menu-manager');
        this.showToast('Item removed 🗑️');
    }
},

toggleMenu(id) {
    NavigationCMS.toggleVisibility(id);
    this.showToast('Visibility toggled 👁️');
},

    renderFeeSubmissions(container) {
        const fees = StorageManager.get('fee_submissions', []);
        container.innerHTML = `
    < div class="admin-card" >
                <div class="card-header-flex">
                    <h2><i class="ph ph-receipt"></i> Fee Submissions</h2>
                    <p>Total: ${fees.length} student records found.</p>
                </div>
                <div class="fees-list-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-top:25px;">
                    ${fees.length === 0 ? '<p style="color:#666; grid-column:1/-1; text-align:center;">No submissions yet.</p>' : ''}
                    ${fees.reverse().map(f => `
                        <div class="fee-item-card glass-mhm" style="padding:20px; border-radius:15px; border:1px solid var(--glass-border); background:rgba(255,255,255,0.02)">
                            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                                <span class="badge ${f.status === 'pending' ? 'warning' : 'success'}">${f.status.toUpperCase()}</span>
                                <span style="font-size:0.8rem; color:#555">${new Date(f.timestamp).toLocaleDateString()}</span>
                            </div>
                            <h4 style="margin-bottom:5px;">${f.student}</h4>
                            <p style="font-size:0.85rem; color:#888;">Reg: ${f.regNo} | Class: ${f.class} | Month: ${f.month}</p>
                            <div style="margin: 15px 0; padding:10px; background:rgba(255,255,255,0.03); border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:700; color:var(--primary-color)">₹${f.amount}</span>
                                <button class="btn btn-icon" onclick="AdminLogic.viewReceipt('${f.receipt}')"><i class="ph ph-eye"></i> View</button>
                            </div>
                            <div style="display:flex; gap:10px;">
                                <button class="btn btn-primary" style="flex:1; padding:8px;" onclick="AdminLogic.updateFeeStatus('${f.id}', 'verified')">Approve</button>
                                <button class="btn btn-secondary" style="flex:1; padding:8px; border-color:#ff4757; color:#ff4757" onclick="AdminLogic.deleteFee('${f.id}')">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div >
    `;
    },

    viewReceipt(dataUrl) {
        const win = window.open();
        win.document.write(`< img src = "${dataUrl}" style = "max-width:100%" > `);
    },

    updateFeeStatus(id, status) {
        const fees = StorageManager.get('fee_submissions', []);
        const idx = fees.findIndex(f => f.id === id);
        if (idx !== -1) {
            fees[idx].status = status;
            StorageManager.set('fee_submissions', fees);
            this.showToast('✅ Status updated!');
            this.switchPanel('fee-submissions');
        }
    },

    deleteFee(id) {
        if (!confirm('Are you sure you want to delete this record?')) return;
        StorageManager.delete('fee_submissions', f => f.id === id);
        this.showToast('🗑️ Record deleted');
        this.switchPanel('fee-submissions');
    },

    renderThemeSettings(container) {
        const theme = StorageManager.get('theme_config', { primary: '#00f3ff', secondary: '#bc13fe' });
        container.innerHTML = `
    < div class="admin-card" >
                <h2><i class="ph ph-palette"></i> Theme Customization</h2>
                <form id="theme-form" class="admin-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Primary Brand Color</label>
                            <input type="color" name="primary" value="${theme.primary}">
                        </div>
                        <div class="form-group">
                            <label>Secondary Accent</label>
                            <input type="color" name="secondary" value="${theme.secondary}">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Apply Theme</button>
                </form>
            </div >
    `;

        document.getElementById('theme-form').onsubmit = (e) => {
            e.preventDefault();
            const config = Object.fromEntries(new FormData(e.target).entries());
            StorageManager.set('theme_config', config);
            document.documentElement.style.setProperty('--primary-color', config.primary);
            document.documentElement.style.setProperty('--secondary-color', config.secondary);
            this.showToast('✨ Theme updated instantly!');
        };
    },

    renderSiteSettings(container) {
        const settings = StorageManager.get('site_settings', {
            siteName: 'MIFTHAHUL HUDA 2026',
            description: 'Educational Excellence'
        });
        container.innerHTML = `
    < div class="admin-card" >
                <h2><i class="ph ph-gear"></i> Page Settings</h2>
                <form id="settings-form" class="admin-form">
                    <div class="form-group">
                        <label>Site Title</label>
                        <input type="text" name="siteName" value="${settings.siteName}">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description">${settings.description}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Config</button>
                </form>
            </div >
    `;
        document.getElementById('settings-form').onsubmit = (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            StorageManager.set('site_settings', data);
            this.showToast('✅ Configuration saved!');
        };
    },


    // 5. Utility Functions
    updateStats() {
        const stats = {
            services: ServicesCMS.getAll().length,
            results: GoogleSheetsFetcher.getCachedResults().length,
            fees: StorageManager.get('fee_submissions', []).length,
            storage: (JSON.stringify(localStorage).length / 1024).toFixed(1) + ' KB'
        };

        const updateVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };

        updateVal('stat-services-count', stats.services);
        updateVal('stat-results-count', stats.results);
        updateVal('stat-fees-count', stats.fees);
        updateVal('stat-storage-usage', stats.storage);
    },

    bindEvents() {
        // Nav Links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                this.switchPanel(link.dataset.panel);
            };
        });

        // Toggle Sidebar
        const toggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('admin-sidebar');
        if (toggle && sidebar) toggle.onclick = () => sidebar.classList.toggle('visible');

        // Logout
        document.getElementById('admin-logout').onclick = () => LocalAuth.logout();
    },

    loadPanelFromUrl() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        this.switchPanel(hash);
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('admin-toast-container');
        const toast = document.createElement('div');
        toast.className = \`admin-toast \${type}\`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // 10. Security & PIN Management
    renderSecuritySettings(container) {
        container.innerHTML = `
    < div class="admin-card animate-fade-in" style = "max-width: 600px; margin: 0 auto;" >
                <div class="card-header-flex">
                    <div>
                        <h2><i class="ph ph-shield-check"></i> Security Settings</h2>
                        <p>Protect your dashboard by managing your access PIN.</p>
                    </div>
                </div>

                <div class="security-form-container glass-mhm" style="padding: 30px; border-radius: 20px;">
                    <form id="change-pin-form">
                        <div class="form-group">
                            <label>Current PIN</label>
                            <input type="password" name="currentPin" maxlength="4" placeholder="••••" required>
                            <small>Required to verify your identity</small>
                        </div>
                        <div class="form-divider" style="margin: 25px 0; border-top: 1px solid rgba(255,255,255,0.05);"></div>
                        <div class="form-group">
                            <label>New 4-Digit PIN</label>
                            <input type="password" name="newPin" maxlength="4" placeholder="••••" required>
                        </div>
                        <div class="form-group">
                            <label>Confirm New PIN</label>
                            <input type="password" name="confirmPin" maxlength="4" placeholder="••••" required>
                        </div>
                        
                        <div class="form-actions" style="margin-top: 30px;">
                            <button type="submit" class="btn btn-primary" style="width: 100%;">
                                <i class="ph ph-check"></i> Update Access PIN
                            </button>
                        </div>
                    </form>
                </div>

                <div class="security-info" style="margin-top: 30px; padding: 20px; background: rgba(0,243,255,0.05); border-radius: 12px; border: 1px dashed rgba(0,243,255,0.2);">
                    <p style="font-size: 0.85rem; color: #888; margin: 0;">
                        <i class="ph ph-info" style="color: var(--primary-color);"></i>
                        <b>Security Tip:</b> Avoid using simple patterns like "1234" or "0000". Your PIN is stored as a secure SHA-256 hash locally.
                    </p>
                </div>
            </div >
    `;

        const form = document.getElementById('change-pin-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());

            if (data.newPin.length !== 4) {
                this.showToast('❌ PIN must be exactly 4 digits.', 'danger');
                return;
            }

            if (data.newPin !== data.confirmPin) {
                this.showToast('❌ New PINs do not match.', 'danger');
                return;
            }

            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-circle-notch animate-spin"></i> Updating...';
            btn.disabled = true;

            try {
                await LocalAuth.changePin(data.currentPin, data.newPin);
                this.showToast('✅ Security PIN updated successfully! 🚀');
                e.target.reset();
            } catch (err) {
                this.showToast(`❌ ${ err.message } `, 'danger');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        };
    },

    applyStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            :root {
    --sidebar - width: 280px;
    --sidebar - bg: #0a0a0a;
    --main - bg: #050505;
    --card - bg: rgba(255, 255, 255, 0.03);
    --glass - border: rgba(255, 255, 255, 0.1);
}

            .admin - wrapper { display: flex; min - height: 100vh; background: var(--main - bg); color: #fff; font - family: 'Outfit', sans - serif; }
            .admin - sidebar { width: var(--sidebar - width); background: var(--sidebar - bg); border - right: 1px solid var(--glass - border); display: flex; flex - direction: column; transition: 0.3s; z - index: 100; }
            .sidebar - header { padding: 40px; text - align: center; font - size: 1.5rem; font - weight: 800; }
            .sidebar - nav { flex: 1; padding: 0 20px; }
            .sidebar - nav ul { list - style: none; padding: 0; }
            .nav - link { display: flex; align - items: center; gap: 12px; padding: 12px 20px; color: #888; text - decoration: none; border - radius: 12px; margin - bottom: 5px; cursor: pointer; transition: 0.3s; }
            .nav - link: hover, .nav - link.active { background: rgba(var(--primary - color), 0.1); color: var(--primary - color); }
            .nav - divider { padding: 25px 20px 10px; font - size: 0.7rem; color: #444; letter - spacing: 1px; font - weight: 800; }
            
            .admin - main { flex: 1; display: flex; flex - direction: column; }
            .admin - header { height: 80px; border - bottom: 1px solid var(--glass - border); display: flex; align - items: center; justify - content: space - between; padding: 0 40px; }
            .admin - content { padding: 40px; flex: 1; overflow - y: auto; }

            .dashboard - stats - grid { display: grid; grid - template - columns: repeat(auto - fit, minmax(260px, 1fr)); gap: 30px; margin - bottom: 40px; }
            .stat - card { background: var(--card - bg); border: 1px solid var(--glass - border); padding: 30px; border - radius: 25px; display: flex; align - items: center; gap: 20px; }
            .stat - icon { font - size: 2rem; color: var(--primary - color); }
            .stat - value { font - size: 2.2rem; font - weight: 700; }
            
            .admin - card { background: var(--card - bg); border: 1px solid var(--glass - border); padding: 35px; border - radius: 30px; margin - bottom: 30px; }
            .services - admin - grid { display: grid; grid - template - columns: repeat(auto - fill, minmax(280px, 1fr)); gap: 25px; margin - top: 30px; }
            .service - admin - card { padding: 25px; border - radius: 20px; text - align: center; border: 1px solid var(--glass - border); background: rgba(255, 255, 255, 0.02); }
            .card - icon { font - size: 2.5rem; color: var(--primary - color); margin - bottom: 20px; display: block; }
            
            .btn { padding: 12px 25px; border - radius: 12px; cursor: pointer; font - weight: 600; border: none; transition: 0.3s; }
            .btn - primary { background: var(--primary - color); color: #000; }
            .btn - primary:hover { transform: translateY(-2px); box - shadow: 0 5px 15px rgba(0, 243, 255, 0.4); }

#admin - toast - container { position: fixed; bottom: 30px; right: 30px; }
            .admin - toast { background: #2ed573; padding: 15px 30px; border - radius: 15px; transform: translateX(120 %); transition: 0.4s; font - weight: 700; color: #000; }
            .admin - toast.visible { transform: translateX(0); }
            
            .form - group { margin - bottom: 20px; }
            .form - group label { display: block; margin - bottom: 10px; color: #888; }
            .form - group input, .form - group textarea { width: 100 %; padding: 15px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass - border); border - radius: 12px; color: #fff; }
`;
        document.head.appendChild(style);
    }
};

// Auto-Launch
document.addEventListener('DOMContentLoaded', () => AdminLogic.init());
window.AdminLogic = AdminLogic;
export default AdminLogic;
