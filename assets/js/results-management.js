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

        // Add Copy Link button if published
        if (isPublished) {
            // Remove existing if any to avoid duplicates
            const existing = publishToggle.parentNode.querySelector('.btn-copy-link');
            if (existing) existing.remove();

            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn btn-sm btn-subtle btn-copy-link';
            copyBtn.style.marginTop = '8px';
            copyBtn.innerHTML = '<i class="ph-bold ph-copy"></i> Copy Public Link';
            copyBtn.title = "Copy direct link to this exam's result portal";
            copyBtn.onclick = () => {
                const url = new URL('../../pages/results/index.html', window.location.href);
                url.searchParams.set('exam', examId);

                navigator.clipboard.writeText(url.href).then(() => {
                    const original = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="ph-bold ph-check"></i> Copied!';
                    setTimeout(() => copyBtn.innerHTML = original, 2000);
                });
            };
            publishToggle.parentNode.appendChild(copyBtn);
        } else {
            // Remove if showing while unpublished
            const existing = publishToggle.parentNode.querySelector('.btn-copy-link');
            if (existing) existing.remove();
        }
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


    /**
     * Calculate grade based on percentage (NOT fixed totals)
     * @param {number} percentage - Percentage score (0-100)
     * @returns {string} Grade (A+, A, B, C, D, F)
     */
    const calculateGrade = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    };

    /**
     * Calculate percentage from marks
     * @param {number} obtained - Total marks obtained
     * @param {number} maxMarks - Maximum possible marks
     * @returns {number} Percentage (0-100)
     */
    const calculatePercentage = (obtained, maxMarks) => {
        if (maxMarks === 0) return 0;
        return Math.round((obtained / maxMarks) * 100 * 100) / 100; // Round to 2 decimals
    };

    /**
     * Determine pass/fail status
     * @param {object} subjects - Subject marks object {subjectName: marks}
     * @param {number} passMark - Minimum passing marks per subject (default: 33)
     * @returns {string} 'Pass' or 'Fail'
     */
    const calculateStatus = (subjects, passMark = 33) => {
        const marks = Object.values(subjects);
        if (marks.length === 0) return 'Absent';

        // Check if any subject has marks below pass mark
        const hasFailed = marks.some(mark => mark < passMark && mark > 0);

        // If all marks are 0, mark as Absent
        const allZero = marks.every(mark => mark === 0);
        if (allZero) return 'Absent';

        return hasFailed ? 'Fail' : 'Pass';
    };


    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * ========================================
     * COLUMN CLASSIFICATION ENGINE
     * ========================================
     * Implements strict 3-category classification:
     * 1. IDENTITY: Roll No, Student Name (required)
     * 2. METADATA: CLASS, SECTION, etc. (ignored)
     * 3. SUBJECTS: All other columns with marks
     */

    // Normalize header for comparison (case-insensitive, remove symbols)
    const normalizeHeader = (h) => {
        if (!h) return '';
        return h.toString()
            .toLowerCase()
            .replace(/['\s\-_]/g, '') // Remove quotes, spaces, hyphens, underscores
            .trim();
    };

    // Identity field patterns (REQUIRED for student identification)
    const IDENTITY_PATTERNS = {
        roll: [
            'rollno', 'roll', 'rollnumber',
            'regno', 'registerno', 'registernumber',
            'admissionno', 'admissionnumber',
            'studentid', 'idno', 'id'
        ],
        name: [
            'studentname', 'name', 'candidatename',
            'fullname', 'student'
        ],
        dob: ['dob', 'dateofbirth', 'birthdate'],
        status: ['status', 'result', 'passfail', 'resultstatus']
    };

    // Metadata patterns (MUST BE IGNORED - not subject marks)
    const METADATA_PATTERNS = [
        'class', 'section', 'batch', 'group',
        'division', 'stream', 'year', 'semester',
        'total', 'grade', 'rank', 'percentage',
        'remark', 'remarks', 'comment', 'comments',
        'exam', 'examname', 'examtype'
    ];

    /**
     * Classify a column header into one of three categories
     * @param {string} header - Column header from sheet
     * @param {string} sampleValue - Sample value from first data row
     * @returns {object} - {type: 'identity'|'metadata'|'subject', field: string|null}
     */
    const classifyColumn = (header, sampleValue = '') => {
        const normalized = normalizeHeader(header);

        if (!normalized) {
            return { type: 'unknown', field: null };
        }

        // 1. Check if it's an IDENTITY field (Roll No, Name, etc.)
        for (const [field, patterns] of Object.entries(IDENTITY_PATTERNS)) {
            for (const pattern of patterns) {
                if (normalized === pattern || normalized.includes(pattern)) {
                    return { type: 'identity', field: field };
                }
            }
        }

        // 2. Check if it's METADATA (must be excluded from subjects)
        for (const pattern of METADATA_PATTERNS) {
            if (normalized === pattern || normalized.includes(pattern)) {
                return { type: 'metadata', field: pattern };
            }
        }

        // 3. Otherwise, it's a SUBJECT column
        // Additional heuristic: if sample value is numeric or reasonable length
        const isNumeric = sampleValue && !isNaN(parseFloat(sampleValue.toString().replace('%', '')));
        const isReasonableLength = header.length > 0 && header.length < 50;

        if (isReasonableLength) {
            return { type: 'subject', field: header }; // Preserve EXACT original name
        }

        return { type: 'unknown', field: null };
    };

    /**
     * Find best match for a specific identity field type
     * @param {string} header - Column header
     * @param {string} type - Identity type (roll, name, dob, status)
     * @returns {boolean}
     */
    const findBestMatch = (header, type) => {
        const normalized = normalizeHeader(header);
        if (!normalized) return false;

        const patterns = IDENTITY_PATTERNS[type] || [];

        // Exact match
        if (patterns.includes(normalized)) return true;

        // Partial match for specific types
        if (type === 'roll' && (normalized.includes('roll') || normalized.includes('regno'))) return true;
        if (type === 'name' && normalized.includes('name')) return true;

        return false;
    };

    /**
     * UI Rendering with Subject-Wise Display
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
        const sorted = [...examData.data].sort((a, b) => (b.total || 0) - (a.total || 0));

        // Build subject-wise display
        tbody.innerHTML = sorted.map((r, index) => {
            // Create subject breakdown tooltip/display
            const subjectBreakdown = r.subjects ? Object.entries(r.subjects)
                .map(([subj, marks]) => `${subj}: ${marks}`)
                .join(' | ') : 'N/A';

            return `
            <tr>
                <td>${r.roll}</td>
                <td><b style="color:#fff;">${r.name}</b></td>
                <td title="${subjectBreakdown}">${r.exam || '---'}</td>
                <td style="color:var(--primary-color); font-weight:bold;">${r.total || 0}</td>
                <td><span class="status-badge" style="background:rgba(255,255,255,0.05);">${r.grade || 'N/A'}</span></td>
                <td><span class="status-badge ${r.status === 'Pass' ? 'approved' : 'pending'}">${r.status || 'Unknown'}</span></td>
                <td>
                    <a href="../../pages/results/index.html?exam=${examId}&roll=${r.roll}" 
                       target="_blank" 
                       class="btn btn-mini btn-subtle" 
                       title="View on Public Portal">
                       <i class="ph-bold ph-arrow-square-out"></i> View
                    </a>
                </td>
            </tr>
        `;
        }).join('');

        // Show sync info with subject count
        const syncInfo = document.getElementById('results-sync-info');
        if (syncInfo) {
            const publishedBadge = examData.published
                ? '<span class="status-badge approved">Published</span>'
                : '<span class="status-badge pending">Unpublished</span>';

            const subjectCount = sorted[0]?.subjects ? Object.keys(sorted[0].subjects).length : 0;

            syncInfo.innerHTML = `
                Last synced: <b>${new Date(examData.syncedAt).toLocaleString()}</b> | 
                ${publishedBadge} | 
                ${sorted.length} results | 
                ${subjectCount} subjects
            `;
            syncInfo.style.display = 'block';
        }
    };

    /**
     * ========================================
     * FETCH HEADERS & AUTO-MAP COLUMNS
     * ========================================
     * Uses classification engine to intelligently detect:
     * - Identity fields (Roll No, Name) → auto-map
     * - Metadata columns (CLASS, etc.) → ignore
     * - Subject columns → auto-select for marks
     */
    const fetchHeaders = async () => {
        const sheetId = sheetIdInput?.value?.trim();
        const examId = examSelect?.value;

        if (!sheetId || !examId) {
            showStatus('<span style="color:#ffcc00;">⚠️ Select an exam and provide a Sheet ID first.</span>', 'warning');
            return;
        }

        try {
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Fetching headers & analyzing sheet structure...', 'loading');

            // Use Google Visualization API for more robust CSV fetching (handles CORS better)
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
            const response = await fetch(csvUrl);

            if (!response.ok) {
                if (response.status === 404) throw new Error('Sheet not found. Check your Sheet ID.');
                throw new Error('Failed to connect to Google Sheets. Ensure the sheet is accessible.');
            }

            const csvText = await response.text();

            // Check if we got HTML instead of CSV (indicates authentication required/private sheet)
            if (csvText.trim().startsWith('<!DOCTYPE html>') || csvText.includes('<html')) {
                throw new Error('Sheet appears to be PRIVATE. Only "Anyone with the link" or "Published" sheets are supported.');
            }
            const lines = csvText.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

            if (headers.length < 2) throw new Error("Could not parse headers from sheet.");

            // Get first data row for classification hints
            const firstDataRow = lines[1] ? lines[1].split(',').map(v => v.trim().replace(/^"|"$/g, '')) : [];

            console.log('📊 Column Classification Report:');
            console.log('================================');

            // Classify all columns
            const classifications = headers.map((header, idx) => {
                const classification = classifyColumn(header, firstDataRow[idx]);
                console.log(`Column "${header}" → ${classification.type.toUpperCase()} ${classification.field ? `(${classification.field})` : ''}`);
                return {
                    header: header,
                    index: idx,
                    ...classification
                };
            });

            // Extract identity fields
            const identityFields = classifications.filter(c => c.type === 'identity');
            const rollField = identityFields.find(c => c.field === 'roll');
            const nameField = identityFields.find(c => c.field === 'name');
            const dobField = identityFields.find(c => c.field === 'dob');
            const statusField = identityFields.find(c => c.field === 'status');

            // Extract subject columns (exclude identity and metadata)
            const subjectColumns = classifications.filter(c => c.type === 'subject');

            console.log('================================');
            console.log(`✓ Identity Fields: ${identityFields.length}`);
            console.log(`✓ Subject Columns: ${subjectColumns.length}`);
            console.log(`✓ Metadata (ignored): ${classifications.filter(c => c.type === 'metadata').length}`);

            // 1. Populate Identity Field Dropdowns with Auto-Selection
            const mappingRefs = {
                'map-roll': rollField,
                'map-name': nameField,
                'map-dob': dobField,
                'map-status': statusField
            };

            Object.keys(mappingRefs).forEach(selectId => {
                const sel = document.getElementById(selectId);
                if (!sel) return;

                const autoField = mappingRefs[selectId];

                sel.innerHTML = '<option value="">-- Select Column --</option>' +
                    headers.map(h => `<option value="${h}">${h}</option>`).join('');

                // Auto-select if detected
                if (autoField) {
                    sel.value = autoField.header;
                    sel.style.borderColor = '#00ff88'; // Visual feedback
                }
            });

            // 2. Populate Subject Checkboxes (Auto-checked)
            const subjectContainer = document.getElementById('map-subjects-container');
            if (subjectContainer) {
                if (subjectColumns.length > 0) {
                    subjectContainer.innerHTML = subjectColumns.map(col => `
                        <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem; background:rgba(0,255,136,0.08); padding:8px 12px; border-radius:6px; cursor:pointer; transition:all 0.2s; border: 1px solid rgba(0,255,136,0.2);" class="subject-map-label">
                            <input type="checkbox" class="map-subject-checkbox" value="${col.header}" checked>
                            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff; font-weight:500;" title="${col.header}">${col.header}</span>
                        </label>
                    `).join('');
                } else {
                    subjectContainer.innerHTML = '<p style="font-size:0.8rem; color:#ff8800; width:100%;">⚠️ No subject columns auto-detected. Please verify your sheet format.</p>';
                }
            }

            // 3. Show Mapping UI
            const mappingUI = document.getElementById('column-mapping-ui');
            if (mappingUI) {
                mappingUI.style.display = 'block';
                mappingUI.style.animation = 'fadeInUp 0.4s ease-out';
                mappingUI.scrollIntoView({ behavior: 'smooth' });
            }

            // 4. Show Summary Status
            const autoMapped = [rollField, nameField].filter(Boolean).length;
            const statusMsg = `
                <i class="ph-bold ph-check-circle" style="color:#00ff88;"></i> 
                ✓ Smart mapping complete!<br>
                <small style="color:#888;">
                    Auto-mapped: ${autoMapped}/2 identity fields | 
                    Detected: ${subjectColumns.length} subjects | 
                    Ignored: ${classifications.filter(c => c.type === 'metadata').length} metadata columns
                </small>
            `;
            showStatus(statusMsg, 'success');

            // Validation warning if critical fields missing
            if (!rollField || !nameField) {
                setTimeout(() => {
                    showStatus('<span style="color:#ffcc00;">⚠️ Could not auto-detect Roll No or Name. Please map manually below.</span>', 'warning');
                }, 2000);
            }

        } catch (error) {
            console.error('📊 ResultsManagement FetchHeaders Error:', error);
            showStatus(`<span style="color:#ff4444;">❌ Error: ${error.message}</span>`, 'error');
        }
    };

    /**
     * VERSION HISTORY: Save previous version before update
     */
    const saveToHistory = (examId, oldData) => {
        if (!oldData) return;
        const historyKey = 'results_history';
        const history = StorageManager.get(historyKey, {});

        if (!history[examId]) history[examId] = [];

        // Keep last 5 versions
        history[examId].unshift({
            timestamp: new Date().toISOString(),
            data: oldData
        });

        if (history[examId].length > 5) history[examId].pop();

        StorageManager.set(historyKey, history);
        console.log(`📊 History: Saved version for ${examId}`);
    };

    /**
     * SYNC PREVIEW MODAL
     */
    const showSyncPreview = (examId, results, sheetId) => {
        const modalId = 'sync-preview-modal';
        let modal = document.getElementById(modalId);

        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'glass-modal';
            Object.assign(modal.style, {
                position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                zIndex: '20000', display: 'flex', alignItems: 'center', justifyContent: 'center'
            });
            document.body.appendChild(modal);
        }

        const stats = {
            total: results.length,
            subjects: Object.keys(results[0].subjects).join(', '),
            avg: Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length),
            passCount: results.filter(r => r.status === 'Pass').length
        };

        modal.innerHTML = `
            <div class="glass-card" style="width: 90%; max-width: 600px; padding: 40px; border-radius: 30px; animation: scaleUp 0.3s ease;">
                <h2 style="margin-bottom: 20px;"><i class="ph-bold ph-eye"></i> Sync Preview</h2>
                
                <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
                        <small style="color: #888;">Students Detected</small>
                        <div style="font-size: 1.5rem; font-weight: 700;">${stats.total}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
                        <small style="color: #888;">Passing Rate</small>
                        <div style="font-size: 1.5rem; font-weight: 700; color: #00ff88;">${Math.round((stats.passCount / stats.total) * 100)}%</div>
                    </div>
                </div>

                <div style="margin-bottom: 25px;">
                    <label style="color: #888; font-size: 0.8rem;">Subjects Detected:</label>
                    <p style="color: var(--primary-color); font-weight: 500;">${stats.subjects}</p>
                </div>

                <div style="display: flex; gap: 15px;">
                    <button id="cancel-sync" class="btn btn-subtle" style="flex: 1;">Cancel</button>
                    <button id="confirm-sync" class="btn btn-primary" style="flex: 2;">Commit & Save</button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';

        document.getElementById('cancel-sync').onclick = () => {
            modal.style.display = 'none';
            showStatus('<span style="color: #ffcc00;">⚠️ Sync cancelled by user.</span>', 'warning');
        };

        document.getElementById('confirm-sync').onclick = () => {
            modal.style.display = 'none';
            commitPublish(examId, results, sheetId);
        };
    };

    const commitPublish = (examId, results, sheetId) => {
        try {
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Committing results to database...', 'loading');

            // Version History
            const oldData = getExamResults(examId);
            saveToHistory(examId, oldData);

            // Save
            saveExamResults(examId, results, sheetId, false);

            // Bridge update
            const examMeta = (window.ExamManager ? ExamManager.getAll() : []).find(e => e.id === examId);
            window.ResultsBridge = {
                generated: {
                    examId: examId,
                    examName: examMeta ? `${examMeta.name}` : 'Result',
                    session: examMeta?.academicYear || new Date().getFullYear(),
                    results: results.map(r => ({
                        roll: String(r.rollNo).trim(),
                        name: r.name,
                        subjects: r.subjects,
                        total: r.totalMarks
                    }))
                },
                syncedAt: new Date().toISOString()
            };

            showStatus(
                `<i class="ph-bold ph-check-circle" style="color:#00ff88;"></i> ✓ Successfully published ${results.length} results locally.`,
                'success'
            );
        } catch (e) {
            showStatus(`<span style="color:#ff4444;">❌ Commit Failed: ${e.message}</span>`, 'error');
        }
    };

    /**
     * ========================================
     * SYNC LOGIC: Process & Store Results
     * ========================================
     */
    const handleSyncClick = async () => {
        const examId = examSelect?.value;
        const sheetId = sheetIdInput?.value?.trim();

        if (!examId || !sheetId) {
            showStatus('<span style="color:#ffcc00;">⚠️ Select an exam and provide a Sheet ID.</span>', 'warning');
            return;
        }

        const mapping = {
            roll: document.getElementById('map-roll')?.value,
            name: document.getElementById('map-name')?.value,
            dob: document.getElementById('map-dob')?.value || null,
            subjects: Array.from(document.querySelectorAll('.map-subject-checkbox:checked')).map(cb => cb.value)
        };

        if (!mapping.roll || !mapping.name || mapping.subjects.length === 0) {
            showStatus('<span style="color:#ff4444;">❌ Error: Mapping incomplete.</span>', 'error');
            return;
        }

        syncButton.disabled = true;
        const originalBtnHtml = syncButton.innerHTML;
        syncButton.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Validating...';

        try {
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&tq&cache_bust=${Date.now()}`;
            const response = await fetch(csvUrl);
            if (!response.ok) throw new Error('Could not reach Google Sheets.');

            const csvText = await response.text();
            if (csvText.includes('<html')) throw new Error('Sheet is private.');

            const rawData = parseCSV(csvText);
            const results = rawData.map(row => {
                const subjects = {};
                let totalMarks = 0;
                mapping.subjects.forEach(s => {
                    const m = parseFloat(row[s]) || 0;
                    subjects[s] = m;
                    totalMarks += m;
                });

                const totalMaxMarks = mapping.subjects.length * 100;
                const percentage = calculatePercentage(totalMarks, totalMaxMarks);

                return {
                    roll: row[mapping.roll] || '',
                    name: row[mapping.name] || '',
                    dob: mapping.dob ? row[mapping.dob] : '',
                    examId: examId,
                    subjects: subjects,
                    total: totalMarks,
                    percentage: percentage,
                    grade: calculateGrade(percentage),
                    status: calculateStatus(subjects, 33)
                };
            }).filter(r => r.roll && r.name);

            if (results.length === 0) throw new Error('No valid data processed.');

            // Show Preview instead of immediate save
            showSyncPreview(examId, results, sheetId);

        } catch (error) {
            showStatus(`<span style="color:#ff4444;">❌ Sync Failed: ${error.message}</span>`, 'error');
        } finally {
            syncButton.disabled = false;
            syncButton.innerHTML = originalBtnHtml;
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
