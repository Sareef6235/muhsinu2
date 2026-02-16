/**
 * --------------------------------------------------
 * SECURE STATIC RESULT PORTAL (Admin + Public)
 * Vercel Compatible | No Backend Required
 * --------------------------------------------------
 */

(function () {

    // Prevent affecting other pages
    if (!document.getElementById("public-view-section")) return;

    const Portal = {

        state: {
            students: []
        },

        // =============================
        // INIT
        // =============================
        init() {
            this.checkPublicDataFromURL();
            this.renderAdminLogin();
        },

        // =============================
        // ADMIN LOGIN
        // =============================
        renderAdminLogin() {
            const adminSection = document.getElementById("admin-view-section");
            // Initial hidden state managed by CSS or logic
            adminSection.innerHTML = `
            <div class="login-box" style="margin-top: 20px;">
                <div class="card" style="text-align: left; border-color: var(--primary);">
                    <h3 style="color: var(--primary); margin-bottom: 15px;"><i class="ph-bold ph-shield-check"></i> Admin Access</h3>
                    <label style="font-size: 0.8rem; font-weight: bold; color: #666; display: block; margin-bottom: 5px;">Password</label>
                    <input type="password" id="adminPass" class="form-control" placeholder="Enter Admin Password">
                    <button class="btn btn-primary" style="width: 100%; margin-top: 10px; justify-content: center;" onclick="SecurePortal.adminLogin()">Login</button>
                    <div id="admin-msg" style="color: var(--danger); margin-top: 10px; font-weight: bold;"></div>
                    <button class="btn btn-sm btn-secondary" style="margin-top: 10px; width: 100%; justify-content: center;" onclick="document.getElementById('admin-view-section').style.display='none'">Cancel</button>
                </div>
            </div>
        `;

            if (location.hash === "#admin") {
                adminSection.style.display = "block";
            }
        },

        toggleAdminLogin() {
            const adminSection = document.getElementById("admin-view-section");
            adminSection.style.display = adminSection.style.display === "none" ? "block" : "none";
            if (adminSection.style.display === "block") {
                this.renderAdminLogin();
            }
        },

        adminLogin() {
            const pass = document.getElementById("adminPass").value;
            if (pass !== "admin123") {
                document.getElementById("admin-msg").textContent = "❌ Incorrect Password";
                return;
            }
            this.renderAdminUpload();
        },

        // =============================
        // ADMIN UPLOAD
        // =============================
        renderAdminUpload() {
            const adminSection = document.getElementById("admin-view-section");
            adminSection.innerHTML = `
            <div class="panel active" style="max-width: 800px; margin: 40px auto; padding: 20px;">
                <h2 style="color: var(--primary); border-bottom: 2px solid var(--primary); padding-bottom: 10px; margin-bottom: 20px;">
                    <i class="ph-bold ph-upload-simple"></i> Upload Results
                </h2>
                
                <div class="card">
                    <p style="margin-bottom: 15px; color: var(--text-light);">Select your <code>published-results.json</code> file to generate a secure shareable link.</p>
                    <div style="border: 2px dashed #ccc; padding: 30px; text-align: center; border-radius: 12px; background: rgba(0,0,0,0.02);">
                        <input type="file" accept=".json" id="jsonUpload" class="form-control" style="max-width: 300px; margin: 0 auto;">
                    </div>
                    <p id="uploadStatus" style="margin-top: 15px; font-weight: 600; text-align: center;"></p>
                </div>

                <div id="generatedLinkBox" style="margin-top: 25px;"></div>
                
                <div style="text-align: center; margin-top: 30px;">
                     <button class="btn btn-secondary" onclick="location.reload()"><i class="ph-bold ph-sign-out"></i> Logout / Reset</button>
                </div>
            </div>
        `;

            document.getElementById("jsonUpload").addEventListener("change", (e) => this.handleUpload(e.target));
        },

        handleUpload(input) {
            const file = input.files[0];
            if (!file) return;

            const statusEl = document.getElementById("uploadStatus");
            statusEl.innerHTML = `<span style="color: #4facfe;">⏳ Processing...</span>`;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    // Convert JSON → Base64
                    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(json))));
                    const publicURL = location.origin + location.pathname + "?data=" + encoded;

                    statusEl.innerHTML = `<span style="color: var(--success);">✅ File uploaded successfully!</span>`;

                    document.getElementById("generatedLinkBox").innerHTML = `
                    <div class="card" style="background: #f0f9ff; border-color: #4facfe;">
                        <h4 style="margin-top: 0; color: #004e92;">🎉 Shareable Result Link</h4>
                        <p style="font-size: 0.9rem; color: #555;">Copy this link and send it to students. No database required.</p>
                        <textarea class="form-control" style="width:100%; height:100px; font-family: monospace; font-size: 0.85rem; margin-top: 10px;" readonly>${publicURL}</textarea>
                        <button class="btn btn-primary" style="margin-top: 10px;" onclick="navigator.clipboard.writeText('${publicURL}'); alert('Link Copied!')">
                            <i class="ph-bold ph-copy"></i> Copy Link
                        </button>
                    </div>
                `;
                } catch (err) {
                    console.error(err);
                    statusEl.innerHTML = `<span style="color: var(--danger);">❌ Invalid JSON File. Please check the format.</span>`;
                }
            };
            reader.readAsText(file);
        },

        // =============================
        // PUBLIC SIDE
        // =============================
        checkPublicDataFromURL() {
            const params = new URLSearchParams(window.location.search);
            const encoded = params.get("data");

            if (!encoded) {
                this.renderPublicSearch(false); // Render empty state
                return;
            }

            try {
                const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
                let students = [];
                if (Array.isArray(decoded)) {
                    students = decoded;
                } else if (decoded.exams) {
                    decoded.exams.forEach(ex => {
                        if (ex.students) students.push(...ex.students);
                        else if (ex.results) students.push(...ex.results); // Handle both formats
                    });
                } else if (decoded.data && decoded.data.exams) {
                    decoded.data.exams.forEach(ex => {
                        if (ex.results) students.push(...ex.results);
                    });
                } else {
                    if (decoded.students) students = decoded.students;
                }

                this.state.students = students;
                this.renderPublicSearch(true);

            } catch (err) {
                console.error(err);
                this.renderPublicMessage("⚠️ Invalid or Corrupted Result Link.");
            }
        },

        renderPublicMessage(msg) {
            document.getElementById("public-view-section").innerHTML = `
            <div class="login-box">
                <div class="card" style="text-align: center; border-color: var(--danger);">
                    <h3 style="color: var(--danger);">${msg}</h3>
                    <p>Please ask your administrator for a new link.</p>
                    <button class="btn btn-secondary" onclick="location.href=location.pathname">Go Back</button>
                </div>
            </div>
        `;
        },

        renderPublicSearch(hasData) {
            const container = document.getElementById("public-view-section");

            // If no data, we show a basic landing or upload prompt for admins
            if (!hasData) {
                container.innerHTML = `
                <div class="login-box">
                    <div style="font-size: 3rem; color: #ccc; margin-bottom: 20px;">
                        <i class="ph-bold ph-student"></i>
                    </div>
                    <h2 style="margin-bottom: 5px; color: #888;">Result Portal</h2>
                    <p style="color: #aaa; margin-bottom: 30px;">Waiting for result data...</p>
                    
                     <div class="card" style="background: rgba(255,255,255,0.5);">
                        <p style="font-size: 0.9rem; color: #666;">
                            <strong>Student?</strong> Please use the link provided by your school.<br>
                            <strong>Admin?</strong> Login below to generate a link.
                        </p>
                    </div>

                    <button class="btn btn-secondary btn-sm" style="margin-top: 30px;" onclick="SecurePortal.toggleAdminLogin()">
                        <i class="ph-bold ph-lock-key"></i> Admin Login
                    </button>
                </div>
            `;
                return;
            }

            // Standard Search View
            container.innerHTML = `
            <div class="login-box">
                <div style="font-size: 3rem; color: var(--primary); margin-bottom: 20px;">
                    <i class="ph-bold ph-student"></i>
                </div>
                <h2 style="margin-bottom: 5px;">Result Portal</h2>
                <p style="color: var(--text-light); margin-bottom: 30px;">Enter your details to view result</p>
                
                <div class="card" style="text-align: left;">
                    <label style="font-size: 0.8rem; font-weight: bold; color: #666; display: block; margin-bottom: 5px;">Register/Roll Number</label>
                    <input type="text" id="regInput" class="form-control" placeholder="e.g. 4029">
                    <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px; margin-top: 10px;" onclick="SecurePortal.search()">
                        View Result
                    </button>
                </div>

                <div id="resultBox" style="margin-top: 15px;"></div>

                <button class="btn btn-secondary btn-sm" style="margin-top: 40px;" onclick="SecurePortal.toggleAdminLogin()">
                    <i class="ph-bold ph-lock-key"></i> Admin Login
                </button>
            </div>
        `;
        },

        search() {
            const regInput = document.getElementById("regInput");
            const reg = regInput.value.trim();
            if (!reg) {
                regInput.classList.add('error');
                return;
            }

            const student = this.state.students.find(s =>
                s.roll == reg || s.rollNo == reg || s.registerNumber == reg
            );

            const resBox = document.getElementById("resultBox");

            if (!student) {
                resBox.innerHTML = `<div style="padding: 10px; background: #ffe6e6; color: #d63031; border-radius: 6px; text-align: center; font-weight: bold;">❌ Result Not Found</div>`;
                return;
            }

            // Simple Result Card
            resBox.innerHTML = `
            <div class="card" style="text-align: left; border: 2px solid var(--success); animation: fadeIn 0.5s;">
                <h3 style="margin-top: 0; color: var(--primary);">${student.name}</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; font-size: 0.9rem;">
                    <div><strong>Roll:</strong> ${reg}</div>
                    <div><strong>Total:</strong> ${student.total || 'N/A'}</div>
                </div>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                 <table style="width: 100%; font-size: 0.85rem;">
                    ${Object.entries(student.subjects || {}).map(([k, v]) => `
                        <tr>
                            <td style="padding: 4px 0; color: #666;">${k}</td>
                            <td style="text-align: right; font-weight: bold;">${v}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;
        }
    };

    // Make globally accessible only for this page
    window.SecurePortal = Portal;

    // Init
    document.addEventListener("DOMContentLoaded", () => {
        Portal.init();
    });

})();
