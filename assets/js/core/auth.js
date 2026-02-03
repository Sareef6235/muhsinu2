/**
 * Client-Side Auth Guard
 * Protects admin routes using a simple localStorage session token.
 * NOTE: This is "brochure-site" security level.
 */

const SESSION_KEY = 'mhm_admin_session';

export const Auth = {
    /**
     * Check if user is logged in
     * If strict=true, redirects to login page on failure
     */
    check(strict = true) {
        const session = localStorage.getItem(SESSION_KEY);
        const isValid = session && (JSON.parse(session).expiry > Date.now());

        if (!isValid) {
            if (strict) {
                window.location.href = 'index.html'; // Assumes running from /pages/admin/
            }
            return false;
        }
        return true;
    },

    /**
     * Login (Simulated)
     * In a real app, verify hash. Here matches hardcoded rules for demo.
     */
    login(email, password) {
        // Hardcoded credential check for "Static" mode
        // Ideally this matches a hash stored in localStorage
        if (email === 'admin@mhmv.org' && password === 'admin123') {
            const session = {
                token: 'mhm_static_token_' + Date.now(),
                expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return true;
        }
        return false;
    },

    logout() {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'index.html';
    }
};

// Auto-check on load for protected pages (any page with admin-guard class or inside admin folder)
if (window.location.pathname.includes('/admin/') && !window.location.pathname.endsWith('index.html')) {
    // Auth.check(); // Disabled for now to prevent lockout during dev
}
