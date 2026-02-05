/**
 * ExamManager.js - Production Ready
 * Manages exams with strict school-aware nested storage: localStorage.exams = { [schoolId]: [...] }
 */
const ExamManager = (function () {
    'use strict';

    const STORAGE_KEY = 'exams';

    function init() {
        console.log('📝 ExamManager: Initializing...');
        refreshAllExamSelectors();

        // Listen for all dependency updates
        window.addEventListener('schoolChanged', () => {
            console.log('📝 ExamManager: School changed, syncing context...');
            refreshAllExamSelectors();
        });

        window.addEventListener('yearChanged', () => {
            console.log('📝 ExamManager: Years updated.');
            refreshAllExamSelectors();
        });

        window.addEventListener('examTypeChanged', () => {
            console.log('📝 ExamManager: Types updated.');
            refreshAllExamSelectors();
        });
    }

    /**
     * INTERNAL: Helper to get active school ID
     */
    function _getSchoolId() {
        // Safe check for current context
        const schoolId = localStorage.getItem('activeSchoolId') || 'default';
        if (schoolId === 'default') console.warn('📝 ExamManager: No active school set, using default.');
        return schoolId;
    }

    /**
     * INTERNAL: Handles the requested nested structure localStorage.exams = { [schoolId]: [...] }
     */
    function _getStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error('📝 ExamManager: Storage error', e);
            return {};
        }
    }

    function _saveStorage(all) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        } catch (e) {
            console.error('📝 ExamManager: Save error', e);
            alert("Storage quota exceeded!");
        }
    }

    /**
     * Get exams for the ACTIVE school only
     */
    function getAll() {
        const schoolId = _getSchoolId();
        const all = _getStorage();
        return all[schoolId] || [];
    }

    /**
     * Save exams for the ACTIVE school
     */
    function saveAll(exams) {
        const schoolId = _getSchoolId();
        const all = _getStorage();
        all[schoolId] = exams;
        _saveStorage(all);

        // Dispatch event for other modules
        window.dispatchEvent(new CustomEvent('examsUpdated', { detail: exams }));
    }

    /**
     * Creates and saves a new exam with the requested schema
     */
    function create(academicYearId, examTypeId, name, sheetId = '') {
        const academicYear = window.AcademicYearManager ? AcademicYearManager.getAll().find(y => y.id === academicYearId) : null;
        const examType = window.ExamTypeManager ? ExamTypeManager.getAll().find(t => t.id === examTypeId) : null;

        const normalized = name.trim();

        if (!academicYear || !examType || !normalized) {
            alert("Please select Academic Year, Exam Type, and enter a Name.");
            return false;
        }

        const exams = getAll();

        // Duplicate check per school context
        if (exams.find(e => e.yearId === academicYearId && e.typeId === examTypeId && e.name.toLowerCase() === normalized.toLowerCase())) {
            alert(`Exam "${normalized}" already exists for this year and type.`);
            return false;
        }

        const newExam = {
            id: 'ex_' + Date.now(),
            name: normalized,
            academicYearId: academicYearId,
            academicYearLabel: academicYear.yearLabel || academicYear.name,
            examTypeId: examTypeId,
            examTypeName: examType.name,
            sheetId: sheetId.trim(),
            isActive: true,
            createdAt: new Date().toISOString(),
            // Maintain mapping fields for backward compatibility if needed
            yearId: academicYearId,
            typeId: examTypeId
        };

        exams.push(newExam);
        saveAll(exams);

        // Universal Refresh with auto-selection
        refreshAllExamSelectors(newExam.id);
        return true;
    }

    /**
     * UNIVERSAL REFRESH METHOD (MANDATORY)
     * Updates all related dropdowns and UI components.
     */
    function refreshAllExamSelectors(autoSelectId = null) {
        console.log('📝 ExamManager: Refreshing all selectors...');

        const exams = getAll();
        const activeExams = exams.filter(e => e.isActive);

        // 1. Results Sync Selector (#results-exam-select)
        const resultsSelect = document.getElementById('results-exam-select');
        if (resultsSelect) {
            const currentVal = autoSelectId || resultsSelect.value;

            if (activeExams.length === 0) {
                resultsSelect.innerHTML = '<option value="">-- No Exams Available --</option>';
            } else {
                resultsSelect.innerHTML = '<option value="">-- Select Exam Profile --</option>' +
                    activeExams.map(e => {
                        const label = `${e.name} – ${e.examTypeName} (${e.academicYearLabel})`;
                        return `<option value="${e.id}">${label}</option>`;
                    }).join('');
            }

            if (currentVal) resultsSelect.value = currentVal;
        }

        // 2. Dashboard Exam List Table (#exams-table-body)
        renderTable(exams);

        // 3. Filter Dropdowns (#exam-filter-year)
        const filterYear = document.getElementById('exam-filter-year');
        if (filterYear && window.AcademicYearManager) {
            const activeYears = AcademicYearManager.getActive();
            const currentFilter = filterYear.value;
            filterYear.innerHTML = '<option value="">All Years</option>' +
                activeYears.map(y => `<option value="${y.id}">${y.yearLabel}</option>`).join('');
            if (currentFilter) filterYear.value = currentFilter;
        }

        // 4. Trigger Result Management UI Updates
        if (window.ResultsManagement && typeof ResultsManagement.refresh === 'function') {
            ResultsManagement.refresh();
        }
    }

    function renderTable(providedExams = null) {
        const tbody = document.getElementById('exams-table-body');
        if (!tbody) return;

        const exams = providedExams || getAll();

        if (exams.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#666;">No exam profiles created.</td></tr>';
            return;
        }

        tbody.innerHTML = exams.map(e => `
            <tr>
                <td><b style="color:#fff;">${e.name}</b></td>
                <td>${e.examTypeName}</td>
                <td>${e.academicYearLabel}</td>
                <td><span class="status-badge ${e.isActive ? 'approved' : 'pending'}">${e.isActive ? 'Active' : 'Disabled'}</span></td>
                <td style="text-align:right;">
                    <div style="display:flex; gap:5px; justify-content:flex-end;">
                        <button class="btn btn-mini btn-secondary" onclick="ExamManager.toggleActive('${e.id}')">
                            <i class="ph-bold ph-eye${e.isActive ? '-slash' : ''}"></i>
                        </button>
                        <button class="btn btn-mini btn-danger" onclick="ExamManager.deleteExam('${e.id}')">
                            <i class="ph-bold ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function saveExam() {
        const yearSelect = document.getElementById('exam-academic-year');
        const typeSelect = document.getElementById('exam-type-select');
        const nameInput = document.getElementById('exam-name-input');
        const sheetInput = document.getElementById('exam-sheet-id');

        if (!yearSelect || !typeSelect || !nameInput) return;

        if (create(yearSelect.value, typeSelect.value, nameInput.value, sheetInput?.value)) {
            // Success cleanup
            nameInput.value = '';
            if (sheetInput) sheetInput.value = '';
            toggleAddForm(); // Closes form
        }
    }

    function toggleActive(id) {
        const exams = getAll();
        const exam = exams.find(e => e.id === id);
        if (exam) {
            exam.isActive = !exam.isActive;
            saveAll(exams);
            refreshAllExamSelectors();
        }
    }

    function deleteExam(id) {
        if (!confirm("Permanently delete this exam profile? Associated results will remain cached but unlinked.")) return;
        const exams = getAll();
        const updated = exams.filter(e => e.id !== id);
        saveAll(updated);
        refreshAllExamSelectors();
    }

    function toggleAddForm() {
        const form = document.getElementById('exam-add-form');
        if (!form) return;
        const display = (form.style.display === 'none' || getComputedStyle(form).display === 'none') ? 'block' : 'none';
        form.style.display = display;
    }

    return {
        init,
        getAll,
        getActive: () => getAll().filter(e => e.isActive),
        create,
        deleteExam,
        toggleActive,
        toggleAddForm,
        saveExam,
        refreshAllExamSelectors,
        refresh: refreshAllExamSelectors // Compatibility alias
    };
})();

window.ExamManager = ExamManager;
document.addEventListener('DOMContentLoaded', () => ExamManager.init());
