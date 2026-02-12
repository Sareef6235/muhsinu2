/**
 * Centralized Storage Manager
 * Handles localStorage with namespacing and deep objects.
 * Updated to support Multi-School Data Isolation.
 */
const StorageManager = {
    LEGACY_PREFIX: 'mhm_v2_',
    SCHOOL_DATA_PREFIX: 'school_',
    ACTIVE_SCHOOL_KEY: 'activeSchoolId', // Updated to match user requirements

    /**
     * Determine the correct prefix for the current context.
     * Falls back to legacy prefix if no school is active.
     */
    getPrefix() {
        try {
            // Check for new key first
            let activeId = localStorage.getItem(this.ACTIVE_SCHOOL_KEY);

            // Backward compatibility: check for old key if new one is missing
            if (!activeId) {
                const oldConfig = localStorage.getItem(this.LEGACY_PREFIX + 'active_school_config');
                if (oldConfig) {
                    const parsed = JSON.parse(oldConfig);
                    activeId = parsed?.id;
                }
            }

            if (activeId && activeId !== 'default') {
                return `${this.SCHOOL_DATA_PREFIX}${activeId}_`;
            }
        } catch (e) {
            console.error("StorageManager: Error parsing school context", e);
        }
        return this.LEGACY_PREFIX;
    },

    /**
     * Get value from storage (context-aware)
     */
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.getPrefix() + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Storage Error (GET ${key}):`, e);
            return defaultValue;
        }
    },

    /**
     * Set value in storage (context-aware)
     */
    set(key, value) {
        try {
            localStorage.setItem(this.getPrefix() + key, JSON.stringify(value));
            window.dispatchEvent(new CustomEvent(`storage-update-${key}`, { detail: value }));
        } catch (e) {
            console.error(`Storage Error (SET ${key}):`, e);
            alert("Storage Quota Exceeded! Please clean up some entries.");
        }
    },

    /**
     * Global (non-namespaced) operations for school management, auth, etc.
     */
    getGlobal(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.LEGACY_PREFIX + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) { return defaultValue; }
    },

    setGlobal(key, value) {
        localStorage.setItem(this.LEGACY_PREFIX + key, JSON.stringify(value));
        window.dispatchEvent(new CustomEvent(`storage-update-global-${key}`, { detail: value }));
    },

    /**
     * Push item to an array in storage
     */
    push(key, item) {
        const list = this.get(key, []);
        list.push(item);
        this.set(key, list);
    },

    /**
     * Delete item from storage (context-aware)
     */
    remove(key) {
        localStorage.removeItem(this.getPrefix() + key);
    }
};

window.StorageManager = StorageManager;
export default StorageManager;
