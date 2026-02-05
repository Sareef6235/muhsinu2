/**
 * AcademicYearManager.js - Production Ready
 * Manages academic years (2024-25, etc.) with multi-school isolation.
 */
const AcademicYearManager = (function () {
    'use strict';

    const STORAGE_KEY = 'academic_years';

    /**
     * Data Model: { id, name, active, current, schoolId, createdAt }
     */

    function init() {
        console.log('📅 AcademicYearManager: Initializing...');
        renderTable();
        refreshDropdowns();

        // Listen for School Changes
        window.addEventListener('schoolChanged', () => {
            console.log('📅 AcademicYearManager: School changed, refreshing...');
            renderTable();
            refreshDropdowns();
        });

        // Backward compatibility listener
        window.addEventListener('school-changed', () => {
            renderTable();
            refreshDropdowns();
        });
    }

    function getAll() {
        // StorageManager.get automatically handles the school-prefixed keys now
        return StorageManager.get(STORAGE_KEY, []);
    }

    function saveAll(years) {
        StorageManager.set(STORAGE_KEY, years);
        // Dispatch Custom Event
        window.dispatchEvent(new CustomEvent('yearChanged', { detail: years }));
        refreshDropdowns();
    }

    function create(name) {
        const years = getAll();
        const normalized = name.trim();

        if (!normalized) return alert("Academic year name is required.");

        // Prevent duplicate names in current school context
        if (years.find(y => y.name.toLowerCase() === normalized.toLowerCase())) {
            alert(`Year "${normalized}" already exists for this school.`);
            return false;
        }

        const newYear = {
            id: 'yr_' + Date.now(),
            name: normalized,
            active: true,
            current: years.length === 0, // Auto-set first as current
            createdAt: new Date().toISOString()
        };

        years.push(newYear);
        saveAll(years);
        renderTable();
        return true;
    }

    function toggleActive(id) {
        const years = getAll();
        const year = years.find(y => y.id === id);
        if (year) {
            year.active = !year.active;
            saveAll(years);
            renderTable();
        }
    }

    function deleteYear(id) {
        const years = getAll();
        const year = years.find(y => y.id === id);

        if (!year) return;
        if (year.current) {
            alert("Cannot delete the current active year. Set another year as 'current' first.");
            return;
        }

        if (!confirm(`Delete academic year "${year.name}"?`)) return;

        const updated = years.filter(y => y.id !== id);
        saveAll(updated);
        renderTable();
    }

    function setCurrent(id) {
        const years = getAll();
        years.forEach(y => y.current = (y.id === id));
        saveAll(years);
        renderTable();
    }

    /**
     * UI Rendering
     */
    function renderTable() {
        const tbody = document.getElementById('academic-years-table-body');
        if (!tbody) return;

        const years = getAll();
        if (years.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#666;">No years found.</td></tr>';
            return;
        }

        tbody.innerHTML = years.map(y => `
            <tr>
                <td><b style="color:#fff;">${y.name}</b> ${y.current ? '<span class="status-badge approved" style="font-size:0.6rem; padding:1px 5px;">CURRENT</span>' : ''}</td>
                <td><span class="status-badge ${y.active ? 'approved' : 'pending'}">${y.active ? 'Active' : 'Disabled'}</span></td>
                <td style="text-align:right;">
                    <div style="display:flex; gap:5px; justify-content:flex-end;">
                        ${!y.current ? `<button class="btn btn-mini btn-subtle" onclick="AcademicYearManager.setCurrent('${y.id}')" title="Set as Current"><i class="ph-bold ph-check"></i></button>` : ''}
                        <button class="btn btn-mini btn-secondary" onclick="AcademicYearManager.toggleActive('${y.id}')"><i class="ph-bold ph-eye${y.active ? '-slash' : ''}"></i></button>
                        <button class="btn btn-mini btn-danger" onclick="AcademicYearManager.deleteYear('${y.id}')"><i class="ph-bold ph-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function refreshDropdowns() {
        // Auto-update all requested selectors
        const yearSelect = document.getElementById('exam-academic-year');
        const filterSelect = document.getElementById('exam-filter-year');

        const activeYears = getAll().filter(y => y.active);
        const optionsHtml = activeYears.map(y => `<option value="${y.id}" ${y.current ? 'selected' : ''}>${y.name}</option>`).join('');

        if (yearSelect) yearSelect.innerHTML = `<option value="">-- Select Year --</option>` + optionsHtml;
        if (filterSelect) filterSelect.innerHTML = `<option value="">All Years</option>` + optionsHtml;
    }

    function saveAcademicYear() {
        const input = document.getElementById('academic-year-input');
        if (create(input.value)) {
            input.value = '';
        }
    }

    return {
        init,
        getAll,
        getActive: () => getAll().filter(y => y.active),
        getCurrent: () => getAll().find(y => y.current),
        create,
        deleteYear,
        toggleActive,
        setCurrent,
        saveAcademicYear,
        refresh: () => { renderTable(); refreshDropdowns(); }
    };
})();

// Expose to window
window.AcademicYearManager = AcademicYearManager;
document.addEventListener('DOMContentLoaded', () => AcademicYearManager.init());
