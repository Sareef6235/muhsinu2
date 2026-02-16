proExamApp.previewCert = function (regNo) {
    const student = this.state.students.find(s =>
        (s.roll == regNo) || (s.rollNo == regNo) || (s.registerNumber == regNo)
    );

    if (!student) {
        alert("Result Not Found");
        return;
    }

    // Certificate overlay
    let certArea = document.getElementById('certificate-area');
    if (!certArea) {
        certArea = document.createElement('div');
        certArea.id = 'certificate-area';
        certArea.style.position = 'fixed';
        certArea.style.top = 0;
        certArea.style.left = 0;
        certArea.style.width = '100%';
        certArea.style.height = '100%';
        certArea.style.background = 'rgba(0,0,0,0.6)';
        certArea.style.display = 'flex';
        certArea.style.justifyContent = 'center';
        certArea.style.alignItems = 'center';
        certArea.style.zIndex = 9999;
        document.body.appendChild(certArea);
    }

    certArea.innerHTML = `
        <div style="background:#fff; padding:20px; max-width:600px; width:90%; border-radius:8px; position:relative;">
            <button style="position:absolute; top:10px; right:10px;" onclick="document.getElementById('certificate-area').style.display='none'">Close</button>
            <h2>${this.state.meta.title}</h2>
            <p><strong>Institution:</strong> ${this.state.meta.school}</p>
            <p><strong>Session:</strong> ${this.state.meta.session}</p>
            <p><strong>${I18N[this.state.meta.lang].name}:</strong> ${student.name}</p>
            <p><strong>${I18N[this.state.meta.lang].roll}:</strong> ${student.roll || student.rollNo || student.registerNumber}</p>
            <table border="1" style="width:100%; border-collapse: collapse; margin-top:10px;">
                <thead>
                    <tr>
                        <th>${I18N[this.state.meta.lang].sub}</th>
                        <th>${I18N[this.state.meta.lang].max}</th>
                        <th>${I18N[this.state.meta.lang].obt}</th>
                        <th>${I18N[this.state.meta.lang].stat}</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(student.subjects || {}).map(([sub, val]) => `
                        <tr>
                            <td>${sub}</td>
                            <td>100</td>
                            <td>${val}</td>
                            <td>${val >= this.state.meta.passVal ? 'Pass' : 'Fail'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p><strong>${I18N[this.state.meta.lang].tot}:</strong> ${student.total}</p>
            <p><strong>${I18N[this.state.meta.lang].perc}:</strong> ${student.percentage || ((student.total / (Object.keys(student.subjects || {}).length * 100)) * 100).toFixed(1)}</p>
            ${this.state.signature ? `<img src="${this.state.signature}" style="max-height:80px; margin-top:10px;">` : ''}
        </div>
    `;

    certArea.style.display = 'flex';
};




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
        mainContent.id = 'admin-layout';
        mainContent.style.display = 'none'; // Initially hidden

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
        this.loadPublicPanel(); // Also load public interface if needed
        this.attachEventListeners();
    },

    loadPublicPanel() {
        const publicView = document.createElement('div');
        publicView.id = 'public-view';
        publicView.className = 'public-panel';
        publicView.innerHTML = `
            <div style="max-width: 400px; margin: 50px auto; text-align: center; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="font-size: 3rem; color: #4facfe; margin-bottom: 20px;"><i class="ph-bold ph-student"></i></div>
                <h2 style="margin-bottom: 10px;">Result Portal</h2>
                <p style="color: #666; margin-bottom: 25px;">Enter your roll number to view result</p>
                
                <input type="text" id="publicRegInput" class="form-control" placeholder="Register/Roll Number" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                <button class="btn btn-primary" style="width: 100%; padding: 12px; background: #4facfe; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;" onclick="proExamApp.publicSearch()">View Result</button>
                
                <div id="public-msg" style="margin-top: 15px; color: #ff4b2b; font-weight: bold; min-height: 20px;"></div>
                
                <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                    <a href="#" style="color: #888; text-decoration: none; font-size: 0.9rem;" onclick="proExamApp.toggleAdminLogin()">Admin Login</a>
                </div>
                
                <div id="admin-login-form" class="hidden" style="margin-top: 20px; text-align: left;">
                    <input type="password" id="adminPassInput" class="form-control" placeholder="Admin Password" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    <button class="btn btn-secondary" style="width: 100%; padding: 10px; background: #333; color: white; border: none; border-radius: 6px; cursor: pointer;" onclick="proExamApp.adminLogin()">Login</button>
                </div>
            </div>
        `;

        // Only append if not already present
        if (!document.getElementById('public-view')) {
            document.body.prepend(publicView);
        }
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
            else alert("Result Not Found");
            return;
        }

        // Certificate overlay
        let certArea = document.getElementById('certificate-area');
        if (!certArea) {
            certArea = document.createElement('div');
            certArea.id = 'certificate-area';
            Object.assign(certArea.style, {
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.8)', display: 'flex',
                justifyContent: 'center', alignItems: 'center', zIndex: 9999,
                backdropFilter: 'blur(5px)'
            });
            document.body.appendChild(certArea);
        }

        const lang = this.state.meta.lang || 'en';
        const dict = I18N[lang] || I18N['en'];

        certArea.innerHTML = `
            <div style="background:#1e1e1e; color:#e0e0e0; padding:30px; max-width:600px; width:90%; border-radius:16px; position:relative; border:1px solid rgba(255,255,255,0.1); box-shadow:0 20px 50px rgba(0,0,0,0.5);">
                <button style="position:absolute; top:15px; right:15px; background:none; border:none; color:#aaa; font-size:1.5rem; cursor:pointer; transition: color 0.3s;" onclick="document.getElementById('certificate-area').style.display='none'" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#aaa'">✕</button>
                
                <h2 style="color:#4facfe; margin:0 0 5px 0; text-align:center; font-family: sans-serif;">${this.state.meta.title}</h2>
                <p style="text-align:center; color:#888; margin:0 0 25px 0; font-size: 0.9rem;">${this.state.meta.school} | ${this.state.meta.session}</p>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:25px; background:rgba(255,255,255,0.03); padding:15px; border-radius:8px;">
                    <div><strong style="color:#aaa;">${dict.name}:</strong> <span style="color:#fff;">${s.name}</span></div>
                    <div><strong style="color:#aaa;">${dict.roll}:</strong> <span style="color:#fff;">${s.roll || s.rollNo || s.registerNumber}</span></div>
                </div>

                <table style="width:100%; border-collapse: separate; border-spacing: 0; margin-bottom:25px; font-size:0.95rem;">
                    <thead style="background:rgba(255,255,255,0.05); color:#4facfe;">
                        <tr>
                            <th style="padding:12px; text-align:left; border-radius: 6px 0 0 6px;">${dict.sub}</th>
                            <th style="padding:12px; text-align:center;">${dict.max}</th>
                            <th style="padding:12px; text-align:center;">${dict.obt}</th>
                            <th style="padding:12px; text-align:center; border-radius: 0 6px 6px 0;">${dict.stat}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(s.subjects || {}).map(([sub, val]) => {
            const isPass = Number(val) >= this.state.meta.passVal;
            return `
                            <tr>
                                <td style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05);">${sub}</td>
                                <td style="padding:12px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.05);">100</td>
                                <td style="padding:12px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold;">${val}</td>
                                <td style="padding:12px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.05); color:${isPass ? '#00f260' : '#ff4b2b'}">${isPass ? 'PASS' : 'FAIL'}</td>
                            </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1);">
                    <div>
                        <p style="margin:5px 0;"><strong style="color:#aaa;">${dict.tot}:</strong> <span style="color:#fff; font-size:1.1rem;">${s.total}</span></p>
                        <p style="margin:5px 0;"><strong style="color:#aaa;">${dict.perc}:</strong> <span style="color:#4facfe; font-size:1.1rem; font-weight:bold;">${s.percentage || ((s.total / (Object.keys(s.subjects || {}).length * 100)) * 100).toFixed(1)}%</span></p>
                    </div>
                    ${this.state.signature ? `<div style="text-align:center;"><img src="${this.state.signature}" style="max-height:70px; display:block; margin-bottom:5px; filter: invert(1);"><small style="color:#666;">${dict.sign}</small></div>` : ''}
                </div>
            </div>
        `;

        certArea.style.display = 'flex';
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

        // Ensure panels are loaded
        this.loadExamPanels();

        await this.fetchPublishedData();
        this.updateDashboard();
        this.renderPreview();
    }
};

// Auto-initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    proExamApp.init();
});

