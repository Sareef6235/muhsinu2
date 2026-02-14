/**
 * Antigravity Results System - Public Portal Logic
 * Consolidates all results-related interactions for the public interface.
 */

import AppState from './state.js';
import { DataValidator } from './utils.js';

const ResultsPortal = {
    data: null,

    init() {
        console.log("ResultsPortal Initialized");
        this.loadData();
    },

    async loadData() {
        try {
            // Try fetching from the default published results path
            const response = await fetch("/data/published-results.json?v=" + Date.now());
            if (response.ok) {
                const json = await response.json();

                // Validate before loading
                const validation = DataValidator.validateResults(json);
                if (!validation.valid) {
                    throw new Error("Data Validation Failed: " + validation.error);
                }

                this.data = json;
                AppState.results.exams = this.data.exams || [];
                AppState.results.totalStudents = this.countTotalStudents();
                AppState.results.lastPublished = new Date().toLocaleString();
            } else {
                console.warn("Published results JSON not found, switching to offline mode.");
                AppState.results.isOffline = true;
            }
        } catch (error) {
            console.error("Portal Data Load Error:", error);
            AppState.results.isOffline = true;
        } finally {
            this.updateStatsUI();
            this.populateDropdowns();
        }
    },

    countTotalStudents() {
        if (!this.data || !this.data.exams) return 0;
        return this.data.exams.reduce((sum, exam) => sum + (exam.results ? exam.results.length : 0), 0);
    },

    updateStatsUI() {
        const examsEl = document.getElementById("results-exams-count");
        const totalEl = document.getElementById("results-total-count");
        const syncEl = document.getElementById("results-last-sync");

        if (examsEl) examsEl.textContent = AppState.results.exams.length;
        if (totalEl) totalEl.textContent = AppState.results.totalStudents;
        if (syncEl) syncEl.textContent = AppState.results.lastPublished || "--:--";
    },

    populateDropdowns() {
        const selects = document.querySelectorAll('select[data-exam-source="published"]');
        selects.forEach(select => {
            select.innerHTML = '<option value="">-- Select Exam --</option>';
            AppState.results.exams.forEach(exam => {
                const opt = document.createElement('option');
                opt.value = exam.examId || exam.id;
                opt.textContent = exam.examName || exam.name;
                select.appendChild(opt);
            });
        });
    },

    // Public Search Logic
    async searchResult(examId, rollNo) {
        if (!this.data) return { success: false, message: "No results data loaded." };

        const exam = this.data.exams.find(e => (e.examId || e.id) === examId);
        if (!exam) return { success: false, message: "Examination session not found." };

        const student = exam.results.find(r => String(r.roll).trim() === String(rollNo).trim());
        if (!student) return { success: false, message: "Result not found for this roll number." };

        return { success: true, data: student, examName: exam.examName || exam.name };
    },

    // Homepage Quick View
    async quickSearch(rollNo) {
        const status = document.getElementById('home-status');
        const container = document.getElementById('home-result-container');
        const area = document.getElementById('home-result-area');

        if (!rollNo) return;
        if (status) status.textContent = "Searching...";

        // Look in all exams for this roll number (homepage logic)
        for (const exam of (this.data?.exams || [])) {
            const student = exam.results.find(r => String(r.roll).trim() === String(rollNo).trim());
            if (student) {
                if (status) status.textContent = "Result Found!";
                if (container) container.style.display = "block";
                if (area) {
                    area.innerHTML = `
                        <div style="text-align: center;">
                            <h3 style="color: var(--primary-color);">${student.name}</h3>
                            <div style="font-size: 2.5rem; font-weight: 800; margin: 10px 0;">${student.total}</div>
                            <p style="color: #888; font-size: 0.8rem;">${exam.examName || exam.name}</p>
                        </div>
                    `;
                }
                return;
            }
        }

        if (status) status.textContent = "No result found for " + rollNo;
        if (container) container.style.display = "none";
    }
};

window.ResultsPortal = ResultsPortal;
export default ResultsPortal;
