/**
 * results-cms.js
 * Public-facing Read-Only System for Exam Results
 * Reads data synced by the Admin Panel
 * Updated to work with unified results schema
 */
import StorageManager from './storage-manager.js';
import SchoolManager from './school-manager.js';

export const ResultsCMS = {
    KEYS: {
        RESULTS: 'results',               // Unified nested structure
        EXAMS: 'exam_results_exams',      // List of available exams (for compatibility)
        LAST_SYNC: 'results_last_sync'    // Timestamp
    },

    init() {
        // Listen for updates from Admin Panel (same browser session)
        window.addEventListener('storage', (e) => {
            const prefix = StorageManager.getPrefix();
            if (e.key === prefix + this.KEYS.RESULTS || e.key === prefix + this.KEYS.EXAMS) {
                window.dispatchEvent(new CustomEvent('exam-store-updated'));
            }
        });
    },

    /**
     * Get list of PUBLISHED exams available for the dropdown
     */
    getVisibleExamList() {
        const schoolResults = StorageManager.get(this.KEYS.RESULTS, {});

        // Filter only published exams
        const publishedExams = Object.keys(schoolResults)
            .filter(examId => schoolResults[examId].published === true)
            .map(examId => {
                const examData = schoolResults[examId];
                return {
                    id: examId,
                    displayName: this._getExamDisplayName(examId),
                    lastSync: examData.syncedAt
                };
            });

        // Sort by most recent first
        return publishedExams.sort((a, b) => new Date(b.lastSync) - new Date(a.lastSync));
    },

    /**
     * Helper: Get exam display name from metadata
     */
    _getExamDisplayName(examId) {
        // Try to get from exam_results_exams first (set by admin)
        const examList = StorageManager.get(this.KEYS.EXAMS, []);
        const examMeta = examList.find(e => e.id === examId);
        if (examMeta) return examMeta.displayName;

        // Fallback: try to get from first result's exam field
        const schoolResults = StorageManager.get(this.KEYS.RESULTS, {});
        const examData = schoolResults[examId];

        if (examData && examData.data && examData.data.length > 0) {
            return examData.data[0].exam || examId;
        }

        return examId; // Last resort
    },

    /**
     * Get all results for PUBLISHED exams only
     */
    getAllResults() {
        const schoolResults = StorageManager.get(this.KEYS.RESULTS, {});

        // Flatten all published exam results into single array
        const results = [];
        Object.keys(schoolResults).forEach(examId => {
            const examData = schoolResults[examId];
            if (examData.published && examData.data) {
                results.push(...examData.data);
            }
        });

        return results;
    },

    /**
     * Get results for a specific exam (published only)
     */
    getExamResults(examId) {
        const schoolResults = StorageManager.get(this.KEYS.RESULTS, {});
        const examData = schoolResults[examId];

        if (!examData || !examData.published) {
            return null; // Exam not found or not published
        }

        return examData.data || [];
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
     * Search functionality with enhanced validation
     */
    search(data, roll, examId, dob = null) {
        // Data might be passed in, or we load it
        let sourceData;

        if (data && data.length) {
            sourceData = data;
        } else {
            // Load from specific exam
            sourceData = this.getExamResults(examId);
            if (!sourceData) {
                console.warn(`ResultsCMS: Exam ${examId} not found or not published`);
                return null;
            }
        }

        // Search with optional DOB validation
        const result = sourceData.find(r => {
            const rollMatch = String(r.rollNo).trim().toLowerCase() === String(roll).trim().toLowerCase();
            const examMatch = r.examId === examId;
            const dobMatch = !dob || r.dob === dob;

            return rollMatch && examMatch && dobMatch;
        });

        return result || null;
    },

    /**
     * Check if an exam is published
     */
    isExamPublished(examId) {
        const schoolResults = StorageManager.get(this.KEYS.RESULTS, {});
        const examData = schoolResults[examId];

        return examData ? examData.published === true : false;
    }
};

// Initial run
ResultsCMS.init();

export default ResultsCMS;
