/**
 * Subject Storage Utility (Local Version)
 * Manages subject data using the local Storage engine.
 */

import { Storage } from './core/storage.js';

const COLLECTION = 'subjects';

export const SubjectStorage = {
    /**
     * Get all subjects
     */
    async getAll() {
        return Storage.getAll(COLLECTION);
    },

    /**
     * Get only active subjects
     */
    async getActive() {
        const list = Storage.getAll(COLLECTION);
        return list.filter(s => s.active !== false);
    },

    /**
     * Save or update a subject
     */
    async save(subject) {
        if (!subject.id) subject.id = 'sub_' + Date.now();

        const data = {
            id: subject.id,
            name: subject.name,
            price: Number(subject.price),
            active: subject.active !== false,
            rtl: !!subject.rtl
        };

        Storage.save(COLLECTION, data);
        return data;
    },

    /**
     * Delete a subject
     */
    async delete(id) {
        Storage.delete(COLLECTION, id);
    },

    /**
     * Toggle status
     */
    async toggle(id) {
        const subject = Storage.getById(COLLECTION, id);
        if (subject) {
            subject.active = !subject.active;
            Storage.save(COLLECTION, subject);
        }
    }
};

// Global Exposure
window.SubjectStorage = SubjectStorage;
