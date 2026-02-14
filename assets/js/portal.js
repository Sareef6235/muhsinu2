let publicData = null;

async function autoLoadPublishedResults() {
    try {
        // Check both root and local folder for convenience
        let response = await fetch("../../published-results.json");
        if (!response.ok) {
            response = await fetch("published-results.json");
        }

        if (!response.ok) throw new Error("No file found");

        publicData = await response.json();
        initializePortal(publicData);

    } catch (err) {
        console.log("No static file found.");
    }
}

window.addEventListener("DOMContentLoaded", autoLoadPublishedResults);

const uploadEl = document.getElementById("published-results-upload");
if (uploadEl) {
    uploadEl.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                publicData = JSON.parse(e.target.result);
                initializePortal(publicData);

                const statusEl = document.getElementById("published-results-status");
                if (statusEl) statusEl.innerHTML = "Results loaded successfully";

            } catch (err) {
                const statusEl = document.getElementById("published-results-status");
                if (statusEl) statusEl.innerHTML = "Invalid JSON file";
            }
        };

        reader.readAsText(file);
    });
}

function initializePortal(data) {
    const select = document.getElementById("examSelect");
    if (!select) return;

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
        const submitBtn = document.getElementById("submitBtn");
        if (submitBtn) {
            submitBtn.disabled = !this.value;
            submitBtn.style.opacity = this.value ? "1" : "0.5";
        }
    });

    // Auto-update stats if elements exist
    const examCountEl = document.getElementById("results-exams-count");
    const totalCountEl = document.getElementById("results-total-count");
    const lastSyncEl = document.getElementById("results-last-sync");

    if (examCountEl) examCountEl.innerText = data.exams.length;
    if (totalCountEl) {
        const totalStudents = data.exams.reduce((sum, ex) => sum + (ex.students ? ex.students.length : 0), 0);
        totalCountEl.innerText = totalStudents;
    }
    if (lastSyncEl && data.exams[0]) {
        lastSyncEl.innerText = new Date(data.exams[0].publishedAt).toLocaleTimeString();
    }
}

const formEl = document.getElementById("resultsForm");
if (formEl) {
    formEl.addEventListener("submit", function (e) {
        e.preventDefault();

        const examId = document.getElementById("examSelect").value;

        if (!examId || !publicData) {
            alert("Please select exam.");
            return;
        }

        const exam = publicData.exams.find(e => String(e.examId) === String(examId));
        const roll = document.getElementById("rollInput").value.trim();

        const student = exam.students.find(s =>
            String(s.rollNo || s.roll).trim() === roll
        );

        if (!student) {
            alert(`Result not found for Roll No: ${roll}`);
            return;
        }

        // Use the existing ResultsPortal.renderResult if available, otherwise fallback
        if (window.ResultsPortal && typeof window.ResultsPortal.renderResult === 'function') {
            window.ResultsPortal.renderResult(student);
        } else {
            alert("Result Found: " + student.name + "\nTotal: " + (student.total || student.totalMarks || 0));
        }
    });
}
