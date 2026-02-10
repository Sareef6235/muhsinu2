
/**
 * PRO EXAM MANAGER
 * Handles the "Pro Exam" tab functionality in the Admin Dashboard.
 * Integrates JSON upload, Certificate Generation, and Signature handling.
 */

const ProExam = {
    state: {
        students: [],
        meta: {
            school: "Global Excellence Academy",
            title: "Official Statement of Marks",
            session: "2025-2026",
            lang: 'en',
            passVal: 35
        },
        signature: null
    },

    init() {
        console.log("Pro Exam Module Initialized");
        this.loadState();
        this.renderStats();
    },

    // --- STATE MANAGEMENT ---
    loadState() {
        // Try to load from localStorage if available (optional persistence)
        const savedMeta = localStorage.getItem('pro_exam_meta');
        if (savedMeta) this.state.meta = JSON.parse(savedMeta);

        const savedSig = localStorage.getItem('pro_exam_sig');
        if (savedSig) {
            this.state.signature = savedSig;
            const imgEl = document.getElementById('pe-sig-preview');
            if (imgEl) {
                imgEl.src = savedSig;
                imgEl.style.display = 'block';
            }
        }
    },

    saveConfig() {
        this.state.meta.school = document.getElementById('pe-school').value;
        this.state.meta.title = document.getElementById('pe-title').value;
        this.state.meta.session = document.getElementById('pe-session').value;
        this.state.meta.lang = document.getElementById('pe-lang').value;

        localStorage.setItem('pro_exam_meta', JSON.stringify(this.state.meta));
        alert("Configuration Saved!");
    },

    // --- TABS ---
    tab(tabName, btn) {
        // Hide all tab content
        document.querySelectorAll('.pro-tab-content').forEach(el => el.style.display = 'none');
        // Show target
        document.getElementById('pro-tab-' + tabName).style.display = 'block';

        // Update buttons
        document.querySelectorAll('.pro-tabs .btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Refresh specific views
        if (tabName === 'analytics') this.renderStats();
    },

    refresh() {
        this.renderStats();
        this.renderPreview();
        alert("Data Refreshed");
    },

    // --- DATA HANDLING ---
    handleUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const statusEl = document.getElementById('pe-upload-status');
        statusEl.textContent = "Parsing...";

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                let allStudents = [];

                if (data.exams) {
                    data.exams.forEach(ex => allStudents.push(...ex.results));
                } else if (Array.isArray(data)) {
                    allStudents = data;
                } else if (data.data && data.data.exams) {
                    data.data.exams.forEach(ex => allStudents.push(...ex.results));
                }

                this.state.students = allStudents;
                statusEl.innerHTML = `<span style="color:#2ed573">✅ Loaded ${allStudents.length} records.</span>`;

                this.renderStats();
                this.renderPreview();

            } catch (err) {
                console.error(err);
                statusEl.textContent = "Error: Invalid JSON";
            }
        };
        reader.readAsText(file);
    },

    renderStats() {
        const students = this.state.students;
        document.getElementById('pe-total').textContent = students.length;

        if (students.length === 0) return;

        let passed = 0;
        let maxScore = 0;
        let totalScoreSum = 0;
        const passVal = Number(this.state.meta.passVal) || 35;

        students.forEach(s => {
            const score = Number(s.total) || 0;
            if (score > maxScore) maxScore = score;
            totalScoreSum += score;

            // Simple Pass Check
            let isPass = true;
            Object.entries(s.subjects || {}).forEach(([k, v]) => {
                if (k.startsWith('@') || k.startsWith('Column')) return;
                if (Number(v) < passVal) isPass = false;
            });
            if (isPass) passed++;
        });

        const passPerc = ((passed / students.length) * 100).toFixed(1);
        document.getElementById('pe-pass').textContent = passPerc + "%";

        if (document.getElementById('pe-top')) document.getElementById('pe-top').textContent = maxScore;
        if (document.getElementById('pe-avg')) document.getElementById('pe-avg').textContent = (totalScoreSum / students.length).toFixed(0);
    },

    renderPreview() {
        const tbody = document.getElementById('pe-preview-tbody');
        if (!tbody) return;

        const list = this.state.students.slice(0, 20); // Limit to 20
        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No Data</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(s => `
            <tr>
                <td>${s.roll || s.registerNumber || '-'}</td>
                <td>${s.name}</td>
                <td>${s.total || 0}</td>
                <td><button class="btn btn-sm btn-secondary" onclick="ProExam.generateCert('${s.roll || s.registerNumber}')">Generate Cert</button></td>
            </tr>
        `).join('');
    },

    // --- SIGNATURE ---
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
                localStorage.setItem('pro_exam_sig', b64);

                const preview = document.getElementById('pe-sig-preview');
                preview.src = b64;
                preview.style.display = 'block';
            };
        };
        reader.readAsDataURL(file);
    },

    // --- CERTIFICATE GENERATION ---
    generateCert(regNo) {
        const s = this.state.students.find(st => (st.roll == regNo) || (st.registerNumber == regNo));
        if (!s) return alert("Student not found!");

        // We need a hidden container to render the PDF content
        let container = document.getElementById('hidden-cert-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'hidden-cert-container';
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '0';
            document.body.appendChild(container);
        }

        // Translation Dictionary
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

        const dict = I18N[this.state.meta.lang] || I18N.en;
        const meta = this.state.meta;

        // Build Rows
        let rows = '';
        let totMax = 0, totObt = 0;
        let allPass = true;
        const passVal = Number(meta.passVal) || 35;

        for (const [sub, marks] of Object.entries(s.subjects || {})) {
            if (sub.startsWith('@') || sub.startsWith('Column')) continue;
            const m = Number(marks);
            const max = 100; // default

            if (m === 0 && sub.includes("Column")) continue;

            const isPass = m >= passVal;
            if (!isPass) allPass = false;

            totMax += max;
            totObt += m;

            rows += `
                <tr>
                    <td style="padding:5px; border:1px solid #ccc;">${sub}</td>
                    <td style="padding:5px; border:1px solid #ccc; text-align:center;">${max}</td>
                    <td style="padding:5px; border:1px solid #ccc; text-align:center;">${m}</td>
                    <td style="padding:5px; border:1px solid #ccc; text-align:center; color:${isPass ? 'green' : 'red'}; font-weight:bold;">${isPass ? 'PASS' : 'FAIL'}</td>
                </tr>
            `;
        }

        const perc = totMax > 0 ? (totObt / totMax * 100).toFixed(2) : 0;
        let grade = "F";
        if (allPass) {
            if (perc >= 90) grade = "A+";
            else if (perc >= 80) grade = "A";
            else if (perc >= 70) grade = "B+";
            else if (perc >= 60) grade = "B";
            else if (perc >= 50) grade = "C+";
            else grade = "D";
        }

        // Template
        container.innerHTML = `
            <div style="width: 210mm; min-height: 297mm; background:white; padding: 20mm; font-family: serif; color: #000;">
                <div style="text-align:center; margin-bottom: 20px;">
                    <h1 style="color:#000; margin:0; font-size: 24pt;">${meta.school}</h1>
                    <h2 style="color:#444; margin:5px 0; font-size: 18pt; font-style: italic;">${meta.title}</h2>
                    <p style="margin:5px 0; letter-spacing:2px;">${meta.session}</p>
                </div>
                
                <div style="display:flex; justify-content:space-between; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
                     <div>
                        <p><strong>${dict.name}:</strong> ${s.name}</p>
                        <p><strong>${dict.roll}:</strong> ${s.roll || s.registerNumber}</p>
                     </div>
                     <div style="width: 100px; height: 120px; background: #eee; border:1px solid #ccc; display:flex; align-items:center; justify-content:center;">
                        <img src="${s.photo || `https://ui-avatars.com/api/?name=${s.name}&background=random`}" style="max-width:100%; max-height:100%;">
                     </div>
                </div>

                <table style="width:100%; border-collapse:collapse; margin-bottom: 20px; font-size: 12pt;">
                    <thead>
                        <tr style="background:#eee;">
                            <th style="padding:8px; border:1px solid #000; text-align:left;">${dict.sub}</th>
                            <th style="padding:8px; border:1px solid #000;">${dict.max}</th>
                            <th style="padding:8px; border:1px solid #000;">${dict.obt}</th>
                            <th style="padding:8px; border:1px solid #000;">${dict.stat}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>

                <div style="display:flex; justify-content:space-between; margin-bottom: 40px;">
                    <div><strong>${dict.tot}:</strong> ${totObt} / ${totMax}</div>
                    <div><strong>${dict.perc}:</strong> ${perc}%</div>
                    <div><strong>${dict.grd}:</strong> ${allPass ? grade : 'N/A'}</div>
                    <div style="font-weight:bold; color:${allPass ? 'green' : 'red'};"><strong>${dict.res}:</strong> ${allPass ? 'PASSED' : 'FAILED'}</div>
                </div>

                <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div id="pe-qrcode"></div>
                    <div style="text-align:right;">
                        ${this.state.signature ? `<img src="${this.state.signature}" style="height: 50px; display:block; margin-left:auto;">` : ''}
                        <p style="border-top: 1px solid #000; display:inline-block; padding-top: 5px;">${dict.sign}</p>
                    </div>
                </div>
            </div>
        `;

        // Generate QR
        const qrContainer = container.querySelector('#pe-qrcode');
        if (window.QRCode && qrContainer) {
            new QRCode(qrContainer, {
                text: `${s.name}|${s.roll}|${allPass ? 'PASS' : 'FAIL'}|${perc}%`,
                width: 80,
                height: 80
            });
        }

        // Generate PDF
        const opt = {
            margin: 0,
            filename: `${s.roll}_Result.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Use global html2pdf
        if (window.html2pdf) {
            html2pdf().set(opt).from(container.children[0]).save().then(() => {
                // Cleanup
                // container.remove(); 
            });
        } else {
            alert("PDF Library not loaded yet.");
        }
    }
};

// Make Global
window.ProExam = ProExam;
