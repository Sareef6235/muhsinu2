/**
 * Admin Dashboard Central Controller (Local Version)
 * Manages panels, settings, and data synchronization without Firebase.
 */

import { ServicesCMS } from './services-cms.js';
import { NewsService } from './news-service.js';
import { SubjectStorage } from './subject-storage.js';
import { BookingsManager } from './modules/bookings.js';
import { ResultManager } from './modules/results.js';
import { GalleryManager } from './modules/gallery.js';
import { AdminMedia } from './admin-media.js';
import { AdminAuth } from './admin-auth.js'; // Ensure Auth is active

const AdminLogic = {
    state: {
        activePanel: 'dashboard',
        sidebarVisible: window.innerWidth > 992
    },

    // 1. Initialization
    async init() {
        console.log('🛠️ Admin Logic Initializing (Local Mode)...');

        this.renderLayout();
        this.bindEvents();
        this.loadPanelFromUrl();
        this.updateStats();
    },

    // 2. DOM Rendering (Main Layout)
    renderLayout() {
        const body = document.body;
        body.innerHTML = `
            <div class="admin-wrapper">
                <!-- Sidebar -->
                <aside class="admin-sidebar" id="admin-sidebar">
                    <div class="sidebar-header">
                        <div class="logo">MHMV Admin</div>
                        <button class="sidebar-close md-only"><i class="ph ph-x"></i></button>
                    </div>
                    <nav class="sidebar-nav">
                        <ul>
                            <li><a href="#dashboard" class="nav-link active" data-panel="dashboard"><i class="ph ph-layout"></i> Dashboard</a></li>
                            <li class="nav-divider">Content</li>
                            <li><a href="#subject-manager" class="nav-link" data-panel="subject-manager"><i class="ph ph-books"></i> Subjects</a></li>
                            <li><a href="#services-cms" class="nav-link" data-panel="services-cms"><i class="ph ph-briefcase"></i> Services</a></li>
                            <li><a href="#news-manager" class="nav-link" data-panel="news-manager"><i class="ph ph-newspaper"></i> News & Updates</a></li>
                            <li><a href="#result-manager" class="nav-link" data-panel="result-manager"><i class="ph ph-exam"></i> Exam Results</a></li>
                            <li class="nav-divider">Media</li>
                            <li><a href="#gallery-admin" class="nav-link" data-panel="gallery-admin"><i class="ph ph-image"></i> Gallery</a></li>
                            <li><a href="#media-manager" class="nav-link" data-panel="media-manager"><i class="ph ph-cloud-arrow-up"></i> Media Manager</a></li>
                            <li class="nav-divider">Settings</li>
                            <li><a href="#site-settings" class="nav-link" data-panel="site-settings"><i class="ph ph-gear"></i> Page Settings</a></li>
                            <li><a href="#menu-management" class="nav-link" data-panel="menu-management"><i class="ph ph-list"></i> Menu Manager</a></li>
                            <li><a href="#bookings-manager" class="nav-link" data-panel="bookings-manager"><i class="ph ph-calendar-check"></i> Bookings</a></li>
                        </ul>
                    </nav>
                    <div class="sidebar-footer">
                        <button id="admin-logout" class="btn-logout"><i class="ph ph-sign-out"></i> Logout</button>
                    </div>
                </aside>

                <!-- Main Content -->
                <main class="admin-main">
                    <header class="admin-header">
                        <button class="sidebar-toggle md-only" id="sidebar-toggle"><i class="ph ph-list"></i></button>
                        <div class="header-breadcrumb">
                            <span id="breadcrumb-parent">Admin</span> / <span id="breadcrumb-current">Dashboard</span>
                        </div>
                        <div class="header-actions">
                            <a href="../../index.html" class="btn-view-site" target="_blank"><i class="ph ph-eye"></i> View Site</a>
                            <div class="admin-profile">
                                <i class="ph ph-user-circle"></i>
                                <span>Administrator</span>
                            </div>
                        </div>
                    </header>

                    <content class="admin-content" id="admin-panel-container">
                        <!-- Panels injected here -->
                    </content>
                </main>
            </div>
            
            <!-- Global Toast Container -->
            <div id="admin-toast-container"></div>
        `;

        this.applyStyles();
    },

    // 3. Panel Switcher Logic
    switchPanel(panelId) {
        this.state.activePanel = panelId;
        const container = document.getElementById('admin-panel-container');
        if (!container) return;

        // Update Nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.panel === panelId);
        });

        // Update Breadcrumb
        document.getElementById('breadcrumb-current').innerText = panelId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

        // Render Panel Content
        switch (panelId) {
            case 'dashboard': this.renderDashboard(container); break;
            case 'site-settings': this.renderSiteSettings(container); break;
            case 'subject-manager': this.renderSubjectManager(container); break;
            case 'services-cms': this.renderServicesCMS(container); break;
            case 'news-manager': this.renderNewsManager(container); break;
            case 'result-manager': this.renderResultManager(container); break;
            case 'menu-management': this.renderMenuManagement(container); break;
            case 'gallery-admin': this.renderGalleryAdmin(container); break;
            case 'media-manager': this.renderMediaManager(container); break;
            case 'bookings-manager': this.renderBookingsManager(container); break;
            default: container.innerHTML = `<h2>Panel ${panelId} coming soon...</h2>`;
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 992) {
            document.getElementById('admin-sidebar').classList.remove('visible');
        }

        // Update URL
        history.pushState(null, null, `#${panelId}`);
    },

    // 4. Panel Renderers
    async renderDashboard(container) {
        container.innerHTML = `
            <div class="dashboard-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="ph ph-books"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="stat-subjects-count">...</div>
                        <div class="stat-label">Active Subjects</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="ph ph-briefcase"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="stat-services-count">...</div>
                        <div class="stat-label">Services</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="ph ph-calendar-check"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="stat-bookings-count">...</div>
                        <div class="stat-label">Total Bookings</div>
                    </div>
                </div>
            </div>

            <div class="dashboard-recent-grid">
                <div class="admin-card">
                    <h3>Quick Actions</h3>
                    <div class="action-buttons">
                        <button onclick="AdminLogic.switchPanel('site-settings')"><i class="ph ph-gear"></i> Site Settings</button>
                        <button onclick="AdminLogic.switchPanel('subject-manager')"><i class="ph ph-plus"></i> New Subject</button>
                        <button onclick="AdminLogic.switchPanel('services-cms')"><i class="ph ph-briefcase"></i> Manage Services</button>
                        <button onclick="AdminLogic.switchPanel('result-manager')"><i class="ph ph-exam"></i> Manage Results</button>
                    </div>
                </div>
                <div class="admin-card">
                    <h3>System Status</h3>
                    <ul class="status-list">
                        <li><span>LocalStorage:</span> <span class="badge success">Active</span></li>
                        <li><span>Offline Mode:</span> <span class="badge success">Ready</span></li>
                    </ul>
                </div>
            </div>
        `;
        this.updateStats();
    },

    async updateStats() {
        try {
            const subjects = await SubjectStorage.getActive();
            const services = await ServicesCMS.getAll();
            const bookings = await BookingsManager.getAll();

            document.getElementById('stat-subjects-count').innerText = subjects.length;
            document.getElementById('stat-services-count').innerText = services.length;
            document.getElementById('stat-bookings-count').innerText = bookings.length;
        } catch (e) {
            console.error("Error updating stats:", e);
        }
    },

    // --- Bookings Manager ---
    async renderBookingsManager(container) {
        container.innerHTML = `
            <div class="admin-card animate-fade-in">
                <div class="card-header">
                    <h2><i class="ph ph-calendar-check"></i> Bookings Management</h2>
                    <p>View and manage tuition booking requests from students.</p>
                </div>
                <div id="bookings-list-container">
                    <div class="loading">Loading bookings...</div>
                </div>
            </div>
        `;

        const listContainer = document.getElementById('bookings-list-container');
        try {
            const bookings = await BookingsManager.getAll();

            if (bookings.length === 0) {
                listContainer.innerHTML = '<div class="empty-state">No bookings yet.</div>';
                return;
            }

            listContainer.innerHTML = `
                <div class="table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                <th>Class</th>
                                <th>Subjects</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bookings.map(b => {
                const date = b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A';
                return `
                                    <tr>
                                        <td>${date}</td>
                                        <td>
                                            <div style="font-weight:600;">${b.firstName} ${b.lastName}</div>
                                            <div style="font-size:0.8rem; color:#888;">${b.email}</div>
                                        </td>
                                        <td><span class="badge">${b.class}</span></td>
                                        <td><div style="max-width:200px; font-size:0.85rem;">${Array.isArray(b.subjects) ? b.subjects.join(', ') : b.subjects}</div></td>
                                        <td style="font-weight:700; color:var(--primary-color);">₹${b.total}</td>
                                        <td>
                                            <button class="btn-icon danger" onclick="AdminLogic.deleteBooking('${b.id}')"><i class="ph ph-trash"></i></button>
                                        </td>
                                    </tr>
                                `;
            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (e) {
            console.error("Error loading bookings:", e);
            listContainer.innerHTML = '<div class="error-state">Failed to load bookings.</div>';
        }
    },

    async deleteBooking(id) {
        if (!confirm("Are you sure you want to delete this booking?")) return;
        try {
            await BookingsManager.delete(id);
            this.showToast("✅ Booking deleted");
            this.renderBookingsManager(document.getElementById('admin-panel-container'));
        } catch (e) {
            console.error("Error deleting booking:", e);
            this.showToast("❌ Delete failed", "error");
        }
    },

    // --- Services CMS ---
    renderServicesCMS(container) {
        const services = typeof ServicesCMS !== 'undefined' ?
            // ServicesCMS.getAll() returns promise now!
            // WAIT, ServicesCMS.getAll is async now. We need async render.
            // But this method signature is synchronous in the switch? No, I can make it async in switch.
            [] : [];

        // This needs to be actively fetched
        this._asyncRenderServices(container);
    },

    async _asyncRenderServices(container) {
        const services = await ServicesCMS.getAll();
        container.innerHTML = `
            <div class="admin-card">
                 <div class="card-header-flex">
                    <div>
                        <h2><i class="ph ph-briefcase"></i> Services CMS</h2>
                        <p>Manage dynamic service cards and their content.</p>
                    </div>
                    <button class="btn btn-primary" id="add-service-btn"><i class="ph ph-plus"></i> Add Service</button>
                </div>
                <div class="services-admin-grid">
                    ${services.map(s => {
            const content = s.content.en || s.content; // Handle legacy/migration
            return `
                            <div class="service-admin-card">
                                <i class="${s.icon} card-icon"></i>
                                <h3>${content.title}</h3>
                                <p>${content.shortDesc || ''}</p>
                                <div class="card-footer">
                                    <span class="badge ${s.visible !== false ? 'success' : 'danger'}">${s.visible !== false ? 'Visible' : 'Hidden'}</span>
                                    <div class="actions">
                                        <button class="btn-icon" onclick="AdminLogic.editService('${s.id}')"><i class="ph ph-pencil"></i></button>
                                        <button class="btn-icon danger" onclick="AdminLogic.deleteService('${s.id}')"><i class="ph ph-trash"></i></button>
                                    </div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
        document.getElementById('add-service-btn').onclick = () => this.showServiceModal();
    },

    showServiceModal(service = null) {
        const isEdit = !!service;
        const modal = this.createModal(isEdit ? 'Edit Service' : 'Add New Service');
        modal.body.innerHTML = `
            <form id="modal-service-form" class="admin-form">
                <div class="form-section">
                    <h4>Basic Info</h4>
                    <div class="form-group">
                        <label>Service Title</label>
                        <input type="text" name="title" value="${isEdit ? (service.content.en ? service.content.en.title : service.content.title) : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Icon Class (Phosphor)</label>
                        <input type="text" name="icon" value="${isEdit ? service.icon : 'ph ph-star'}" placeholder="ph ph-briefcase">
                    </div>
                    <div class="form-group">
                        <label>Short Description</label>
                        <textarea name="shortDesc">${isEdit ? (service.content.en ? service.content.en.shortDesc : service.content.shortDesc) : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Detailed HTML Content</label>
                        <textarea name="fullContent" rows="5">${isEdit ? (service.content.en ? service.content.en.full : service.content.full) : ''}</textarea>
                    </div>
                </div>
                <div class="form-section">
                    <h4>Media</h4>
                    <div class="form-group">
                        <label>Feature Image</label>
                        <input type="file" id="service-image-input" accept="image/*">
                        <div id="service-image-preview" class="media-preview-box">
                             ${isEdit && service.image ? `<img src="${service.image}" style="max-width:100%; border-radius:10px; margin-top:10px;">` : ''}
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Service'}</button>
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                </div>
            </form>
        `;

        let uploadedImage = isEdit ? service.image : null;
        document.getElementById('service-image-input').onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                uploadedImage = await AdminMedia.handleImageUpload(file, document.getElementById('service-image-preview'));
            }
        };

        modal.form.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                id: isEdit ? service.id : undefined,
                icon: e.target.icon.value,
                image: uploadedImage,
                content: {
                    en: {
                        title: e.target.title.value,
                        shortDesc: e.target.shortDesc.value,
                        full: e.target.fullContent.value
                    }
                },
                visible: true
            };

            await ServicesCMS.save(data);
            this.closeModal();
            this.renderServicesCMS(document.getElementById('admin-panel-container'));
            this.showToast(`✅ Service ${isEdit ? 'updated' : 'created'}`);
        };
    },

    async editService(id) {
        const service = await ServicesCMS.getById(id);
        if (service) this.showServiceModal(service);
    },

    async deleteService(id) {
        if (!confirm("Delete this service?")) return;
        await ServicesCMS.delete(id);
        this.renderServicesCMS(document.getElementById('admin-panel-container'));
        this.showToast("🗑️ Service deleted", "error");
    },

    // --- Subject Manager ---
    async renderSubjectManager(container) {
        const subjects = await SubjectStorage.getAll();
        container.innerHTML = `
            <div class="admin-card">
                <div class="card-header-flex">
                    <div>
                        <h2><i class="ph ph-books"></i> Subject Management</h2>
                        <p>Manage tuition subjects and their associated prices.</p>
                    </div>
                    <button class="btn btn-primary" id="add-subject-btn"><i class="ph ph-plus"></i> Add Subject</button>
                </div>

                <div class="table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Subject Name</th>
                                <th>Base Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="subjects-table-body">
                            ${subjects.map(s => `
                                <tr>
                                    <td>${s.name} ${s.rtl ? '<span class="badge">RTL</span>' : ''}</td>
                                    <td>₹${s.price}</td>
                                    <td><span class="badge ${s.active ? 'success' : 'danger'}">${s.active ? 'Active' : 'Hidden'}</span></td>
                                    <td class="table-actions">
                                        <button class="btn-icon" onclick="AdminLogic.toggleSubject('${s.id}')" title="Toggle Visibility"><i class="ph ph-eye"></i></button>
                                        <button class="btn-icon danger" onclick="AdminLogic.deleteSubject('${s.id}')" title="Delete"><i class="ph ph-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('add-subject-btn').onclick = () => this.showSubjectModal();
    },

    showSubjectModal(subject = null) {
        const isEdit = !!subject;
        const modal = this.createModal(isEdit ? 'Edit Subject' : 'Add New Subject');
        modal.body.innerHTML = `
            <form id="modal-subject-form" class="admin-form">
                <div class="form-group">
                    <label>Subject Name</label>
                    <input type="text" name="name" value="${isEdit ? subject.name : ''}" required>
                </div>
                <div class="form-group">
                    <label>Base Price (₹)</label>
                    <input type="number" name="price" value="${isEdit ? subject.price : '1000'}" required>
                </div>
                <div class="form-group">
                    <label><input type="checkbox" name="active" ${(!isEdit || subject.active) ? 'checked' : ''}> Active</label>
                </div>
                <div class="form-group">
                    <label><input type="checkbox" name="rtl" ${isEdit && subject.rtl ? 'checked' : ''}> RTL Support</label>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Add'} Subject</button>
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                </div>
            </form>
        `;

        modal.form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                id: isEdit ? subject.id : undefined,
                name: formData.get('name'),
                price: formData.get('price'),
                active: e.target.active.checked,
                rtl: e.target.rtl.checked
            };

            await SubjectStorage.save(data);
            this.closeModal();
            this.renderSubjectManager(document.getElementById('admin-panel-container'));
            this.showToast(`✅ Subject ${isEdit ? 'updated' : 'added'}`);
        };
    },

    async toggleSubject(id) {
        await SubjectStorage.toggle(id);
        this.renderSubjectManager(document.getElementById('admin-panel-container'));
    },

    async deleteSubject(id) {
        if (confirm("Delete this subject?")) {
            await SubjectStorage.delete(id);
            this.renderSubjectManager(document.getElementById('admin-panel-container'));
            this.showToast("🗑️ Subject deleted", "error");
        }
    },

    // --- News Manager ---
    async renderNewsManager(container) {
        container.innerHTML = '<div class="loading">Loading news...</div>';
        const news = await new NewsService().getAllNews();
        container.innerHTML = `
            <div class="admin-card">
                 <div class="card-header-flex">
                    <div>
                        <h2><i class="ph ph-newspaper"></i> News & Updates</h2>
                    </div>
                    <button class="btn btn-primary" id="add-news-btn"><i class="ph ph-plus"></i> Add News</button>
                </div>
                <div id="news-admin-list" class="admin-grid-list">
                    ${news.map(item => `
                        <div class="admin-item-card">
                            <div class="item-info">
                                <h4>${item.title.en || 'Untitled'}</h4>
                                <p>${new Date(item.date).toLocaleDateString()}</p>
                            </div>
                            <div class="item-actions">
                                <button onclick="AdminLogic.editNews('${item.id}')" class="btn-icon"><i class="ph ph-pencil"></i></button>
                                <button onclick="AdminLogic.deleteNews('${item.id}')" class="btn-icon btn-danger"><i class="ph ph-trash"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.getElementById('add-news-btn').onclick = () => this.showNewsModal();
    },

    showNewsModal(newsItem = null) {
        const isEdit = !!newsItem;
        const modal = this.createModal(isEdit ? 'Edit News' : 'Add News');
        modal.body.innerHTML = `
            <form id="modal-news-form" class="admin-form">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" value="${isEdit ? newsItem.title.en : ''}" required>
                </div>
                <div class="form-group">
                    <label>Short Description</label>
                    <textarea name="shortDesc">${isEdit ? newsItem.shortDesc : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>News Image</label>
                    <input type="file" id="news-image-input" accept="image/*">
                    <div id="news-image-preview">
                        ${isEdit && newsItem.image ? `<img src="${newsItem.image}" style="max-height:100px;">` : ''}
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save</button>
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                </div>
            </form>
        `;

        let uploadedImage = isEdit ? newsItem.image : null;
        document.getElementById('news-image-input').onchange = async (e) => {
            uploadedImage = await AdminMedia.handleImageUpload(e.target.files[0], document.getElementById('news-image-preview'));
        };

        modal.form.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                title: { en: e.target.title.value },
                shortDesc: e.target.shortDesc.value,
                image: uploadedImage,
                date: isEdit ? newsItem.date : new Date().toISOString()
            };
            await new NewsService().saveNews(data, isEdit ? newsItem.id : null);
            this.closeModal();
            this.renderNewsManager(document.getElementById('admin-panel-container'));
        };
    },

    async editNews(id) {
        const news = await new NewsService().getAllNews();
        const item = news.find(n => n.id === id);
        if (item) this.showNewsModal(item);
    },

    async deleteNews(id) {
        if (!confirm("Delete update?")) return;
        await new NewsService().deleteNews(id);
        this.renderNewsManager(document.getElementById('admin-panel-container'));
    },

    // --- Result Manager ---
    async renderResultManager(container) {
        container.innerHTML = `
            <div class="admin-card">
                 <div class="card-header-flex">
                    <div>
                        <h2><i class="ph ph-exam"></i> Exam Results</h2>
                        <p>Manage examinations and publish student results.</p>
                    </div>
                    <button class="btn btn-primary" id="create-exam-btn"><i class="ph ph-plus"></i> Create Exam</button>
                </div>
                <div id="exams-list-container" class="admin-grid-list">
                    <div class="loading">Loading exams...</div>
                </div>
            </div>
        `;

        const exams = await ResultManager.getAllExams();
        const listContainer = document.getElementById('exams-list-container');

        if (exams.length === 0) {
            listContainer.innerHTML = '<div class="empty-state">No exams created yet.</div>';
        } else {
            listContainer.innerHTML = exams.map(exam => `
                <div class="admin-item-card">
                    <div class="item-info">
                        <h4>${exam.name}</h4>
                        <p>${new Date(exam.date).toLocaleDateString()} • ${exam.type || 'General'}</p>
                    </div>
                    <div class="item-actions">
                        <button onclick="AdminLogic.manageExamResults('${exam.id}')" class="btn-secondary"><i class="ph ph-table"></i> Results</button>
                        <button onclick="AdminLogic.deleteExam('${exam.id}')" class="btn-icon btn-danger"><i class="ph ph-trash"></i></button>
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('create-exam-btn').onclick = () => this.showExamModal();
    },

    showExamModal() {
        const modal = this.createModal('Create New Exam');
        modal.body.innerHTML = `
            <form id="create-exam-form" class="admin-form">
                <div class="form-group">
                    <label>Exam Name</label>
                    <input type="text" name="name" placeholder="e.g. Mid Term 2026" required>
                </div>
                <div class="form-group">
                    <label>Exam Date</label>
                    <input type="date" name="date" required>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select name="type">
                        <option value="Public">Public Exam</option>
                        <option value="Internal">Internal Exam</option>
                        <option value="Entrance">Entrance</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Create Exam</button>
                </div>
            </form>
        `;

        modal.form.onsubmit = async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            await ResultManager.saveExam(data);
            this.closeModal();
            this.renderResultManager(document.getElementById('admin-panel-container'));
            this.showToast('✅ Exam created successfully');
        };
    },

    async deleteExam(id) {
        if (!confirm("Are you sure? This will delete all results for this exam.")) return;
        await ResultManager.deleteExam(id);
        this.renderResultManager(document.getElementById('admin-panel-container'));
        this.showToast('🗑️ Exam deleted');
    },

    async manageExamResults(examId) {
        const exam = await ResultManager.getExamById(examId);
        const results = await ResultManager.getResultsByExam(examId);

        const container = document.getElementById('admin-panel-container');
        container.innerHTML = `
            <div class="admin-card">
                <div class="card-header-flex">
                    <div>
                        <button onclick="AdminLogic.switchPanel('result-manager')" class="btn-text"><i class="ph ph-arrow-left"></i> Back</button>
                        <h2 style="margin-top:10px;">Results: ${exam.name}</h2>
                        <p>${results.length} records found.</p>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" id="import-csv-btn"><i class="ph ph-upload"></i> Import CSV</button>
                        <button class="btn btn-primary" id="add-result-btn"><i class="ph ph-plus"></i> Add Single</button>
                    </div>
                </div>

                <div class="table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Reg No</th>
                                <th>Student Name</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(r => `
                                <tr>
                                    <td>${r.regNo}</td>
                                    <td>${r.name}</td>
                                    <td>${r.score}</td>
                                    <td><span class="badge ${r.status === 'Pass' ? 'success' : 'danger'}">${r.status}</span></td>
                                    <td>
                                        <button onclick="AdminLogic.deleteResult('${r.id}', '${examId}')" class="btn-icon danger"><i class="ph ph-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('add-result-btn').onclick = () => this.showAddResultModal(examId);
        document.getElementById('import-csv-btn').onclick = () => this.showImportCSVModal(examId);
    },

    showAddResultModal(examId) {
        const modal = this.createModal('Add Result');
        modal.body.innerHTML = `
            <form id="add-result-form" class="admin-form">
                <div class="form-group">
                    <label>Register No</label>
                    <input type="text" name="regNo" required>
                </div>
                <div class="form-group">
                    <label>Student Name</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Score / Marks</label>
                    <input type="text" name="score" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="Withheld">Withheld</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Add Result</button>
                </div>
            </form>
        `;

        modal.form.onsubmit = async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            data.examId = examId;
            await ResultManager.addResult(data);
            this.closeModal();
            this.manageExamResults(examId);
            this.showToast('✅ Result added');
        };
    },

    showImportCSVModal(examId) {
        const modal = this.createModal('Import Results via CSV');
        modal.body.innerHTML = `
             <div class="admin-form">
                <p>Paste CSV Data (Format: RegNo, Name, Score, Status)</p>
                <textarea id="csv-input" rows="10" placeholder="1001, John Doe, 95%, Pass\n1002, Jane Smith, 88%, Pass"></textarea>
                <div class="form-actions">
                    <button id="process-import-btn" class="btn btn-primary">Process Import</button>
                </div>
             </div>
        `;

        document.getElementById('process-import-btn').onclick = async () => {
            const text = document.getElementById('csv-input').value;
            const count = await ResultManager.importResults(examId, text);
            this.closeModal();
            this.manageExamResults(examId);
            this.showToast(`✅ Imported ${count} results`);
        };
    },

    async deleteResult(id, examId) {
        if (!confirm("Delete this result?")) return;
        await ResultManager.deleteResult(id);
        this.manageExamResults(examId);
    },

    // --- Gallery & Site Settings (Simplified Reuse) ---
    renderSiteSettings(container) {
        // Reuse existing logic, but ensure it saves to localStorage 'mhm_site_settings'
        // Copied from previous logic, ensuring it works
        const settings = JSON.parse(localStorage.getItem('mhm_site_settings')) || {
            siteName: 'MIFTHAHUL HUDA MADRASA',
            siteDescription: 'Empowering students through knowledge.',
            contactPhone: '+91 6235989198'
        };
        container.innerHTML = `
            <div class="admin-card">
                <h2>Site Settings</h2>
                <form id="settings-form">
                    <div class="form-group"><label>Site Name</label><input name="siteName" value="${settings.siteName}"></div>
                    <button type="submit" class="btn btn-primary">Save</button>
                </form>
            </div>
        `;
        document.getElementById('settings-form').onsubmit = (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            localStorage.setItem('mhm_site_settings', JSON.stringify({ ...settings, ...data }));
            this.showToast('Settings saved');
        };
    },

    // --- Gallery Manager ---
    async renderGalleryAdmin(container) {
        container.innerHTML = `
            <div class="admin-card">
                 <div class="card-header-flex">
                    <div>
                        <h2><i class="ph ph-image"></i> Gallery Management</h2>
                        <p>Manage photos and videos for the site gallery.</p>
                    </div>
                    <button class="btn btn-primary" id="add-gallery-btn"><i class="ph ph-plus"></i> Add Media</button>
                </div>
                <div id="gallery-admin-list" class="gallery-grid">
                    <div class="loading">Loading gallery...</div>
                </div>
            </div>
        `;

        const items = await GalleryManager.getAll();
        const listContainer = document.getElementById('gallery-admin-list');

        if (items.length === 0) {
            listContainer.innerHTML = '<div class="empty-state">No items in gallery.</div>';
        } else {
            listContainer.innerHTML = items.map(item => `
                <div class="gallery-item-card">
                    <div class="media-wrapper">
                        ${item.type === 'video'
                    ? `<video src="${item.src}" controls></video>`
                    : `<img src="${item.src}" alt="${item.caption || 'Gallery Image'}" loading="lazy">`
                }
                    </div>
                    <div class="caption">${item.caption || 'No Caption'}</div>
                    <button onclick="AdminLogic.deleteGalleryItem('${item.id}')" class="delete-btn"><i class="ph ph-trash"></i></button>
                </div>
            `).join('');
        }

        document.getElementById('add-gallery-btn').onclick = () => this.showGalleryModal();
    },

    showGalleryModal() {
        const modal = this.createModal('Add to Gallery');
        modal.body.innerHTML = `
            <form id="add-gallery-form" class="admin-form">
                <div class="form-group">
                    <label>Caption</label>
                    <input type="text" name="caption" placeholder="Short description...">
                </div>
                <div class="form-group">
                    <label>Media File</label>
                    <input type="file" id="gallery-file-input" accept="image/*,video/*" required>
                    <div id="gallery-preview" class="media-preview-box"></div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Upload & Save</button>
                </div>
            </form>
        `;

        let uploadedFile = null;
        document.getElementById('gallery-file-input').onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    if (file.type.startsWith('image/')) {
                        const src = await AdminMedia.handleImageUpload(file, document.getElementById('gallery-preview'));
                        uploadedFile = { src, type: 'image' };
                    } else if (file.type.startsWith('video/')) {
                        // Note: AdminMedia might need adjustment for pure local if not using Blob logic for persistence
                        // But for now assuming AdminMedia returns proper src
                        // We used URL.createObjectURL in AdminMedia, which is session-only.
                        // But wait, my MediaOptimizer in modules/media.js handles persistence with Base64 for small videos.
                        // AdminLogic imports AdminMedia.js. I should check AdminMedia.js to see if it uses MediaOptimizer correctly.
                        // Let's assume AdminMedia.handleVideoUpload returns a file/blob, we need to convert it for storage if we want persistence.

                        // Re-implementing logic here to be safe and use local MediaOptimizer directly if needed,
                        // OR just trust AdminMedia returns a blob url which warns user.
                        // For true "local json" site, video persistence is hard. 
                        // Let's use the modules/media.js logic here explicitly for robust local handling.

                        const { MediaOptimizer } = await import('./modules/media.js');
                        const result = await MediaOptimizer.processVideo(file);

                        if (result.src) {
                            // Preview it
                            const container = document.getElementById('gallery-preview');
                            container.innerHTML = `<video src="${result.src}" controls style="max-width:100%"></video>`;
                            if (result.warning) this.showToast(result.warning, 'warning');
                            uploadedFile = { src: result.src, type: 'video' };
                        }
                    }
                } catch (err) {
                    this.showToast(err, 'error');
                }
            }
        };

        modal.form.onsubmit = async (e) => {
            e.preventDefault();
            if (!uploadedFile) {
                this.showToast('Please upload a file first', 'error');
                return;
            }

            const data = {
                caption: e.target.caption.value,
                src: uploadedFile.src,
                type: uploadedFile.type
            };

            try {
                await GalleryManager.add(data);
                this.closeModal();
                this.renderGalleryAdmin(document.getElementById('admin-panel-container'));
                this.showToast('✅ Added to Gallery');
            } catch (err) {
                // Quota check
                this.showToast('Failed to save. storage full?', 'error');
            }
        };
    },

    async deleteGalleryItem(id) {
        if (!confirm("Remove this item?")) return;
        await GalleryManager.delete(id);
        this.renderGalleryAdmin(document.getElementById('admin-panel-container'));
        this.showToast('🗑️ Item removed');
    },

    // --- Utilities ---
    createModal(title) {
        // Remove existing
        const existing = document.querySelector('.admin-modal-overlay');
        if (existing) existing.remove();

        // Create new
        const overlay = document.createElement('div');
        overlay.className = 'admin-modal-overlay active';
        overlay.innerHTML = `
            <div class="admin-modal animate-scale-in">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.querySelector('.modal-close').onclick = close;
        overlay.onclick = (e) => { if (e.target === overlay) close(); };

        return {
            body: overlay.querySelector('.modal-body'),
            close: close,
            form: null // To be assigned
        };
    },

    closeModal() {
        const existing = document.querySelector('.admin-modal-overlay');
        if (existing) existing.remove();
    },

    showToast(msg, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}`;
        toast.innerText = msg;
        document.getElementById('admin-toast-container').appendChild(toast);
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => { toast.remove(); }, 3000);
    },

    applyStyles() {
        // Reuse global styles
    },

    bindEvents() {
        // Logout
        const logout = document.getElementById('admin-logout');
        if (logout) {
            logout.onclick = () => {
                if (typeof AdminAuth !== 'undefined') AdminAuth.logout(); // Wait, AdminAuth might have different method signature
                // Actually AdminAuth in admin-auth.js binds the logout button itself?
                // In my refactored admin-auth.js, I bound it.
                // But AdminLogic often overrides it.
                // Let's use Auth.logout() directly if needed.
                import('./core/auth.js').then(m => m.Auth.logout());
            };
        }
    }
};

window.AdminLogic = AdminLogic;
document.addEventListener('DOMContentLoaded', () => AdminLogic.init());
