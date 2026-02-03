/**
 * Admin Dashboard Central Controller
 * Manages panels, settings, and data synchronization.
 */

import { ServicesCMS } from './services-cms.js';
import { db } from './firebase-config.js';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { NewsService } from './news-service.js';
import { SubjectStorage } from './subject-storage.js';

const AdminLogic = {
    state: {
        activePanel: 'dashboard',
        sidebarVisible: window.innerWidth > 992
    },

    async updateStats() {
        try {
            const news = await new NewsService().getAllNews();
            const subjects = await SubjectStorage.getAll();
            const services = await ServicesCMS.getAll();

            document.getElementById('stat-news-count').textContent = news.length;
            document.getElementById('stat-subjects-count').textContent = subjects.length;
            document.getElementById('stat-services-count').textContent = services.length;
        } catch (e) {
            console.error("Error updating stats:", e);
        }
    },

    async renderNews() {
        const container = document.getElementById('news-admin-list');
        if (!container) return;

        container.innerHTML = '<div class="loading">Loading news...</div>';
        const news = await new NewsService().getAllNews();

        if (news.length === 0) {
            container.innerHTML = '<div class="empty-state">No news found.</div>';
            return;
        }

        container.innerHTML = news.map(item => `
            <div class="admin-item-card">
                <div class="item-info">
                    <h4>${item.title.en || 'Untitled'}</h4>
                    <p>${new Date(item.date || item.createdAt?.toDate?.()).toLocaleDateString()}</p>
                </div>
                <div class="item-actions">
                    <button onclick="editNews('${item.id}')" class="btn-icon"><i class="ph ph-pencil"></i></button>
                    <button onclick="deleteNews('${item.id}')" class="btn-icon btn-danger"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `).join('');
    },

    async renderSubjects() {
        const container = document.getElementById('subjects-admin-list');
        if (!container) return;

        container.innerHTML = '<div class="loading">Loading subjects...</div>';
        const subjects = await SubjectStorage.getAll();

        if (subjects.length === 0) {
            container.innerHTML = '<div class="empty-state">No subjects found.</div>';
            return;
        }

        container.innerHTML = subjects.map(s => `
            <div class="admin-item-card">
                <div class="item-info">
                    <h4>${s.name}</h4>
                    <p>₹${s.price} • ${s.active ? 'Active' : 'Inactive'}</p>
                </div>
                <div class="item-actions">
                    <button onclick="AdminLogic.toggleSubject('${s.id}')" class="btn-secondary">${s.active ? 'Deactivate' : 'Activate'}</button>
                    <button onclick="AdminLogic.deleteSubject('${s.id}')" class="btn-icon btn-danger"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `).join('');
    },

    // 1. Initialization
    async init() {
        console.log('🛠️ Admin Logic Initializing...');

        // Wait for Auth
        if (typeof window.AdminAuth !== 'undefined') {
            // Already initialized in admin-auth.js
        }

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
                            <li class="nav-divider">Settings</li>
                            <li><a href="#site-settings" class="nav-link" data-panel="site-settings"><i class="ph ph-gear"></i> Page Settings</a></li>
                            <li><a href="#menu-management" class="nav-link" data-panel="menu-management"><i class="ph ph-list"></i> Menu Manager</a></li>
                            <li class="nav-divider">Content</li>
                            <li><a href="#subject-manager" class="nav-link" data-panel="subject-manager"><i class="ph ph-books"></i> Subjects</a></li>
                            <li><a href="#services-cms" class="nav-link" data-panel="services-cms"><i class="ph ph-briefcase"></i> Services</a></li>
                            <li><a href="#gallery-admin" class="nav-link" data-panel="gallery-admin"><i class="ph ph-image"></i> Gallery</a></li>
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
            case 'menu-management': this.renderMenuManagement(container); break;
            case 'gallery-admin': this.renderGalleryAdmin(container); break;
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
    renderDashboard(container) {
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
                        <div class="stat-label">Recent Bookings</div>
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
                    </div>
                </div>
                <div class="admin-card">
                    <h3>System Status</h3>
                    <ul class="status-list">
                        <li><span>LocalStorage:</span> <span class="badge success">Active</span></li>
                        <li><span>IndexedDB:</span> <span class="badge success">Connected</span></li>
                        <li><span>News Service:</span> <span class="badge success">Online</span></li>
                    </ul>
                </div>
            </div>
        `;
        this.updateStats();
    },

    renderSiteSettings(container) {
        const settings = JSON.parse(localStorage.getItem('mhm_site_settings')) || {
            siteName: 'MIFTHAHUL HUDA MADRASA',
            siteDescription: 'Empowering students through knowledge, creativity, and spiritual growth.',
            contactPhone: '+91 6235989198',
            contactEmail: 'contact@mhmv.org',
            socialWhatsapp: 'https://wa.me/916235989198',
            socialInstagram: '#',
            socialYoutube: '#',
            siteNotice: 'Admission Open 2026'
        };

        container.innerHTML = `
            <div class="admin-card animate-fade-in">
                <div class="card-header">
                    <h2><i class="ph ph-gear"></i> Page Settings</h2>
                    <p>Mange global website configuration and brand identity.</p>
                </div>
                <form id="site-settings-form" class="admin-form">
                    <div class="form-section">
                        <h4>Identity</h4>
                        <div class="form-group">
                            <label>Website Name</label>
                            <input type="text" name="siteName" value="${settings.siteName}" required>
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Website Description (Meta)</label>
                            <textarea name="siteDescription" rows="3">${settings.siteDescription}</textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Contact Info</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Support Phone</label>
                                <input type="text" name="contactPhone" value="${settings.contactPhone}">
                            </div>
                            <div class="form-group">
                                <label>Support Email</label>
                                <input type="email" name="contactEmail" value="${settings.contactEmail}">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>External Links</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>WhatsApp Link</label>
                                <input type="text" name="socialWhatsapp" value="${settings.socialWhatsapp}">
                            </div>
                            <div class="form-group">
                                <label>Instagram Link</label>
                                <input type="text" name="socialInstagram" value="${settings.socialInstagram}">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Global Notice</h4>
                        <div class="form-group">
                            <label>Announcement Text</label>
                            <input type="text" name="siteNotice" value="${settings.siteNotice}">
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Save Settings</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('site-settings-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const newSettings = Object.fromEntries(formData.entries());
            localStorage.setItem('mhm_site_settings', JSON.stringify(newSettings));
            this.showToast('✅ Site settings saved successfully!');
        };
    },

    renderSubjectManager(container) {
        const subjects = typeof SubjectStorage !== 'undefined' ? SubjectStorage.getAll() : [];

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

    renderServicesCMS(container) {
        const services = ServicesCMS.getAll();
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
            const content = s.content.en;
            return `
                            <div class="service-admin-card">
                                <i class="${s.icon} card-icon"></i>
                                <h3>${content.title}</h3>
                                <p>${content.shortDesc}</p>
                                <div class="card-footer">
                                    <span class="badge ${s.visible ? 'success' : 'danger'}">${s.visible ? 'Visible' : 'Hidden'}</span>
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

    // 5. Utility & Helper Functions
    loadPanelFromUrl() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        this.switchPanel(hash);
    },

    bindEvents() {
        // Nav Links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchPanel(link.dataset.panel);
            });
        });

        // Toggle Sidebar
        const toggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('admin-sidebar');
        if (toggle && sidebar) {
            toggle.onclick = () => sidebar.classList.toggle('visible');
        }

        // Logout
        document.getElementById('admin-logout').onclick = () => {
            if (typeof AdminAuth !== 'undefined') AdminAuth.logout();
            window.location.href = '../index.html';
        };
    },

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
            const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
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
                            ${snapshot.docs.map(doc => {
                const b = doc.data();
                const date = b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString() : 'N/A';
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
                                            <button class="btn-icon danger" onclick="AdminLogic.deleteBooking('${doc.id}')"><i class="ph ph-trash"></i></button>
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
            const { deleteDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            await deleteDoc(doc(db, "bookings", id));
            this.showToast("✅ Booking deleted");
            this.switchPanel('bookings-manager');
        } catch (e) {
            console.error("Error deleting booking:", e);
            this.showToast("❌ Delete failed", "error");
        }
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('admin-toast-container');
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

    async updateStats() {
        try {
            const subCount = document.getElementById('stat-subjects-count');
            if (subCount && typeof SubjectStorage !== 'undefined') {
                const active = await SubjectStorage.getActive();
                subCount.innerText = active.length;
            }

            const servCount = document.getElementById('stat-services-count');
            if (servCount) {
                const all = await ServicesCMS.getAll();
                servCount.innerText = all.length;
            }

            const bookCount = document.getElementById('stat-bookings-count');
            if (bookCount) {
                const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                bookCount.innerText = snapshot.size;
            }
        } catch (e) {
            console.error("Error updating stats:", e);
        }
    },

    // ... Event Handlers for UI ...
    async toggleSubject(id) {
        if (typeof SubjectStorage !== 'undefined') {
            await SubjectStorage.toggle(id);
            this.switchPanel('subject-manager');
            this.showToast('✅ Subject status updated');
        }
    },

    async deleteSubject(id) {
        if (typeof SubjectStorage !== 'undefined' && confirm(`Are you sure you want to delete this subject?`)) {
            await SubjectStorage.delete(id);
            this.switchPanel('subject-manager');
            this.showToast('🗑️ Subject deleted', 'error');
        }
    },

    showSubjectModal(subject = null) {
        const isEdit = !!subject;
        const modal = this.createModal(isEdit ? 'Edit Subject' : 'Add New Subject');
        modal.body.innerHTML = `
            <form id="modal-subject-form" class="admin-form">
                <div class="form-group">
                    <label>Subject Name</label>
                    <input type="text" name="name" value="${isEdit ? subject.name : ''}" required ${isEdit ? 'readonly' : ''}>
                </div>
                <div class="form-group">
                    <label>Base Price (₹)</label>
                    <input type="number" name="price" value="${isEdit ? subject.price : '1000'}" required>
                </div>
                <div class="form-group">
                    <label><input type="checkbox" name="active" ${(!isEdit || subject.active) ? 'checked' : ''}> Active</label>
                </div>
                <div class="form-group">
                    <label><input type="checkbox" name="rtl" ${isEdit && subject.rtl ? 'checked' : ''}> RTL Support (For Arabic/Malayalam)</label>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Add'} Subject</button>
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                </div>
            </form>
        `;

        modal.form.onsubmit = (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            data.price = Number(data.price);
            data.active = e.target.active.checked;
            data.rtl = e.target.rtl.checked;

            if (typeof SubjectStorage !== 'undefined') {
                SubjectStorage.save(data);
                this.closeModal();
                this.switchPanel('subject-manager');
                this.showToast(`✅ Subject ${isEdit ? 'updated' : 'added'} successfully`);
            }
        };
    },

    // --- Menu Management (Ported & Enhanced) ---
    async renderMenuManagement(container) {
        container.innerHTML = `
            <div class="admin-card">
                <div class="card-header">
                    <h2><i class="ph ph-list"></i> Menu Manager</h2>
                    <p>Manage site-wide navigation links and search visibility.</p>
                </div>
                <div id="admin-menu-list">
                    <p>Loading menu items...</p>
                </div>
                <div class="form-actions" style="margin-top: 30px;">
                    <button id="save-menu-config" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Save Navigation</button>
                </div>
            </div>
        `;

        if (window.galleryDB) {
            const savedSettings = await window.galleryDB.getSetting('menu_config') || {};
            // We use the same labels as gallery-admin.js but can extend here
            // For now, let's just use the current implementation logic if gallery-admin is active
            // Or better, implement it here.
            this.loadMenuRows(savedSettings);
        }
    },

    loadMenuRows(savedSettings) {
        const listContainer = document.getElementById('admin-menu-list');
        if (!listContainer) return;

        // This is a simplified version, in a real app we'd fetch the structure from site-nav.js
        const defaultItems = [
            { id: 'm1', label: 'Home', visible: true },
            { id: 'm2', label: 'Services', visible: true },
            { id: 'm3', label: 'Gallery', visible: true },
            { id: 'm4', label: 'Student Zone', visible: true },
            { id: 'm5', label: 'About', visible: true }
        ];

        listContainer.innerHTML = defaultItems.map(item => {
            const isVisible = savedSettings[item.id]?.visible !== false;
            return `
                <div class="menu-item-row">
                    <span class="menu-label">${item.label}</span>
                    <div class="menu-controls">
                        <label class="switch">
                            <input type="checkbox" class="menu-toggle" data-id="${item.id}" ${isVisible ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('save-menu-config').onclick = async () => {
            const config = {};
            document.querySelectorAll('.menu-toggle').forEach(cb => {
                config[cb.dataset.id] = { visible: cb.checked };
            });
            if (window.galleryDB) {
                await window.galleryDB.saveSetting('menu_config', config);
                this.showToast('✅ Menu configuration saved!');
            }
        };
    },

    // --- Modal System ---
    createModal(title) {
        const overlay = document.createElement('div');
        overlay.className = 'admin-modal-overlay';
        overlay.innerHTML = `
            <div class="admin-modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        const close = () => { overlay.classList.remove('active'); setTimeout(() => overlay.remove(), 300); };
        overlay.querySelectorAll('.modal-close').forEach(b => b.onclick = close);
        setTimeout(() => overlay.classList.add('active'), 10);

        return {
            body: overlay.querySelector('.modal-body'),
            form: null, // to be set by caller
            get form() { return overlay.querySelector('form'); }
        };
    },

    closeModal() {
        const overlay = document.querySelector('.admin-modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    },

    applyStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            :root {
                --sidebar-width: 280px;
                --primary-color: #00f3ff;
                --sidebar-bg: #0a0a0a;
                --main-bg: #050505;
                --card-bg: rgba(255, 255, 255, 0.03);
                --glass-border: rgba(255, 255, 255, 0.1);
            }

            .admin-wrapper { display: flex; min-height: 100vh; background: var(--main-bg); color: #fff; font-family: 'Outfit', sans-serif; }
            
            /* Sidebar */
            .admin-sidebar { width: var(--sidebar-width); background: var(--sidebar-bg); border-right: 1px solid var(--glass-border); display: flex; flex-direction: column; transition: 0.3s; z-index: 100; }
            .sidebar-header { padding: 30px; text-align: center; }
            .sidebar-header .logo { font-size: 1.5rem; font-weight: 800; color: var(--primary-color); }
            .sidebar-nav { flex: 1; padding: 0 20px; }
            .sidebar-nav ul { list-style: none; padding: 0; }
            .sidebar-nav .nav-link { display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #888; text-decoration: none; border-radius: 10px; transition: 0.3s; margin-bottom: 5px; cursor: pointer; }
            .sidebar-nav .nav-link i { font-size: 1.2rem; }
            .sidebar-nav .nav-link:hover, .sidebar-nav .nav-link.active { background: rgba(0, 243, 255, 0.1); color: var(--primary-color); }
            .nav-divider { padding: 25px 20px 10px; font-size: 0.7rem; text-transform: uppercase; color: #444; letter-spacing: 1px; font-weight: 800; }
            .sidebar-footer { padding: 30px; }
            .btn-logout { width: 100%; padding: 12px; background: rgba(255,0,0,0.1); border: 1px solid rgba(255,0,0,0.2); color: #ff4d4d; border-radius: 10px; cursor: pointer; transition: 0.3s; }

            /* Main Content */
            .admin-main { flex: 1; display: flex; flex-direction: column; position: relative; }
            .admin-header { height: 80px; border-bottom: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; }
            .admin-content { padding: 40px; flex: 1; overflow-y: auto; }
            
            /* Stats */
            .dashboard-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; margin-bottom: 40px; }
            .stat-card { background: var(--card-bg); border: 1px solid var(--glass-border); padding: 25px; border-radius: 20px; display: flex; align-items: center; gap: 20px; }
            .stat-icon { width: 50px; height: 50px; background: rgba(0, 243, 255, 0.1); color: var(--primary-color); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
            .stat-value { font-size: 1.8rem; font-weight: 700; }
            .stat-label { font-size: 0.85rem; color: #888; }

            /* Cards */
            .admin-card { background: var(--card-bg); border: 1px solid var(--glass-border); padding: 35px; border-radius: 25px; margin-bottom: 30px; }
            .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .admin-table { width: 100%; border-collapse: collapse; }
            .admin-table th { text-align: left; padding: 15px; color: #666; font-size: 0.8rem; border-bottom: 1px solid #1a1a1a; }
            .admin-table td { padding: 18px 15px; border-bottom: 1px solid rgba(255,255,255,0.03); }
            
            /* Modals */
            .admin-modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; opacity: 0; transition: 0.3s; pointer-events: none; }
            .admin-modal-overlay.active { opacity: 1; pointer-events: auto; }
            .admin-modal { background: #0a0a0a; border: 1px solid var(--glass-border); width: 90%; max-width: 500px; border-radius: 25px; padding: 35px; transform: translateY(20px); transition: 0.3s; }
            .admin-modal-overlay.active .admin-modal { transform: translateY(0); }
            .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
            .modal-close { background: none; border: none; color: #888; font-size: 1.5rem; cursor: pointer; }

            /* Switch */
            .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #222; transition: .4s; border-radius: 34px; }
            .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .slider { background-color: var(--primary-color); }
            input:checked + .slider:before { transform: translateX(22px); background-color: #000; }

            /* Toast */
            #admin-toast-container { position: fixed; bottom: 30px; right: 30px; z-index: 2000; }
            .admin-toast { background: #00ff88; color: #000; padding: 12px 25px; border-radius: 12px; font-weight: 700; margin-top: 10px; transform: translateX(120%); transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .admin-toast.visible { transform: translateX(0); }
            .admin-toast.error { background: #ff4d4d; color: #fff; }

            .btn-icon { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: #fff; width: 35px; height: 35px; border-radius: 8px; cursor: pointer; transition: 0.3s; }
            .btn-icon:hover { background: var(--primary-color); color: #000; }
            .btn-icon.danger:hover { background: #ff4d4d; color: #fff; }
        `;
        document.head.appendChild(style);
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => AdminLogic.init());
window.AdminLogic = AdminLogic;
