/**
 * AuthManager.js
 * Unified Authentication Manager for the Antigravity Platform.
 * Features:
 * - 4-digit PIN system with SHA-256 hashing
 * - Session persistence with expiry
 * - Role detection (Admin/User)
 */
import StorageManager from './storage-manager.js';

const AuthManager = {
    AUTH_KEY: 'admin_session',
    PIN_HASH_KEY: 'admin_pin_hash',
    SESSION_DURATION: 2 * 60 * 60 * 1000, // 2 Hours

    /**
     * Internal: Secure SHA-256 Hashing
     */
    async _hash(str) {
        const msgUint8 = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Initialize first-time PIN if not set
     */
    async init(defaultPin = '2026') {
        if (!StorageManager.get(this.PIN_HASH_KEY)) {
            const hash = await this._hash(defaultPin);
            StorageManager.set(this.PIN_HASH_KEY, hash);
        }
    },

    /**
     * Authenticate via PIN
     */
    async login(username, pin) {
        // Handle single argument call (pin only)
        if (arguments.length === 1) {
            pin = username;
        }
        if (!pin || pin.length < 4) return false;

        const storedHash = StorageManager.get(this.PIN_HASH_KEY);
        const inputHash = await this._hash(pin);

        if (inputHash === storedHash) {
            StorageManager.set(this.AUTH_KEY, {
                active: true,
                role: 'admin',
                timestamp: Date.now()
            });
            return true;
        }
        return false;
    },

    /**
     * Logout and Redirect
     */
    logout(redirectUrl = '../admin/index.html') {
        StorageManager.set(this.AUTH_KEY, null);
        if (typeof window !== 'undefined' && redirectUrl) {
            window.location.href = redirectUrl;
        }
    },

    /**
     * Check if user is authenticated and session is valid
     */
    isAuthenticated() {
        const session = StorageManager.get(this.AUTH_KEY);
        if (!session || !session.active) return false;

        if (Date.now() - session.timestamp > this.SESSION_DURATION) {
            this.logout();
            return false;
        }
        return true;
    },

    /**
     * Update PIN logic
     */
    async changePin(oldPin, newPin) {
        if (newPin.length !== 4) throw new Error('New PIN must be 4 digits.');

        const storedHash = StorageManager.get(this.PIN_HASH_KEY);
        const oldHash = await this._hash(oldPin);

        if (oldHash !== storedHash) {
            throw new Error('Current PIN is incorrect.');
        }

        const newHash = await this._hash(newPin);
        StorageManager.set(this.PIN_HASH_KEY, newHash);
        return true;
    }
};

if (typeof window !== 'undefined') {
    window.AuthManager = AuthManager;
}

export default AuthManager;
