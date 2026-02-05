// ====================================================================
// ACADEMIC YEAR MANAGER MODULE
// ====================================================================
// Manages academic years (2024-25, 2025-26, etc.)
// Safe for production - includes validation and backward compatibility
// ====================================================================

const AcademicYearManager = (function () {
    'use strict';

    const STORAGE_KEY = 'academic_years';
    let editingId = null;

    // Get all academic years
    function getAll() {
        return StorageManager.get(STORAGE_KEY, []);
    }

    // Get only active years
    function getActive() {
        return getAll().filter(y => y.active);
    }

    // Get current academic year
    function getCurrent() {
        const years = getAll();
        const current = years.find(y => y.current);
        return current || years[0] || null;
    }

    // Save to localStorage
    function save(exams) {
        StorageManager.set(STORAGE_KEY, exams);
        window.dispatchEvent(new CustomEvent('exams-updated'));
    }

    // Create new academic year
    function create(name) {
        const years = getAll();

        // Normalize name
        const normalized = name.trim();
        if (!normalized) {
            alert('Academic year name cannot be empty');
            return false;
        }

        // Check duplicate name
        if (years.find(y => y.name.toLowerCase() === normalized.toLowerCase())) {
            alert(`Academic year "${normalized}" already exists`);
            return false;
        }

        const newYear = {
            id: Date.now().toString(), // User requirement: timestamp ID
            name: normalized,          // User requirement: 'name' property
            active: true,
            current: years.length === 0,
            createdAt: new Date().toISOString()
        };

        years.push(newYear);
        save(years);
        return true;
    }

    // Update academic year
    function update(id, updates) {
        const years = getAll();
        const index = years.findIndex(y => y.id === id);

        if (index === -1) {
            alert('Academic year not found');
            return false;
        }

        // If updating name, check duplicates
        if (updates.name) {
            const dup = years.find(y => y.id !== id && y.name.toLowerCase() === updates.name.toLowerCase());
            if (dup) {
                alert('Academic Year name already exists');
                return false;
            }
        }

        years[index] = { ...years[index], ...updates };
        save(years);
        return true;
    }

    // Set current academic year
    function setCurrent(id) {
        const years = getAll();
        years.forEach(y => y.current = (y.id === id));
        save(years);
        updateCurrentYearDisplay();
        return true;
    }

    // Toggle active status
    function toggleActive(id) {
        const years = getAll();
        const year = years.find(y => y.id === id);

        if (year) {
            year.active = !year.active;
            save(years);
            return true;
        }
        return false;
    }

    // Delete academic year
    function deleteYear(id) {
        if (!confirm('Delete this academic year?\n\nNote: Associated exams will remain but won\'t be linked.')) {
            return false;
        }

        const years = getAll().filter(y => y.id !== id);
        save(years);
        return true;
    }

    // UI Functions
    function toggleAddForm() {
        const form = document.getElementById('academic-year-add-form');
        const input = document.getElementById('academic-year-input');

        if (form.style.display === 'none') {
            form.style.display = 'block';
            input.value = '';
            input.focus();
            editingId = null;
        } else {
            form.style.display = 'none';
            editingId = null;
        }
    }

    function saveAcademicYear() {
        const btn = event?.target || document.querySelector('button[onclick="AcademicYearManager.saveAcademicYear()"]');
        const input = document.getElementById('academic-year-input');
        const name = input.value.trim();

        if (!name) {
            alert('Please enter an academic year (e.g., 2026-27)');
            return;
        }

        if (window.uiLock) window.uiLock(btn, true);

        try {
            let success;
            if (editingId) {
                success = update(editingId, { name });
            } else {
                success = create(name);
            }

            if (success) {
                toggleAddForm();
                renderTable();
                updateCurrentYearSelector();
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (window.uiLock) window.uiLock(btn, false);
        }
    }

    function startEdit(id) {
        const years = getAll();
        const year = years.find(y => y.id === id);

        if (year) {
            editingId = id;
            const form = document.getElementById('academic-year-add-form');
            const input = document.getElementById('academic-year-input');

            form.style.display = 'block';
            input.value = year.name;
            input.focus();
        }
    }

    function handleDelete(id) {
        if (deleteYear(id)) {
            renderTable();
            updateCurrentYearSelector();
        }
    }

    function handleToggleActive(id) {
        if (toggleActive(id)) {
            renderTable();
            updateCurrentYearSelector();
        }
    }

    function handleSetCurrent(id) {
        if (handleSetCurrent.processing) return; // Prevent double clicks
        handleSetCurrent.processing = true;

        if (setCurrent(id)) {
            renderTable();
        }

        setTimeout(() => handleSetCurrent.processing = false, 500);
    }

    function renderTable() {
        const tbody = document.getElementById('academic-years-table-body');
        if (!tbody) return; // Safety check

        const years = getAll();

        if (years.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #666; padding: 30px;">
                        No academic years created. Click "Add Year" to create one.
                    </td>
                </tr>
            `;
            return;
        }

        // Sort: Current first, then by name (descending roughly matches years usually)
        years.sort((a, b) => {
            if (a.current) return -1;
            if (b.current) return 1;
            return b.name.localeCompare(a.name); // Newest years first generally
        });

        tbody.innerHTML = years.map(year => {
            const statusBadge = year.active
                ? '<span class="status-badge approved">Active</span>'
                : '<span class="status-badge pending">Inactive</span>';

            const currentBadge = year.current
                ? '<span class="status-badge" style="background: rgba(188, 19, 254, 0.2); color: #bc13fe;">Current</span>'
                : '';

            const date = new Date(year.createdAt);
            const dateStr = !isNaN(date) ? date.toLocaleDateString() : 'N/A';

            return `
                <tr>
                    <td><b>${year.name}</b> ${currentBadge}</td>
                    <td>${statusBadge}</td>
                    <td style="color: #888; font-size: 0.85rem;">${dateStr}</td>
                    <td style="text-align: right;">
                        <div style="display: inline-flex; gap: 8px;">
                            ${!year.current ? `
                                <button class="btn btn-mini btn-subtle"
                                    onclick="AcademicYearManager.handleSetCurrent('${year.id}')"
                                    title="Set as Current">
                                    <i class="ph-bold ph-check-circle"></i>
                                </button>
                            ` : ''}
                            <button class="btn btn-mini btn-secondary"
                                onclick="AcademicYearManager.startEdit('${year.id}')"
                                title="Edit">
                                <i class="ph-bold ph-pencil-simple"></i>
                            </button>
                            <button class="btn btn-mini ${year.active ? 'btn-secondary' : 'btn-primary'}" 
                                onclick="AcademicYearManager.handleToggleActive('${year.id}')"
                                title="${year.active ? 'Deactivate' : 'Activate'}">
                                <i class="ph-bold ph-${year.active ? 'eye-slash' : 'eye'}"></i>
                            </button>
                            <button class="btn btn-mini btn-danger"
                                onclick="AcademicYearManager.handleDelete('${year.id}')"
                                title="Delete">
                                <i class="ph-bold ph-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function updateCurrentYearSelector() {
        const select = document.getElementById('current-academic-year-select');
        if (!select) return;

        const years = getActive();
        const current = getCurrent();

        select.innerHTML = years.map(y =>
            `<option value="${y.id}" ${y.id === current?.id ? 'selected' : ''}>${y.name}</option>`
        ).join('');
    }

    function updateCurrentYearDisplay() {
        const current = getCurrent();
        const displays = document.querySelectorAll('.current-academic-year-display');
        displays.forEach(el => {
            el.textContent = current ? current.name : 'Not Set';
        });
    }

    function init() {
        if (typeof StorageManager === 'undefined') {
            console.error('AcademicYearManager: StorageManager not found. Logic will fail.');
            return;
        }

        const years = getAll();

        // Create default current year if none exist (only if legacy/empty)
        if (years.length === 0) {
            const now = new Date();
            const month = now.getMonth();
            const year = now.getFullYear();
            const startYear = month >= 3 ? year : year - 1;
            const endYear = startYear + 1;
            const defaultName = `${startYear}-${endYear.toString().slice(2)}`;

            // We use create() here to ensure proper ID generation
            create(defaultName);
        }

        renderTable();
        updateCurrentYearSelector();
        updateCurrentYearDisplay();
    }

    // Public API
    return {
        init,
        getAll,
        getActive,
        getCurrent,
        create,
        update,
        setCurrent,
        toggleActive,
        deleteYear,
        toggleAddForm,
        saveAcademicYear,
        startEdit,
        handleDelete,
        handleToggleActive,
        handleSetCurrent,
        renderTable,
        updateCurrentYearSelector
    };
})();

// Expose globally
window.AcademicYearManager = AcademicYearManager;
