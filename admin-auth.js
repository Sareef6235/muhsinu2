/**
 * Simple Admin Authentication
 * Protects admin dashboard with password-based access
 * NO Firebase - Pure localStorage implementation
 */

const AdminAuth = {
    ADMIN_KEY: 'admin_session',
    PASSWORD_KEY: 'admin_password_hash',

    /**
     * Check if user is authenticated as admin
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        const session = sessionStorage.getItem(this.ADMIN_KEY);
        return session === 'authenticated';
    },

    /**
     * Simple hash function (NOT cryptographically secure - for demo only)
     * @param {string} str - String to hash
     * @returns {string} Hashed string
     */
    _simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    },

    /**
     * Check if admin password is set
     * @returns {boolean} Password set status
     */
    isPasswordSet() {
        return localStorage.getItem(this.PASSWORD_KEY) !== null;
    },

    /**
     * Set admin password (first-time setup)
     * @param {string} password - Admin password
     */
    setPassword(password) {
        const hashed = this._simpleHash(password);
        localStorage.setItem(this.PASSWORD_KEY, hashed);
    },

    /**
     * Verify password and authenticate
     * @param {string} password - Password to verify
     * @returns {boolean} Authentication success
     */
    login(password) {
        const stored = localStorage.getItem(this.PASSWORD_KEY);
        const hashed = this._simpleHash(password);

        if (stored === hashed) {
            sessionStorage.setItem(this.ADMIN_KEY, 'authenticated');
            return true;
        }
        return false;
    },

    /**
     * Logout admin
     */
    logout() {
        sessionStorage.removeItem(this.ADMIN_KEY);
    },

    /**
     * Protect page - redirect if not authenticated
     * @param {string} redirectUrl - URL to redirect to if not authenticated
     */
    protectPage(redirectUrl = '../index.html') {
        if (!this.isAuthenticated()) {
            this.showLoginPrompt(redirectUrl);
        }
    },

    /**
     * Show login prompt
     * @param {string} redirectUrl - URL to redirect to on cancel
     */
    showLoginPrompt(redirectUrl) {
        // First-time setup
        if (!this.isPasswordSet()) {
            const newPassword = prompt('🔐 First-time setup\n\nSet your admin password:');
            if (!newPassword || newPassword.trim().length < 4) {
                alert('Password must be at least 4 characters');
                window.location.href = redirectUrl;
                return;
            }
            this.setPassword(newPassword);
            alert('✅ Admin password set successfully!\n\nPlease login now.');
        }

        // Login
        const password = prompt('🔐 Admin Login\n\nEnter admin password:');
        if (!password) {
            window.location.href = redirectUrl;
            return;
        }

        if (this.login(password)) {
            // Success - page will continue loading
            return;
        } else {
            alert('❌ Incorrect password');
            window.location.href = redirectUrl;
        }
    }
};

// Auto-protect if on admin page
if (typeof window !== 'undefined' && window.location.pathname.includes('/admin/')) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AdminAuth.protectPage();
        });
    } else {
        AdminAuth.protectPage();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAuth;
}
