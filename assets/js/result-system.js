/**
 * ResultManager (Legacy Bridge)
 * Redirects to ResultsCMS for modern unified storage
 */
import ResultsCMS from './results-cms.js';
import StorageManager from './storage-manager.js';

const ResultManager = {
    // Keep legacy keys for backward compatibility lookup if needed
    KEY: 'site_results',

    init() {
        // ResultsCMS initializes itself
        if (typeof ResultsCMS !== 'undefined' && ResultsCMS.init) {
            ResultsCMS.init();
        }
    },

    /**
     * Modern lookup used by index.html and public pages
     */
    lookup(regNo, dob = null, examId = null) {
        // Use ResultsCMS if available
        if (typeof ResultsCMS !== 'undefined' && ResultsCMS.search) {
            const data = StorageManager.get(ResultsCMS.KEYS.CACHE, []);
            return ResultsCMS.search(data, regNo, examId, dob);
        }

        // Fallback to direct StorageManager
        const results = StorageManager.get('exam_results_cache', []);
        if (examId) {
            return results.find(r => String(r.rollNo).trim() === String(regNo).trim() && r.examId === examId);
        }
        return results.find(r => String(r.rollNo).trim() === String(regNo).trim());
    },

    getAllCategories() {
        if (typeof ResultsCMS !== 'undefined') {
            return ResultsCMS.getVisibleExamList();
        }
        return [];
    },

    // Admin methods
    saveResult(res) {
        // In the new system, results are managed via Google Sheets
        // This is kept for manual local additions if necessary
        const results = StorageManager.get(this.KEY, []);
        results.push(res);
        StorageManager.set(this.KEY, results);
    }
};

export default ResultManager;
