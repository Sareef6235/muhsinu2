window.AuthSystem = (function () {

    const ADMIN_USER = "admin";
    const ADMIN_PASS = "Admin@123";

    function login(username, password) {
        if (username === ADMIN_USER && password === ADMIN_PASS) {
            localStorage.setItem("portal-admin", "true");
            return true;
        }
        return false;
    }

    function isAdmin() {
        return localStorage.getItem("portal-admin") === "true";
    }

    function logout() {
        localStorage.removeItem("portal-admin");
        location.reload();
    }

    return { login, isAdmin, logout };

})();

window.ResultsPortal = (function () {

    let data = null;

    function init() {

        const saved = localStorage.getItem("published-results");

        if (saved) {
            try {
                data = JSON.parse(saved);
                activatePortal();
            } catch (e) {
                console.error("Invalid saved data");
                showOfflineWarning();
            }
        } else {
            showOfflineWarning();
        }

        bindUpload();
        bindSearch();
        updateAuthUI();
    }

    function bindUpload() {

        const input = document.getElementById("published-results-upload");
        const status = document.getElementById("published-results-status");

        if (!input) return;

        input.addEventListener("change", function () {

            if (!AuthSystem.isAdmin()) {
                status.innerHTML = "<i class='ph ph-x-circle'></i> Admin login required.";
                status.style.color = "#ff4d4d";
                return;
            }

            const file = this.files[0];

            if (!file || !file.name.endsWith(".json")) {
                status.innerHTML = "<i class='ph ph-x-circle'></i> Invalid JSON file.";
                status.style.color = "#ff4d4d";
                return;
            }

            const reader = new FileReader();

            reader.onload = function (e) {

                try {
                    const parsed = JSON.parse(e.target.result);

                    if (!parsed.exams || !Array.isArray(parsed.exams)) {
                        throw new Error("Invalid structure: exams array missing");
                    }

                    data = parsed;
                    localStorage.setItem("published-results", JSON.stringify(data));

                    activatePortal();

                    status.innerHTML = "<i class='ph ph-check-circle'></i> Results Loaded Successfully";
                    status.style.color = "#00ff88";

                } catch (err) {
                    console.error("Upload error:", err);
                    status.innerHTML = "<i class='ph ph-x-circle'></i> " + (err.message || "JSON validation failed.");
                    status.style.color = "#ff4d4d";
                }
            };

            reader.readAsText(file);
        });
    }

    function activatePortal() {
        const syncWarn = document.getElementById("sync-warning");
        if (syncWarn) syncWarn.style.display = "none";

        const examCountEl = document.getElementById("results-exams-count");
        const totalCountEl = document.getElementById("results-total-count");
        const lastSyncEl = document.getElementById("results-last-sync");

        const exams = data.exams || [];
        const totalStudents = exams.reduce((sum, ex) => sum + (ex.students ? ex.students.length : 0), 0);

        if (examCountEl) examCountEl.innerText = exams.length;
        if (totalCountEl) totalCountEl.innerText = totalStudents;
        if (lastSyncEl) lastSyncEl.innerText = new Date(data.publishedAt || (data.meta ? data.meta.generatedAt : null) || Date.now()).toLocaleTimeString();

        populateExamDropdown(exams);
        updateSearchButtonState();
    }

    function populateExamDropdown(exams) {
        const select = document.getElementById("examSelect");
        if (!select) return;

        select.innerHTML = '<option value="">-- Select Exam --</option>';
        exams.forEach(exam => {
            const option = document.createElement('option');
            option.value = exam.examId;
            option.textContent = exam.examName;
            select.appendChild(option);
        });

        select.disabled = false;
        select.addEventListener('change', updateSearchButtonState);
    }

    function updateSearchButtonState() {
        const select = document.getElementById("examSelect");
        const submitBtn = document.getElementById("submitBtn");
        if (!select || !submitBtn) return;

        const isEnabled = data && select.value;
        submitBtn.disabled = !isEnabled;
        submitBtn.style.opacity = isEnabled ? "1" : "0.5";
        submitBtn.style.cursor = isEnabled ? "pointer" : "not-allowed";
    }

    function showOfflineWarning() {
        const warn = document.getElementById("sync-warning");
        if (warn) {
            warn.style.display = "block";
            const timeEl = document.getElementById("sync-time");
            if (timeEl) timeEl.innerText = "No Data";
        }
    }

    function bindSearch() {
        const form = document.getElementById("resultsForm");
        const submitBtn = document.getElementById("submitBtn");
        if (!form || !submitBtn) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const selectedExamId = document.getElementById("examSelect").value;
            if (!selectedExamId) {
                alert("Please select an exam session first.");
                return;
            }

            const exam = data.exams.find(ex => String(ex.examId) === String(selectedExamId));
            if (!exam) {
                alert("Selected exam data not found.");
                return;
            }

            // Visual feedback: Searching state
            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = `<i class="ph ph-circle-notch animate-spin"></i> Analyzing...`;
            submitBtn.style.pointerEvents = "none";
            submitBtn.style.opacity = "0.8";

            setTimeout(() => {
                const roll = document.getElementById("rollInput").value.trim();
                const student = (exam.students || []).find(s => String(s.roll || s.rollNo) === roll);

                // Revert button
                submitBtn.innerHTML = originalContent;
                submitBtn.style.pointerEvents = "auto";
                submitBtn.style.opacity = "1";

                if (!student) {
                    alert("Result not found for Roll No: " + roll + " in " + exam.examName);
                    return;
                }

                renderResult(student);
            }, 600);
        });
    }

    function renderResult(student) {
        const display = document.getElementById("result-display");
        if (!display) return;
        display.style.display = "block";

        display.innerHTML = `
            <div class="glass-card result-card animate-fade-up">
                <div class="student-meta">
                    <div>
                        <h2 style="margin:0; font-size: 1.8rem; color: var(--primary);">${escapeHTML(student.name)}</h2>
                        <p style="margin:5px 0 0; color: #888;">Registration ID: ${escapeHTML(student.rollNo)}</p>
                    </div>
                    <div class="grade-badge">
                        <span class="grade">${student.grade || 'N/A'}</span>
                        <span class="label">Grade</span>
                    </div>
                </div>
                
                <div style="background: rgba(0,0,0,0.2); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
                     <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color:#888;">Total Marks</span>
                        <span style="font-weight:700; font-size:1.2rem;">${escapeHTML(student.total)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color:#888;">Result Status</span>
                        <span style="font-weight:700; color: ${String(student.status).toLowerCase() === 'pass' ? '#00ff88' : '#ff4d4d'};">
                            ${escapeHTML(student.status || 'Verified')}
                        </span>
                    </div>
                </div>

                <div class="actions">
                    <button class="btn-check" onclick="window.print()" style="padding: 12px;">
                        <i class="ph ph-printer"></i> Print Statement
                    </button>
                    <button class="btn-sec" onclick="document.getElementById('result-display').style.display='none'">
                        <i class="ph ph-x"></i> Close
                    </button>
                </div>
            </div>
        `;

        display.scrollIntoView({ behavior: 'smooth' });
    }

    function showRankList() {
        const selectedExamId = document.getElementById("examSelect").value;
        if (!selectedExamId) {
            alert("Please select an exam session first.");
            return;
        }

        const exam = data.exams.find(ex => String(ex.examId) === String(selectedExamId));
        if (!exam || !exam.students) {
            alert("No data available for the selected exam.");
            return;
        }

        const sorted = [...exam.students].sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0));

        const tbody = document.getElementById("results-table-body");
        if (tbody) {
            tbody.innerHTML = sorted.map((s, i) => `
                <tr>
                    <td style="font-weight: 700; color: var(--primary);">#${i + 1}</td>
                    <td style="font-family: monospace;">${escapeHTML(s.roll || s.rollNo)}</td>
                    <td>${escapeHTML(s.name)}</td>
                    <td style="text-align:right; font-weight: 600;">${escapeHTML(s.total)}</td>
                </tr>
            `).join('');
        }

        const meritView = document.getElementById("merit-view");
        const resultsForm = document.getElementById("resultsForm");

        if (meritView) meritView.style.display = "block";
        if (resultsForm) resultsForm.style.display = "none";

        const meritExamName = document.getElementById("merit-exam-name");
        if (meritExamName) meritExamName.innerText = exam.examName;
    }

    function showSearchForm() {
        document.getElementById("merit-view").style.display = "none";
        document.getElementById("resultsForm").style.display = "grid";
    }

    function escapeHTML(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function updateAuthUI() {
        const uploadSection = document.querySelector(".upload-section");
        const badge = document.getElementById("auth-status-badge");
        const badgeText = document.querySelector("#auth-status-badge .text");
        const mainBtn = document.getElementById("auth-main-btn");

        if (!mainBtn) return;

        const adminLoggedIn = AuthSystem.isAdmin();

        if (adminLoggedIn) {
            if (uploadSection) uploadSection.style.display = "block";
            if (badge) badge.classList.add("admin");
            if (badgeText) badgeText.textContent = "Admin Mode";

            mainBtn.innerHTML = '<i class="ph-bold ph-sign-out"></i> Logout';
            mainBtn.onclick = () => AuthSystem.logout();
            mainBtn.style.background = "rgba(255,255,255,0.05)";
            mainBtn.style.color = "#fff";
            mainBtn.style.border = "1px solid var(--border)";
        } else {
            if (uploadSection) uploadSection.style.display = "none";
            if (badge) badge.classList.remove("admin");
            if (badgeText) badgeText.textContent = "Public Mode";

            mainBtn.innerHTML = '<i class="ph-bold ph-user"></i> Login';
            mainBtn.onclick = () => toggleLoginModal();
            mainBtn.style.background = "var(--primary)";
            mainBtn.style.color = "#000";
            mainBtn.style.border = "none";
        }
    }

    return {
        init,
        showRankList,
        showSearchForm,
        updateAuthUI
    };

})();

// Global functions for HTML onclicks
window.toggleLoginModal = function () {
    const modal = document.getElementById('loginModal');
    if (!modal) return;
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
};

window.handleLoginAttempt = function () {
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const success = AuthSystem.login(username, password);

    if (success) {
        window.toggleLoginModal();
        ResultsPortal.updateAuthUI();
        usernameInput.value = '';
        passwordInput.value = '';
    } else {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.querySelector(".error-msg").textContent = "Invalid Admin Credentials";
            errorDiv.style.display = 'block';

            const modal = document.querySelector(".login-modal");
            modal.style.animation = 'none';
            modal.offsetHeight;
            modal.style.animation = 'shake 0.4s ease';
        }
    }
};

window.showRankList = function () {
    ResultsPortal.showRankList();
};

window.showSearchForm = function () {
    ResultsPortal.showSearchForm();
};

document.addEventListener("DOMContentLoaded", () => {
    ResultsPortal.init();
});
