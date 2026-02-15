import AppState from './state.js';
import { DataValidator, UIUtils } from './utils.js';
import ResultsCMS from './results-cms.js';

const ResultsPortal = {
    data: { exams: [] },

    init() {
        console.log("ResultsPortal Initialized");
        this.loadData();
        this.bindGlobalEvents();
    },

    bindGlobalEvents() {
        window.addEventListener('exam-store-updated', () => {
            console.log("Portal: Store updated, re-syncing...");
            this.loadData();
        });

        // Manual upload listener
        const uploadInput = document.getElementById('manual-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => this.handleManualUpload(e));
        }
    },

    async loadData() {
        try {
            // Priority 1: Check ResultsCMS (Admin Synced Data)
            const cmsExams = ResultsCMS.getVisibleExamList();
            if (cmsExams.length > 0) {
                console.log("Portal: Loading from ResultsCMS...");
                const allResults = ResultsCMS.getAllResults();

                // Construct structure compatible with existing logic
                this.data = {
                    exams: ResultsCMS.getVisibleExamList().map(idObj => {
                        return {
                            examId: idObj.id,
                            examName: idObj.displayName,
                            results: ResultsCMS.getExamResults(idObj.id)
                        };
                    })
                };
            } else {
                // Priority 2: Fallback to published JSON file
                console.log("Portal: No CMS data found, checking published JSON...");
                const response = await fetch("/data/published-results.json?v=" + Date.now());
                if (response.ok) {
                    const json = await response.json();
                    const validation = DataValidator.validateResults(json);
                    if (validation.valid) {
                        this.data = json;
                    } else {
                        throw new Error(validation.error);
                    }
                }
            }

            // Update Global AppState
            AppState.results.exams = this.data.exams || [];
            AppState.results.totalStudents = this.countTotalStudents();

            // Set last published timestamp if available (from metadata or current)
            const lastSync = localStorage.getItem('results_last_sync');
            AppState.results.lastPublished = lastSync ? new Date(parseInt(lastSync)).toLocaleString() : new Date().toLocaleString();

        } catch (error) {
            console.error("Portal Data Load Error:", error);
            AppState.results.isOffline = true;
        } finally {
            this.updateStatsUI();
            this.populateDropdowns();
        }
    },

    async handleManualUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const json = JSON.parse(text);

            const validation = DataValidator.validateResults(json);
            if (!validation.valid) {
                UIUtils.showToast("Invalid JSON: " + validation.error, "error");
                return;
            }

            // Load manual data
            this.data = json;
            AppState.results.exams = this.data.exams;
            AppState.results.totalStudents = this.countTotalStudents();

            UIUtils.showToast(`Successfully loaded ${this.data.exams.length} exams from file.`, "success");

            this.updateStatsUI();
            this.populateDropdowns();

            // Dispatch event for specialized result pages
            window.dispatchEvent(new CustomEvent('results-manual-loaded', { detail: this.data }));

        } catch (e) {
            UIUtils.showToast("Failed to parse file. Ensure it is a valid JSON.", "error");
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

        if (examsEl) examsEl.textContent = this.data.exams.length;
        if (totalEl) totalEl.textContent = this.countTotalStudents();
        if (syncEl) syncEl.textContent = AppState.results.lastPublished || "--:--";
    },

    populateDropdowns() {
        const selects = document.querySelectorAll('select[data-exam-source="published"]');
        selects.forEach(select => {
            const currentVal = select.value;
            select.innerHTML = '<option value="">-- Select Exam --</option>';
            this.data.exams.forEach(exam => {
                const opt = document.createElement('option');
                opt.value = exam.examId || exam.id;
                opt.textContent = exam.examName || exam.name;
                select.appendChild(opt);
            });
            if (currentVal) select.value = currentVal;
        });
    },

    // Public Search Logic
    async searchResult(examId, rollNo) {
        if (!this.data || !this.data.exams) return { success: false, message: "No results data loaded." };

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

        for (const exam of (this.data.exams || [])) {
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
