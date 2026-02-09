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

    showSearchForm() {
        this.ui.form.style.display = "grid";
        document.querySelector('.portal-title') && (document.querySelector('.portal-title').style.display = "block");
        this.ui.meritView && (this.ui.meritView.style.display = "none");
        if (this.ui.display) {
            this.ui.display.innerHTML = "";
            this.ui.display.style.display = "none";
        }
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
document.addEventListener("DOMContentLoaded", () => ResultApp.init());

// Expose shared methods
window.showSearchForm = () => ResultApp.showSearchForm();
