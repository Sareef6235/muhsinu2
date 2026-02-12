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
            meritExamName: document.getElementById('merit-exam-name')
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

        } catch (error) {
            console.error("Critical System Failure:", error);
            this.handleGlobalFailure();
        }
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

window.ResultsEngine = (function () {

    let publishedData = null;

    /* ---------- Utils ---------- */

    function safeText(text) {
        return String(text).replace(/[<>]/g, "");
    }

    function updateStats() {
        if (!publishedData) return;

        const exams = publishedData.exams || [];
        const totalStudents = exams.reduce((sum, ex) => {
            const results = ex.results || ex.students || [];
            return sum + results.length;
        }, 0);

        const examsEl = document.getElementById("results-exams-count");
        const totalEl = document.getElementById("results-total-count");
        const syncEl = document.getElementById("results-last-sync");

        if (examsEl) examsEl.textContent = exams.length;
        if (totalEl) totalEl.textContent = totalStudents;
        if (syncEl) syncEl.textContent = new Date().toLocaleTimeString();
    }

    function populateExamDropdown() {
        const select = document.getElementById("examSelect");
        if (!select) return;

        select.innerHTML = `<option value="">-- Select Academic Session --</option>`;

        publishedData.exams.forEach(exam => {
            const opt = document.createElement("option");
            opt.value = exam.examId || exam.id;
            opt.textContent = safeText(exam.examName || exam.name);
            select.appendChild(opt);
        });

        select.disabled = false;
    }

    function showStatus(message, success = true) {
        const status = document.getElementById("published-results-status");
        if (!status) return;

        status.style.color = success ? "#2ed573" : "#ff4757";
        status.innerHTML = success
            ? `<i class="ph-bold ph-check-circle"></i> ${safeText(message)}`
            : `<i class="ph-bold ph-warning-circle"></i> ${safeText(message)}`;
    }

    /* ---------- Upload Handler ---------- */

    function handleUpload(file) {
        if (!file) return;

        // Logic Protection: Security Check
        if (typeof AuthManager !== 'undefined' && !AuthManager.isAdmin()) {
            showStatus("Admin privileges required to upload results.", false);
            alert("Security Error: Unauthorized upload attempt blocked.");
            return;
        }

        if (!file.name.endsWith(".json")) {
            showStatus("Invalid file format. Upload JSON only.", false);
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);

                // Basic schema validation
                if (!data.exams || !Array.isArray(data.exams)) {
                    throw new Error("Invalid results schema.");
                }

                publishedData = data;

                updateStats();
                populateExamDropdown();
                showStatus("Loaded: " + file.name, true);

            } catch (err) {
                showStatus("JSON validation failed.", false);
                console.error(err);
            }
        };

        reader.readAsText(file);
    }

    /* ---------- Search Logic ---------- */

    function handleSearch(e) {
        if (e) e.preventDefault();

        const examId = document.getElementById("examSelect").value;
        const roll = document.getElementById("rollInput").value.trim();

        if (!examId || !roll) return;

        const exam = publishedData.exams.find(e => (e.examId || e.id) === examId);
        if (!exam) return;

        const results = exam.results || exam.students || [];
        const student = results.find(s => String(s.roll).trim() === String(roll).trim());

        if (!student) {
            alert("Result not found.");
            return;
        }

        // Bridge to ResultApp's renderer
        if (window.ResultApp && typeof window.ResultApp.renderResult === 'function') {
            window.ResultApp.renderResult(student, exam.examName || exam.name);
        } else {
            alert(`Name: ${student.name}\nTotal: ${student.total}`);
        }
    }

    /* ---------- Merit List ---------- */

    function showMerit() {
        if (!publishedData) return alert("Please upload results file first.");

        const examId = document.getElementById("examSelect").value;
        if (!examId) return alert("Select exam first.");

        const exam = publishedData.exams.find(e => (e.examId || e.id) === examId);
        if (!exam) return;

        const results = exam.results || exam.students || [];
        const sorted = [...results].sort((a, b) => b.total - a.total);

        const tbody = document.getElementById("results-table-body");
        const meritView = document.getElementById("merit-view");
        const resultsForm = document.getElementById("resultsForm");
        const examLabel = document.getElementById("merit-exam-name");

        if (!tbody || !meritView || !resultsForm) return;

        tbody.innerHTML = "";
        if (examLabel) examLabel.textContent = exam.examName || exam.name;

        sorted.forEach((s, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>#${i + 1}</td>
                <td>${safeText(s.roll)}</td>
                <td>${safeText(s.name)}</td>
                <td style="text-align:right; color: var(--primary); font-weight: 800;">${s.total}</td>
            `;
            tbody.appendChild(tr);
        });

        meritView.style.display = "block";
        resultsForm.style.display = "none";

        const title = document.querySelector('.portal-title');
        if (title) title.style.display = "none";
    }

    function showSearch() {
        const meritView = document.getElementById("merit-view");
        const resultsForm = document.getElementById("resultsForm");
        const title = document.querySelector('.portal-title');

        if (meritView) meritView.style.display = "none";
        if (resultsForm) resultsForm.style.display = "grid";
        if (title) title.style.display = "block";
    }

    function clearData() {
        publishedData = null;
        const select = document.getElementById("examSelect");
        if (select) {
            select.innerHTML = `<option value="">-- Select Academic Session --</option>`;
            select.disabled = true;
        }
        updateStats();
        showStatus("Cleared.", false);
    }

    /* ---------- Public API ---------- */

    return {
        init: function () {
            const fileInput = document.getElementById("published-results-upload");
            const form = document.getElementById("resultsForm");

            if (fileInput) {
                fileInput.addEventListener("change", function () {
                    handleUpload(this.files[0]);
                });
            }

            if (form) {
                form.addEventListener("submit", handleSearch);
            }

            // Expose handlers globally
            window.showRankList = showMerit;
            window.showSearchForm = showSearch;
            window.clearPublishedResults = clearData;
        }
    };

})();
