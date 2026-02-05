/**
 * results-cms.js
 * Public-facing Read-Only System for Exam Results
 * Reads data synced by the Admin Panel
 */
import StorageManager from './storage-manager.js';

export const ResultsCMS = {
    KEYS: {
        CACHE: 'exam_results_cache',      // The actual results data
        EXAMS: 'exam_results_exams',      // List of available exams
        LAST_SYNC: 'results_last_sync'    // Timestamp
    },

    init() {
        // Listen for updates from Admin Panel (same browser session)
        window.addEventListener('storage', (e) => {
            const prefix = StorageManager.getPrefix();
            if (e.key === prefix + this.KEYS.EXAMS || e.key === prefix + this.KEYS.CACHE) {
                window.dispatchEvent(new CustomEvent('exam-store-updated'));
            }
        });
    },

    /**
     * Get list of exams available for the dropdown
     */
    getVisibleExamList() {
        const exams = StorageManager.get(this.KEYS.EXAMS, []);
        // Sort by most recent first
        return exams.sort((a, b) => new Date(b.lastSync) - new Date(a.lastSync));
    },

    /**
     * Get all results (cached)
     */
    getAllResults() {
        return StorageManager.get(this.KEYS.CACHE, []);
    },

    /**
     * Get results count for current context
     */
    getResultsCount() {
        return this.getAllResults().length;
    },

    /**
     * Compatibility wrapper for fetchResults
     * Now just returns local data since Admin handles the "Fetch"
     */
    async fetchResults() {
        // We pretend to be async to maintain compatibility with existing calls
        return this.getAllResults();
    },

    /**
     * Sync Meta is now a no-op as Admin handles it
     */
    async syncExamMeta() {
        return true;
    },

    /**
     * Search functionality
     */
    search(data, roll, examId, dob = null) {
        // Data might be passed in, or we load it
        const sourceData = data && data.length ? data : this.getAllResults();

        return sourceData.find(r =>
            String(r.rollNo).trim().toLowerCase() === String(roll).trim().toLowerCase() &&
            r.examId === examId &&
            (!dob || r.dob === dob) // Optional DOB check if data has it
        );
    }
};

// Initial run
ResultsCMS.init();

export default ResultsCMS;
