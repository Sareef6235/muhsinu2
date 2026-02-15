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
                this.updateUI(store.published);

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

                    // Restore state logic if needed (optional, as we prioritize new uploads)
                    // state.students = ... 
                    // Note: We don't fully restore state.students to avoid confusion with new uploads.
                    // We only show the "Live" stats.
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

        // Structure matches /data/results-store.json
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
        link.download = "results-store.json"; // Changed filename
        link.click();

        alert("Results Published Successfully! \n\nACTION REQUIRED:\nMove the downloaded 'results-store.json' to the '/data/' folder in your project root.");

        // Update UI
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
            // Construct absolute URL based on current location
            const baseUrl = window.location.origin + window.location.pathname.replace('/admin.html', '').replace('/pages/admin', '');
            const publicUrl = `${baseUrl}/pages/results/index.html?exam=${state.examId}`;
            linkInput.value = publicUrl;
        } else if (linkContainer) {
            linkContainer.style.display = "none";
        }
    }
};

window.StaticPublisher = StaticPublisher;
window.ResultsManagement = ResultsManagement;

export default ResultsManagement;
