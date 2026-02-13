/**
 * RESULTS PORTAL - STATIC SYNC ENGINE
 * Data Source: /data/published-results.json
 * 
 * WHY THIS WORKS IN STATIC SITES:
 * 1. CACHE-BUSTING: We add '?v=timestamp' to the URL to bypass browser caching.
 * 2. NO BACKEND: We fetch a static JSON file that the admin manually uploads.
 * 3. DEFENSIVE CODING: We validate the JSON structure before rendering to prevent portal crashes.
 */
const ResultApp = {
    data: null,
    ui: {},

    /**
     * 1. INITIALIZE PORTAL
     * Binds UI elements and triggers data fetch.
     */
    async init() {
        console.log("Portal Initializing...");

        // Bind DOM elements after page load
        this.ui = {
            examSelect: document.getElementById('examSelect'),
            rollInput: document.getElementById('rollInput'),
            form: document.getElementById('resultsForm'),
            display: document.getElementById('result-display'),
            meritView: document.getElementById('merit-view'),
            meritBody: document.getElementById('results-table-body'),
            meritExamName: document.getElementById('merit-exam-name'),
            uploadInput: document.getElementById('published-results-upload'),
            uploadStatus: document.getElementById('published-results-status')
        };

        try {
            // Fetch the static results file (Cache-busted)
            const response = await fetch("/data/published-results.json?v=" + Date.now());

            if (!response.ok) throw new Error("Database file missing or unreachable.");

            this.data = await response.json();
            console.log("Data loaded successfully:", this.data);

            this.populateDropdown();

            // Set up form submission handler
            if (this.ui.form) {
                this.ui.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSearch();
                });
            }

            // Global bridge for Error UI feedback
            window.UI = { roll: this.ui.rollInput };

            this.handleDeepLinking();

            // Bind Upload Handler
            if (this.ui.uploadInput) {
                this.ui.uploadInput.addEventListener('change', (e) => this.handleManualUpload(e.target.files[0]));
            }

        } catch (error) {
            console.error("Critical System Failure:", error);
            // Don't fail globally yet, maybe manual upload will save us
            if (this.ui.uploadStatus) this.ui.uploadStatus.innerHTML = '<span style="color:orange">⚠ Search database unavailable. Please upload file manually.</span>';
        }
    },

    /**
     * MANUAL UPLOAD HANDLER
     */
    handleManualUpload(file) {
        if (!file) return;

        // Security check if needed
        // if (typeof AuthManager !== 'undefined' && !AuthManager.isAdmin()) return;

        if (!file.name.endsWith(".json")) {
            return this.updateUploadStatus("❌ Invalid file. Please upload .json", false);
        }

        this.updateUploadStatus("⏳ Processing...", true);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                this.loadData(json);
                this.updateUploadStatus(`✅ Loaded ${this.countTotalStudents()} records.`, true);
            } catch (err) {
                console.error(err);
                this.updateUploadStatus("❌ Error parsing JSON.", false);
            }
        };
        reader.readAsText(file);
    },

    /**
     * LOAD DATA INTO ENGINE
     * Can be called by manual upload or initial fetch
     */
    loadData(json) {
        console.log("Loading Data:", json);
        let normalizedData = { exams: [] };

        if (json.exams) {
            normalizedData = json;
        } else if (JSON.stringify(json).includes('results') || Array.isArray(json)) {
            // Handle legacy/flat formats
            if (json.data && json.data.exams) normalizedData = json.data;
            else if (Array.isArray(json)) normalizedData = { exams: [{ id: 'manual', name: 'Uploaded Data', results: json }] };
        }

        this.data = normalizedData;
        this.populateDropdown();
        this.updateStatsUI();
    },

    updateUploadStatus(msg, success) {
        if (this.ui.uploadStatus) {
            this.ui.uploadStatus.innerHTML = msg;
            this.ui.uploadStatus.style.color = success ? 'var(--text-main, #888)' : 'red';
            if (msg.includes('✅')) this.ui.uploadStatus.style.color = 'var(--success, limegreen)';
        }
    },

    countTotalStudents() {
        if (!this.data || !this.data.exams) return 0;
        return this.data.exams.reduce((acc, ex) => acc + (ex.results ? ex.results.length : 0), 0);
    },

    updateStatsUI() {
        // Optional: Update the stats bar numbers if they exist
        const examsEl = document.getElementById("results-exams-count");
        const totalEl = document.getElementById("results-total-count");
        if (examsEl && this.data.exams) examsEl.textContent = this.data.exams.length;
        if (totalEl) totalEl.textContent = this.countTotalStudents();
    },

    /**
     * 2. POPULATE DROPDOWN (DEFENSIVE)
     * Strictly filters published exams and prevents 'undefined' options forever.
     */
    populateDropdown() {
        if (!this.ui.examSelect) return;
        this.ui.examSelect.innerHTML = "";

        // Verification Rule: 'exams' must be a valid array
        if (!this.data || !Array.isArray(this.data.exams)) {
            this.ui.examSelect.innerHTML = '<option value="">No published exams available</option>';
            this.ui.examSelect.disabled = true;
            return;
        }

        // Filter: Only include exams marked as published and containing valid metadata
        const activeExams = this.data.exams.filter(exam => {
            const hasId = !!(exam.examId || exam.id);
            const hasName = !!(exam.examName || exam.name);
            return exam.published === true && hasId && hasName;
        });

        if (activeExams.length === 0) {
            this.ui.examSelect.innerHTML = '<option value="">No published exams currently available</option>';
            this.ui.examSelect.disabled = true;
            return;
        }

        // Add Default Option
        const defaultOpt = document.createElement('option');
        defaultOpt.value = "";
        defaultOpt.textContent = "-- Select Academic Session --";
        this.ui.examSelect.appendChild(defaultOpt);

        // Populate with validated data
        activeExams.forEach(exam => {
            const opt = document.createElement('option');
            opt.value = exam.examId || exam.id; // Correct key priority
            opt.textContent = exam.examName || exam.name;
            this.ui.examSelect.appendChild(opt);
        });

        this.ui.examSelect.disabled = false;
    },

    /**
     * 3. SEARCH & RENDER LOGIC
     */
    handleSearch() {
        const examId = this.ui.examSelect.value;
        const roll = this.ui.rollInput.value.trim();

        if (!examId) return alert("Please select an academic session.");
        if (!roll) return this.ui.rollInput.focus();

        // Update URL for bookmarkability
        const url = new URL(window.location.href);
        url.searchParams.set('exam', examId);
        url.searchParams.set('roll', roll);
        window.history.pushState({}, '', url);

        this.performSearch(examId, roll);
    },

    performSearch(examId, roll) {
        if (!this.data || !this.data.exams) return;

        this.renderLoading();

        // Simulation delay for better UX feel
        setTimeout(() => {
            const exam = this.data.exams.find(e => (e.examId || e.id) === examId);
            if (!exam) return this.renderNotFound("Exam Session Not Found", roll);

            // Strict string comparison for roll numbers (trimmed)
            const student = exam.results.find(r => String(r.roll).trim() === String(roll).trim());

            if (student) {
                this.renderResult(student, exam.examName);
            } else {
                this.renderNotFound(exam.examName, roll);
            }
        }, 500);
    },

    /**
     * UI RENDERING COMPONENTS
     */
    renderResult(student, examName) {
        if (!this.ui.display) return;
        this.ui.display.style.display = "block";

        // Build subject-wise marks table if subjects exist
        let subjectsHTML = '';
        if (student.subjects && typeof student.subjects === 'object') {
            const subjectEntries = Object.entries(student.subjects);
            if (subjectEntries.length > 0) {
                subjectsHTML = `
                    <div style="margin-top: 30px;">
                        <h3 style="font-size: 1.2rem; color: #fff; margin-bottom: 15px; text-align: center;">Subject-wise Performance</h3>
                        <table style="width: 100%; border-collapse: collapse; background: rgba(0,0,0,0.2); border-radius: 12px; overflow: hidden;">
                            <thead>
                                <tr style="background: rgba(0, 229, 255, 0.1);">
                                    <th style="padding: 12px; text-align: left; color: #888; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">Subject</th>
                                    <th style="padding: 12px; text-align: right; color: #888; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${subjectEntries.map(([subject, marks]) => `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 15px 12px; color: #fff; font-weight: 500;">${subject}</td>
                                        <td style="padding: 15px 12px; text-align: right; color: var(--primary); font-weight: 700; font-size: 1.1rem;">${marks}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }

        this.ui.display.innerHTML = `
            <div class="glass-card result-card animate-slide-up" style="margin-top: 30px;">
                <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 25px;">
                    <h2 style="font-size: 2.2rem; color: var(--primary); margin: 0;">${student.name}</h2>
                    <p style="color: #888; margin: 5px 0 0;">Roll Number: <b>${student.roll}</b></p>
                    <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 10px;">${examName}</p>
                </div>
                
                <div style="text-align: center; padding: 40px; background: rgba(0, 229, 255, 0.05); border-radius: 20px; border: 1px solid rgba(0, 229, 255, 0.1);">
                    <div style="font-size: 4.5rem; font-weight: 800; color: #fff; line-height: 1;">${student.total}</div>
                    <div style="color: var(--primary); text-transform: uppercase; letter-spacing: 3px; font-size: 0.75rem; margin-top: 10px; font-weight: 700;">TOTAL MARKS</div>
                </div>

                ${subjectsHTML}

                <div style="margin-top: 30px; display: flex; gap: 15px;">
                    <button class="btn-check" style="flex: 1; padding: 14px;" onclick="window.print()">
                        <i class="ph ph-printer"></i> PRINT MARK SHEET
                    </button>
                    <button class="btn-sec" style="flex: 1;" onclick="ResultApp.showSearchForm()">
                        <i class="ph ph-arrow-counter-clockwise"></i> NEW SEARCH
                    </button>
                </div>
            </div>
        `;
        this.ui.display.scrollIntoView({ behavior: 'smooth' });
    },

    renderNotFound(examName, roll) {
        if (!this.ui.display) return;
        this.ui.display.style.display = "block";
        this.ui.display.innerHTML = `
            <div class="error-state animate-slide-up" style="margin-top: 30px; padding: 60px 40px; text-align: center;">
                <i class="ph ph-warning-circle" style="font-size: 4rem; color: #ff3b3b; margin-bottom: 25px; display: block;"></i>
                <h2 style="margin: 0 0 10px; color: #fff;">Wait, something's missing...</h2>
                <p style="color: #888; line-height: 1.6; max-width: 450px; margin: 0 auto 35px;">
                    Registration number <b style="color: #fff;">${roll}</b> could not be verified for <br>
                    <span style="color: var(--primary);">${examName}</span>.
                </p>
                <button class="btn-sec" onclick="ResultApp.ui.rollInput.focus()" style="padding: 15px 40px; font-size: 1rem;">
                    <i class="ph ph-pencil-simple"></i> RE-ENTER ROLL NO
                </button>
            </div>
        `;
    },

    renderLoading() {
        if (!this.ui.display) return;
        this.ui.display.style.display = "block";
        this.ui.display.innerHTML = `
            <div class="glass-card animate-slide-up" style="margin-top: 30px; text-align: center; padding: 50px;">
                <div class="animate-spin" style="width: 40px; height: 40px; border: 4px solid var(--primary); border-top-color: transparent; border-radius: 50%; margin: 0 auto 20px;"></div>
                <p style="color: #888; letter-spacing: 2px;">VERIFYING CREDENTIALS...</p>
            </div>
        `;
    },

    showRankList() {
        if (!this.data || !this.data.exams) return;
        const examId = this.ui.examSelect.value;
        if (!examId) return alert("Select an exam to view merit list.");

        const exam = this.data.exams.find(e => (e.examId || e.id) === examId);
        if (!exam) return alert("Exam data not found.");

        this.ui.form.style.display = "none";
        document.querySelector('.portal-title') && (document.querySelector('.portal-title').style.display = "none");
        this.ui.meritView.style.display = "block";
        this.ui.meritExamName.textContent = exam.examName;

        // Sort by total marks descending
        const sorted = [...exam.results].sort((a, b) => b.total - a.total);
        this.ui.meritBody.innerHTML = sorted.map((r, i) => `
            <tr>
                <td>#${i + 1}</td>
                <td>${r.roll}</td>
                <td>${r.name}</td>
                <td style="text-align: right; color: var(--primary); font-weight: 800;">${r.total}</td>
            </tr>
        `).join('');
    },

    handleGlobalFailure() {
        if (this.ui.examSelect) {
            this.ui.examSelect.innerHTML = '<option value="">System unavailable</option>';
            this.ui.examSelect.disabled = true;
        }
    },

    handleDeepLinking() {
        const params = new URLSearchParams(window.location.search);
        const examId = params.get("exam");
        const roll = params.get("roll");

        if (examId && roll) {
            if (this.ui.examSelect) this.ui.examSelect.value = examId;
            if (this.ui.rollInput) this.ui.rollInput.value = roll;
            this.performSearch(examId, roll);
        }
    }
};

// Start the engine
document.addEventListener("DOMContentLoaded", () => {
    if (window.ResultApp) ResultApp.init();
});

// Expose to window for HTML onclick handlers
window.ResultApp = ResultApp;
window.showSearchForm = () => ResultApp.showSearchForm();
window.showRankList = () => ResultApp.showRankList();

/* =========================================
   RESULTS ENGINE (Manual Upload System)
========================================= */

// Replaces the old ResultsEngine IIFE
// Replaces the old ResultsEngine IIFE
window.ResultsSystem = {
    init: () => { console.log("ResultsSystem delegated to ResultApp"); },
    loadData: (json) => ResultApp.loadData(json)
};
