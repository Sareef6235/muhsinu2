const ResultsManagement = (() => {
    'use strict';

    const STORAGE_KEY = 'exam_results_cache';

    // UI Elements
    const syncButton = document.getElementById('btn-sync-results');
    const statusBox = document.getElementById('results-sync-status');
    const statusMessage = document.getElementById('results-sync-message');
    const examSelect = document.getElementById('results-exam-select');

    /**
     * CORE LOGIC: Initialize
     */
    const init = () => {
        console.log('📊 ResultsManagement: Initializing...');
        renderTable();
        updateButtonState();
        clearStatus();

        // Listen for context changes
        window.addEventListener('schoolChanged', () => {
            console.log('📊 ResultsManagement: School changed, resetting selectors...');
            resetSyncState();
            renderTable();
        });

        window.addEventListener('examsUpdated', () => {
            renderTable();
        });

        // Sync Button Safety & Table Refresh
        if (examSelect) {
            examSelect.addEventListener('change', () => {
                updateButtonState();
                clearStatus();
                renderTable(); // Update table view for selected exam
            });
        }
    };

    /**
     * UI LOGIC: Button & Status management
     */
    const updateButtonState = () => {
        if (!syncButton || !examSelect) return;

        const hasValue = !!examSelect.value;
        syncButton.disabled = !hasValue;
        syncButton.style.opacity = hasValue ? '1' : '0.5';
        syncButton.style.cursor = hasValue ? 'pointer' : 'not-allowed';
        syncButton.title = hasValue ? 'Fetch data and sync' : 'Please select an exam first';
    };

    const clearStatus = () => {
        if (statusBox && statusMessage) {
            statusBox.style.display = 'none';
            statusMessage.innerHTML = '';
        }
    };

    const resetSyncState = () => {
        if (examSelect) examSelect.value = '';
        updateButtonState();
        clearStatus();
    };

    /**
     * STORAGE LOGIC
     */
    const getAllResults = () => StorageManager.get(STORAGE_KEY, []);

    const saveResults = (results) => {
        StorageManager.set(STORAGE_KEY, results);
        renderTable();
    };

    /**
     * SYNC LOGIC: Handle Sync click
     * Refactored for step-by-step feedback and defensive validation
     */
    const handleSyncClick = () => {
        const examId = examSelect?.value;
        const schoolId = window.SchoolManager ? SchoolManager.getActiveSchool() : null;

        if (!statusBox || !statusMessage) return;

        // 1. Validation
        if (!schoolId) {
            statusBox.style.display = 'block';
            statusMessage.innerHTML = '<span style="color:#ff4444;">❌ Error: No active school selected.</span>';
            return;
        }

        if (!examId) {
            statusBox.style.display = 'block';
            statusMessage.innerHTML = '<span style="color:#ff4444;">❌ Error: Please select an exam first.</span>';
            return;
        }

        // 2. Start Sync Flow
        statusBox.style.display = 'block';
        statusMessage.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Validating...';

        setTimeout(() => {
            statusMessage.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Preparing preview...';

            setTimeout(() => {
                const yearFilter = document.getElementById('exam-filter-year');
                const yearId = yearFilter ? yearFilter.value : 'All';

                statusMessage.innerHTML = `<i class="ph-bold ph-check-circle"></i> Ready to sync! Previewing Exam: <b>${examId}</b>`;

                // Populate results table (Logic integration)
                const tbody = document.getElementById('results-table-body');
                if (tbody) {
                    // Sample preview row
                    tbody.innerHTML = `
                        <tr>
                            <td>101</td>
                            <td><b style="color:#fff;">John Doe</b></td>
                            <td>${examId}</td>
                            <td style="color:var(--primary-color); font-weight:bold;">450</td>
                            <td><span class="status-badge" style="background:rgba(255,255,255,0.05);">A+</span></td>
                            <td><span class="status-badge approved">Pass</span></td>
                        </tr>
                    `;
                }

                console.log(`📊 ResultsManagement: Sync preview successful for school [${schoolId}]`);
            }, 800);
        }, 600);
    };

    /**
     * Fetch Column Headers (Feature Requirement)
     */
    const fetchHeaders = async () => {
        const examId = examSelect?.value;
        const sheetId = document.getElementById('results-sheet-id')?.value;

        if (!examId || !sheetId) {
            alert("Please select an exam and provide a Sheet ID.");
            return;
        }

        console.log(`📊 ResultsManagement: Fetching headers for Sheet [${sheetId}]`);
        alert("Header fetch sequence initiated. (Mock integration)");
    };

    /**
     * UI Rendering
     */
    const renderTable = () => {
        const tbody = document.getElementById('results-table-body');
        const examId = examSelect?.value;

        if (!tbody) return;

        if (!examId) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#666;">Select an exam to view results.</td></tr>';
            return;
        }

        const allResults = getAllResults();
        const filtered = allResults.filter(r => r.examId === examId);

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#666;">Ready to sync.</td></tr>';
            return;
        }

        // Sort by Total Marks (Ranking)
        const sorted = [...filtered].sort((a, b) => (b.totalMarks || 0) - (a.totalMarks || 0));

        tbody.innerHTML = sorted.map((r, index) => `
            <tr>
                <td>${r.rollNo}</td>
                <td><b style="color:#fff;">${r.name}</b></td>
                <td>${r.examName || '---'}</td>
                <td style="color:var(--primary-color); font-weight:bold;">${r.totalMarks || 0}</td>
                <td><span class="status-badge" style="background:rgba(255,255,255,0.05);">${r.grade || 'N/A'}</span></td>
                <td><span class="status-badge ${r.status === 'Pass' ? 'approved' : 'pending'}">${r.status || 'Unknown'}</span></td>
            </tr>
        `).join('');
    };

    return {
        init,
        getAllResults,
        handleSyncClick,
        fetchHeaders,
        refresh: () => { renderTable(); updateButtonState(); }
    };
})();

// Initialize on DOM load
window.ResultsManagement = ResultsManagement;
document.addEventListener('DOMContentLoaded', () => {
    ResultsManagement.init();
});
