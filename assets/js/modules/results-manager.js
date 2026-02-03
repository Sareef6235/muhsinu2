/**
 * Results Manager (Local Version)
 * Manages result highlights and announcements.
 */

import { Storage } from '../core/storage.js';

const COLLECTION = 'site_results_meta';

export const ResultsManager = {

    /**
     * Get Highlight Config
     */
    async getHighlight() {
        const config = Storage.getById(COLLECTION, 'home_highlight');
        if (!config) {
            // Default Config
            return {
                id: 'home_highlight',
                active: true,
                title: 'Exam Results',
                subtitle: 'Check your performance online',
                linkText: 'Check Now',
                linkUrl: 'results.html'
            };
        }
        return config;
    },

    /**
     * Save Highlight Config
     */
    async saveHighlight(data) {
        data.id = 'home_highlight';
        Storage.save(COLLECTION, data);
        return data;
    }
};

window.ResultsManager = ResultsManager;
