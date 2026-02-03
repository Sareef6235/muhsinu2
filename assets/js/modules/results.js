/**
 * Result System Manager (Local Version)
 * Manages Exams and their Results.
 */

import { Storage } from '../core/storage.js';

const COLLECTION_EXAMS = 'exams';
const COLLECTION_RESULTS = 'results';

export const ResultManager = {

    // --- Exam Management ---

    async getAllExams() {
        return Storage.getAll(COLLECTION_EXAMS).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    async getExamById(id) {
        return Storage.getById(COLLECTION_EXAMS, id);
    },

    async saveExam(exam) {
        if (!exam.id) exam.id = 'exam_' + Date.now();
        Storage.save(COLLECTION_EXAMS, exam);
        return exam;
    },

    async deleteExam(id) {
        // Also delete associated results
        Storage.delete(COLLECTION_EXAMS, id);
        // Clean up results for this exam
        const allResults = Storage.getAll(COLLECTION_RESULTS);
        const toKeep = allResults.filter(r => r.examId !== id);
        Storage._persist(COLLECTION_RESULTS, toKeep); // Accessing internal helper for bulk overwrite
    },

    // --- Result Entries Management ---

    async getResultsByExam(examId) {
        const all = Storage.getAll(COLLECTION_RESULTS);
        return all.filter(r => r.examId === examId);
    },

    async addResult(result) {
        if (!result.id) result.id = 'res_' + Date.now();
        Storage.save(COLLECTION_RESULTS, result);
        return result;
    },

    async deleteResult(id) {
        Storage.delete(COLLECTION_RESULTS, id);
    },

    async searchResult(examId, regNo) {
        const results = await this.getResultsByExam(examId);
        // Loose comparison for RegNo to be safe
        return results.find(r => r.regNo.toString() === regNo.toString());
    },

    // --- Bulk Import Helper ---
    async importResults(examId, csvText) {
        // Simple CSV Parser: RegNo, Name, Score, Status
        const lines = csvText.split('\n');
        let count = 0;
        for (let i = 1; i < lines.length; i++) { // Skip header
            const cols = lines[i].split(',');
            if (cols.length >= 3) {
                const res = {
                    examId: examId,
                    regNo: cols[0].trim(),
                    name: cols[1].trim(),
                    score: cols[2].trim(),
                    status: cols[3]?.trim() || 'Pass'
                };
                if (res.regNo) {
                    await this.addResult(res);
                    count++;
                }
            }
        }
        return count;
    }
};

window.ResultManager = ResultManager;
