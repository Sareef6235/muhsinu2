/**
 * ==========================================
 * PRO EXAM APP - SECURE PORTAL CONTROLLER
 * ==========================================
 * Handles Public Search, Admin Uploads, Certificate Generation
 * and Security Logic.
 */

const I18N = window.ExamPortalDict || {};
const Utils = window.ExamPortalUtils || {};

const proExamApp = {
    state: {
        rawJson: null,
        students: [],
        schools: [],
        meta: {
            school: "Global Excellence Academy",
            title: "Official Statement of Marks",
            session: "2025-2026",
            lang: 'en',
            passVal: 35
        },
        signature: null
    },

    // ================= AUTH =================

    showAdminLogin() {
        document.getElementById("admin-login-box").classList.toggle("hidden");
    },

    adminLogin() {
        const pass = document.getElementById("adminPassInput").value;
        if (pass === "admin123") {
            document.getElementById("public-view").classList.add("hidden");
            document.getElementById("admin-layout").classList.remove("hidden");
        } else {
            alert("Incorrect Password!");
        }
    },

    logout() {
        if (confirm("Logout? All unsaved memory data will be lost on refresh!")) {
            document.getElementById("admin-layout").classList.add("hidden");
            document.getElementById("public-view").classList.remove("hidden");
            document.getElementById("adminPassInput").value = "";
            document.getElementById("admin-login-box").classList.add("hidden");
        }
    },

    switchSchool(value) {
        console.log("Switching school to " + value);
    },

    // ================= NAVIGATION =================

    nav(panelId, el) {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById('panel-' + panelId).classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
    },

    // ================= DATA HANDLING =================

    handleJsonUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                let allStudents = [];

                // Schema Detection
                if (data.exams) {
                    data.exams.forEach(ex => allStudents.push(...ex.results));
                } else if (Array.isArray(data)) {
                    allStudents = data;
                } else if (data.data && data.data.exams) {
                    data.data.exams.forEach(ex => allStudents.push(...ex.results));
                }

                this.state.students = allStudents;
                document.getElementById('upload-status').innerHTML = `✅ Loaded ${allStudents.length} Records`;
                document.getElementById('upload-status').style.color = "green";

                this.updateDashboard();
                this.renderPreview();

            } catch (err) {
                console.error(err);
                alert("Invalid JSON File");
            }
        };
        reader.readAsText(file);
    },

    async fetchPublishedData() {
        try {
            const response = await fetch('/api/results.php');
            if (!response.ok) throw new Error("No data found");
            const json = await response.json();

            if (json.meta) this.state.meta = json.meta;
            if (json.signature) this.state.signature = json.signature;

            if (json.data && json.data.exams) {
                let allStudents = [];
                json.data.exams.forEach(ex => allStudents.push(...ex.results));
                this.state.students = allStudents;
                console.log(`Loaded ${allStudents.length} published records.`);
            }
        } catch (err) {
            console.log("Static Data Fetch Skip:", err.message);
        }
    },

    // ================= DASHBOARD & ANALYTICS =================

    updateDashboard() {
        const total = this.state.students.length;
        document.getElementById('d-total').textContent = total;

        let passed = 0;
        let maxScore = 0;
        let totalScoreSum = 0;
        const pVal = this.state.meta.passVal;

        this.state.students.forEach(s => {
            const score = s.total || 0;
            if (score > maxScore) maxScore = score;
            totalScoreSum += score;

            const status = Utils.calculateStatus(s.subjects || {}, pVal);
            if (status === 'Pass') passed++;
        });

        const passPerc = Utils.calculatePercentage(passed, total);
        document.getElementById('d-pass').textContent = passPerc + "%";
        document.getElementById('a-topt').textContent = maxScore;
        document.getElementById('a-avg').textContent = total > 0 ? (totalScoreSum / total).toFixed(0) : 0;
    },

    renderPreview() {
        const tbody = document.getElementById('preview-table');
        if (!tbody) return;

        tbody.innerHTML = this.state.students.slice(0, 10).map(s => `
            <tr>
                <td style="padding:10px; border-bottom:1px solid #eee;">${s.roll || s.registerNumber || '-'}</td>
                <td style="padding:10px; border-bottom:1px solid #eee;">${s.name}</td>
                <td style="padding:10px; border-bottom:1px solid #eee;">${s.total || 0}</td>
                <td style="padding:10px; border-bottom:1px solid #eee;">
                    <button class="btn btn-sm btn-secondary" onclick="proExamApp.previewCert('${s.roll || s.registerNumber}')">View</button>
                </td>
            </tr>
        `).join('');
    },

    // ================= SETTINGS & META =================

    saveMeta() {
        this.state.meta.school = document.getElementById('confSchool').value;
        this.state.meta.title = document.getElementById('confTitle').value;
        this.state.meta.session = document.getElementById('confSession').value;
        this.state.meta.lang = document.getElementById('confLang').value;
        this.state.meta.passVal = Number(document.getElementById('confPass').value);
    },

    handleSignature(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const scale = Math.min(300 / img.width, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

                const b64 = canvas.toDataURL("image/jpeg", 0.7);
                this.state.signature = b64;
                document.getElementById('sig-preview').src = b64;
            };
        };
        reader.readAsDataURL(file);
    },

    // ================= PUBLIC SEARCH =================

    publicSearch() {
        const reg = document.getElementById('publicRegInput').value.trim();
        if (!reg) return;
        this.previewCert(reg);
    },

    // ================= CERTIFICATE GENERATION =================

    previewCert(regNo) {
        const s = this.state.students.find(st => (st.roll == regNo) || (st.registerNumber == regNo));

        if (!s) {
            const msgEl = document.getElementById('public-msg');
            if (msgEl) msgEl.textContent = "Result Not Found";
            else alert("Result Not Found");
            return;
        }

        // Clear error msg
        if (document.getElementById('public-msg')) document.getElementById('public-msg').textContent = "";

        // 1. Set Labels based on Language
        const dict = I18N[this.state.meta.lang] || I18N.en;
        document.querySelectorAll('.lbl-name').forEach(el => el.textContent = dict.name);
        document.querySelectorAll('.lbl-roll').forEach(el => el.textContent = dict.roll);
        document.querySelectorAll('.lbl-sub').forEach(el => el.textContent = dict.sub);
        document.querySelectorAll('.lbl-max').forEach(el => el.textContent = dict.max);
        document.querySelectorAll('.lbl-obt').forEach(el => el.textContent = dict.obt);
        document.querySelectorAll('.lbl-stat').forEach(el => el.textContent = dict.stat);
        document.querySelectorAll('.lbl-tot').forEach(el => el.textContent = dict.tot);
        document.querySelectorAll('.lbl-perc').forEach(el => el.textContent = dict.perc);
        document.querySelectorAll('.lbl-grd').forEach(el => el.textContent = dict.grd);
        document.querySelectorAll('.lbl-res').forEach(el => el.textContent = dict.res);
        document.querySelectorAll('.lbl-sign').forEach(el => el.textContent = dict.sign);

        // 2. Hydrate Data
        document.getElementById('c-school').textContent = this.state.meta.school;
        document.getElementById('c-title').textContent = this.state.meta.title;
        document.getElementById('c-session').textContent = this.state.meta.session;
        document.getElementById('c-name').textContent = s.name;
        document.getElementById('c-roll').textContent = s.roll || s.registerNumber || "-";

        document.getElementById('c-photo').src = s.photo || `https://ui-avatars.com/api/?name=${s.name}&background=random`;

        const sigEl = document.getElementById('c-sign');
        if (this.state.signature) {
            sigEl.src = this.state.signature;
            sigEl.classList.remove('hidden');
        } else {
            sigEl.classList.add('hidden');
        }

        // 3. Render Marks Table
        const tbody = document.getElementById('c-tbody');
        tbody.innerHTML = "";

        let totMax = 0, totObt = 0, allPass = true;
        const subMap = s.subjects || {};
        const pVal = this.state.meta.passVal;

        for (const [sub, marks] of Object.entries(subMap)) {
            if (sub.startsWith('@') || sub.startsWith('Column')) continue;

            const max = 100;
            const m = Number(marks);

            if (m === 0 && sub.includes("Column")) continue;

            totMax += max;
            totObt += m;

            const isPass = m >= pVal;
            if (!isPass) allPass = false;

            tbody.innerHTML += `
                <tr>
                    <td>${sub}</td>
                    <td>${max}</td>
                    <td>${m}</td>
                    <td class="${isPass ? 'status-pass' : 'status-fail'}">${isPass ? 'PASS' : 'FAIL'}</td>
                </tr>
            `;
        }

        // 4. Summary
        document.getElementById('c-total').textContent = `${totObt} / ${totMax}`;
        const perc = Utils.calculatePercentage(totObt, totMax);
        document.getElementById('c-perc').textContent = perc + "%";

        const grade = Utils.calculateGrade(perc, allPass);
        document.getElementById('c-grade').textContent = allPass ? grade : "N/A";

        const resEl = document.getElementById('c-result');
        resEl.textContent = allPass ? "PASSED" : "FAILED";
        resEl.style.color = allPass ? "var(--success)" : "var(--danger)";

        // 5. Generate QR
        Utils.generateQR('qrcode', `${s.name}|${s.roll || s.registerNumber}|${allPass ? 'PASS' : 'FAIL'}|${perc}%`);

        // 6. Show Overlay
        document.getElementById('certificate-area').classList.add('visible');
    },

    closeCert() {
        document.getElementById('certificate-area').classList.remove('visible');
    },

    downloadPDF() {
        Utils.downloadPDF('printable-cert', `Result_${new Date().getTime()}.pdf`);
    },

    async init() {
        console.log("Exam App Initializing...");
        await this.fetchPublishedData();
        this.updateDashboard();
        this.renderPreview();
    }
};

// Auto Init
document.addEventListener('DOMContentLoaded', () => {
    proExamApp.init();
});
