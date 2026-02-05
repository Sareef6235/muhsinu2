/**
 * Gallery & Navigation Database Layer
 * Zero Firebase - Pure IndexedDB implementation
 */

class GalleryDB {
    constructor() {
        this.dbName = 'GalleryUltraDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Media Store
                if (!db.objectStoreNames.contains('media')) {
                    db.createObjectStore('media', { keyPath: 'id', autoIncrement: true });
                }

                // Settings Store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('IndexedDB Error:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // --- Media Operations ---
    async addMedia(item) {
        return this._execute('media', 'readwrite', (store) => store.add(item));
    }

    async getAllMedia() {
        return this._execute('media', 'readonly', (store) => store.getAll());
    }

    async deleteMedia(id) {
        return this._execute('media', 'readwrite', (store) => store.delete(id));
    }

    // --- Settings Operations ---
    async saveSetting(key, value) {
        return this._execute('settings', 'readwrite', (store) => store.put({ key, value }));
    }

    async getSetting(key) {
        const result = await this._execute('settings', 'readonly', (store) => store.get(key));
        return result ? result.value : null;
    }

    // Helper to execute transactions
    _execute(storeName, mode, callback) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = callback(store);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Global DB instance
window.galleryDB = new GalleryDB();
window.galleryDB.init().then(() => console.log('📁 GalleryDB Initialized'));
