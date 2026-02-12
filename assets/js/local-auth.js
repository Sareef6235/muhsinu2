/**
 * Local Authentication Guard
 * Replaces Firebase Auth with a site-controlled PIN/Key system.
 */
import StorageManager from './storage-manager.js';

const LocalAuth = {
    AUTH_KEY: 'admin_session',
    PIN_HASH_KEY: 'admin_pin_hash',

    /**
     * Secure SHA-256 Hashing (Async)
     */
    async _hash(str) {
        const msgUint8 = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Initialize first-time password if not set
     */
    async init(defaultPin = '2026') {
        if (!StorageManager.get(this.PIN_HASH_KEY)) {
            const hash = await this._hash(defaultPin);
            StorageManager.set(this.PIN_HASH_KEY, hash);
        }
    },

    async login(pin) {
        if (pin.length !== 4) return false;

        const storedHash = StorageManager.get(this.PIN_HASH_KEY);
        const inputHash = await this._hash(pin);

        if (inputHash === storedHash) {
            StorageManager.set(this.AUTH_KEY, {
                active: true,
                timestamp: Date.now()
            });
            return true;
        }
        return false;
    },

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
    },

    logout() {
        StorageManager.set(this.AUTH_KEY, null);
        window.location.href = '../admin/index.html';
    },

    isAuthenticated() {
        const session = StorageManager.get(this.AUTH_KEY);
        if (!session || !session.active) return false;

        // Session expiry (2 hours)
        const sessionDuration = 2 * 60 * 60 * 1000;
        if (Date.now() - session.timestamp > sessionDuration) {
            this.logout();
            return false;
        }
        return true;
    }
};

export default LocalAuth;
