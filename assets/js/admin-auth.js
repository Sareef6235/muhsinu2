/**
 * Firebase Admin Authentication Guard
 * Protects admin pages and provides auth state helpers.
 */
import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const AdminAuth = {
    /**
     * Initialize Auth Guard
     */
    init() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Logged in
                window.adminLoggedIn = true;
                window.adminUser = user;
                this.updateUI(true);
            } else {
                // Logged out
                window.adminLoggedIn = false;
                window.adminUser = null;
                this.updateUI(false);

                // Protect admin pages
                if (window.location.pathname.includes('/admin/dashboard.html')) {
                    window.location.href = 'index.html';
                }
            }
        });
    },

    /**
     * Logout logic
     */
    async logout() {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Logout Error:", error);
        }
    },

    /**
     * Update UI based on auth state
     */
    updateUI(isLoggedIn) {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isLoggedIn ? 'block' : 'none';
        });

        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }
    }
};

// Auto-init if browser
if (typeof window !== 'undefined') {
    AdminAuth.init();
    window.AdminAuth = AdminAuth;
}

export default AdminAuth;
