/**
 * Storage Manager
 * Handles data persistence: Memory <-> LocalStorage <-> JSON (Initial Load)
 */

export class StorageManager {
    constructor() {
        this.cache = {};
        this.listeners = [];
        this.DATA_SOURCES = {
            services: './assets/data/services.json',
            results: './assets/data/results.json',
            settings: './assets/data/settings.json',
            users: './assets/data/users.json' // Admin users
        };
    }

    // Initialize all data
    async init() {
        console.log('StorageManager: Initializing...');
        for (const [key, url] of Object.entries(this.DATA_SOURCES)) {
            await this.loadData(key, url);
        }
        console.log('StorageManager: Ready');
    }

    // Load data: LocalStorage > JSON
    async loadData(key, url) {
        const localData = localStorage.getItem(`APP_${key.toUpperCase()}`);
        if (localData) {
            this.cache[key] = JSON.parse(localData);
        } else {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const jsonData = await response.json();
                    this.cache[key] = jsonData;
                    // We don't save to LS immediately to keep LS clean until edit
                } else {
                    this.cache[key] = []; // Fallback empty
                }
            } catch (e) {
                console.warn(`Failed to load ${url}`, e);
                this.cache[key] = [];
            }
        }
    }

    // Get Data
    get(collection) {
        return this.cache[collection] || [];
    }

    // Get Single Item
    getById(collection, id) {
        const list = this.get(collection);
        return list.find(item => item.id === id);
    }

    // Save Data (Update Cache + LocalStorage)
    save(collection, data) {
        this.cache[collection] = data;
        localStorage.setItem(`APP_${collection.toUpperCase()}`, JSON.stringify(data));
        this.notifyChange(collection);
    }

    // Add Item
    add(collection, item) {
        const list = this.get(collection);
        list.push(item);
        this.save(collection, list);
    }

    // Update Item
    update(collection, id, updates) {
        const list = this.get(collection);
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updates };
            this.save(collection, list);
            return true;
        }
        return false;
    }

    // Delete Item
    delete(collection, id) {
        let list = this.get(collection);
        list = list.filter(item => item.id !== id);
        this.save(collection, list);
    }

    // Export Data (For Admin to download and update source code)
    exportAll() {
        return JSON.stringify(this.cache, null, 2);
    }

    // Listen for changes
    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyChange(collection) {
        this.listeners.forEach(cb => cb(collection, this.cache[collection]));
    }
}

export const db = new StorageManager();
