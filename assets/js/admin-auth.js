import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

class AdminAuth {
    constructor() {
        this.init();
    }

    init() {
        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                document.body.classList.remove('admin-logged-in');
                this.hideAdminElements();
                if (this.isProtectedPage()) {
                    this.redirectToLogin();
                }
            } else {
                document.body.classList.add('admin-logged-in');
                this.showAdminElements();
            }
        });
    }

    isProtectedPage() {
        const path = window.location.pathname;
        // Consider any page under /admin/ (except the login page itself) as protected
        return path.includes('/admin/') && !path.endsWith('/admin/index.html');
    }

    redirectToLogin() {
        const BP = (window.Perf && window.Perf.getBasePath) ? window.Perf.getBasePath() : '../../';
        window.location.href = BP + 'pages/admin/index.html';
    }

    async logout() {
        try {
            await signOut(auth);
            this.redirectToLogin();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    showAdminElements() {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    }

    hideAdminElements() {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
}

// Create instance
const adminAuth = new AdminAuth();

// Export as both global and module
window.AdminAuth = adminAuth;
export default adminAuth;
