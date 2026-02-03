/**
 * Stats CMS (Local Version)
 * Manages homepage statistics/counters using LocalStorage.
 */

import { Storage } from '../core/storage.js';

const COLLECTION = 'site_stats';

export const StatsCMS = {

    /**
     * Get all stats
     */
    async getAll() {
        const list = Storage.getAll(COLLECTION);
        if (list.length === 0) {
            console.log("Stats CMS empty, loading defaults...");
            const defaults = [
                { id: 'st_1', value: '500+', label: 'Students Enrolled', color: 'var(--primary-color)' },
                { id: 'st_2', value: '25+', label: 'Expert Faculty', color: 'var(--secondary-color)' },
                { id: 'st_3', value: '98%', label: 'Pass Rate', color: 'var(--primary-color)' },
                { id: 'st_4', value: '10+', label: 'Years of Excellence', color: 'var(--secondary-color)' }
            ];
            defaults.forEach(item => Storage.save(COLLECTION, item));
            return defaults;
        }
        return list;
    },

    /**
     * Save Stat
     */
    async save(data) {
        if (!data.id) data.id = 'st_' + Date.now();
        Storage.save(COLLECTION, data);
        return data;
    },

    /**
     * Delete Stat
     */
    async delete(id) {
        Storage.delete(COLLECTION, id);
    }
};

window.StatsCMS = StatsCMS;
