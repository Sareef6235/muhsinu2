/**
 * Antigravity Results System - Admin Dashboard Core
 * Manages panel switching, sidebars, and high-level dashboard state.
 */

import AppState from './state.js';

const AdminApp = {
    currentPanel: 'dashboard',

    init() {
        console.log("AdminApp Initialized");
        this.checkAuth();
        this.bindEvents();
        this.renderActivePanel();
    },

    checkAuth() {
        if (!AppState.user.isLoggedIn || AppState.user.role === 'public') {
            console.warn("User not authorized. Redirecting to login.");
            window.location.href = 'index.html';
        }
    },

    bindEvents() {
        // Sidebar Navigation
        const navItems = document.querySelectorAll('.nav-item[data-panel]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const panelId = item.getAttribute('data-panel');
                this.switchPanel(panelId);

                // Update active state in UI
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Mobile Sidebar Toggle
        const menuToggle = document.getElementById('admin-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                overlay && overlay.classList.toggle('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
    },

    switchPanel(panelId) {
        if (this.currentPanel === panelId) return;

        console.log(`Switching to panel: ${panelId}`);
        this.currentPanel = panelId;
        this.renderActivePanel();
    },

    renderActivePanel() {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            if (panel.id === `panel-${this.currentPanel}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Trigger panel-specific initialization
        this.initPanel(this.currentPanel);
    },

    initPanel(panelId) {
        switch (panelId) {
            case 'dashboard':
                this.updateDashboardStats();
                break;
            case 'exams':
                // ExamManager.init()
                break;
            case 'results':
                import('./results-management.js').then(m => m.default.init());
                break;
            case 'services':
                if (window.SiteSettings) {
                    window.SiteSettings.openPanel();
                    window.SiteSettings.switchTab('content');
                }
                break;
            case 'fees':
                // Load Fees via StorageManager if needed
                break;
            case 'news':
                // Load News via NewsService if needed
                break;
            case 'menus':
                if (window.SiteSettings) {
                    window.SiteSettings.openPanel();
                    window.SiteSettings.switchTab('header');
                }
                break;
            case 'settings':
                if (window.SiteSettings) {
                    window.SiteSettings.openPanel();
                    window.SiteSettings.switchTab('pages');
                }
                break;
            case 'theme':
                if (window.SiteSettings) {
                    window.SiteSettings.openPanel();
                    window.SiteSettings.switchTab('theme');
                }
                break;
            case 'security':
                // Initialize security settings
                break;
        }
    },

    updateDashboardStats() {
        // Mock stats or pull from AppState
        document.getElementById('stat-exams-count').textContent = AppState.results.exams.length;
        document.getElementById('stat-students-count').textContent = AppState.results.totalStudents;
    }
};

window.AdminApp = AdminApp;
export default AdminApp;



