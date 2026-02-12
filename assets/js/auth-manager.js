/**
 * AuthManager.js
 * Production-Safe, Role-Based Access Control (RBAC) Engine
 */

(function () {
    'use strict';

    window.AuthManager = (function () {
        // Core state: Attempt to restore session from localStorage
        let currentUser = null;
        try {
            const savedUser = localStorage.getItem("auth_user");
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
            }
        } catch (e) {
            console.warn("[AuthManager] Failed to restore session:", e);
        }

        return {
            /**
             * Create / Restore session
             * @param {Object} user { id, name, role, isAuthenticated }
             */
            login(user) {
                currentUser = user;
                localStorage.setItem("auth_user", JSON.stringify(user));
                window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
            },

            /**
             * Destroy session
             */
            logout() {
                currentUser = null;
                localStorage.removeItem("auth_user");
                window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
            },

            /**
             * Get current user profile
             */
            getUser() {
                return currentUser;
            },

            /**
             * Check if user is logged in
             */
            isAuthenticated() {
                return !!(currentUser && currentUser.isAuthenticated);
            },

            /**
             * Security check: Admin only
             */
            isAdmin() {
                return currentUser && currentUser.role === "admin";
            },

            /**
             * Future-Ready: Role verification
             */
            hasRole(role) {
                return currentUser && currentUser.role === role;
            }
        };
    })();

})();
