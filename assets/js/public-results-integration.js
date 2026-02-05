// ====================================================================
// PUBLIC RESULTS PAGE - INTEGRATION CODE
// ====================================================================
// Cascading dropdown system: Year → Type → Exam → Search
// Backward compatible with old results format
// ====================================================================

(function () {
    'use strict';

    // DOM Elements
    const yearSelect = document.getElementById('yearSelect');
    const typeSelect = document.getElementById('typeSelect');
    const examSelect = document.getElementById('examSelect');
    const rollInput = document.getElementById('rollInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultContainer = document.getElementById('resultContainer');

    // Initialize on page load
    function init() {
        loadAcademicYears();
        attachEventListeners();
    }

    // Attach event listeners
    function attachEventListeners() {
        if (yearSelect) yearSelect.addEventListener('change', loadExamTypes);
        if (typeSelect) typeSelect.addEventListener('change', loadExams);
        if (searchBtn) searchBtn.addEventListener('click', searchResults);
        if (rollInput) rollInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchResults();
        });

        // Listen for updates from admin panel
        window.addEventListener('academic-year-updated', loadAcademicYears);
        window.addEventListener('exam-types-updated', loadExamTypes);
        window.addEventListener('exams-updated', loadExams);
    }

    // 1. Load Academic Years
    function loadAcademicYears() {
        if (!yearSelect) return;

        const years = StorageManager.get('academic_years', []);
        const activeYears = years.filter(y => y.active);
        const currentYear = years.find(y => y.current);

        if (activeYears.length === 0) {
            yearSelect.innerHTML = '<option value="">No sessions available</option>';
            if (typeSelect) typeSelect.innerHTML = '<option value="">-- Select Year First --</option>';
            if (examSelect) examSelect.innerHTML = '<option value="">-- Select Type First --</option>';
            return;
        }

        yearSelect.innerHTML = '<option value="">-- Select session --</option>' +
            activeYears.map(y =>
                `<option value="${y.id}" ${y.id === currentYear?.id ? 'selected' : ''}>${y.name}</option>`
            ).join('');

        loadExamTypes();
    }

    // 2. Load Exam Types (filtered by selected year)
    function loadExamTypes() {
        if (!typeSelect || !yearSelect) return;

        const selectedYear = yearSelect.value;
        if (!selectedYear) {
            typeSelect.innerHTML = '<option value="">-- Select Year First --</option>';
            if (examSelect) examSelect.innerHTML = '<option value="">-- Select Type First --</option>';
            return;
        }

        // Get all active exams for selected year
        const exams = StorageManager.get('exams', []);
        const yearExams = exams.filter(e => e.academicYear === selectedYear && e.active);

        // Get active exam types
        const examTypes = StorageManager.get('exam_types', []);

        // Find which active types actually have exams for this year
        const availableTypeIds = [...new Set(yearExams.map(e => e.examType))];
        const typeOptions = examTypes.filter(t => {
            const id = t.id; // Use ID directly
            return t.active && availableTypeIds.includes(id);
        });

        if (typeOptions.length === 0) {
            typeSelect.innerHTML = '<option value="">No exam types available</option>';
            if (examSelect) examSelect.innerHTML = '<option value="">-- Select Type First --</option>';
            return;
        }

        typeSelect.innerHTML = '<option value="">-- Select type --</option>' +
            typeOptions.map(t => {
                return `<option value="${t.id}">${t.name}</option>`;
            }).join('');

        loadExams();
    }

    // 3. Load Exams (filtered by year + type)
    function loadExams() {
        if (!examSelect || !yearSelect || !typeSelect) return;

        const selectedYear = yearSelect.value;
        const selectedType = typeSelect.value;

        if (!selectedYear || !selectedType) {
            examSelect.innerHTML = '<option value="">-- Select Type First --</option>';
            return;
        }

        // Get exams for selected year and type
        const exams = StorageManager.get('exams', []);
        const filtered = exams.filter(e =>
            e.academicYear === selectedYear &&
            e.examType === selectedType &&
            e.active
        );

        if (filtered.length === 0) {
            examSelect.innerHTML = '<option value="">No exams available</option>';
            return;
        }

        examSelect.innerHTML = '<option value="">-- Select Exam Name --</option>' +
            filtered.map(e => `<option value="${e.id}">${e.examName}</option>`).join('');
    }

    // 4. Search Results
    function searchResults() {
        const examId = examSelect ? examSelect.value : '';
        const rollNo = rollInput ? rollInput.value.trim() : '';

        // Validation
        if (!rollNo) {
            showError('Please enter your Roll Number');
            return;
        }

        if (!examId) {
            showError('Please select an exam');
            return;
        }

        // Use ResultsCMS search if available globally, or load manually
        let result;
        if (window.ResultsCMS) {
            result = window.ResultsCMS.search(null, rollNo, examId);
        } else {
            const results = StorageManager.get('exam_results_cache', []);
            result = results.find(r => r.examId === examId && String(r.rollNo).trim() === String(rollNo));
        }

        if (result) {
            displayResult(result);
        } else {
            showError(`Result not found for Roll No: ${rollNo} in the selected exam.`);
        }
    }

    // Display result
    function displayResult(result) {
        if (!resultContainer) return;

        // Get exam details
        let examDisplayName = 'Exam Result';
        if (result.examId) {
            const exams = JSON.parse(localStorage.getItem('mhm_v2_exams') || '[]');
            const exam = exams.find(e => e.id === result.examId);
            if (exam) examDisplayName = exam.displayName;
        } else if (result.exam) {
            // Old format
            examDisplayName = result.exam;
        }

        const statusClass = result.status === 'Pass' ? 'success' : 'warning';

        resultContainer.innerHTML = `
            <div class="result-card">
                <div class="result-header">
                    <h3>${examDisplayName}</h3>
                </div>
                <div class="result-body">
                    <div class="result-row">
                        <span class="label">Roll Number:</span>
                        <span class="value"><b>${result.rollNo}</b></span>
                    </div>
                    <div class="result-row">
                        <span class="label">Student Name:</span>
                        <span class="value"><b>${result.name}</b></span>
                    </div>
                    <div class="result-row">
                        <span class="label">Total Marks:</span>
                        <span class="value"><b style="color: var(--primary-color);">${result.totalMarks}</b></span>
                    </div>
                    <div class="result-row">
                        <span class="label">Grade:</span>
                        <span class="value"><b>${result.grade}</b></span>
                    </div>
                    <div class="result-row">
                        <span class="label">Status:</span>
                        <span class="value">
                            <span class="status-badge ${statusClass}">${result.status}</span>
                        </span>
                    </div>
                </div>
                <div class="result-footer">
                    <button class="btn-print" onclick="window.print()">
                        <i class="ph-bold ph-printer"></i> Print Result
                    </button>
                </div>
            </div>
        `;

        resultContainer.style.display = 'block';
    }

    // Show error message
    function showError(message) {
        if (!resultContainer) return;

        resultContainer.innerHTML = `
            <div class="result-card error">
                <div class="result-body" style="text-align: center; padding: 40px;">
                    <i class="ph ph-warning-circle" style="font-size: 3rem; color: #ff4444; margin-bottom: 15px;"></i>
                    <p style="color: #ff4444; font-size: 1.1rem; margin: 0;">${message}</p>
                </div>
            </div>
        `;

        resultContainer.style.display = 'block';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
