/**
 * exam-type-manager.js
 * Manages exam types (Half Yearly, Annual, etc.)
 * Storage: localStorage key "exam_types"
 */

const ExamTypeManager = (function () {
    'use strict';

    const STORAGE_KEY = 'exam_types';
    let editingId = null;

    // Get all exam types
    function getAll() {
        return StorageManager.get(STORAGE_KEY, []);
    }

    // Get active exam types
    function getActive() {
        return getAll().filter(t => t.active);
    }

    // Save to localStorage
    function save(types) {
        StorageManager.set(STORAGE_KEY, types);
        window.dispatchEvent(new CustomEvent('exam-types-updated'));
    }

    // Create new exam type
    function create(name) {
        const types = getAll();
        const normalized = name.trim();

        if (!normalized) {
            alert('Please enter an exam type name.');
            return false;
        }

        // Check for duplicates (case-insensitive)
        const duplicate = types.find(t => t.name.toLowerCase() === normalized.toLowerCase());
        if (duplicate) {
            alert(`Exam type "${normalized}" already exists.`);
            return false;
        }

        const newType = {
            id: 'type_' + Date.now(),
            name: normalized,
            active: true,
            createdAt: new Date().toISOString()
        };

        types.push(newType);
        save(types);
        return true;
    }

    // Update existing exam type
    function update(id, updates) {
        const types = getAll();
        const index = types.findIndex(t => t.id === id);

        if (index === -1) return false;

        // Check for duplicate name if changed
        if (updates.name) {
            const normalized = updates.name.trim();
            const duplicate = types.find((t, i) => i !== index && t.name.toLowerCase() === normalized.toLowerCase());
            if (duplicate) {
                alert(`Exam type "${normalized}" already exists.`);
                return false;
            }
            updates.name = normalized;
        }

        types[index] = { ...types[index], ...updates };
        save(types);
        return true;
    }

    // Delete exam type
    function deleteType(id) {
        if (!confirm('Delete this exam type?\n\nExisting results using this type will NOT be deleted, but this type will no longer be available for new exams.')) {
            return false;
        }

        const types = getAll().filter(t => t.id !== id);
        save(types);
        return true;
    }

    // Toggle active status
    function toggleActive(id) {
        const types = getAll();
        const type = types.find(t => t.id === id);

        if (type) {
            type.active = !type.active;
            save(types);
            return true;
        }
        return false;
    }

    // UI Functions
    function toggleAddForm() {
        const form = document.getElementById('exam-type-add-form');
        const input = document.getElementById('exam-type-name-input');

        if (form.style.display === 'none') {
            form.style.display = 'block';
            input.value = '';
            input.focus();
            editingId = null;
        } else {
            form.style.display = 'none';
        }
    }

    function saveExamType() {
        const input = document.getElementById('exam-type-name-input');
        const name = input.value.trim();

        if (!name) {
            alert('Please enter an exam type name.');
            return;
        }

        let success;
        if (editingId) {
            success = update(editingId, { name });
        } else {
            success = create(name);
        }

        if (success) {
            toggleAddForm();
            renderTable();
            updateExamTypeSelectors();
        }
    }

    function startEdit(id) {
        const type = getAll().find(t => t.id === id);
        if (type) {
            editingId = id;
            const form = document.getElementById('exam-type-add-form');
            const input = document.getElementById('exam-type-name-input');

            form.style.display = 'block';
            input.value = type.name;
            input.focus();
        }
    }

    function renderTable() {
        const tbody = document.getElementById('exam-types-table-body');
        if (!tbody) return;

        const types = getAll();

        if (types.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #666; padding: 30px;">
                        No exam types created yet. Click "Add Type" to create one.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = types.map(type => {
            const statusBadge = type.active
                ? '<span class="status-badge approved">Active</span>'
                : '<span class="status-badge pending">Inactive</span>';

            const date = new Date(type.createdAt).toLocaleDateString();

            return `
                <tr>
                    <td><b>${type.name}</b></td>
                    <td>${statusBadge}</td>
                    <td style="color: #888; font-size: 0.85rem;">${date}</td>
                    <td style="text-align: right;">
                        <div style="display: inline-flex; gap: 8px;">
                            <button class="nav-item" style="padding: 6px 12px; border: none; font-size: 0.85rem;" 
                                onclick="ExamTypeManager.startEdit('${type.id}')" title="Edit">
                                <i class="ph-bold ph-pencil-simple"></i>
                            </button>
                            <button class="nav-item ${type.active ? '' : 'active'}" 
                                style="padding: 6px 12px; border: none; font-size: 0.85rem;" 
                                onclick="ExamTypeManager.toggleActive('${type.id}')" 
                                title="${type.active ? 'Disable' : 'Enable'}">
                                <i class="ph-bold ph-${type.active ? 'eye-slash' : 'eye'}"></i>
                            </button>
                            <button class="nav-item" style="padding: 6px 12px; border: none; font-size: 0.85rem; color: #ff4444;" 
                                onclick="ExamTypeManager.deleteType('${type.id}')" title="Delete">
                                <i class="ph-bold ph-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function updateExamTypeSelectors() {
        // Update both the filter and the add exam form's type dropdown
        const addExamTypeSelect = document.getElementById('exam-type-select');
        const filterTypeSelect = document.getElementById('exam-filter-type');
        const syncExamTypeSelect = document.getElementById('results-exam-type');

        const activeTypes = getActive();

        const optionsHtml = (prefix) => `<option value="">${prefix}</option>` +
            activeTypes.map(t => {
                const id = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                return `<option value="${id}">${t.name}</option>`;
            }).join('');

        if (addExamTypeSelect) addExamTypeSelect.innerHTML = optionsHtml('-- Select Type --');
        if (filterTypeSelect) filterTypeSelect.innerHTML = optionsHtml('All Types');
        if (syncExamTypeSelect) syncExamTypeSelect.innerHTML = optionsHtml('-- Select Type --');
    }

    function init() {
        // If empty, add some defaults
        if (getAll().length === 0) {
            create('Half Yearly');
            create('Quarterly');
            create('Annual');
            create('Onam Exam');
        }
        renderTable();
        updateExamTypeSelectors();
    }

    return {
        init,
        getAll,
        getActive,
        create,
        update,
        deleteType,
        toggleActive,
        toggleAddForm,
        saveExamType,
        startEdit,
        renderTable,
        updateExamTypeSelectors,
        // Compatibility Aliases for dashboard.html
        updateExamTypeDropdown: updateExamTypeSelectors,
        handleDelete: deleteType,
        handleToggleActive: toggleActive
    };
})();

// Initialize on load
window.ExamTypeManager = ExamTypeManager;
