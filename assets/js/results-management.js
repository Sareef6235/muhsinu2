/**
 * ADMIN RESULTS MANAGEMENT (Simplified)
 * Handles syncing from JSON/Sheets and Static Publishing.
 */

// Global State
const state = {
    students: [],
    examId: null,
    examName: null,
    lastSynced: null
};

// Results Management Object
const ResultsManagement = {
    init: function () {
        console.log("Results Management Initialized");
        this.bindEvents();
        this.fetchCurrentStatus();
    },

    fetchCurrentStatus: async function () {
        try {
            const response = await fetch('../../data/results-store.json?t=' + Date.now());
            if (response.ok) {
                const store = await response.json();

                // Update Badge
                if (window.StaticPublisher) {
                    window.StaticPublisher.updateUI(store.published);
                }

                // Update Stats if published
                if (store.published && store.exams) {
                    state.lastSynced = new Date(store.lastUpdated);

                    const examsCount = store.exams.length;
                    const totalStudents = store.exams.reduce((sum, ex) => sum + (ex.students ? ex.students.length : 0), 0);

                    const examsCountEl = document.getElementById("results-exams-count");
                    const totalCountEl = document.getElementById("results-total-count");
                    const lastSyncEl = document.getElementById("results-last-sync");

                    if (examsCountEl) examsCountEl.textContent = examsCount;
                    if (totalCountEl) totalCountEl.textContent = totalStudents;
                    if (lastSyncEl) lastSyncEl.textContent = state.lastSynced.toLocaleTimeString();
                }
            }
        } catch (e) {
            console.log("No existing results store found.");
        }
    },

    bindEvents: function () {
        // Exam Selection Listener
        const examSelect = document.getElementById("results-exam-select");
        if (examSelect) {
            examSelect.addEventListener("change", function () {
                state.examId = this.value;
                state.examName = this.selectedOptions[0].text;
            });
        }

        // Published Results Upload Listener
        const uploadInput = document.getElementById("published-results-upload");
        if (uploadInput) {
            uploadInput.addEventListener("change", function () {
                const file = this.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        const parsed = JSON.parse(e.target.result);
                        let students = [];
                        if (Array.isArray(parsed.students)) {
                            students = parsed.students;
                        } else if (parsed.exams && parsed.exams[0] && Array.isArray(parsed.exams[0].students)) {
                            students = parsed.exams[0].students;
                        } else {
                            throw new Error("Invalid JSON format");
                        }

                        state.students = students;

                        const statusEl = document.getElementById("published-results-status");
                        if (statusEl) {
                            statusEl.innerHTML = "File loaded successfully. " + state.students.length + " records found.";
                            statusEl.style.color = "#2ed573";
                        }

                    } catch (err) {
                        const statusEl = document.getElementById("published-results-status");
                        if (statusEl) {
                            statusEl.innerHTML = "Invalid JSON file.";
                            statusEl.style.color = "#ff4d4d";
                        }
                    }
                };
                reader.readAsText(file);
            });
        }

        // Sync Button Listener
        const syncBtn = document.getElementById("btn-sync-results");
        if (syncBtn) {
            syncBtn.addEventListener("click", () => this.handleSyncClick());
        }

        // Google Sheet Fetch Listener
        const fetchBtn = document.getElementById("btn-fetch-headers");
        if (fetchBtn) {
            fetchBtn.addEventListener("click", () => this.fetchHeaders());
        }

        // Import Button Listener
        const importBtn = document.getElementById("btn-import-sheet");
        if (importBtn) {
            importBtn.addEventListener("click", () => this.importFromSheet());
        }
    },

    handleSyncClick: function () {
        if (state.students && state.students.length > 0) {
            state.lastSynced = new Date();
            this.updateStatsUI();
            const statusDiv = document.getElementById("results-sync-status");
            const messageDiv = document.getElementById("results-sync-message");
            if (statusDiv) statusDiv.style.display = "block";
            if (messageDiv) messageDiv.innerHTML = "Sync Verified. " + state.students.length + " records ready to publish.";
            return;
        }

        if (window.ProExam && window.ProExam.state && window.ProExam.state.students.length > 0) {
            state.students = window.ProExam.state.students;
            state.lastSynced = new Date();
            this.updateStatsUI();
            const statusDiv = document.getElementById("results-sync-status");
            const messageDiv = document.getElementById("results-sync-message");
            if (statusDiv) statusDiv.style.display = "block";
            if (messageDiv) messageDiv.innerHTML = "Preview Ready. " + state.students.length + " students synced successfully!";
            return;
        }

        alert("No data found. Please Import from Sheet or Upload JSON.");
    },

    updateStatsUI: function () {
        const examsCountEl = document.getElementById("results-exams-count");
        const totalCountEl = document.getElementById("results-total-count");
        const lastSyncEl = document.getElementById("results-last-sync");

        if (examsCountEl) examsCountEl.textContent = 1;
        if (totalCountEl) totalCountEl.textContent = state.students ? state.students.length : 0;
        if (lastSyncEl) lastSyncEl.textContent = state.lastSynced.toLocaleTimeString();
    },

    importFromSheet: async function () {
        const sheetInput = document.getElementById("results-sheet-id");
        const sheetId = sheetInput ? sheetInput.value.trim() : "";
        if (!sheetId) return alert("Sheet ID missing");

        const rollMap = document.getElementById("map-roll").value;
        const nameMap = document.getElementById("map-name").value;
        const statusMap = document.getElementById("map-status").value;

        const subjectChecks = document.querySelectorAll("#map-subjects-container input:checked");
        const subjectMaps = Array.from(subjectChecks).map(cb => cb.value);

        if (!rollMap || !nameMap || !statusMap) {
            return alert("Please map at least Register No, Name, and Status fields.");
        }

        try {
            const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
            const response = await fetch(url);
            const text = await response.text();
            const json = JSON.parse(text.substring(47).slice(0, -2));

            const headers = json.table.cols.map(col => col.label);
            const rows = json.table.rows;

            const getValue = (row, header) => {
                const index = headers.indexOf(header);
                if (index === -1) return "";
                const cell = row.c[index];
                return cell ? (cell.v || cell.f || "") : "";
            };

            const students = rows.map(row => {
                return {
                    regNo: String(getValue(row, rollMap)),
                    name: getValue(row, nameMap),
                    status: getValue(row, statusMap),
                    subjects: subjectMaps.map(subHeader => ({
                        name: subHeader,
                        score: getValue(row, subHeader),
                        max: 100
                    }))
                };
            }).filter(s => s.regNo);

            state.students = students;
            state.lastSynced = new Date();

            this.updateStatsUI();

            alert(`Import Successful! ${students.length} students loaded.`);

        } catch (e) {
            console.error(e);
            alert("Error importing data: " + e.message);
        }
    },

    fetchHeaders: async function () {
        const sheetInput = document.getElementById("results-sheet-id");
        const sheetId = sheetInput ? sheetInput.value.trim() : "";

        if (!sheetId) {
            alert("Please enter Google Sheet ID");
            return;
        }

        try {
            const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok");

            const text = await response.text();
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}');

            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error("Invalid response format from Google Sheets");
            }

            const jsonString = text.substring(jsonStart, jsonEnd + 1);
            const json = JSON.parse(jsonString);

            const headers = json.table.cols.map(col => col.label).filter(Boolean);

            if (!headers.length) {
                alert("No headers found. Ensure the first row of your sheet contains headers.");
                return;
            }

            this.populateMappingUI(headers);

        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Failed to fetch sheet. Check Sheet ID and ensure 'Anyone with the link' can view.");
        }
    },

    populateMappingUI: function (headers) {
        const selects = ["map-roll", "map-name", "map-dob", "map-status"];

        selects.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;

            select.innerHTML = '<option value="">Select Column</option>';

            headers.forEach(header => {
                const opt = document.createElement("option");
                opt.value = header;
                opt.textContent = header;
                select.appendChild(opt);
            });
        });

        const subjectContainer = document.getElementById("map-subjects-container");
        if (subjectContainer) {
            subjectContainer.innerHTML = "";

            headers.forEach(header => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <label style="font-size:0.75rem; display: flex; align-items: center; gap: 5px; color: #ccc;">
                        <input type="checkbox" value="${header}">
                        ${header}
                    </label>
                `;
                subjectContainer.appendChild(div);
            });
        }

        const mappingUI = document.getElementById("column-mapping-ui");
        if (mappingUI) {
            mappingUI.style.display = "block";
            mappingUI.animate([
                { opacity: 0, transform: 'translateY(-10px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], { duration: 300, fill: 'forwards' });
        }

        alert("Headers loaded successfully! Please map the columns below.");
    }
};

window.ResultsManagement = ResultsManagement;

const StaticPublisher = {
    publish: function () {
        if (!state.students || state.students.length === 0) {
            alert("No students available to publish.");
            return;
        }

        if (!state.examId) {
            alert("Please select exam profile before publishing.");
            return;
        }

        const exportData = {
            published: true,
            lastUpdated: new Date().toISOString(),
            exams: [
                {
                    examId: state.examId,
                    examName: state.examName,
                    publishedAt: new Date().toISOString(),
                    students: state.students
                }
            ]
        };

        const blob = new Blob(
            [JSON.stringify(exportData, null, 2)],
            { type: "application/json" }
        );

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "results-store.json";
        link.click();

        alert("Results Published Successfully! \n\nACTION REQUIRED:\nMove the downloaded 'results-store.json' to the '/data/' folder in your project root.");

        this.updateUI(true);
    },

    unpublish: function () {
        const exportData = {
            published: false,
            lastUpdated: new Date().toISOString(),
            exams: []
        };
        const blob = new Blob(
            [JSON.stringify(exportData, null, 2)],
            { type: "application/json" }
        );

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "results-store.json";
        link.click();

        alert("Results Unpublished. \n\nACTION REQUIRED:\nReplace 'results-store.json' in '/data/' with this file to hide results.");
        this.updateUI(false);
    },

    updateUI: function (isPublished) {
        const statusEl = document.getElementById("results-publish-status");
        if (statusEl) {
            statusEl.textContent = isPublished ? "Live" : "Offline";
            statusEl.className = isPublished ? "status-badge approved" : "status-badge pending";
        }

        const linkContainer = document.getElementById("public-link-container");
        const linkInput = document.getElementById("public-link-input");

        if (isPublished && state.examId && linkContainer && linkInput) {
            linkContainer.style.display = "block";
            const baseUrl = window.location.origin + window.location.pathname.replace('/admin.html', '').replace('/pages/admin', '');
            const publicUrl = `${baseUrl}/pages/results/index.html?exam=${state.examId}`;
            linkInput.value = publicUrl;
        } else if (linkContainer) {
            linkContainer.style.display = "none";
        }
    }
};

window.StaticPublisher = StaticPublisher;

export default ResultsManagement;
