/**
 * RESULTS PORTAL - Static JSON Fetcher & Renderer
 * Connects to /data/published-results.json
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
            console.log("Portal: Initializing Static Flow...");

            // 1. Fetch JSON data
            // Note: Using relative path from /pages/results/index.html
            const res = await fetch("../../data/published-results.json?v=" + Date.now());
            if (!res.ok) throw new Error("Results file not found or inaccessible.");

            this.data = await res.json();
            console.log("Portal: Data Loaded", this.data?.exams?.length, "exams");

            // 2. Populate Dropdown
            this.populateDropdown();

            // 3. Handle Direct Link (URL Prams)
            const params = new URLSearchParams(window.location.search);
            const examId = params.get("exam");
            const roll = params.get("roll");

            if (examId && roll) {
                if (this.ui.examSelect) this.ui.examSelect.value = examId;
                if (this.ui.rollInput) this.ui.rollInput.value = roll;
                this.search(examId, roll);
            }

            // 4. Setup Form Listener
            if (this.ui.form) {
                this.ui.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSearch();
                });
            }

        } catch (error) {
            console.error("Portal Initialization Error:", error);
            this.renderSystemError("System currently unavailable. Please check back later.");
        }
    },

    populateDropdown() {
        if (!this.ui.examSelect) return;

        this.ui.examSelect.innerHTML = '<option value="">-- Select Academic Session --</option>';
        if (this.data && this.data.exams) {
            this.data.exams.forEach(exam => {
                const opt = document.createElement('option');
                opt.value = exam.examId;
                opt.textContent = exam.examName;
                this.ui.examSelect.appendChild(opt);
            });
            this.ui.examSelect.disabled = false;
        } else {
            this.ui.examSelect.innerHTML = '<option value="">No results published</option>';
            this.ui.examSelect.disabled = true;
        }
    },

    handleSearch() {
        const examId = this.ui.examSelect.value;
        const roll = this.ui.rollInput.value.trim();

        if (!examId) return alert("Please select an academic session.");
        if (!roll) return this.ui.rollInput.focus();

        // Update URL without reload for sharing
        const url = new URL(window.location.href);
        url.searchParams.set('exam', examId);
        url.searchParams.set('roll', roll);
        window.history.replaceState({}, '', url);

        this.search(examId, roll);
    },

    search(examId, rollInput) {
        const roll = String(rollInput).trim();
        this.renderLoading();

        if (!this.data || !this.data.exams) return this.renderSystemError("Data not loaded correctly.");

        const exam = this.data.exams.find(e => e.examId === examId);
        if (!exam) return this.renderError(roll, "Selected session not found.");

        const student = exam.results.find(r => String(r.roll).trim() === roll);

        // Small delay for UX "Searching" feel
        setTimeout(() => {
            if (student) {
                this.renderResult(student, exam.examName);
            } else {
                this.renderError(roll, exam.examName);
            }
        }, 400);
    },

    renderLoading() {
        if (!this.ui.display) return;
        this.ui.display.style.display = "block";
        this.ui.display.innerHTML = `
            <div class="glass-card animate-slide-up" style="margin-top: 30px; text-align: center; padding: 50px;">
                <i class="ph ph-circle-notch animate-spin" style="font-size: 3rem; color: var(--primary); margin-bottom: 20px; display: block;"></i>
                <p style="color: #888; letter-spacing: 2px; font-weight: 600;">SEARCHING DATABASE...</p>
            </div>
        `;
    },

    renderResult(student, examName) {
        if (!this.ui.display) return;
        this.ui.display.style.display = "block";

        this.ui.display.innerHTML = `
            <div class="glass-card result-card animate-slide-up" style="margin-top: 30px;">
                <div class="student-meta" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 30px;">
                    <div>
                        <h2 style="font-size: 2.5rem; margin: 0; color: #fff; letter-spacing: -1px;">${student.name}</h2>
                        <p style="color: #888; margin: 8px 0 0; font-size: 1.1rem;">Roll No: <b style="color: var(--primary);">${student.roll}</b></p>
                        <span style="display:inline-block; padding:6px 14px; background:rgba(0,229,255,0.05); border-radius:8px; font-size:0.75rem; margin-top:20px; border:1px solid rgba(0,229,255,0.1); color:var(--primary); font-weight:600;">${examName}</span>
                    </div>
                </div>

                <div class="summary-stats" style="margin-top:40px; display: flex; justify-content: center; text-align: center;">
                    <div class="stat-box">
                        <div style="font-size: 4rem; font-weight: 800; color: #fff;">${student.total}</div>
                        <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 1px;">TOTAL SCORE</div>
                    </div>
                </div>

                <div class="actions" style="margin-top:40px; display:flex; gap:15px;">
                    <button class="btn btn-primary" style="flex:1; padding: 15px;" onclick="window.print()">
                        <i class="ph ph-printer"></i> PRINT MARK SHEET
                    </button>
                    <button class="btn btn-secondary" style="flex:1; padding: 15px;" onclick="location.reload()">
                        <i class="ph ph-magnifying-glass"></i> NEW SEARCH
                    </button>
                </div>
            </div>
        `;
        this.ui.display.scrollIntoView({ behavior: 'smooth' });
    },

    renderError(roll, examName) {
        if (!this.ui.display) return;
        this.ui.display.style.display = "block";
        this.ui.display.innerHTML = `
            <div class="error-state animate-slide-up" style="margin-top: 30px; padding: 60px 40px; text-align: center; background: rgba(255,59,59,0.02); border: 1px dashed rgba(255,59,59,0.2); border-radius: 20px;">
                <i class="ph ph-warning-circle" style="font-size: 4rem; color: #ff3b3b; margin-bottom: 25px; display: block;"></i>
                <h2 style="margin: 0 0 10px; color: #fff;">Result Not Found</h2>
                <p style="color: #888; line-height: 1.6; max-width: 450px; margin: 0 auto 35px;">
                    Roll number <b style="color: #fff;">${roll}</b> could not be verified for <br> <span style="color: var(--primary);">${examName}</span>. 
                    Please ensure the details are correct.
                </p>
                <button class="btn btn-secondary" onclick="document.getElementById('rollInput').focus()" style="padding: 12px 30px;">
                    <i class="ph ph-pencil-simple"></i> RE-ENTER ROLL NO
                </button>
            </div>
        `;
        this.ui.display.scrollIntoView({ behavior: 'smooth' });
    },

    renderSystemError(msg) {
        if (!this.ui.display) return;
        this.ui.display.style.display = "block";
        this.ui.display.innerHTML = `
            <div class="error-state animate-slide-up" style="margin-top: 30px; padding: 40px; text-align: center; border: 1px dashed rgba(255,255,255,0.1); background: rgba(255,255,255,0.01); border-radius: 20px;">
                <i class="ph ph-shield-warning" style="font-size: 3rem; color: #666; margin-bottom: 20px; display: block;"></i>
                <p style="color: #bbb; font-size: 1.1rem;">${msg}</p>
            </div>
        `;
    }
};

document.addEventListener("DOMContentLoaded", () => ResultApp.init());
