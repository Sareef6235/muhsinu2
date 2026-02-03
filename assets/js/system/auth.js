/**
 * Auth System (Client-side only)
 * Security Level: Low (Obfuscation). 
 * Sufficient for "Site-controlled logic" requirement.
 */

export const Auth = {
    // Ideally this would be a hash, but for this constraint we keep it simple or obfuscated
    // Default PIN: 1234
    SECRET_PIN_HASH: '81dc9bdb52d04dc20036dbd8313ed055', // md5 of 1234

    isAuthenticated() {
        return sessionStorage.getItem('ADMIN_SESSION') === 'true';
    },

    async login(pin) {
        // Simple hash check (using a tiny custom hash or just direct compare if user allows)
        // For now, let's just do a direct check to keep it dependency-free and easy to edit
        // The user can change this string.
        if (pin === '1234') { // TODO: Change this to something stronger
            sessionStorage.setItem('ADMIN_SESSION', 'true');
            return true;
        }
        return false;
    },

    logout() {
        sessionStorage.removeItem('ADMIN_SESSION');
        window.location.reload();
    }
};
