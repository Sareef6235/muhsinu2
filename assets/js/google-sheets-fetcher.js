/**
 * GoogleSheetsFetcher.js
 * Centralized utility for fetching and caching Google Sheets DATA.
 * Handles CSV parsing and column normalization.
 */

import StorageManager from './storage-manager.js';

const GoogleSheetsFetcher = {
    CONFIG: {
        SHEET_ID: '1oG1NRnlekVEj8U6bAm-qNKL2N0LZj3kgNI1UMASvQKU',
        GID: '0', // Default sheet
        CACHE_KEY: 'exam_results_cache',
        CACHE_EXPIRY: 5 * 60 * 1000 // 5 minutes
    },

    /**
     * Fetch results from Google Sheets
     * @param {string} sheetId 
     * @returns {Promise<Array>}
     */
    async fetchResults(sheetId = this.CONFIG.SHEET_ID) {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${this.CONFIG.GID}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch sheet data');

            const csvText = await response.text();
            const results = this.parseCSV(csvText);

            // Cache the results
            StorageManager.set(this.CONFIG.CACHE_KEY, results);
            StorageManager.set(this.CONFIG.CACHE_KEY + '_timestamp', Date.now());

            return results;
        } catch (error) {
            console.error('GoogleSheetsFetcher: Fetch failed', error);
            // Fallback to cache
            return this.getCachedResults();
        }
    },

    /**
     * Get cached results
     */
    getCachedResults() {
        return StorageManager.get(this.CONFIG.CACHE_KEY, []);
    },

    /**
     * Extract unique exam names from results
     */
    getExamNames(results) {
        if (!results || !Array.isArray(results)) return [];
        const names = results.map(r => r.exam || r.ExamName || r['Exam Name']).filter(Boolean);
        return [...new Set(names)];
    },

    /**
     * Simple CSV Parser
     */
    parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            if (values.length < headers.length) continue;

            const entry = {};
            headers.forEach((h, index) => {
                entry[h] = values[index];
            });
            rows.push(entry);
        }

        return rows;
    }
};

// Global export for non-module scripts if needed
if (typeof window !== 'undefined') {
    window.GoogleSheetsFetcher = GoogleSheetsFetcher;
}

export default GoogleSheetsFetcher;
