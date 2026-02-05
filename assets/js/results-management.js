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


    const calculateGrade = (total) => {
        if (total >= 450) return 'A+';
        if (total >= 400) return 'A';
        if (total >= 350) return 'B+';
        if (total >= 300) return 'B';
        if (total >= 250) return 'C';
        if (total >= 180) return 'D';
        return 'F';
    };


    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * AUTO-MAPPING HELPERS
     */
    const normalizeHeader = (h) => h ? h.toLowerCase().replace(/[^a-z0-9]/g, '').trim() : '';

    const patterns = {
        roll: ['roll', 'rollno', 'rollnumber', 'register', 'regno', 'registerno', 'registernumber', 'admissionno', 'admissionnumber', 'studentid', 'idno'],
        name: ['name', 'studentname', 'candidatename', 'fullname'],
        dob: ['dob', 'dateofbirth', 'birthdate'],
        status: ['status', 'result', 'passfail', 'resultstatus']
    };

    const findBestMatch = (header, type) => {
        const normalized = normalizeHeader(header);
        if (!normalized) return false;

        // Exact normalized match
        if (patterns[type].includes(normalized)) return true;

        // Partial match for specific types
        if (type === 'roll' && (normalized.includes('roll') || normalized.includes('register') || normalized.includes('regno'))) return true;
        if (type === 'name' && (normalized.includes('student') && normalized.includes('name'))) return true;

        return false;
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
     * Fetch Column Headers & Reveal Mapping UI with Smart Auto-Detection
     */
    const fetchHeaders = async () => {
        const sheetId = sheetIdInput?.value?.trim();
        const examId = examSelect?.value;

        if (!sheetId || !examId) {
            showStatus('<span style="color:#ffcc00;">⚠️ Select an exam and provide a Sheet ID first.</span>', 'warning');
            return;
        }

        try {
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Fetching headers & analyzing sheet content...', 'loading');

            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
            const response = await fetch(csvUrl);

            if (!response.ok) {
                throw new Error('Failed to connect to Google Sheets. Verify Sheet ID and public access.');
            }

            const csvText = await response.text();
            const lines = csvText.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

            if (headers.length < 2) throw new Error("Could not parse headers from sheet.");

            // Analyze first data row to help identify subjects
            const firstDataRow = lines[1] ? lines[1].split(',').map(v => v.trim().replace(/^"|"$/g, '')) : [];

            // 1. Populate Mapping Dropdowns & Run Auto-Detection
            const mappingRefs = {
                'map-roll': 'roll',
                'map-name': 'name',
                'map-dob': 'dob',
                'map-status': 'status'
            };

            const autoMappedHeaders = new Set();

            Object.keys(mappingRefs).forEach(selectId => {
                const sel = document.getElementById(selectId);
                if (!sel) return;

                const type = mappingRefs[selectId];
                sel.innerHTML = '<option value="">-- Select Column --</option>' +
                    headers.map(h => `<option value="${h}">${h}</option>`).join('');

                // Smart Detection
                const match = headers.find(h => findBestMatch(h, type));
                if (match) {
                    sel.value = match;
                    autoMappedHeaders.add(match);
                }
            });

            // 2. Identify and Group Subject Columns
            const subjectContainer = document.getElementById('map-subjects-container');
            if (subjectContainer) {
                const standardKeywords = ['roll', 'name', 'dob', 'class', 'status', 'total', 'grade', 'rank', 'remark', 'id', 'result', 'year', 'exam'];

                const subjectFields = headers.filter((h, idx) => {
                    // Skip if already auto-mapped to a standard field
                    if (autoMappedHeaders.has(h)) return false;

                    const normalized = normalizeHeader(h);

                    // Skip if it looks like a standard field keyword
                    if (standardKeywords.some(key => normalized.includes(key))) return false;

                    // Heuristic: If it has data in first row that is numeric or not empty, and not standard field
                    const dataVal = firstDataRow[idx];
                    const isNumeric = dataVal && !isNaN(dataVal.replace('%', ''));

                    return isNumeric || (dataVal && dataVal.length > 0 && dataVal.length < 15);
                });

                subjectContainer.innerHTML = subjectFields.map(h => `
                    <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px; cursor:pointer; transition:all 0.2s;" class="subject-map-label">
                        <input type="checkbox" class="map-subject-checkbox" value="${h}" checked>
                        <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${h}">${h}</span>
                    </label>
                `).join('');

                if (subjectFields.length === 0) {
                    subjectContainer.innerHTML = '<p style="font-size:0.8rem; color:#888; width:100%;">No subject columns identified. You can manually select them if needed.</p>';
                }
            }

            // 3. Reveal Mapping UI
            const mappingUI = document.getElementById('column-mapping-ui');
            if (mappingUI) {
                mappingUI.style.display = 'block';
                mappingUI.style.animation = 'fadeInUp 0.4s ease-out';
                mappingUI.scrollIntoView({ behavior: 'smooth' });
            }

            showStatus('<i class="ph-bold ph-check-circle" style="color:#00ff88;"></i> ✓ Smart mapping complete! Please verify the selections below.', 'success');
        } catch (error) {
            console.error('📊 ResultsManagement FetchHeaders Error:', error);
            showStatus(`<span style="color:#ff4444;">❌ Error: ${error.message}</span>`, 'error');
        }
    };

    /**
     * SYNC LOGIC: Robust Handle Sync click
     */
    const handleSyncClick = async () => {
        const examId = examSelect?.value;
        const sheetId = sheetIdInput?.value?.trim();
        const schoolId = window.SchoolManager ? SchoolManager.getActiveSchool() : 'default';

        // 1. Initial Validation
        if (!examId) {
            showStatus('<span style="color:#ffcc00;">⚠️ Please select an exam session first.</span>', 'warning');
            return;
        }
        if (!sheetId) {
            showStatus('<span style="color:#ffcc00;">⚠️ Please provide a valid Google Sheet ID.</span>', 'warning');
            return;
        }

        // 2. Mapping Configuration Validation
        const mapping = {
            roll: document.getElementById('map-roll')?.value,
            name: document.getElementById('map-name')?.value,
            dob: document.getElementById('map-dob')?.value,
            status: document.getElementById('map-status')?.value,
            subjects: Array.from(document.querySelectorAll('.map-subject-checkbox:checked')).map(cb => cb.value)
        };

        if (!mapping.roll || !mapping.name) {
            showStatus('<span style="color:#ff4444;">❌ Error: Roll No and Name columns must be mapped.</span>', 'error');
            const mappingUI = document.getElementById('column-mapping-ui');
            if (mappingUI) mappingUI.style.display = 'block';
            return;
        }

        // UI State: Loading
        syncButton.disabled = true;
        const originalBtnHtml = syncButton.innerHTML;
        syncButton.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Processing...';

        try {
            // Step 1: Network Check & Fetch
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Fetching data from Google Sheets...', 'loading');
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0&cache_bust=${Date.now()}`;

            const response = await fetch(csvUrl);
            if (!response.ok) {
                throw new Error('Could not reach Google Sheets. Ensure the sheet is Public (Anyone with link can view).');
            }

            const csvText = await response.text();

            // Step 2: Parse CSV
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Parsing spreadsheet content...', 'loading');
            const rawData = parseCSV(csvText);
            if (!rawData || rawData.length === 0) {
                throw new Error('Spreadsheet appears to be empty or misformatted.');
            }

            // Step 3: Transformation with Validation
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Preparing preview table...', 'loading');
            const examMeta = (window.ExamManager ? ExamManager.getAll() : []).find(e => e.id === examId);
            const examName = examMeta ? `${examMeta.name} (${examMeta.examTypeName || ''})` : 'Result';

            const results = rawData.map(row => {
                const subjects = {};
                let totalMarks = 0;

                // Process subject marks
                mapping.subjects.forEach(sub => {
                    const val = parseFloat(row[sub]) || 0;
                    subjects[sub] = val;
                    totalMarks += val;
                });

                // Get status (Pass/Fail)
                const resStatus = row[mapping.status] || (totalMarks > 0 ? 'Pass' : 'Absent');

                return {
                    rollNo: row[mapping.roll] || '',
                    name: row[mapping.name] || '',
                    dob: mapping.dob ? row[mapping.dob] : '',
                    examId: examId,
                    exam: examName,
                    subjects: subjects,
                    totalMarks: totalMarks,
                    grade: calculateGrade(totalMarks),
                    status: resStatus,
                    rank: null // Rank will be calculated on render
                };
            }).filter(r => r.rollNo && r.name);

            if (results.length === 0) {
                throw new Error('No valid results found after processing. Check your column mappings.');
            }

            // Step 4: Storage & UI Update
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Saving locally...', 'loading');
            saveExamResults(examId, results, sheetId, false);

            showStatus(
                `<i class="ph-bold ph-check-circle" style="color:#00ff88;"></i> ✓ Sync success! ${results.length} results loaded. Click "Publish" to go live.`,
                'success'
            );

        } catch (error) {
            console.error('📊 ResultsManagement Sync Error:', error);
            showStatus(`<span style="color:#ff4444;">❌ Sync Failed: ${error.message}</span>`, 'error');
        } finally {
            syncButton.disabled = false;
            syncButton.innerHTML = originalBtnHtml;
            updateButtonState();
        }
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
