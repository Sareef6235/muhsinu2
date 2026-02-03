/**
 * Admin Authentication Guard (Local Version)
 * Protects admin pages using local session logic.
 */

import { Auth } from './core/auth.js';

export class AdminAuth {
    constructor() {
        this.init();
    }

    init() {
        // 1. Check if we are on a protected page
        if (this.isProtectedPage()) {
            // Strict check: Redirects if not logged in
            Auth.check(true);
        }

        // 2. Handle Login Form (if on login page)
        this.bindLogin();

        // 3. Handle Logout (if on dashboard)
        this.bindLogout();
    }

    isProtectedPage() {
        const path = window.location.pathname;
        return path.includes('/admin/') &&
            !path.endsWith('/admin/') &&
            !path.endsWith('/admin/index.html');
    }

    bindLogin() {
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('admin-email').value;
                const password = document.getElementById('admin-password').value;
                const errorMsg = document.getElementById('login-error');

                if (Auth.login(email, password)) {
                    // Success
                    window.location.href = 'dashboard.html';
                } else {
                    // Fail
                    if (errorMsg) errorMsg.textContent = 'Invalid credentials. Try admin@mhmv.org / admin123';
                    if (errorMsg) errorMsg.style.display = 'block';
                }
            });
        }
    }

    bindLogout() {
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    Auth.logout();
                }
            });
        }
    }
}

// Auto-init
window.AdminAuth = new AdminAuth();
