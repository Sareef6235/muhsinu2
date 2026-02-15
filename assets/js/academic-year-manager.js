/**
 * AcademicYearManager.js - Production Ready
 * Manages academic years (2024-25, etc.) with multi-school isolation.
 */
const AcademicYearManager = (function () {
    'use strict';

    const CONFIG_KEY = 'schoolConfig';

    function _getSchoolId() {
        return localStorage.getItem('activeSchoolId') || 'default';
    }

    function _getConfig() {
        let config = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
        const schoolId = _getSchoolId();
        if (!config[schoolId]) config[schoolId] = { academicYears: [], examTypes: [] };
        return config;
    }

    function _saveConfig(config) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    }

    function init() {
        console.log('📅 AcademicYearManager: Initializing...');
        renderTable();
        refreshDropdowns();

        window.addEventListener('schoolChanged', () => {
            console.log('📅 AcademicYearManager: School changed, refreshing...');
            renderTable();
            refreshDropdowns();
        });
    }

    function getAll() {
        const schoolId = _getSchoolId();
        const config = _getConfig();
        return config[schoolId].academicYears || [];
    }

    function saveAll(years) {
        const config = _getConfig();
        const schoolId = _getSchoolId();
        config[schoolId].academicYears = years;
        _saveConfig(config);

        window.dispatchEvent(new CustomEvent('yearChanged', { detail: years }));
        refreshDropdowns();
    }

    function create(yearLabel) {
        const years = getAll();
        const normalized = yearLabel.trim();

        if (!normalized) {
            alert("Academic year label is required (e.g. 2026-27).");
            return false;
        }

        if (years.find(y => y.yearLabel.toLowerCase() === normalized.toLowerCase())) {
            alert(`Year "${normalized}" already exists.`);
            return false;
        }

        const newYear = {
            id: 'yr_' + Date.now(),
            yearLabel: normalized,
            isActive: true,
            isCurrent: years.length === 0,
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
            year.isActive = !year.isActive;
            saveAll(years);
            renderTable();
        }
    }

    function deleteYear(id) {
        const years = getAll();
        const year = years.find(y => y.id === id);

        if (!year) return;
        if (year.isCurrent) {
            alert("Cannot delete the current active year. Set another year as 'current' first.");
            return;
        }

        if (!confirm(`Delete academic year "${year.yearLabel}"?`)) return;

        const updated = years.filter(y => y.id !== id);
        saveAll(updated);
        renderTable();
    }

    function setCurrent(id) {
        const years = getAll();
        years.forEach(y => y.isCurrent = (y.id === id));
        saveAll(years);
        renderTable();
    }

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
                <td><b style="color:#fff;">${y.yearLabel}</b> ${y.isCurrent ? '<span class="status-badge approved" style="font-size:0.6rem; padding:1px 5px;">CURRENT</span>' : ''}</td>
                <td><span class="status-badge ${y.isActive ? 'approved' : 'pending'}">${y.isActive ? 'Active' : 'Disabled'}</span></td>
                <td style="text-align:right;">
                    <div style="display:flex; gap:5px; justify-content:flex-end;">
                        ${!y.isCurrent ? `<button class="btn btn-mini btn-subtle" onclick="AcademicYearManager.setCurrent('${y.id}')" title="Set as Current"><i class="ph-bold ph-check"></i></button>` : ''}
                        <button class="btn btn-mini btn-secondary" onclick="AcademicYearManager.toggleActive('${y.id}')"><i class="ph-bold ph-eye${y.isActive ? '-slash' : ''}"></i></button>
                        <button class="btn btn-mini btn-danger" onclick="AcademicYearManager.deleteYear('${y.id}')"><i class="ph-bold ph-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function refreshDropdowns() {
        const yearSelect = document.getElementById('exam-academic-year');
        const filterSelect = document.getElementById('exam-filter-year');

        const activeYears = getAll().filter(y => y.isActive);
        const optionsHtml = activeYears.map(y => `<option value="${y.id}" ${y.isCurrent ? 'selected' : ''}>${y.yearLabel}</option>`).join('');

        if (yearSelect) yearSelect.innerHTML = `<option value="">-- Select Year --</option>` + optionsHtml;
        if (filterSelect) filterSelect.innerHTML = `<option value="">All Years</option>` + optionsHtml;
        console.log('📅 AcademicYearManager: Dropdowns refreshed.');
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
        getActive: () => getAll().filter(y => y.isActive),
        getCurrent: () => getAll().find(y => y.isCurrent),
        create,
        deleteYear,
        toggleActive,
        setCurrent,
        saveAcademicYear,
        refresh: () => { renderTable(); refreshDropdowns(); }
    };
})();

window.AcademicYearManager = AcademicYearManager;
document.addEventListener('DOMContentLoaded', () => AcademicYearManager.init());
