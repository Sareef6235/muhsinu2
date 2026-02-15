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
            // In a real app, redirect to login. For now, we simulate.
            console.warn("User not authorized. Redirecting to login (simulated)");
            // window.location.href = '/login.html';
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
                // ExamManager.init() - to be implemented/imported
                break;
            case 'results':
                import('./admin-panels.js').then(m => m.default.init());
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

// =============================
// ADMIN PANEL ROUTER SYSTEM
// =============================

document.addEventListener("DOMContentLoaded", function () {

    const navLinks = document.querySelectorAll(".nav-link");
    const container = document.getElementById("admin-panel-container");
    const breadcrumb = document.getElementById("breadcrumb-current");

    // Panel Templates
    const panels = {

        dashboard: `
            <div class="panel">
                <h2>Dashboard</h2>
                <p>Welcome to Admin Dashboard.</p>
            </div>
        `,

        "services-cms": `
            <div class="panel">
                <h2>Services Engine</h2>
                <p>Manage services here.</p>
            </div>
        `,

        "result-manager": `
            <div class="panel">
                <h2>Exam Results Manager</h2>
                <p>Upload, sync, publish results.</p>
            </div>
        `,

        "fee-submissions": `
            <div class="panel">
                <h2>Fee Management</h2>
                <p>Manage fee records.</p>
            </div>
        `,

        "news-manager": `
            <div class="panel">
                <h2>News & Events</h2>
                <p>Create and edit news posts.</p>
            </div>
        `,

        "menu-manager": `
            <div class="panel">
                <h2>Menu Control</h2>
                <p>Reorder and manage navigation.</p>
            </div>
        `,

        "site-settings": `
            <div class="panel">
                <h2>Page Config</h2>
                <p>Control page settings.</p>
            </div>
        `,

        "theme-settings": `
            <div class="panel">
                <h2>Theme & UI</h2>
                <p>Customize site theme.</p>
            </div>
        `,

        "security-settings": `
            <div class="panel">
                <h2>Security</h2>
                <p>Admin security settings.</p>
            </div>
        `
    };


    function loadPanel(panelName) {

        if (!panels[panelName]) {
            container.innerHTML = "<p>Panel not found.</p>";
            return;
        }

        container.innerHTML = panels[panelName];
        breadcrumb.textContent = panelName.replace("-", " ");
    }


    // Attach Click Events
    navLinks.forEach(link => {

        link.addEventListener("click", function (e) {

            e.preventDefault();

            // Remove active
            navLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");

            const panel = this.dataset.panel;
            loadPanel(panel);

            // Close sidebar on mobile
            document.getElementById("admin-sidebar")
                .classList.remove("open");
        });

    });

    // Load default panel
    loadPanel("dashboard");

});

// Sidebar Toggle
document.getElementById("sidebar-toggle")
    .addEventListener("click", function () {
        document.getElementById("admin-sidebar")
            .classList.toggle("open");
    });

// Sidebar Close
document.querySelector(".sidebar-close")
    .addEventListener("click", function () {
        document.getElementById("admin-sidebar")
            .classList.remove("open");
    });

