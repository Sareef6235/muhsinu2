/**
 * ----------------------------------------------------
 * ULTRA ADMIN RESULT SYSTEM (Static Memory-Only)
 * ----------------------------------------------------
 */

const I18N = {
    en: { name: "Name", roll: "Register No", sub: "Subject", max: "Max", obt: "Obtained", stat: "Status", tot: "Total", perc: "Percentage", grd: "Grade", res: "Result", sign: "Principal Signature" },
    mal: { name: "പേര്", roll: "രജിസ്റ്റർ നമ്പർ", sub: "വിഷയം", max: "പരമാവധി", obt: "ലഭിച്ചത്", stat: "നില", tot: "ആകെ", perc: "ശതമാനം", grd: "ഗ്രേഡ്", res: "ഫലം", sign: "പ്രിൻസിപ്പൽ" },
    ar: { name: "الاسم", roll: "رقم التسجيل", sub: "المادة", max: "الحد الأقصى", obt: "المحصلة", stat: "الحالة", tot: "المجموع", perc: "النسبة", grd: "الدرجة", res: "النتيجة", sign: "توقيع المدير" },
    ta: { name: "பெயர்", roll: "பதிவு எண்", sub: "பாடம்", max: "அதிகபட்சம்", obt: "பெற்றது", stat: "நிலை", tot: "மொத்தம்", perc: "சதவீதம்", grd: "தரம்", res: "முடிவு", sign: "முதல்வர் கையொப்பம்" },
    kn: { name: "ಹೆಸರು", roll: "ನೋಂದಣಿ ಸಂಖ್ಯೆ", sub: "ವಿಷಯ", max: "ಗರಿಷ್ಠ", obt: "ಗಳಿಸಿದ", stat: "ಸ್ಥಿತಿ", tot: "ಒಟ್ಟು", perc: "ಶೇಕಡಾವಾರು", grd: "ಶ್ರೇಣಿ", res: "ಫಲಿತಾಂಶ", sign: "ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ" },
    te: { name: "పేరు", roll: "రిజిస్టర్ నంబర్", sub: "విషయం", max: "గరిష్ట", obt: "పొందిన", stat: "స్థితి", tot: "మొత్తం", perc: "శాతం", grd: "గ్రేడ్", res: "ఫలితం", sign: "ప్రిన్సిపాల్ సంతకం" },
    ur: { name: "نام", roll: "رجسٹریشن نمبر", sub: "مضمون", max: "زیادہ سے زیادہ", obt: "حاصل کردہ", stat: "حیثیت", tot: "کل", perc: "فیصد", grd: "گریڈ", res: "نتیجہ", sign: "پرنسپل کے دستخط" },
    hi: { name: "नाम", roll: "पंजीकरण संख्या", sub: "विषय", max: "अधिकतम", obt: "प्राप्त", stat: "स्थिति", tot: "कुल", perc: "प्रतिशत", grd: "श्रेणी", res: "परिणाम", sign: "प्रधानाचार्य" }
};

// Global state for published data
let publicData = null;

