console.log("JS LOADED");

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
        submitBtn: document.getElementById('submitBtn'),
        meritView: document.getElementById('merit-view'),
        meritBody: document.getElementById('results-table-body'),
        meritExamName: document.getElementById('merit-exam-name')
    },

    async init() {
        try {
            // 1. Fetch JSON (Root relative path)
            const response = await fetch("/data/published-results.json?v=" + Date.now());

            if (!response.ok) {
                // Try fallback to published-exams.json if results.json not found
                console.warn("Attempting fallback data source...");
                const fallback = await fetch("/data/published-exams.json");
                if (!fallback.ok) throw new Error("Results database not found.");
                this.data = await fallback.json();
            } else {
                this.data = await response.json();
            }

            console.log("Published data:", this.data);

            // 2. Populate Dropdown
            this.populateDropdown();

            // 3. Setup Form Listener
            if (this.ui.form) {
                this.ui.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    console.log("Submit clicked");
                    this.handleSearch();
                });
            }

            // 4. Global UI Bridge (Explicitly for onclick handlers)
            window.UI = {
                roll: this.ui.rollInput
            };
            window.showRankList = () => this.showRankList();
            window.showSearchForm = () => this.showSearchForm();

            // 5. Handle Incoming URL Params (Deep Linking)
            this.handleDeepLinking();

        } catch (error) {
            console.error("System Error:", error);
            this.handleGlobalFailure();
        }
    },

    populateDropdown() {
        if (!this.ui.examSelect) return;
        this.ui.examSelect.innerHTML = "";

        if (!this.data || !this.data.exams || this.data.exams.length === 0) {
            this.ui.examSelect.innerHTML = '<option value="">No published exams available</option>';
            this.ui.examSelect.disabled = true;
            return;
        }

        const defaultOpt = document.createElement('option');
        defaultOpt.value = "";
        defaultOpt.textContent = "-- Select Academic Session --";
        this.ui.examSelect.appendChild(defaultOpt);

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

        console.log("Selected exam:", examId);
        console.log("Roll entered:", roll);

        if (!examId) return alert("Please select an exam session.");
        if (!roll) return this.ui.rollInput.focus();

        const url = new URL(window.location.href);
        url.searchParams.set('exam', examId);
        url.searchParams.set('roll', roll);

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

        setTimeout(() => {
            const exam = this.data.exams.find(e => e.examId === examId);
            console.log("Exam found:", exam);

            if (!exam) return this.renderNotFound("Exam Session Not Found", roll);

            const foundResult = exam.results.find(r => String(r.roll).trim() === String(roll).trim());
            console.log("Matching result:", foundResult);

            if (foundResult) {
                this.renderResult(foundResult, exam.examName);
            } else {
                console.log("Rendering error UI");
                this.renderNotFound(exam.examName, roll);
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
                    <button class="btn-sec" style="flex: 1;" onclick="window.showSearchForm()">
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
                <button class="btn-sec" onclick="UI.roll.focus()" style="padding: 15px 40px; font-size: 1rem;">
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
        const examId = this.ui.examSelect.value;
        if (!examId) return alert("Select an exam to view merit list.");

        const exam = this.data.exams.find(e => e.examId === examId);
        if (!exam) return alert("Exam data not found.");

        this.ui.form.style.display = "none";
        document.querySelector('.portal-title').style.display = "none";
        this.ui.meritView.style.display = "block";
        this.ui.meritExamName.textContent = exam.examName;

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

    showSearchForm() {
        this.ui.form.style.display = "grid";
        document.querySelector('.portal-title').style.display = "block";
        this.ui.meritView.style.display = "none";
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
        this.renderNotFound("Database Unreachable", "System");
    }
};

document.addEventListener("DOMContentLoaded", () => ResultApp.init());
