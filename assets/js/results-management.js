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
                        // Check for nested format or flat format
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
            syncBtn.addEventListener("click", this.handleSyncClick);
        }
    },

    handleSyncClick: function () {
        // Bridge to ProExam if it has data
        if (window.ProExam && window.ProExam.state && window.ProExam.state.students.length > 0) {
            state.students = window.ProExam.state.students;
        }

        if (!state.students || state.students.length === 0) {
            alert("Please upload results JSON before syncing.");
            return;
        }

        if (!state.examId) {
            alert("Please select exam profile before syncing.");
            return;
        }

        state.lastSynced = new Date();

        // Update UI Stats
        const examsCountEl = document.getElementById("results-exams-count");
        const totalCountEl = document.getElementById("results-total-count");
        const lastSyncEl = document.getElementById("results-last-sync");

        if (examsCountEl) examsCountEl.textContent = 1;
        if (totalCountEl) totalCountEl.textContent = state.students.length;
        if (lastSyncEl) lastSyncEl.textContent = state.lastSynced.toLocaleTimeString();

        // Show Success Message
        const statusDiv = document.getElementById("results-sync-status");
        const messageDiv = document.getElementById("results-sync-message");

        if (statusDiv) statusDiv.style.display = "block";
        if (messageDiv) messageDiv.innerHTML = "Preview Ready. " + state.students.length + " students synced successfully!";

        console.log("Sync successful:", state);
    }
};

const StaticPublisher = {
    publish: function () {
        // Use the global state
        if (!state.students || state.students.length === 0) {
            alert("No students available to publish.");
            return;
        }

        if (!state.examId) {
            alert("Please select exam profile before publishing.");
            return;
        }

        const exportData = {
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
        link.download = "published-results.json";
        link.click();

        alert("Results Published Successfully! Download the 'published-results.json' file and place it in the root folder.");
    }
};

window.StaticPublisher = StaticPublisher;
window.ResultsManagement = ResultsManagement;

export default ResultsManagement;