// Main Application Object
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

    // --- PANEL INJECTION ---
    loadExamPanels() {
        const mainContent = document.createElement('main');
        mainContent.className = 'admin-content';

        mainContent.innerHTML = `
            <!-- 1. DASHBOARD -->
            <div id="panel-dashboard" class="panel active">
                <h2>Dashboard Overview</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-val" id="d-total">0</div>
                        <div class="stat-label">Total Students</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-val" id="d-pass" style="color: var(--success);">0%</div>
                        <div class="stat-label">Pass Percentage</div>
                    </div>
                </div>
            </div>

            <!-- 2. UPLOAD RESULTS -->
            <div id="panel-results" class="panel">
                <h2>Upload Results</h2>
                <div class="card">
                    <p>Select your <code>published-results.json</code> file.</p>
                    <input type="file" accept=".json" class="form-control" id="published-results-upload">
                    <p id="upload-status" style="margin-top: 10px; font-weight: 500;"></p>
                </div>

                <h3>Recent Data Preview</h3>
                <div style="overflow-x: auto; background: white; border-radius: 8px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead style="background: #eee; text-align: left;">
                            <tr>
                                <th style="padding: 10px;">Roll</th>
                                <th style="padding: 10px;">Name</th>
                                <th style="padding: 10px;">Total</th>
                                <th style="padding: 10px;">Action</th>
                            </tr>
                        </thead>
                        <tbody id="preview-table">
                            <tr>
                                <td colspan="4" style="padding: 20px; text-align: center; color: #888;">No Data</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 3. CERTIFICATE SETTINGS -->
            <div id="panel-certificate" class="panel">
                <h2>Certificate Configuration</h2>
                <div class="card">
                    <div class="form-group">
                        <label>Institution Name</label>
                        <input type="text" id="confSchool" class="form-control" value="Global Excellence Academy">
                    </div>
                    <div class="form-group">
                        <label>Certificate Title</label>
                        <input type="text" id="confTitle" class="form-control" value="Official Statement of Marks">
                    </div>
                    <div class="form-group">
                        <label>Academic Session</label>
                        <input type="text" id="confSession" class="form-control" value="2025-2026">
                    </div>
                    <div class="form-group">
                        <label>Language</label>
                        <select id="confLang" class="form-control">
                            <option value="en">English</option>
                            <option value="mal">Malayalam</option>
                            <option value="ar">Arabic</option>
                            <option value="ta">Tamil</option>
                            <option value="kn">Kannada</option>
                            <option value="te">Telugu</option>
                            <option value="ur">Urdu</option>
                            <option value="hi">Hindi</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Pass Mark Value</label>
                        <input type="number" id="confPass" class="form-control" value="35">
                    </div>
                </div>
            </div>

            <!-- 4. SIGNATURE -->
            <div id="panel-signature" class="panel">
                <h2>Principal Signature</h2>
                <div class="card">
                    <input type="file" accept="image/*" class="form-control" id="signature-upload">
                    <div style="margin-top: 20px;">
                        <p>Current Signature:</p>
                        <img id="sig-preview" src="" alt="No Signature"
                            style="max-height: 80px; border: 1px dashed #ccc; padding: 10px;">
                    </div>
                </div>
            </div>

            <!-- 5. ANALYTICS -->
            <div id="panel-analytics" class="panel">
                <h2>Analytics</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-val" id="a-topt">0</div>
                        <div class="stat-label">Top Score</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-val" id="a-avg">0</div>
                        <div class="stat-label">Average Score</div>
                    </div>
                </div>
            </div>

            <!-- 6. SCHOOL PROFILES -->
            <div id="panel-schools" class="panel">
                <h2>School Profiles</h2>
                <div class="card">
                    <p>School profile management will be available when multi-school JSON data is loaded.</p>
                </div>
            </div>
        `;

        document.body.appendChild(mainContent);

        // Attach event listeners after DOM injection
        this.attachEventListeners();
    },

    // --- EVENT LISTENERS ---
    attachEventListeners() {
        // File upload for results
        const uploadInput = document.getElementById('published-results-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => this.handleJsonUpload(e.target));
        }

        // Signature upload
        const sigInput = document.getElementById('signature-upload');
        if (sigInput) {
            sigInput.addEventListener('change', (e) => this.handleSignature(e.target));
        }

        // Config inputs
        const confInputs = ['confSchool', 'confTitle', 'confSession', 'confLang', 'confPass'];
        confInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.saveMeta());
                el.addEventListener('change', () => this.saveMeta());
            }
        });
    },

    // --- AUTH ---
    toggleAdminLogin() {
        const form = document.getElementById('admin-login-form');
        if (form) form.classList.toggle('hidden');
    },

    adminLogin() {
        const pass = document.getElementById('adminPassInput')?.value;
        if (pass === "admin123") {
            document.getElementById('public-view')?.classList.add('hidden');
            document.getElementById('admin-layout')?.classList.remove('hidden');
        } else {
            alert("Incorrect Password!");
        }
    },

    logout() {
        if (confirm("Logout? All unsaved memory data will be lost on refresh!")) {
            document.getElementById('admin-layout')?.classList.add('hidden');
            document.getElementById('public-view')?.classList.remove('hidden');
            const passInput = document.getElementById('adminPassInput');
            if (passInput) passInput.value = "";
            document.getElementById('admin-login-form')?.classList.add('hidden');
        }
    },

    switchSchool(value) {
        console.log("Switching school to " + value);
    },

    // --- NAV ---
    nav(panelId, el) {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById('panel-' + panelId);
        if (panel) panel.classList.add('active');

        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        if (el) el.classList.add('active');
    },

    // --- DATA HANDLING ---
    handleJsonUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.initializePortal(data);

                const statusEl = document.getElementById('upload-status');
                if (statusEl) {
                    statusEl.innerHTML = "✅ Results loaded successfully";
                    statusEl.style.color = "green";
                }

            } catch (err) {
                console.error(err);
                const statusEl = document.getElementById('upload-status');
                if (statusEl) {
                    statusEl.innerHTML = "❌ Invalid JSON file";
                    statusEl.style.color = "red";
                }
            }
        };
        reader.readAsText(file);
    },

    initializePortal(data) {
        publicData = data;

        let allStudents = [];

        // Handle different JSON structures
        if (data.exams && Array.isArray(data.exams)) {
            data.exams.forEach(ex => {
                if (ex.students) allStudents.push(...ex.students);
                if (ex.results) allStudents.push(...ex.results);
            });
        } else if (Array.isArray(data)) {
            allStudents = data;
        } else if (data.data && data.data.exams) {
            data.data.exams.forEach(ex => {
                if (ex.students) allStudents.push(...ex.students);
                if (ex.results) allStudents.push(...ex.results);
            });
        }

        this.state.students = allStudents;
        console.log(`Loaded ${allStudents.length} student records`);

        this.updateDashboard();
        this.renderPreview();

        // Initialize exam selector if exists
        const examSelect = document.getElementById('examSelect');
        if (examSelect && data.exams) {
            examSelect.innerHTML = `<option value="">-- Select Exam --</option>`;
            data.exams.forEach(exam => {
                examSelect.innerHTML += `
                    <option value="${exam.examId || exam.id}">
                        ${exam.examName || exam.name || exam.displayName}
                    </option>
                `;
            });
            examSelect.disabled = false;
        }
    },

    // --- UI UPDATES ---
    updateDashboard() {
        const total = this.state.students.length;
        const totalEl = document.getElementById('d-total');
        if (totalEl) totalEl.textContent = total;

        let passed = 0;
        let maxScore = 0;
        let totalScoreSum = 0;

        this.state.students.forEach(s => {
            const score = s.total || 0;
            if (score > maxScore) maxScore = score;
            totalScoreSum += score;

            let isPass = true;
            const subjects = s.subjects || {};
            Object.values(subjects).forEach(v => {
                if (Number(v) < this.state.meta.passVal) isPass = false;
            });
            if (isPass) passed++;
        });

        const passPerc = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
        const passEl = document.getElementById('d-pass');
        if (passEl) passEl.textContent = passPerc + "%";

        const topEl = document.getElementById('a-topt');
        if (topEl) topEl.textContent = maxScore;

        const avgEl = document.getElementById('a-avg');
        if (avgEl) avgEl.textContent = total > 0 ? (totalScoreSum / total).toFixed(0) : 0;
    },

    renderPreview() {
        const tbody = document.getElementById('preview-table');
        if (!tbody) return;

        if (this.state.students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #888;">No Data</td></tr>';
            return;
        }

        tbody.innerHTML = this.state.students.slice(0, 10).map(s => `
            <tr>
                <td style="padding:10px; border-bottom:1px solid #eee;">${s.roll || s.rollNo || s.registerNumber || '-'}</td>
                <td style="padding:10px; border-bottom:1px solid #eee;">${s.name}</td>
                <td style="padding:10px; border-bottom:1px solid #eee;">${s.total || 0}</td>
                <td style="padding:10px; border-bottom:1px solid #eee;">
                    <button class="btn btn-sm btn-secondary" onclick="proExamApp.previewCert('${s.roll || s.rollNo || s.registerNumber}')">View</button>
                </td>
            </tr>
        `).join('');
    },

    // --- META & CONFIG ---
    saveMeta() {
        const schoolEl = document.getElementById('confSchool');
        const titleEl = document.getElementById('confTitle');
        const sessionEl = document.getElementById('confSession');
        const langEl = document.getElementById('confLang');
        const passEl = document.getElementById('confPass');

        if (schoolEl) this.state.meta.school = schoolEl.value;
        if (titleEl) this.state.meta.title = titleEl.value;
        if (sessionEl) this.state.meta.session = sessionEl.value;
        if (langEl) this.state.meta.lang = langEl.value;
        if (passEl) this.state.meta.passVal = Number(passEl.value);
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

                const preview = document.getElementById('sig-preview');
                if (preview) preview.src = b64;
            };
        };
        reader.readAsDataURL(file);
    },

    // --- SEARCH & CERTIFICATE ---
    publicSearch() {
        const regInput = document.getElementById('publicRegInput');
        if (!regInput) return;

        const reg = regInput.value.trim();
        if (!reg) return;
        this.previewCert(reg);
    },

    previewCert(regNo) {
        const s = this.state.students.find(st =>
            (st.roll == regNo) || (st.rollNo == regNo) || (st.registerNumber == regNo)
        );

        if (!s) {
            const msgEl = document.getElementById('public-msg');
            if (msgEl) msgEl.textContent = "Result Not Found";
            else alert("Not Found");
            return;
        }

        // Certificate rendering logic would go here
        console.log("Rendering certificate for:", s.name);
        alert(`Certificate for ${s.name} - Roll: ${regNo}`);
    },

    // --- INITIALIZATION ---
    async fetchPublishedData() {
        try {
            const response = await fetch('../../data/published-results.json');
            if (!response.ok) throw new Error("No data found");
            const json = await response.json();

            if (json.meta) this.state.meta = json.meta;
            if (json.signature) this.state.signature = json.signature;

            this.initializePortal(json);
            console.log("Published data loaded successfully");
        } catch (err) {
            console.log("Static data fetch skipped:", err.message);
        }
    },

    async init() {
        console.log("Exam Portal Initializing...");
        await this.fetchPublishedData();
        this.updateDashboard();
        this.renderPreview();
    }
};

// Auto-initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    proExamApp.init();
});
