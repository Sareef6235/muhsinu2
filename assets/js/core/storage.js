/**
 * Local Storage Wrapper (The "Local DB")
 * Mimics a document database API using localStorage.
 * Handles JSON serialization, error handling, and default data initialization.
 */

const STORAGE_PREFIX = 'mhm_cms_';

export const Storage = {

    /**
     * Initialize a collection with default data if empty
     * @param {string} key - Collection name (e.g. 'services')
     * @param {Array} defaultData - Array of objects
     */
    init(key, defaultData = []) {
        const fullKey = STORAGE_PREFIX + key;
        if (!localStorage.getItem(fullKey)) {
            localStorage.setItem(fullKey, JSON.stringify(defaultData));
            console.log(`[Storage] Initialized '${key}' with ${defaultData.length} items.`);
        }
    },

    /**
     * Get all items from a collection
     * @param {string} key 
     * @returns {Array} List of items
     */
    getAll(key) {
        const fullKey = STORAGE_PREFIX + key;
        try {
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[Storage] Error reading '${key}':`, e);
            return [];
        }
    },

    /**
     * Get a single item by ID
     * @param {string} key 
     * @param {string} id 
     * @returns {Object|null}
     */
    getById(key, id) {
        const list = this.getAll(key);
        return list.find(item => item.id === id) || null;
    },

    /**
     * Add or Overwrite a single item (Upsert)
     * @param {string} key 
     * @param {Object} item - Must have an 'id' property
     */
    save(key, item) {
        if (!item.id) {
            console.error('[Storage] Save failed: Item missing ID');
            return;
        }

        const list = this.getAll(key);
        const index = list.findIndex(i => i.id === item.id);

        if (index >= 0) {
            list[index] = { ...list[index], ...item, updatedAt: new Date().toISOString() };
        } else {
            item.createdAt = item.createdAt || new Date().toISOString();
            item.updatedAt = new Date().toISOString();
            list.push(item);
        }

        this._persist(key, list);
        return item;
    },

    /**
     * Delete an item by ID
     * @param {string} key 
     * @param {string} id 
     */
    delete(key, id) {
        const list = this.getAll(key);
        const filtered = list.filter(item => item.id !== id);
        if (filtered.length !== list.length) {
            this._persist(key, filtered);
            return true;
        }
        return false;
    },

    /**
     * Internal persist helper
     */
    _persist(key, data) {
        const fullKey = STORAGE_PREFIX + key;
        try {
            localStorage.setItem(fullKey, JSON.stringify(data));
            // Dispatch event for reactivity across tabs/components
            window.dispatchEvent(new CustomEvent('db:update', { detail: { key, data } }));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('Storage Full! Please delete some data or optimize images.');
            }
            console.error('[Storage] Write failed:', e);
        }
    },

    /**
     * Clear specific collection
     */
    clear(key) {
        localStorage.removeItem(STORAGE_PREFIX + key);
    }
};

// Expose globally for ensuring easier transition/debugging
window.LocalDB = Storage;
