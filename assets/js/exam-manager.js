/**
 * ExamManager.js - Production Ready
 * Manages exams with structure {id, name, typeId, yearId, sheetId} per school.
 */
const ExamManager = (function () {
    'use strict';

    const STORAGE_KEY = 'exams';

    function init() {
        console.log('📝 ExamManager: Initializing...');
        renderTable();
        refreshDropdowns();

        // Listen for all dependency updates
        window.addEventListener('schoolChanged', () => {
            console.log('📝 ExamManager: School changed, refreshing...');
            renderTable();
            refreshDropdowns();
        });

        window.addEventListener('yearChanged', () => {
            console.log('📝 ExamManager: Years changed, refreshing dropdowns...');
            refreshDropdowns();
        });

        window.addEventListener('examTypeChanged', () => {
            console.log('📝 ExamManager: Types changed, refreshing dropdowns...');
            refreshDropdowns();
        });

        // Backward compatibility
        window.addEventListener('school-changed', () => {
            renderTable();
            refreshDropdowns();
        });
    }

    function getAll() {
        return StorageManager.get(STORAGE_KEY, []);
    }

    function saveAll(exams) {
        StorageManager.set(STORAGE_KEY, exams);
        window.dispatchEvent(new CustomEvent('examsUpdated', { detail: exams }));
        refreshDropdowns();
    }

    function create(academicYearId, examTypeId, name, sheetId = '') {
        const exams = getAll();
        const normalized = name.trim();

        if (!academicYearId || !examTypeId || !normalized) {
            alert("Please fill all required fields (Year, Type, and Name).");
            return false;
        }

        // Check duplicates for this year and type
        const dup = exams.find(e =>
            e.yearId === academicYearId &&
            e.typeId === examTypeId &&
            e.name.toLowerCase() === normalized.toLowerCase()
        );
        if (dup) {
            alert(`Exam "${normalized}" already exists for this year and type.`);
            return false;
        }

        const newExam = {
            id: 'ex_' + Date.now(),
            name: normalized,
            typeId: examTypeId,
            yearId: academicYearId,
            sheetId: sheetId.trim(),
            active: true,
            createdAt: new Date().toISOString()
        };

        exams.push(newExam);
        saveAll(exams);
        renderTable();
        return true;
    }

    function deleteExam(id) {
        if (!confirm("Delete this exam profile? Results associated with this exam will remain in cache but will not be linked.")) return;
        const exams = getAll();
        const updated = exams.filter(e => e.id !== id);
        saveAll(updated);
        renderTable();
    }

    function toggleActive(id) {
        const exams = getAll();
        const exam = exams.find(e => e.id === id);
        if (exam) {
            exam.active = !exam.active;
            saveAll(exams);
            renderTable();
        }
    }

    /**
     * UI Rendering
     */
    function renderTable() {
        const tbody = document.getElementById('exams-table-body');
        if (!tbody) return;

        const exams = getAll();
        const years = window.AcademicYearManager ? window.AcademicYearManager.getAll() : [];
        const types = window.ExamTypeManager ? window.ExamTypeManager.getAll() : [];

        if (exams.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#666;">No exams found.</td></tr>';
            return;
        }

        tbody.innerHTML = exams.map(e => {
            const year = years.find(y => y.id === e.yearId)?.yearLabel || 'Unknown';
            const type = types.find(t => t.id === e.typeId)?.name || 'Unknown';

            return `
                <tr>
                    <td><b style="color:#fff;">${e.name}</b></td>
                    <td>${type}</td>
                    <td>${year}</td>
                    <td><span class="status-badge ${e.active ? 'approved' : 'pending'}">${e.active ? 'Active' : 'Disabled'}</span></td>
                    <td style="text-align:right;">
                        <div style="display:flex; gap:5px; justify-content:flex-end;">
                            <button class="btn btn-mini btn-secondary" onclick="ExamManager.toggleActive('${e.id}')"><i class="ph-bold ph-eye${e.active ? '-slash' : ''}"></i></button>
                            <button class="btn btn-mini btn-danger" onclick="ExamManager.deleteExam('${e.id}')"><i class="ph-bold ph-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function refreshDropdowns() {
        // Auto-update `#results-exam-select`
        const examSelect = document.getElementById('results-exam-select');
        if (!examSelect) return;

        const activeExams = getAll().filter(e => e.active);

        // Contextual labeling
        const years = window.AcademicYearManager ? window.AcademicYearManager.getAll() : [];
        const types = window.ExamTypeManager ? window.ExamTypeManager.getAll() : [];

        examSelect.innerHTML = `<option value="">-- Select Exam --</option>` +
            activeExams.map(e => {
                const yearName = years.find(y => y.id === e.yearId)?.yearLabel || '';
                const typeName = types.find(t => t.id === e.typeId)?.name || '';
                const label = `${e.name} (${typeName} - ${yearName})`;
                return `<option value="${e.id}">${label}</option>`;
            }).join('');

        // Trigger results refresh if current exam selection might be affected
        window.dispatchEvent(new CustomEvent('examSelectionRefreshed'));
        console.log('📝 ExamManager: Dropdowns refreshed.');
    }

    function saveExam() {
        const yearSelect = document.getElementById('exam-academic-year');
        const typeSelect = document.getElementById('exam-type-select');
        const nameInput = document.getElementById('exam-name-input');
        const sheetInput = document.getElementById('exam-sheet-id');

        if (create(yearSelect.value, typeSelect.value, nameInput.value, sheetInput?.value)) {
            nameInput.value = '';
            if (sheetInput) sheetInput.value = '';
            toggleAddForm(); // Close on success
        }
    }

    // Defensive toggle: resets inputs and ensures fresh state
    function toggleAddForm() {
        const form = document.getElementById('exam-add-form');
        if (!form) return;

        const isOpening = (form.style.display === 'none' || getComputedStyle(form).display === 'none');

        if (isOpening) {
            // Reset fields
            const inputs = form.querySelectorAll('input');
            inputs.forEach(i => i.value = '');

            const selects = form.querySelectorAll('select');
            selects.forEach(s => s.selectedIndex = 0);

            // Populate dropdowns fresh BEFORE showing
            if (typeof window.populateExamFormDropdowns === 'function') {
                window.populateExamFormDropdowns();
            }

            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            form.style.display = 'none';
        }
    }

    // New: Listen for dependency updates
    window.addEventListener('yearChanged', () => {
        console.log('📝 ExamManager: Academic Year changed, refreshing form context...');
        if (typeof window.populateExamFormDropdowns === 'function') {
            window.populateExamFormDropdowns();
        }
        refreshDropdowns();
    });

    window.addEventListener('examTypeChanged', () => {
        console.log('📝 ExamManager: Exam Type changed, refreshing form context...');
        if (typeof window.populateExamFormDropdowns === 'function') {
            window.populateExamFormDropdowns();
        }
        refreshDropdowns();
    });

    return {
        init,
        getAll,
        getActive: () => getAll().filter(e => e.active),
        create,
        deleteExam,
        toggleActive,
        toggleAddForm,
        saveExam,
        refresh: () => { renderTable(); refreshDropdowns(); }
    };
})();

window.ExamManager = ExamManager;
document.addEventListener('DOMContentLoaded', () => ExamManager.init());