/**
 * Consolidated Exam Portal Script
 * - Handles JSON upload
 * - Injects public view
 * - Allows result search
 */

const proExamApp = {
    state: {
        students: [],
        meta: { school: "Global Excellence Academy", title: "Official Statement of Marks", session: "2025-2026", lang: "en", passVal: 35 }
    },

    init() {
        this.injectPublicView();
    },

    injectPublicView() {
        const container = document.getElementById('exam-portal');
        if (!container) return;

        container.innerHTML = `
            <div class="login-box">
                <h2>Result Portal</h2>
                <p>Enter your Roll/Register Number to view result</p>
                <input type="text" id="publicRegInput" placeholder="e.g. 4029">
                <button onclick="proExamApp.publicSearch()">View Result</button>
                <p id="public-msg" style="color:red;"></p>
                
                <h3>Upload Results JSON</h3>
                <input type="file" accept=".json" id="published-results-upload">
                <p id="upload-status"></p>
            </div>
        `;

        // Attach JSON upload listener
        document.getElementById('published-results-upload').addEventListener('change', e => this.handleJsonUpload(e.target));
    },

    handleJsonUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target.result);

                let students = [];
                if (Array.isArray(data)) students = data;
                else if (data.exams) data.exams.forEach(ex => { if (ex.students) students.push(...ex.students); });

                this.state.students = students;

                document.getElementById('upload-status').textContent = `✅ ${students.length} students loaded`;
                document.getElementById('upload-status').style.color = 'green';

            } catch (err) {
                console.error(err);
                document.getElementById('upload-status').textContent = '❌ Invalid JSON file';
                document.getElementById('upload-status').style.color = 'red';
            }
        };
        reader.readAsText(file);
    },

    publicSearch() {
        const regInput = document.getElementById('publicRegInput');
        if (!regInput) return alert("Enter Roll/Register Number");

        const reg = regInput.value.trim();
        if (!reg) return alert("Enter Roll/Register Number");

        const student = this.state.students.find(s =>
            (s.roll == reg) || (s.rollNo == reg) || (s.registerNumber == reg)
        );

        const msgEl = document.getElementById('public-msg');
        if (!student) {
            msgEl.textContent = "Result Not Found";
            return;
        }

        msgEl.textContent = "";
        alert(`Result for ${student.name || 'Unknown'}\nRoll: ${reg}\nTotal: ${student.total || 'N/A'}`);
    }
};

