/**
 * ExamTypeManager.js - Production Ready
 * Manages exam types (Half Yearly, Annual, etc.) per school.
 */
const ExamTypeManager = (function () {
    'use strict';

    const STORAGE_KEY = 'exam_types';

    function init() {
        console.log('📝 ExamTypeManager: Initializing...');
        renderTable();
        refreshDropdowns();

        // Listen for School Changes
        window.addEventListener('schoolChanged', () => {
            console.log('📝 ExamTypeManager: School changed, refreshing...');
            renderTable();
            refreshDropdowns();
        });

        // Listen for storage updates
        window.addEventListener(`storage-update-${STORAGE_KEY}`, () => {
            renderTable();
            refreshDropdowns();
        });
    }

    function getAll() {
        return StorageManager.get(STORAGE_KEY, []);
    }

    function saveAll(types) {
        StorageManager.set(STORAGE_KEY, types);
        window.dispatchEvent(new CustomEvent('examTypeChanged', { detail: types }));
        refreshDropdowns();
    }

    function create(name) {
        const types = getAll();
        const normalized = name.trim();

        if (!normalized) {
            alert("Exam type name is required (e.g. Annual).");
            return false;
        }

        if (types.find(t => t.name.toLowerCase() === normalized.toLowerCase())) {
            alert(`Type "${normalized}" already exists.`);
            return false;
        }

        const newType = {
            id: 'et_' + Date.now(),
            name: normalized,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        types.push(newType);
        saveAll(types);
        renderTable();
        return true;
    }

    function deleteType(id) {
        if (!confirm("Are you sure? This will remove this exam type from all future selectors.")) return;
        const types = getAll();
        const updated = types.filter(t => t.id !== id);
        saveAll(updated);
        renderTable();
    }

    function toggleActive(id) {
        const types = getAll();
        const type = types.find(t => t.id === id);
        if (type) {
            type.isActive = !type.isActive;
            saveAll(types);
            renderTable();
        }
    }

    /**
     * UI Rendering
     */
    function renderTable() {
        const tbody = document.getElementById('exam-types-table-body');
        if (!tbody) return;

        const types = getAll();
        if (types.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#666;">No exam types found.</td></tr>';
            return;
        }

        tbody.innerHTML = types.map(t => `
            <tr>
                <td><b style="color:#fff;">${t.name}</b></td>
                <td><span class="status-badge ${t.isActive ? 'approved' : 'pending'}">${t.isActive ? 'Active' : 'Disabled'}</span></td>
                <td style="text-align:right;">
                    <div style="display:flex; gap:5px; justify-content:flex-end;">
                        <button class="btn btn-mini btn-secondary" onclick="ExamTypeManager.toggleActive('${t.id}')"><i class="ph-bold ph-eye${t.isActive ? '-slash' : ''}"></i></button>
                        <button class="btn btn-mini btn-danger" onclick="ExamTypeManager.deleteType('${t.id}')"><i class="ph-bold ph-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function refreshDropdowns() {
        const typeSelects = document.querySelectorAll('#exam-type-select');
        const activeTypes = getAll().filter(t => t.isActive);

        const html = `<option value="">-- Select Type --</option>` +
            activeTypes.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

        typeSelects.forEach(select => {
            select.innerHTML = html;
        });
        console.log('📝 ExamTypeManager: Dropdowns refreshed.');
    }

    function saveExamType() {
        const input = document.getElementById('exam-type-name-input');
        if (create(input.value)) {
            input.value = '';
        }
    }

    function toggleAddForm() {
        const form = document.getElementById('exam-type-add-form');
        if (form) {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }
    }

    return {
        init,
        getAll,
        getActive: () => getAll().filter(t => t.isActive),
        create,
        deleteType,
        toggleActive,
        saveExamType,
        toggleAddForm,
        refresh: () => { renderTable(); refreshDropdowns(); }
    };
})();

window.ExamTypeManager = ExamTypeManager;
document.addEventListener('DOMContentLoaded', () => ExamTypeManager.init());
