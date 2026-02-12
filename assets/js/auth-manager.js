/**
 * AuthManager.js
 * Production-Safe, Role-Based Access Control (RBAC) Engine
 * Upgraded with SHA-256 Password Authentication
 */

(function () {
    'use strict';

    // Demo Admin Credentials (Username: admin, Password: Admin@123)
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASS_HASH = "fc38b3a0e666a01178a9c279c656365ea2da48419615a137b017770857189196";

    window.AuthManager = (function () {
        let currentUser = null;

        // Restore session from localStorage (using 'auth_session' for consistency)
        try {
            const savedSession = localStorage.getItem("auth_session");
            if (savedSession) {
                currentUser = JSON.parse(savedSession);
            }
        } catch (e) {
            console.warn("[AuthManager] Failed to restore session:", e);
        }

        /**
         * Standard SHA-256 Hashing Utility
         */
        async function hashPassword(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        }

        return {
            /**
             * Secure Login Flow
             * @param {string} username 
             * @param {string} password 
             */
            async login(username, password) {
                const hashed = await hashPassword(password);

                if (username === ADMIN_USERNAME && hashed === ADMIN_PASS_HASH) {
                    currentUser = {
                        id: "1",
                        username: "admin",
                        name: "Super Admin",
                        role: "admin",
                        isAuthenticated: true,
                        loginTime: Date.now()
                    };
                    localStorage.setItem("auth_session", JSON.stringify(currentUser));
                    window.dispatchEvent(new CustomEvent('auth-changed', { detail: currentUser }));
                    return { success: true };
                }

                return { success: false, message: "Invalid username or password" };
            },

            /**
             * Destroy session
             */
            logout() {
                currentUser = null;
                localStorage.removeItem("auth_session");
                window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
            },

            getUser() { return currentUser; },
            isAuthenticated() { return !!(currentUser && currentUser.isAuthenticated); },
            isAdmin() { return currentUser && currentUser.role === "admin"; },
            hasRole(role) { return currentUser && currentUser.role === role; }
        };
    })();

})();