// Initialize after DOM load
document.addEventListener('DOMContentLoaded', () => proExamApp.init());



<script>
        /**
    * ----------------------------------------------------
    * ULTRA ADMIN RESULT SYSTEM (Static Memory-Only)
    * ----------------------------------------------------
    */

    const I18N = {
        en: {name: "Name", roll: "Register No", sub: "Subject", max: "Max", obt: "Obtained", stat: "Status", tot: "Total", perc: "Percentage", grd: "Grade", res: "Result", sign: "Principal Signature" },
    mal: {name: "പേര്", roll: "രജിസ്റ്റർ നമ്പർ", sub: "വിഷയം", max: "പരമാവധി", obt: "ലഭിച്ചത്", stat: "നില", tot: "ആകെ", perc: "ശതമാനം", grd: "ഗ്രേഡ്", res: "ഫലം", sign: "പ്രിൻസിപ്പൽ" },
    ar: {name: "الاسم", roll: "رقم التسجيل", sub: "المادة", max: "الحد الأقصى", obt: "المحصلة", stat: "الحالة", tot: "المجموع", perc: "النسبة", grd: "الدرجة", res: "النتيجة", sign: "توقيع المدير" },
    ta: {name: "பெயர்", roll: "பதிவு எண்", sub: "பாடம்", max: "அதிகபட்சம்", obt: "பெற்றது", stat: "நிலை", tot: "மொத்தம்", perc: "சதவீதம்", grd: "தரம்", res: "முடிவு", sign: "முதல்வர் கையொப்பம்" },
    kn: {name: "ಹೆಸರು", roll: "ನೋಂದಣಿ ಸಂಖ್ಯೆ", sub: "ವಿಷಯ", max: "ಗರಿಷ್ಠ", obt: "ಗಳಿಸಿದ", stat: "ಸ್ಥಿತಿ", tot: "ಒಟ್ಟು", perc: "ಶೇಕಡಾವಾರು", grd: "ಶ್ರೇಣಿ", res: "ಫಲಿತಾಂಶ", sign: "ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ" },
    te: {name: "పేరు", roll: "రిజిస్టర్ నంబర్", sub: "విషయం", max: "గరిష్ట", obt: "పొందిన", stat: "స్థితి", tot: "మొత్తం", perc: "శాతం", grd: "గ్రేడ్", res: "ఫలితం", sign: "ప్రిన్సిపాల్ సంతకం" },
    ur: {name: "نام", roll: "رجسٹریشن نمبر", sub: "مضمون", max: "زیادہ سے زیادہ", obt: "حاصل کردہ", stat: "حیثیت", tot: "کل", perc: "فیصد", grd: "گریڈ", res: "نتیجہ", sign: "پرنسپل کے دستخط" },
    hi: {name: "नाम", roll: "पंजीकरण संख्या", sub: "विषय", max: "अधिकतम", obt: "प्राप्त", stat: "स्थिति", tot: "कुल", perc: "प्रतिशत", grd: "श्रेणी", res: "परिणाम", sign: "प्रधानाचार्य" }
        };

    const proExamApp = {
        state: {
        rawJson: null,
    students: [], // Flattened list of active students
    schools: [], // If multi-school
    meta: {school: "Global Excellence Academy", title: "Official Statement of Marks", session: "2025-2026", lang: 'en', passVal: 35 },
    signature: null
            },

    // --- AUTH ---
    toggleAdminLogin() {
        document.getElementById('admin-login-form').classList.toggle('hidden');
            },

    adminLogin() {
                const pass = document.getElementById('adminPassInput').value;
    if (pass === "admin123") {
        document.getElementById('public-view').classList.add('hidden');
    document.getElementById('admin-layout').classList.remove('hidden');
                } else {
        alert("Incorrect Password!");
                }
            },

    logout() {
                if (confirm("Logout? All unsaved memory data will be lost on refresh!")) {
        document.getElementById('admin-layout').classList.add('hidden');
    document.getElementById('public-view').classList.remove('hidden');
    document.getElementById('adminPassInput').value = "";
    document.getElementById('admin-login-form').classList.add('hidden');
                }
            },

    switchSchool(value) {
        console.log("Switching school to " + value);
                // Placeholder for future logic
            },

    // --- NAV ---
    nav(panelId, el) {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + panelId).classList.add('active');
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
            },

    // --- DATA ---
    handleJsonUpload(input) {
                const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
    // Parsing Logic: Handles both direct array or new object structure

    let allStudents = [];
    // Case 1: Root exams array (Previous schema)
    if (data.exams) {
        data.exams.forEach(ex => allStudents.push(...ex.results));
                        }
    // Case 2: Direct array
    else if (Array.isArray(data)) {
        allStudents = data;
                        }
    // Case 3: PublishedResultsStore format (Single object wrapper)
    else if (data.data) {
                            // Recursive check? Assume data.data is array or has exams
                            if (data.data.exams) data.data.exams.forEach(ex => allStudents.push(...ex.results));
                        }

    this.state.students = allStudents;
    document.getElementById('upload-status').innerHTML = `✅ Loaded ${allStudents.length} Records`;
    document.getElementById('upload-status').style.color = "green";

    this.updateDashboard();
    this.renderPreview();

                    } catch (err) {
        console.error(err);
    alert("JSON Parse Error. Check console.");
                    }
                };
    reader.readAsText(file);
            },

    // --- UI UPDATES ---
    updateDashboard() {
                const total = this.state.students.length;
    document.getElementById('d-total').textContent = total;

    // Simple analytics
    let passed = 0;
    let maxScore = 0;
    let totalScoreSum = 0;

                this.state.students.forEach(s => {
                    // Quick check based on 'total' field if exists, else 0
                    const score = s.total || 0;
                    if (score > maxScore) maxScore = score;
    totalScoreSum += score;

    // Assume pass if no subjects are below threshold? 
    // For dashboard quick stats, we might blindly trust a status flag OR calc it
    // Let's use the calc logic quickly:
    // Assuming pass mark 35 for now
    let isPass = true;
    Object.values(s.subjects || { }).forEach(v => {
                        if (Number(v) < 35) isPass = false;
                    });
    if (isPass) passed++;
                });

                const passPerc = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    document.getElementById('d-pass').textContent = passPerc + "%";
    document.getElementById('a-topt').textContent = maxScore;
                document.getElementById('a-avg').textContent = total > 0 ? (totalScoreSum / total).toFixed(0) : 0;
            },

    renderPreview() {
                const tbody = document.getElementById('preview-table');
                tbody.innerHTML = this.state.students.slice(0, 10).map(s => `
    <tr>
        <td style="padding:10px; border-bottom:1px solid #eee;">${s.roll || s.registerNumber || '-'}</td>
        <td style="padding:10px; border-bottom:1px solid #eee;">${s.name}</td>
        <td style="padding:10px; border-bottom:1px solid #eee;">${s.total || 0}</td>
        <td style="padding:10px; border-bottom:1px solid #eee;"><button class="btn btn-sm btn-secondary" onclick="proExamApp.previewCert('${s.roll || s.registerNumber}')">View</button></td>
    </tr>
    `).join('');
            },

    // --- META & CONFIG ---
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

    // --- SEARCH & CERTIFICATE ---
    publicSearch() {
                const reg = document.getElementById('publicRegInput').value.trim();
    if (!reg) return;
    this.previewCert(reg);
            },

    previewCert(regNo) {
                const s = this.state.students.find(st => (st.roll == regNo) || (st.registerNumber == regNo));
    if (!s) {
                    if (document.getElementById('public-msg'))
    document.getElementById('public-msg').textContent = "Result Not Found";
    else alert("Not Found");
    return;
                }

    // Render Cert
    const dict = I18N[this.state.meta.lang];

    // Labels
    document.querySelector('.lbl-name').textContent = dict.name;
    document.querySelector('.lbl-roll').textContent = dict.roll;
    document.querySelector('.lbl-sub').textContent = dict.sub;
    document.querySelector('.lbl-max').textContent = dict.max;
    document.querySelector('.lbl-obt').textContent = dict.obt;
    document.querySelector('.lbl-stat').textContent = dict.stat;
    document.querySelector('.lbl-tot').textContent = dict.tot;
    document.querySelector('.lbl-perc').textContent = dict.perc;
    document.querySelector('.lbl-grd').textContent = dict.grd;
    document.querySelector('.lbl-res').textContent = dict.res;
    document.querySelector('.lbl-sign').textContent = dict.sign;

    // Data
    document.getElementById('c-school').textContent = this.state.meta.school;
    document.getElementById('c-title').textContent = this.state.meta.title;
    document.getElementById('c-session').textContent = this.state.meta.session;
    document.getElementById('c-name').textContent = s.name;
    document.getElementById('c-roll').textContent = s.roll || s.registerNumber || "-";

    // Photo
    document.getElementById('c-photo').src = s.photo || `https://ui-avatars.com/api/?name=${s.name}&background=random`;

    // Signature
    const sigEl = document.getElementById('c-sign');
    if (this.state.signature) {
        sigEl.src = this.state.signature;
    sigEl.classList.remove('hidden');
                } else {
        sigEl.classList.add('hidden');
                }

    // Table
    const tbody = document.getElementById('c-tbody');
    tbody.innerHTML = "";
    let totMax = 0, totObt = 0, allPass = true;

    const subMap = s.subjects || { };
    const pVal = this.state.meta.passVal;

    for (const [sub, marks] of Object.entries(subMap)) {
                    if (sub.startsWith('@') || sub.startsWith('Column')) continue;

    const max = 100; // Default max?
    const m = Number(marks);

    // Skip if 0 and key looks like filler? 
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

    document.getElementById('c-total').textContent = `${totObt} / ${totMax}`;
                const perc = totMax > 0 ? (totObt / totMax * 100).toFixed(2) : 0;
    document.getElementById('c-perc').textContent = perc + "%";

    let grade = "F";
    if (allPass) {
                    if (perc >= 90) grade = "A+";
                    else if (perc >= 80) grade = "A";
                    else if (perc >= 70) grade = "B+";
                    else if (perc >= 60) grade = "B";
                    else if (perc >= 50) grade = "C+";
                    else if (perc >= 40) grade = "C";
    else grade = "D";
                }
    document.getElementById('c-grade').textContent = allPass ? grade : "N/A";

    const resEl = document.getElementById('c-result');
    resEl.textContent = allPass ? "PASSED" : "FAILED";
    resEl.style.color = allPass ? "var(--success)" : "var(--danger)";

    // QR
    document.getElementById('qrcode').innerHTML = "";
    new QRCode(document.getElementById('qrcode'), {
        text: `${s.name}|${s.roll}|${allPass ? 'PASS' : 'FAIL'}|${perc}%`,
    width: 80, height: 80
                });

    document.getElementById('certificate-area').classList.add('visible');
            },

    closeCert() {
        document.getElementById('certificate-area').classList.remove('visible');
            },

    downloadPDF() {
                const element = document.getElementById('printable-cert');
    html2pdf().set({
        margin: 0,
    filename: `Result.pdf`,
    image: {type: 'jpeg', quality: 0.98 },
    html2canvas: {scale: 2 },
    jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait' }
                }).from(element).save();
            },

    async init() {
        console.log("Portal Initializing...");
    await this.fetchPublishedData();
    this.updateDashboard();
    this.renderPreview();
            },

    let publicData = null;

    async function autoLoadPublishedResults() {
                try {
                    const response = await fetch("published-results.json");
    if (!response.ok) throw new Error("No file found");

    publicData = await response.json();
    initializePortal(publicData);

    } catch (err) {
        console.log("No static file found.");
        }
}

    window.addEventListener("DOMContentLoaded", autoLoadPublishedResults);

    document.getElementById("published-results-upload")
    .addEventListener("change", function () {

                const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
                    try {
        publicData = JSON.parse(e.target.result);
    initializePortal(publicData);

    document.getElementById("published-results-status")
    .innerHTML = "Results loaded successfully";

                    } catch (err) {
        document.getElementById("published-results-status")
            .innerHTML = "Invalid JSON file";
                    }
                };

    reader.readAsText(file);
            });

    function initializePortal(data) {

            const select = document.getElementById("examSelect");
    select.innerHTML = `<option value="">-- Select Exam --</option>`;

            data.exams.forEach(exam => {
        select.innerHTML += `
            <option value="${exam.examId}">
                ${exam.examName}
            </option>
        `;
            });

    select.disabled = false;

    select.addEventListener("change", function () {
        document.getElementById("submitBtn").disabled =
        !this.value;

    document.getElementById("submitBtn").style.opacity =
    this.value ? "1" : "0.5";
            });
        }

    document.getElementById("resultsForm")
    .addEventListener("submit", function (e) {

        e.preventDefault();

    const examId =
    document.getElementById("examSelect").value;

    if (!examId || !publicData) {
        alert("Please select exam.");
    return;
                }

    const exam =
                    publicData.exams.find(e => e.examId === examId);

    const roll =
    document.getElementById("rollInput").value.trim();

    const student =
                    exam.students.find(s =>
    String(s.rollNo).trim() === roll
    );

    if (!student) {
        alert(`Result not found for Roll No: ${roll}`);
    return;
                }

    alert("Result Found: " + student.name);
            });








    async fetchPublishedData() {
            try {
                const response = await fetch('../../data/published-results.json');
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
        }
        };

        // Initialize App
        document.addEventListener('DOMContentLoaded', () => {
        proExamApp.init();
        });
</script>