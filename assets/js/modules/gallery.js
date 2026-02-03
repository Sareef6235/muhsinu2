/**
 * Gallery Manager (Local Version)
 * Manages gallery images using LocalStorage.
 */

import { Storage } from '../core/storage.js';

const COLLECTION = 'gallery';

export const GalleryManager = {

    async getAll() {
        const items = Storage.getAll(COLLECTION);
        return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    async add(item) {
        if (!item.id) item.id = 'gal_' + Date.now();
        item.createdAt = new Date().toISOString();
        Storage.save(COLLECTION, item);
        return item;
    },

    async delete(id) {
        Storage.delete(COLLECTION, id);
    },

    async getStats() {
        const items = await this.getAll();
        return { count: items.length };
    }
};

window.GalleryManager = GalleryManager;
