/**
 * Admin Dashboard Central Controller (REBUILT FOR LOCAL CMS)
 * Manages panels, settings, and local data persistence.
 */

import StorageManager from './storage-manager.js';
import AuthManager from './auth-manager.js';
import UploadUtils from './upload-utils.js';
import GoogleSheetsFetcher from './google-sheets-fetcher.js';

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
        if (!AuthManager.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        this.renderLayout();
        this.bindEvents();
        this.loadPanelFromUrl();
        this.updateStats();

        // SiteSettings handles its own initialization typically via global script
        if (window.SiteSettings) {
            window.SiteSettings.init();
        }
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

                    <section class="admin-content" id="admin-panel-container">
                        <!-- Dynamic Panels Injected Here -->
                    </section>
                </main>
            </div>
            
            <div id="admin-toast-container"></div>
        `;

        this.updateStats();
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

        if (window.innerWidth <= 992) {
            const sidebar = document.getElementById('admin-sidebar');
            if (sidebar) sidebar.classList.remove('visible');
        }
        history.pushState(null, null, `#${panelId}`);
    },

    // 4. Panel Renderers
    renderDashboard(container) {
        container.innerHTML = `
            <div class="dashboard-stats-grid animate-fade-in">
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
            </div>

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
                        <li><span>Auth Manager:</span> <span class="badge success">Unified</span></li>
                        <li><span>Site Settings:</span> <span class="badge success">Integrated</span></li>
                    </ul>
                </div>
            </div>
        `;
        this.updateStats();
    },

    renderServicesCMS(container) {
        if (window.SiteSettings) {
            window.SiteSettings.openPanel();
            window.SiteSettings.switchTab('content');
            setTimeout(() => {
                const el = document.querySelector('[data-section="services"]');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return;
        }
        container.innerHTML = `<div class="admin-card"><h2><i class="ph ph-warning"></i> SiteSettings not found.</h2></div>`;
    },

    renderMenuManager(container) {
        if (window.SiteSettings) {
            window.SiteSettings.openPanel();
            window.SiteSettings.switchTab('header');
            return;
        }
        container.innerHTML = `<div class="admin-card"><h2><i class="ph ph-warning"></i> SiteSettings not found.</h2></div>`;
    },

    async renderResultManager(container) {
        container.innerHTML = `
            <div class="admin-card animate-fade-in">
                <div class="card-header-flex">
                    <div>
                        <h2><i class="ph ph-exam"></i> Exam Result System (Google Sheets)</h2>
                        <p>Results are managed externally via Google Sheets. This view is read-only.</p>
                    </div>
                    <div class="action-group" style="display:flex; gap:10px;">
                        <button class="btn btn-primary" onclick="AdminLogic.refreshResultsWithoutReload()"><i class="ph ph-arrows-clockwise"></i> Sync Now</button>
                        <button class="btn btn-secondary" style="background:#00ff88; color:#000; border:none;" onclick="AdminLogic.publishResultsToStaticJson()"><i class="ph ph-export"></i> Publish for Static Site</button>
                        <a href="https://docs.google.com/spreadsheets/d/1oG1NRnlekVEj8U6bAm-qNKL2N0LZj3kgNI1UMASvQKU/edit" target="_blank" class="btn btn-secondary"><i class="ph ph-arrow-square-out"></i> Open Sheet</a>
                    </div>
                </div>
                <div id="results-sync-message" style="margin-top:10px; font-size:0.85rem; color:#888;"></div>

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
            </div>
        `;

        try {
            const results = await GoogleSheetsFetcher.fetchResults();
            const exams = GoogleSheetsFetcher.getExamNames(results);

            const filterDropdown = document.getElementById('admin-exam-filter');
            if (filterDropdown) {
                exams.forEach(ex => {
                    const opt = document.createElement('option');
                    opt.value = ex;
                    opt.innerText = ex;
                    if (this.state.selectedExamFilter === ex) opt.selected = true;
                    filterDropdown.appendChild(opt);
                });
            }

            this.renderAdminResultsTable(results);
        } catch (e) {
            const body = document.getElementById('admin-results-body');
            if (body) body.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--accent-color);">Error loading results: ${e.message}</td></tr>`;
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
            <tr>
                <td><b>${r['Roll Number'] || r['RollNumber'] || r['rollNo']}</b></td>
                <td>${r['Student Name'] || r['Name'] || r['name']}</td>
                <td>${r['Exam Name'] || r['ExamName'] || r['exam']}</td>
                <td>${r['Class'] || r['class']}</td>
                <td><span class="status-badge ${(r['Status'] || r['status'] || 'pass').toLowerCase() === 'pass' ? 'approved' : 'pending'}">${r['Status'] || r['status']}</span></td>
                <td>${r['Total'] || r['total']}</td>
            </tr>
        `).join('') + (filtered.length > 100 ? `<tr><td colspan="6" style="text-align:center; padding:10px; color:#888;">...and ${filtered.length - 100} more records</td></tr>` : '');
    },

    filterAdminResults(examName) {
        this.state.selectedExamFilter = examName;
        const results = GoogleSheetsFetcher.getCachedResults();
        this.renderAdminResultsTable(results);
    },

    async refreshResultsWithoutReload() {
        if (!confirm('This will clear the local cache and fetch fresh data from Google Sheets. Continue?')) return;

        GoogleSheetsFetcher.clearCache();
        this.showToast('🔄 Syncing with Google Sheets...');
        try {
            await GoogleSheetsFetcher.fetchResults(true);
            this.showToast('✅ Data Synced Successfully!');
            this.renderResultManager(document.getElementById('admin-panel-container'));
            this.updateStats();
        } catch (e) {
            this.showToast('❌ Sync Failed: ' + e.message, 'danger');
        }
    },

    renderFeeSubmissions(container) {
        const fees = StorageManager.get('fee_submissions', []);
        container.innerHTML = `
            <div class="admin-card">
                <div class="card-header-flex">
                    <h2><i class="ph ph-receipt"></i> Fee Submissions</h2>
                    <p>Total: ${fees.length} student records found.</p>
                </div>
                <div class="fees-list-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-top:25px;">
                    ${fees.length === 0 ? '<p style="color:#666; grid-column:1/-1; text-align:center;">No submissions yet.</p>' : ''}
                    ${[...fees].reverse().map(f => `
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
            </div>
        `;
    },

    viewReceipt(dataUrl) {
        const win = window.open();
        if (win) {
            win.document.write(`<img src="${dataUrl}" style="max-width:100%">`);
            win.document.close();
        }
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
        const fees = StorageManager.get('fee_submissions', []).filter(f => f.id !== id);
        StorageManager.set('fee_submissions', fees);
        this.showToast('🗑️ Record deleted');
        this.switchPanel('fee-submissions');
    },

    renderThemeSettings(container) {
        if (window.SiteSettings) {
            window.SiteSettings.openPanel();
            window.SiteSettings.switchTab('theme');
            return;
        }
        container.innerHTML = `<div class="admin-card"><h2><i class="ph ph-warning"></i> SiteSettings not found.</h2></div>`;
    },

    renderSiteSettings(container) {
        if (window.SiteSettings) {
            window.SiteSettings.openPanel();
            window.SiteSettings.switchTab('pages');
            return;
        }
        container.innerHTML = `<div class="admin-card"><h2><i class="ph ph-warning"></i> SiteSettings not found.</h2></div>`;
    },

    // 5. Utility Functions
    updateStats() {
        const servicesCount = window.SiteSettings ? window.SiteSettings._settings.content.services.items.length : 0;
        const resultsCount = GoogleSheetsFetcher.getCachedResults().length;
        const feesCount = StorageManager.get('fee_submissions', []).length;
        const storageUsage = (JSON.stringify(localStorage).length / 1024).toFixed(1) + ' KB';

        const updateVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };

        updateVal('stat-services-count', servicesCount);
        updateVal('stat-results-count', resultsCount);
        updateVal('stat-fees-count', feesCount);
        updateVal('stat-storage-usage', storageUsage);
    },

    bindEvents() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                this.switchPanel(link.dataset.panel);
            };
        });

        const toggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('admin-sidebar');
        if (toggle && sidebar) toggle.onclick = () => sidebar.classList.toggle('visible');

        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.onclick = () => AuthManager.logout();
        }
    },

    loadPanelFromUrl() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        this.switchPanel(hash);
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('admin-toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    async refreshResultsWithoutReload() {
        const btn = document.querySelector('button[onclick*="refreshResultsWithoutReload"]');
        const originalText = btn ? btn.innerHTML : '';
        if (btn) {
            btn.innerHTML = '<i class="ph ph-circle-notch animate-spin"></i> Syncing...';
            btn.disabled = true;
        }

        try {
            await GoogleSheetsFetcher.fetchResults(true); // Force refresh
            this.showToast('✅ Exam records synced from Google Sheets!');
            const container = document.getElementById('admin-panel-container');
            if (this.state.activePanel === 'result-manager') {
                this.renderResultManager(container);
            }
            this.updateStats();
        } catch (e) {
            this.showToast('❌ Sync failed: ' + e.message, 'danger');
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    },

    async publishResultsToStaticJson() {
        this.showToast('🚀 Preparing static publication...');
        try {
            const results = GoogleSheetsFetcher.getCachedResults();
            if (!results || results.length === 0) {
                throw new Error('No results cached. Please sync data first.');
            }

            // Normalize data into the contract format
            const payload = {
                meta: {
                    generatedAt: new Date().toISOString(),
                    published: true,
                    version: "2.0-unified"
                },
                exams: this.getGroupedExams(results)
            };

            const jsonString = JSON.stringify(payload, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'published-results.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.showToast('✅ published-results.json generated!');
            const msg = document.getElementById('results-sync-message');
            if (msg) msg.innerHTML = '✓ published-results.json downloaded. Upload to /data/ and deploy.';

            alert('✅ SUCCESS!\n\npublished-results.json has been generated.\n\nDEPLOYMENT:\n1. Move file to /data/ folder\n2. Git push origin main\n\nYour site will update in minutes! 🚀');
        } catch (e) {
            this.showToast('❌ Publish failed: ' + e.message, 'danger');
        }
    },

    getGroupedExams(results) {
        const examsMap = {};
        results.forEach(r => {
            const exName = r.exam_name || r.exam || 'General Exam';
            if (!examsMap[exName]) {
                const exId = exName.toLowerCase().replace(/\s+/g, '_');
                examsMap[exName] = {
                    examId: exId,
                    examName: exName,
                    publishedAt: new Date().toISOString(),
                    students: []
                };
            }

            examsMap[exName].students.push({
                roll: String(r.roll_no || r.roll || ''),
                name: String(r.student_name || r.name || ''),
                class: String(r.class || r.class_name || ''),
                status: String(r.status || 'Pass'),
                total: Number(r.total_marks || r.total || 0),
                subjects: r.subjects || {}
            });
        });
        return Object.values(examsMap);
    },

    filterAdminResults(val) {
        this.state.selectedExamFilter = val;
        const results = GoogleSheetsFetcher.getCachedResults();
        this.renderAdminResultsTable(results);
    },

    renderAdminResultsTable(results) {
        const body = document.getElementById('admin-results-body');
        if (!body) return;

        const filtered = this.state.selectedExamFilter === 'all'
            ? results
            : results.filter(r => (r.exam_name || r.exam) === this.state.selectedExamFilter);

        if (filtered.length === 0) {
            body.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No records found.</td></tr>';
            return;
        }

        body.innerHTML = filtered.map(r => `
            <tr>
                <td>${r.roll_no || r.roll || 'N/A'}</td>
                <td>${r.student_name || r.name || 'N/A'}</td>
                <td><span class="status-badge pending" style="background:rgba(255,165,2,0.1); color:#ffa502;">${r.exam_name || r.exam || 'N/A'}</span></td>
                <td>${r.class || r.class_name || 'N/A'}</td>
                <td><span class="status-badge ${r.status === 'Pass' ? 'approved' : 'pending'}" style="background:${r.status === 'Pass' ? 'rgba(46,213,115,0.1)' : 'rgba(255,71,87,0.1)'}; color:${r.status === 'Pass' ? '#2ed573' : '#ff4757'};">${r.status || 'N/A'}</span></td>
                <td><b>${r.total_marks || r.total || '0'}</b></td>
            </tr>
        `).join('');
    },

    renderSecuritySettings(container) {
        container.innerHTML = `
            <div class="admin-card animate-fade-in" style="max-width: 600px; margin: 0 auto;">
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
            </div>
        `;

        const form = document.getElementById('change-pin-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const currentPin = formData.get('currentPin');
                const newPin = formData.get('newPin');
                const confirmPin = formData.get('confirmPin');

                if (newPin.length !== 4) {
                    this.showToast('❌ PIN must be exactly 4 digits.', 'danger');
                    return;
                }

                if (newPin !== confirmPin) {
                    this.showToast('❌ New PINs do not match.', 'danger');
                    return;
                }

                const btn = e.target.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="ph ph-circle-notch animate-spin"></i> Updating...';
                btn.disabled = true;

                try {
                    await AuthManager.changePin(currentPin, newPin);
                    this.showToast('✅ Security PIN updated successfully! 🚀');
                    e.target.reset();
                } catch (err) {
                    this.showToast(`❌ ${err.message}`, 'danger');
                } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            };
        }
    },

};

// Auto-Launch
document.addEventListener('DOMContentLoaded', () => AdminLogic.init());
window.AdminLogic = AdminLogic;
export default AdminLogic;
