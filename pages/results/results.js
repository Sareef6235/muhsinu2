/**
 * RESULTS PORTAL - PRODUCTION ENGINE (STATIC FLOW)
 * Data Source: /data/published-results.json
 * Compatibility: GitHub Pages, Vercel (Pure Vanilla JS)
 */
const ResultApp = {
    data: null,
    ui: {
        display: document.getElementById('result-display'),
        examSelect: document.getElementById('examSelect'),
        rollInput: document.getElementById('rollInput'),
        form: document.getElementById('resultsForm')
    },

    async init() {
        try {
            this.renderLoading(); // Initial state

            // 1. Fetch JSON (Relative path safe for static hosting)
            // Using ../../data/ as current file is in /pages/results/
            const response = await fetch("../../data/published-results.json?cache_bust=" + Date.now());

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            this.data = await response.json();

            // 2. Populate Dropdown (Mandatory Rule: Never leave empty)
            this.populateDropdown();

            // 3. Handle URL Deep-Linking
            this.handleDeepLinking();

            // 4. Form Submission Handler
            if (this.ui.form) {
                this.ui.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSearchRedirect();
                });
            }

            // If we have data but no search yet, hide the loading but keep structure
            if (!window.location.search) {
                this.ui.display.style.display = "none";
            }

        } catch (error) {
            console.error("Critical System Failure:", error);
            this.renderSystemUnavailable();
        }
    },

    populateDropdown() {
        if (!this.ui.examSelect) return;

        // Clear "Loading..." option
        this.ui.examSelect.innerHTML = "";

        if (!this.data || !this.data.exams || this.data.exams.length === 0) {
            const opt = document.createElement('option');
            opt.textContent = "No Exams Published";
            this.ui.examSelect.appendChild(opt);
            this.ui.examSelect.disabled = true;
            return;
        }

        // Add Default Option
        const defaultOpt = document.createElement('option');
        defaultOpt.value = "";
        defaultOpt.textContent = "-- Select Exam --";
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

    handleDeepLinking() {
        const params = new URLSearchParams(window.location.search);
        const examId = params.get("exam");
        const roll = params.get("roll");

        if (examId && roll) {
            // Set UI values to match URL
            if (this.ui.examSelect) this.ui.examSelect.value = examId;
            if (this.ui.rollInput) this.ui.rollInput.value = roll;

            this.performSearch(examId, roll);
        }
    },

    handleSearchRedirect() {
        const examId = this.ui.examSelect.value;
        const roll = this.ui.rollInput.value.trim();

        if (!examId) return alert("Please select an exam session.");
        if (!roll) return this.ui.rollInput.focus();

        // Standard requirement: Redirect to same page with params
        const url = new URL(window.location.href);
        url.searchParams.set('exam', examId);
        url.searchParams.set('roll', roll);

        // Use replaceState to update URL without full page refresh for better UX
        window.history.replaceState({}, '', url);

        this.performSearch(examId, roll);
    },

    performSearch(examId, rawRoll) {
        const roll = String(rawRoll).trim();
        this.renderLoading();

        // Safety check
        if (!this.data || !this.data.exams) return;

        const exam = this.data.exams.find(e => e.examId === examId);

        // UX Delay for "Search" feel
        setTimeout(() => {
            if (!exam) {
                this.renderNotFound(roll, "Academic Session Not Found");
                return;
            }

            const student = exam.results.find(r => String(r.roll).trim() === roll);

            if (student) {
                this.renderResultFound(student, exam.examName);
            } else {
                this.renderNotFound(roll, exam.examName);
            }
        }, 500);
    },

    // --- VIEW RENDERING (MANDATORY DISPLAY: BLOCK) ---

    renderResultFound(student, examName) {
        this.ui.display.style.display = "block";
        this.ui.display.innerHTML = `
            <div class="glass-card result-card animate-slide-up" style="margin-top: 30px;">
                <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 25px;">
                    <h2 style="font-size: 2rem; color: var(--primary); margin: 0;">${student.name}</h2>
                    <p style="color: #888; margin: 5px 0 0;">Registration No: <b>${student.roll}</b></p>
                    <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 10px;">Exam: ${examName}</p>
                </div>
                
                <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 15px;">
                    <div style="font-size: 4rem; font-weight: 800; color: #fff;">${student.total}</div>
                    <div style="color: #666; text-transform: uppercase; letter-spacing: 2px; font-size: 0.7rem;">TOTAL MARKS</div>
                </div>

                <div style="margin-top: 30px; display: flex; gap: 10px;">
                    <button class="btn btn-primary" style="flex: 1;" onclick="window.print()">
                        <i class="ph ph-printer"></i> PRINT RESULT
                    </button>
                </div>
            </div>
        `;
        this.ui.display.scrollIntoView({ behavior: 'smooth' });
    },

    renderNotFound(roll, examName) {
        this.ui.display.style.display = "block";
        this.ui.display.innerHTML = `
            <div class="error-state animate-slide-up" style="margin-top: 30px; padding: 40px; text-align: center;">
                <i class="ph ph-mask-sad" style="font-size: 4rem; color: #ff3d3d; margin-bottom: 20px; display: block;"></i>
                <h2 style="color: #fff; margin: 0 0 10px;">Result Not Found</h2>
                <p style="color: #888; font-size: 0.95rem;">
                   Registration No. <b>${roll}</b> could not be verified for <br>
                   <span style="color: var(--primary)">${examName}</span>.
                </p>
                <button class="btn btn-secondary" onclick="location.reload()" style="margin-top: 25px; height: 36px; padding: 0 20px;">
                    Try Another Search
                </button>
            </div>
        `;
    },

    renderLoading() {
        this.ui.display.style.display = "block";
        this.ui.display.innerHTML = `
            <div class="glass-card animate-slide-up" style="margin-top: 30px; text-align: center; padding: 40px;">
                <div class="animate-spin" style="width: 40px; height: 40px; border: 4px solid var(--primary); border-top-color: transparent; border-radius: 50%; margin: 0 auto 20px;"></div>
                <p style="color: #888; letter-spacing: 1px; font-weight: 600;">ACCESSING DATABASE...</p>
            </div>
        `;
    },

    renderSystemUnavailable() {
        this.ui.display.style.display = "block";
        this.ui.display.innerHTML = `
            <div class="error-state" style="margin-top: 30px; border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.01);">
                <i class="ph ph-plug-connected" style="font-size: 3rem; color: #666; margin-bottom: 15px; display: block;"></i>
                <h3 style="color: #fff;">System Unavailable</h3>
                <p style="color: #777; font-size: 0.85rem;">The results database is currently being updated or is inaccessible. Please try again in a few minutes.</p>
            </div>
        `;
    }
};

// Start
document.addEventListener("DOMContentLoaded", () => ResultApp.init());
