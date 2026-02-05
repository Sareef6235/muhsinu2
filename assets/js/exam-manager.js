// ====================================================================
// EXAM MANAGER MODULE
// ====================================================================
// Manages specific exams (Half Yearly - Class 10, Annual - Science, etc.)
// Links: Academic Year + Exam Type + Exam Name
// Safe for production - backward compatible with old results
// ====================================================================

const ExamManager = (function () {
    'use strict';

    const STORAGE_KEY = 'exams';
    let editingId = null;

    // Get all exams
    function getAll() {
        return StorageManager.get(STORAGE_KEY, []);
    }

    // Get exams by academic year
    function getByYear(academicYear) {
        return getAll().filter(e => e.academicYear === academicYear);
    }

    // Get exams by academic year and type
    function getByYearAndType(academicYear, examType) {
        return getAll().filter(e =>
            e.academicYear === academicYear && e.examType === examType
        );
    }

    // Get only active exams
    function getActive() {
        return getAll().filter(e => e.active);
    }

    // Get exam by ID
    function getById(id) {
        return getAll().find(e => e.id === id);
    }

    // Save to localStorage
    function save(exams) {
        StorageManager.set(STORAGE_KEY, exams);
        window.dispatchEvent(new CustomEvent('exams-updated'));
    }

    // Create new exam
    function create(academicYear, examType, examName, sheetId = '') {
        const exams = getAll();

        // Validation
        if (!academicYear || !examType || !examName) {
            alert('Please fill all required fields');
            return false;
        }

        const normalized = examName.trim();
        if (!normalized) {
            alert('Exam name cannot be empty');
            return false;
        }

        // Check duplicate
        const duplicate = exams.find(e =>
            e.academicYear === academicYear &&
            e.examType === examType &&
            e.examName.toLowerCase() === normalized.toLowerCase()
        );
        if (duplicate) {
            alert(`Exam "${normalized}" already exists for this type and year`);
            return false;
        }

        // Get exam type name for display
        let typeName = examType;
        if (window.ExamTypeManager) {
            const types = window.ExamTypeManager.getAll();
            const typeObj = types.find(t => {
                const id = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                return id === examType;
            });
            if (typeObj) typeName = typeObj.name;
        }

        // Get year label for display
        let yearLabel = academicYear;
        if (window.AcademicYearManager) {
            const years = window.AcademicYearManager.getAll();
            const yearObj = years.find(y => y.id === academicYear);
            if (yearObj) yearLabel = yearObj.label;
        }

        const newExam = {
            id: 'exam_' + Date.now(),
            academicYear,
            examType,
            examName: normalized,
            displayName: `${typeName} - ${normalized} (${yearLabel})`,
            sheetId: sheetId.trim(),
            active: true,
            createdAt: new Date().toISOString(),
            lastSync: null
        };

        exams.push(newExam);
        save(exams);
        return newExam;
    }

    // Update exam
    function update(id, updates) {
        const exams = getAll();
        const index = exams.findIndex(e => e.id === id);

        if (index === -1) {
            alert('Exam not found');
            return false;
        }

        // If updating name, check duplicates
        if (updates.examName) {
            const normalized = updates.examName.trim();
            if (!normalized) {
                alert('Exam name cannot be empty');
                return false;
            }

            const exam = exams[index];
            const duplicate = exams.find((e, i) =>
                i !== index &&
                e.academicYear === exam.academicYear &&
                e.examType === exam.examType &&
                e.examName.toLowerCase() === normalized.toLowerCase()
            );
            if (duplicate) {
                alert(`Exam "${normalized}" already exists`);
                return false;
            }

            updates.examName = normalized;
        }

        exams[index] = { ...exams[index], ...updates };
        save(exams);
        return true;
    }

    // Toggle active status
    function toggleActive(id) {
        const exams = getAll();
        const exam = exams.find(e => e.id === id);

        if (exam) {
            exam.active = !exam.active;
            save(exams);
            return true;
        }
        return false;
    }

    // Delete exam
    function deleteExam(id) {
        if (!confirm('Delete this exam?\n\nNote: Results will remain in storage but won\'t be linked to this exam.')) {
            return false;
        }

        const exams = getAll().filter(e => e.id !== id);
        save(exams);
        return true;
    }

    // UI Functions
    function toggleAddForm() {
        const form = document.getElementById('exam-add-form');
        const nameInput = document.getElementById('exam-name-input');

        if (form.style.display === 'none') {
            form.style.display = 'block';
            nameInput.value = '';
            document.getElementById('exam-sheet-id').value = '';
            nameInput.focus();
            editingId = null;
        } else {
            form.style.display = 'none';
            editingId = null;
        }
    }

    function saveExam(btn) {
        const yearSelect = document.getElementById('exam-academic-year');
        const typeSelect = document.getElementById('exam-type-select');
        const nameInput = document.getElementById('exam-name-input');
        const sheetInput = document.getElementById('exam-sheet-id');

        const academicYear = yearSelect.value;
        const examType = typeSelect.value;
        const examName = nameInput.value.trim();
        const sheetId = sheetInput.value.trim();

        if (!academicYear || !examType || !examName) {
            alert('Please fill all required fields');
            return;
        }

        if (window.uiLock) window.uiLock(btn, true);

        try {
            let success;
            if (editingId) {
                success = update(editingId, { examName, sheetId });
            } else {
                success = create(academicYear, examType, examName, sheetId);
            }

            if (success) {
                toggleAddForm();
                renderTable();
                updateExamSelector();
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (window.uiLock) window.uiLock(btn, false);
        }
    }

    function startEdit(id) {
        const exams = getAll();
        const exam = exams.find(e => e.id === id);

        if (exam) {
            editingId = id;
            const form = document.getElementById('exam-add-form');

            document.getElementById('exam-academic-year').value = exam.academicYear;
            document.getElementById('exam-type-select').value = exam.examType;
            document.getElementById('exam-name-input').value = exam.examName;
            document.getElementById('exam-sheet-id').value = exam.sheetId || '';

            form.style.display = 'block';
            document.getElementById('exam-name-input').focus();
        }
    }

    function handleDelete(id) {
        if (deleteExam(id)) {
            renderTable();
            updateExamSelector();
        }
    }

    function handleToggleActive(id) {
        if (toggleActive(id)) {
            renderTable();
            updateExamSelector();
        }
    }

    function renderTable() {
        const tbody = document.getElementById('exams-table-body');
        const exams = getAll();

        // Get filter values
        const filterYear = document.getElementById('exam-filter-year')?.value || '';
        const filterType = document.getElementById('exam-filter-type')?.value || '';

        // Filter exams
        let filtered = exams;
        if (filterYear) filtered = filtered.filter(e => e.academicYear === filterYear);
        if (filterType) filtered = filtered.filter(e => e.examType === filterType);

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #666; padding: 30px;">
                        No exams found. Click "Add Exam" to create one.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(exam => {
            const statusBadge = exam.active
                ? '<span class="status-badge approved">Active</span>'
                : '<span class="status-badge pending">Inactive</span>';

            const syncBadge = exam.lastSync
                ? `<span style="font-size: 0.75rem; color: #2ed573;">✓ Synced</span>`
                : `<span style="font-size: 0.75rem; color: #888;">Not synced</span>`;

            return `
                <tr>
                    <td><b>${exam.examName}</b><br>${syncBadge}</td>
                    <td style="font-size: 0.85rem; color: #888;">${exam.examType.replace(/_/g, ' ')}</td>
                    <td style="font-size: 0.85rem; color: #888;">${exam.academicYear.replace(/_/g, '-')}</td>
                    <td>${statusBadge}</td>
                    <td style="text-align: right;">
                        <div style="display: inline-flex; gap: 8px;">
                            <button class="nav-item" style="padding: 6px 12px; border: none; font-size: 0.85rem;"
                                onclick="ExamManager.startEdit('${exam.id}')"
                                title="Edit">
                                <i class="ph-bold ph-pencil-simple"></i>
                            </button>
                            <button class="nav-item ${exam.active ? '' : 'active'}" 
                                style="padding: 6px 12px; border: none; font-size: 0.85rem;"
                                onclick="ExamManager.handleToggleActive('${exam.id}')"
                                title="${exam.active ? 'Deactivate' : 'Activate'}">
                                <i class="ph-bold ph-${exam.active ? 'eye-slash' : 'eye'}"></i>
                            </button>
                            <button class="nav-item" style="padding: 6px 12px; border: none; font-size: 0.85rem; color: #ff4444;"
                                onclick="ExamManager.handleDelete('${exam.id}')"
                                title="Delete">
                                <i class="ph-bold ph-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function updateExamSelector() {
        const select = document.getElementById('results-exam-select');
        if (!select) return;

        const currentYear = window.AcademicYearManager ? window.AcademicYearManager.getCurrent() : null;
        const yearId = currentYear ? currentYear.id : '';

        const exams = getActive().filter(e => e.academicYear === yearId);

        select.innerHTML = '<option value="">-- Select Exam --</option>' +
            exams.map(e => `<option value="${e.id}">${e.displayName}</option>`).join('');
    }

    function init() {
        renderTable();
        updateExamSelector();

        // Listen for exam type updates to refresh labels/selectors
        window.addEventListener('exam-types-updated', () => {
            renderTable();
            updateExamSelector();
        });
    }

    // Public API
    return {
        init,
        getAll,
        getByYear,
        getByYearAndType,
        getActive,
        getById,
        create,
        update,
        toggleActive,
        deleteExam,
        toggleAddForm,
        saveExam,
        startEdit,
        handleDelete,
        handleToggleActive,
        renderTable,
        updateExamSelector
    };
})();

// Expose globally
window.ExamManager = ExamManager;
