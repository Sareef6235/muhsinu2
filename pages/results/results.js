/**
 * RESULTS PORTAL - STATIC SYNC ENGINE
 * Data Source: /data/published-results.json
 */
const ResultApp = {
    data: null,
    ui: {
        examSelect: document.getElementById('examSelect'),
        rollInput: document.getElementById('rollInput'),
        form: document.getElementById('resultsForm'),
        display: document.getElementById('result-display'),
        submitBtn: document.getElementById('submitBtn')
    },

    async init() {
        try {
            // 1. Fetch JSON (Root relative path for Vercel/GitHub Pages compatibility)
            const response = await fetch("/data/published-results.json?v=" + Date.now());

            if (!response.ok) {
                throw new Error("Results database not found.");
            }

            this.data = await response.json();

            // 2. Populate Dropdown
            this.populateDropdown();

            // 3. Setup Form Listener
            if (this.ui.form) {
                this.ui.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSearch();
                });
            }

            // 4. Handle Incoming URL Params (Deep Linking)
            this.handleDeepLinking();

        } catch (error) {
            console.error("System Error:", error);
            this.handleGlobalFailure();
        }
    },

    populateDropdown() {
        if (!this.ui.examSelect) return;

        // Clear "Loading..."
        this.ui.examSelect.innerHTML = "";

        if (!this.data || !this.data.exams || this.data.exams.length === 0) {
            this.ui.examSelect.innerHTML = '<option value="">No published exams available</option>';
            this.ui.examSelect.disabled = true;
            return;
        }

        // Add Default
        const defaultOpt = document.createElement('option');
        defaultOpt.value = "";
        defaultOpt.textContent = "-- Select Academic Session --";
        this.ui.examSelect.appendChild(defaultOpt);

        // Add Exams
        this.data.exams.forEach(exam => {
            const opt = document.createElement('option');
            opt.value = exam.examId;
            opt.textContent = exam.examName;
            this.ui.examSelect.appendChild(opt);
        });

        this.ui.examSelect.disabled = false;
    },

    handleSearch() {
        const examId = this.ui.examSelect.value;
        const roll = this.ui.rollInput.value.trim();

        if (!examId) return alert("Please select an exam session.");
        if (!roll) return this.ui.rollInput.focus();

        // Redirect to same page with params for bookmarkability
        const url = new URL(window.location.href);
        url.searchParams.set('exam', examId);
        url.searchParams.set('roll', roll);

        // Push state so back button works, then run search
        window.history.pushState({}, '', url);
        this.performSearch(examId, roll);
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
    },

    performSearch(examId, roll) {
        if (!this.data || !this.data.exams) return;

        this.renderLoading();

        // Simulate network feel
        setTimeout(() => {
            const exam = this.data.exams.find(e => e.examId === examId);
            if (!exam) return this.renderNotFound("Exam Session Not Found");

            const student = exam.results.find(r => String(r.roll).trim() === String(roll).trim());

            if (student) {
                this.renderResult(student, exam.examName);
            } else {
                this.renderNotFound(`Registration No. ${roll} not found in ${exam.examName}`);
            }
        }, 600);
    },

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
                    <button class="btn-sec" style="flex: 1;" onclick="location.href='index.html'">
                        <i class="ph ph-arrow-counter-clockwise"></i> NEW SEARCH
                    </button>
                </div>
            </div>
        `;
        this.ui.display.scrollIntoView({ behavior: 'smooth' });
    },

    renderNotFound(message) {
        if (!this.ui.display) return;
        this.ui.display.style.display = "block";
        this.ui.display.innerHTML = `
            <div class="error-state animate-slide-up" style="margin-top: 30px; padding: 50px;">
                <i class="ph ph-warning-octagon" style="font-size: 3rem; color: #ff3d3d; margin-bottom: 15px; display: block;"></i>
                <h3 style="color: #fff; margin:0 0 10px;">No Match Found</h3>
                <p style="color: #888;">${message}</p>
                <button class="btn-sec" style="margin-top: 20px; padding: 8px 20px;" onclick="document.getElementById('rollInput').focus()">
                    Check Roll Number
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

    handleGlobalFailure() {
        if (this.ui.examSelect) {
            this.ui.examSelect.innerHTML = '<option value="">System unavailable</option>';
            this.ui.examSelect.disabled = true;
        }
        this.renderNotFound("The results database is currently unreachable. Please try again later.");
    }
};

// Initialize
document.addEventListener("DOMContentLoaded", () => ResultApp.init());
