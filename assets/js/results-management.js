const ResultsManagement = (() => {
    'use strict';

    const STORAGE_KEY = 'results'; // New unified key: results[schoolId][examId]

    // UI Elements
    const syncButton = document.getElementById('btn-sync-results');
    const statusBox = document.getElementById('results-sync-status');
    const statusMessage = document.getElementById('results-sync-message');
    const examSelect = document.getElementById('results-exam-select');
    const sheetIdInput = document.getElementById('results-sheet-id');
    const publishToggle = document.getElementById('results-publish-toggle');

    /**
     * CORE LOGIC: Initialize
     */
    const init = () => {
        console.log('📊 ResultsManagement: Initializing...');
        migrateOldData(); // Backward compatibility
        renderTable();
        updateButtonState();
        updatePublishToggle();
        clearStatus();

        // Listen for context changes
        window.addEventListener('schoolChanged', () => {
            console.log('📊 ResultsManagement: School changed, resetting...');
            resetSyncState();
            renderTable();
            updatePublishToggle();
        });

        window.addEventListener('examsUpdated', () => {
            renderTable();
        });

        // Sync Button Safety & Table Refresh
        if (examSelect) {
            examSelect.addEventListener('change', () => {
                updateButtonState();
                updatePublishToggle();
                clearStatus();
                renderTable();
            });
        }

        // Sheet ID input validation
        if (sheetIdInput) {
            sheetIdInput.addEventListener('input', updateButtonState);
        }
    };

    /**
     * DATA MIGRATION: Convert old flat cache to new nested structure
     */
    const migrateOldData = () => {
        const oldKey = 'exam_results_cache';
        const oldData = StorageManager.get(oldKey, null);

        if (oldData && Array.isArray(oldData) && oldData.length > 0) {
            console.log('📊 ResultsManagement: Migrating old data...');
            const schoolId = window.SchoolManager ? SchoolManager.getActiveSchool() : 'default';
            const results = getAllResults();

            // Group old data by examId
            const grouped = {};
            oldData.forEach(result => {
                const examId = result.examId || 'unknown';
                if (!grouped[examId]) {
                    grouped[examId] = [];
                }
                grouped[examId].push(result);
            });

            // Save to new structure
            Object.keys(grouped).forEach(examId => {
                if (!results[schoolId]) results[schoolId] = {};
                if (!results[schoolId][examId]) {
                    results[schoolId][examId] = {
                        published: false, // Default to unpublished
                        syncedAt: new Date().toISOString(),
                        sheetId: '',
                        data: grouped[examId]
                    };
                }
            });

            saveAllResults(results);
            StorageManager.remove(oldKey); // Clean up old data
            console.log('📊 ResultsManagement: Migration complete!');
        }
    };

    /**
     * STORAGE LOGIC
     * Using StorageManager which handles school-prefix isolation automatically.
     */
    const getAllResults = () => StorageManager.get(STORAGE_KEY, {});

    const saveAllResults = (results) => {
        StorageManager.set(STORAGE_KEY, results);

        // Update exam list for student portal
        updateExamList();
    };

    const getExamResults = (examId) => {
        const results = getAllResults();
        return results[examId] || null;
    };

    const saveExamResults = (examId, data, sheetId, published = false) => {
        const results = getAllResults();

        results[examId] = {
            published,
            syncedAt: new Date().toISOString(),
            sheetId: sheetId || '',
            data
        };

        saveAllResults(results);
        renderTable();
        updatePublishToggle();
    };

    /**
     * Update exam list for student portal (ResultsCMS compatibility)
     */
    const updateExamList = () => {
        const results = getAllResults();
        const exams = window.ExamManager ? ExamManager.getAll() : [];
        const years = window.AcademicYearManager ? AcademicYearManager.getAll() : [];
        const types = window.ExamTypeManager ? ExamTypeManager.getAll() : [];

        const examList = Object.keys(results)
            .filter(examId => results[examId].published) // Only published
            .map(examId => {
                const examMeta = exams.find(e => e.id === examId);
                if (!examMeta) return null;

                const yearName = years.find(y => y.id === examMeta.yearId)?.yearLabel || '';
                const typeName = types.find(t => t.id === examMeta.typeId)?.name || '';

                return {
                    id: examId,
                    displayName: `${examMeta.name} (${typeName} - ${yearName})`,
                    lastSync: results[examId].syncedAt
                };
            })
            .filter(Boolean);

        // Save for ResultsCMS
        StorageManager.set('exam_results_exams', examList);
    };

    /**
     * UI LOGIC: Button & Status management
     */
    const updateButtonState = () => {
        if (!syncButton || !examSelect) return;

        const hasExam = !!examSelect.value;
        const hasSheet = sheetIdInput && sheetIdInput.value.trim().length > 0;
        const canSync = hasExam && hasSheet;

        // Visual feedback for the button
        syncButton.disabled = !canSync;
        syncButton.style.opacity = canSync ? '1' : '0.5';
        syncButton.style.cursor = canSync ? 'pointer' : 'not-allowed';

        // Also update fetch headers button if it exists
        const fetchBtn = document.querySelector('button[onclick*="fetchHeaders"]');
        if (fetchBtn) {
            fetchBtn.disabled = !canSync;
            fetchBtn.style.opacity = canSync ? '1' : '0.5';
        }

        if (!canSync) {
            syncButton.title = "Select an exam and provide a valid Google Sheet ID to enable sync.";
        } else {
            syncButton.title = "Click to preview and sync results.";
        }
    };

    const clearStatus = () => {
        if (statusBox && statusMessage) {
            statusBox.style.display = 'none';
            statusMessage.innerHTML = '';
        }
    };

    const resetSyncState = () => {
        if (examSelect) examSelect.value = '';
        if (sheetIdInput) sheetIdInput.value = '';

        // Hide mapping UI on reset
        const mappingUI = document.getElementById('column-mapping-ui');
        if (mappingUI) mappingUI.style.display = 'none';

        updateButtonState();
        clearStatus();
    };

    const showStatus = (html, type = 'info') => {
        if (!statusBox || !statusMessage) return;
        statusBox.style.display = 'block';
        statusMessage.innerHTML = html;
    };

    /**
     * PUBLISH/UNPUBLISH TOGGLE
     */
    const updatePublishToggle = () => {
        if (!publishToggle || !examSelect) return;

        const examId = examSelect.value;
        const examData = getExamResults(examId);

        if (!examData || !examData.data || examData.data.length === 0) {
            publishToggle.style.display = 'none';
            return;
        }

        publishToggle.style.display = 'inline-flex';
        const isPublished = examData.published;

        publishToggle.innerHTML = isPublished
            ? '<i class="ph-bold ph-eye-slash"></i> Unpublish'
            : '<i class="ph-bold ph-eye"></i> Publish';

        publishToggle.className = isPublished
            ? 'btn btn-sm btn-danger'
            : 'btn btn-sm btn-primary';
    };

    const togglePublish = () => {
        const examId = examSelect?.value;
        if (!examId) return;

        const results = getAllResults();
        const examData = results[examId];

        if (!examData) return;

        const newState = !examData.published;
        examData.published = newState;

        results[examId] = examData;
        saveAllResults(results);

        showStatus(
            `<i class="ph-bold ph-check-circle"></i> Exam ${newState ? 'published' : 'unpublished'} successfully!`,
            'success'
        );

        updatePublishToggle();
    };

    /**
     * GOOGLE SHEET INTEGRATION
     */
    const parseCSV = (text) => {
        const lines = text.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const results = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            if (values.length < headers.length) continue;

            const row = {};
            headers.forEach((header, idx) => {
                row[header] = values[idx] || '';
            });

            results.push(row);
        }

        return results;
    };

    const transformToResultObject = (row, examId) => {
        // Extract subject columns (any column not in standard fields)
        const standardFields = ['Roll No', 'Name', 'DOB', 'Class', 'Total', 'Grade', 'Status', 'Rank'];
        const subjects = {};

        Object.keys(row).forEach(key => {
            if (!standardFields.includes(key) && row[key] && !isNaN(row[key])) {
                subjects[key] = parseInt(row[key], 10);
            }
        });

        // Calculate total if not provided
        let total = parseInt(row['Total'], 10) || 0;
        if (total === 0 && Object.keys(subjects).length > 0) {
            total = Object.values(subjects).reduce((sum, mark) => sum + mark, 0);
        }

        return {
            rollNo: row['Roll No'] || '',
            name: row['Name'] || '',
            dob: row['DOB'] || '',
            class: row['Class'] || '',
            exam: '', // Will be filled from exam metadata
            examId: examId,
            subjects: subjects,
            totalMarks: total,
            grade: row['Grade'] || calculateGrade(total),
            status: row['Status'] || (total >= 180 ? 'Pass' : 'Fail'), // Example threshold
            rank: parseInt(row['Rank'], 10) || null
        };
    };

    const calculateGrade = (total) => {
        if (total >= 450) return 'A+';
        if (total >= 400) return 'A';
        if (total >= 350) return 'B+';
        if (total >= 300) return 'B';
        if (total >= 250) return 'C';
        if (total >= 180) return 'D';
        return 'F';
    };

    /**
     * SYNC LOGIC: Handle Sync click
     */
    const handleSyncClick = async () => {
        const examId = examSelect?.value;
        const sheetId = sheetIdInput?.value?.trim();
        const schoolId = window.SchoolManager ? SchoolManager.getActiveSchool() : 'default';

        if (!schoolId) {
            showStatus('<span style="color:#ff4444;">❌ No active school selected.</span>', 'error');
            return;
        }

        if (!examId) {
            showStatus('<span style="color:#ff4444;">❌ Please select an exam session first.</span>', 'error');
            return;
        }

        // Disable button during sync
        syncButton.disabled = true;
        const originalBtnHtml = syncButton.innerHTML;
        syncButton.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Syncing...';

        try {
            // Step 1: Validating
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Validating...', 'loading');
            await sleep(500);

            if (!sheetId) {
                throw new Error('Google Sheet ID is required for syncing results.');
            }

            // Step 2: Preparing preview
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Preparing preview...', 'loading');
            await sleep(500);

            // Step 3: Fetching from Google Sheets
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Fetching from Google Sheets...', 'loading');
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

            const response = await fetch(csvUrl);
            if (!response.ok) {
                throw new Error('Failed to connect to Google Sheets. Please verify the Sheet ID and ensure the sheet is "Public" (Anyone with link can view).');
            }

            const csvText = await response.text();

            // Step 4: Parsing data
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Parsing data...', 'loading');
            await sleep(500);

            const rawData = parseCSV(csvText);
            if (!rawData || rawData.length === 0) {
                throw new Error('No data found in the spreadsheet. Please verify the sheet content.');
            }

            // Get exam metadata for display name
            const exams = window.ExamManager ? ExamManager.getAll() : [];
            const examMeta = exams.find(e => e.id === examId);
            const examName = examMeta ? examMeta.name : 'Unknown Exam';

            const results = rawData.map(row => {
                const result = transformToResultObject(row, examId);
                result.exam = examName;
                return result;
            });

            // Step 5: Ready to sync
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Ready to sync...', 'loading');
            await sleep(500);

            // Save to storage (as preview - published is false by default)
            saveExamResults(schoolId, examId, results, sheetId, false);

            // Step 6: Success
            showStatus(
                `<i class="ph-bold ph-check-circle" style="color:#00ff88;"></i> ✓ Preview generated! ${results.length} results loaded. Click "Publish" to make them visible to students.`,
                'success'
            );

            renderTable();
            updatePublishToggle();

        } catch (error) {
            console.error('Sync Error:', error);
            showStatus(
                `<span style="color:#ff4444;">❌ Error: ${error.message}</span>`,
                'error'
            );
        } finally {
            syncButton.disabled = false;
            syncButton.innerHTML = originalBtnHtml;
            updateButtonState();
        }
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

        const results = getAllResults();
        const examData = results[examId];

        if (!examData || !examData.data || examData.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#666;">No results synced yet. Enter Sheet ID and click Sync.</td></tr>';

            // Pre-fill sheet ID if available in exam metadata
            if (sheetIdInput && !sheetIdInput.value) {
                const exams = window.ExamManager ? ExamManager.getAll() : [];
                const examMeta = exams.find(e => e.id === examId);
                if (examMeta && examMeta.sheetId) {
                    sheetIdInput.value = examMeta.sheetId;
                    updateButtonState();
                }
            }
            return;
        }

        // Sort by Total Marks (Ranking)
        const sorted = [...examData.data].sort((a, b) => (b.totalMarks || 0) - (a.totalMarks || 0));

        tbody.innerHTML = sorted.map((r, index) => `
            <tr>
                <td>${r.rollNo}</td>
                <td><b style="color:#fff;">${r.name}</b></td>
                <td>${r.exam || '---'}</td>
                <td style="color:var(--primary-color); font-weight:bold;">${r.totalMarks || 0}</td>
                <td><span class="status-badge" style="background:rgba(255,255,255,0.05);">${r.grade || 'N/A'}</span></td>
                <td><span class="status-badge ${r.status === 'Pass' ? 'approved' : 'pending'}">${r.status || 'Unknown'}</span></td>
            </tr>
        `).join('');

        // Show sync info
        const syncInfo = document.getElementById('results-sync-info');
        if (syncInfo) {
            const publishedBadge = examData.published
                ? '<span class="status-badge approved">Published</span>'
                : '<span class="status-badge pending">Unpublished</span>';

            syncInfo.innerHTML = `
                Last synced: <b>${new Date(examData.syncedAt).toLocaleString()}</b> | 
                ${publishedBadge} | 
                ${sorted.length} results
            `;
        }
    };

    /**
     * Fetch Column Headers (Feature Requirement)
     */
    /**
     * Fetch Column Headers & Reveal Mapping UI
     */
    const fetchHeaders = async () => {
        const sheetId = sheetIdInput?.value?.trim();
        const examId = examSelect?.value;

        if (!sheetId || !examId) {
            alert("Please select an exam and provide a Sheet ID first.");
            return;
        }

        try {
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Fetching headers...', 'loading');

            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
            const response = await fetch(csvUrl);

            if (!response.ok) {
                throw new Error('Failed to connect to Google Sheets. Verify Sheet ID and public access.');
            }

            const csvText = await response.text();
            const firstLine = csvText.split('\n')[0];
            const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));

            if (headers.length < 2) throw new Error("Could not parse headers from sheet.");

            // Populate Mapping Selects
            const selects = document.querySelectorAll('.map-select');
            selects.forEach(sel => {
                sel.innerHTML = '<option value="">-- Ignore --</option>' +
                    headers.map(h => `<option value="${h}">${h}</option>`).join('');

                // Smart Auto-Mapping
                const id = sel.id;
                const match = headers.find(h => {
                    const lower = h.toLowerCase();
                    if (id === 'map-roll') return lower.includes('roll') || lower.includes('reg') || lower.includes('id');
                    if (id === 'map-name') return lower.includes('name') || lower.includes('student');
                    if (id === 'map-dob') return lower.includes('dob') || lower.includes('birth');
                    if (id === 'map-status') return lower.includes('status') || lower.includes('result');
                    return false;
                });
                if (match) sel.value = match;
            });

            // Populate Subject Checkboxes
            const subjectContainer = document.getElementById('map-subjects-container');
            if (subjectContainer) {
                const standard = ['roll', 'name', 'dob', 'class', 'status', 'total', 'grade', 'rank', 'remark', 'id'];
                subjectContainer.innerHTML = headers.map(h => {
                    const isLikelySubject = !standard.some(s => h.toLowerCase().includes(s));
                    return `
                        <label style="display:flex; align-items:center; gap:5px; font-size:0.75rem; background:rgba(255,255,255,0.05); padding:5px; border-radius:4px; cursor:pointer;">
                            <input type="checkbox" class="map-subject-checkbox" value="${h}" ${isLikelySubject ? 'checked' : ''}>
                            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${h}">${h}</span>
                        </label>
                    `;
                }).join('');
            }

            // Reveal UI
            const mappingUI = document.getElementById('column-mapping-ui');
            if (mappingUI) {
                mappingUI.style.display = 'block';
                mappingUI.scrollIntoView({ behavior: 'smooth' });
            }

            showStatus('<i class="ph-bold ph-check-circle"></i> Headers loaded! Please verify the column mappings below.', 'success');
        } catch (error) {
            console.error('Fetch Headers Error:', error);
            showStatus(`<span style="color:#ff4444;">❌ Error: ${error.message}</span>`, 'error');
        }
    };

    /**
     * SYNC LOGIC: Handle Sync click
     */
    const handleSyncClick = async () => {
        const examId = examSelect?.value;
        const sheetId = sheetIdInput?.value?.trim();
        const schoolId = window.SchoolManager ? SchoolManager.getActiveSchool() : 'default';

        if (!schoolId || !examId || !sheetId) {
            alert("Please select an exam and provide a Sheet ID.");
            return;
        }

        // Get Mapping configuration
        const mapping = {
            roll: document.getElementById('map-roll')?.value,
            name: document.getElementById('map-name')?.value,
            dob: document.getElementById('map-dob')?.value,
            status: document.getElementById('map-status')?.value,
            subjects: Array.from(document.querySelectorAll('.map-subject-checkbox:checked')).map(cb => cb.value)
        };

        if (!mapping.roll || !mapping.name) {
            alert("Roll No and Name columns must be mapped.");
            return;
        }

        syncButton.disabled = true;
        const originalBtnHtml = syncButton.innerHTML;
        syncButton.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Syncing...';

        try {
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Fetching data...', 'loading');

            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
            const response = await fetch(csvUrl);
            if (!response.ok) throw new Error('Failed to connect to Google Sheets.');

            const csvText = await response.text();
            const rawData = parseCSV(csvText);

            if (!rawData.length) throw new Error('No data found in sheet.');

            // Get exam metadata
            const examMeta = (window.ExamManager ? ExamManager.getAll() : []).find(e => e.id === examId);
            const examName = examMeta ? `${examMeta.name} (${examMeta.examTypeName})` : 'Result';

            // Process Data
            const results = rawData.map(row => {
                const subjects = {};
                let totalMarks = 0;

                mapping.subjects.forEach(sub => {
                    const val = parseFloat(row[sub]) || 0;
                    subjects[sub] = val;
                    totalMarks += val;
                });

                const resStatus = row[mapping.status] || (totalMarks > 0 ? 'Pass' : 'Absent');

                return {
                    schoolId,
                    examId,
                    exam: examName,
                    rollNo: row[mapping.roll] || '',
                    name: row[mapping.name] || '',
                    dob: mapping.dob ? row[mapping.dob] : '',
                    subjects: subjects,
                    totalMarks: totalMarks,
                    grade: calculateGrade(totalMarks),
                    status: resStatus,
                    rank: null // Rank calculated later during render
                };
            }).filter(r => r.rollNo && r.name);

            // Save
            saveExamResults(examId, results, sheetId, false);

            showStatus(
                `<i class="ph-bold ph-check-circle" style="color:#00ff88;"></i> ✓ Sync success! ${results.length} results loaded. Click "Publish" to go live.`,
                'success'
            );

        } catch (error) {
            console.error('Sync Error:', error);
            showStatus(`<span style="color:#ff4444;">❌ Error: ${error.message}</span>`, 'error');
        } finally {
            syncButton.disabled = false;
            syncButton.innerHTML = originalBtnHtml;
            updateButtonState();
        }
    };

    const calculateGrade = (total) => {
        // Simple default grading logic
        if (total >= 450) return 'A+';
        if (total >= 400) return 'A';
        if (total >= 350) return 'B+';
        if (total >= 300) return 'B';
        if (total >= 200) return 'C';
        return 'D';
    };

    return {
        init,
        getAllResults,
        handleSyncClick,
        fetchHeaders,
        togglePublish,
        refresh: () => { renderTable(); updateButtonState(); updatePublishToggle(); }
    };
})();

// Initialize on DOM load
window.ResultsManagement = ResultsManagement;
document.addEventListener('DOMContentLoaded', () => {
    ResultsManagement.init();
});
