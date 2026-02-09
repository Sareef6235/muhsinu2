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
     * Also generates the unified 'publishedResults' for the static public portal.
     */
    const updateExamList = () => {
        const results = getAllResults();
        const exams = window.ExamManager ? ExamManager.getAll() : [];
        const years = window.AcademicYearManager ? AcademicYearManager.getAll() : [];
        const types = window.ExamTypeManager ? ExamTypeManager.getAll() : [];

        const publicExams = [];
        const cmsExams = [];

        Object.keys(results).forEach(examId => {
            const examData = results[examId];
            if (!examData.published) return;

            const examMeta = exams.find(e => e.id === examId);
            if (!examMeta) return;

            const yearName = years.find(y => y.id === examMeta.yearId)?.yearLabel || '';
            const typeName = types.find(t => t.id === examMeta.typeId)?.name || '';
            const displayName = `${examMeta.name} (${typeName} - ${yearName})`;

            // 1. Structure for ResultsCMS (Legacy/Compatibility)
            cmsExams.push({
                id: examId,
                displayName: displayName,
                lastSync: examData.syncedAt
            });

            // 2. Full Structure for Public Static Portal (New Requirement)
            publicExams.push({
                examId: examId,
                examName: displayName,
                published: true,
                lastSync: examData.syncedAt,
                subjects: examData.subjects || [],
                results: examData.data || [] // Full results array
            });
        });

        // Save for Legacy ResultsCMS
        StorageManager.set('exam_results_exams', cmsExams);

        // Save for PUBLIC PORTAL (Unified Global Key)
        localStorage.setItem('publishedResults', JSON.stringify({
            exams: publicExams,
            lastUpdated: new Date().toISOString()
        }));

        console.log("Public Results Synced:", publicExams.length, "exams published.");
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
        const sorted = [...examData.data].sort((a, b) => (b.totalMarks || 0) - (a.totalMarks || 0));

        // Build subject-wise display
        tbody.innerHTML = sorted.map((r, index) => {
            // Create subject breakdown tooltip/display
            const subjectBreakdown = r.subjects ? Object.entries(r.subjects)
                .map(([subj, marks]) => `${subj}: ${marks}`)
                .join(' | ') : 'N/A';

            return `
            <tr>
                <td>${r.rollNo}</td>
                <td><b style="color:#fff;">${r.name}</b></td>
                <td title="${subjectBreakdown}">${r.exam || '---'}</td>
                <td style="color:var(--primary-color); font-weight:bold;">${r.totalMarks || 0}</td>
                <td><span class="status-badge" style="background:rgba(255,255,255,0.05);">${r.grade || 'N/A'}</span></td>
                <td><span class="status-badge ${r.status === 'Pass' ? 'approved' : 'pending'}">${r.status || 'Unknown'}</span></td>
                <td>
                    <a href="../../pages/results/index.html?exam=${examId}&roll=${r.rollNo}" 
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
     * ========================================
     * SYNC LOGIC: Process & Store Results
     * ========================================
     * Validates mapping, fetches data, transforms with subject-wise marks
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

        // 2. Mapping Configuration Validation (ONLY Roll No and Name required)
        const mapping = {
            roll: document.getElementById('map-roll')?.value,
            name: document.getElementById('map-name')?.value,
            dob: document.getElementById('map-dob')?.value || null, // Optional
            subjects: Array.from(document.querySelectorAll('.map-subject-checkbox:checked')).map(cb => cb.value)
        };

        // STRICT VALIDATION: Only Roll No and Name are mandatory
        if (!mapping.roll || !mapping.name) {
            showStatus('<span style="color:#ff4444;">❌ Error: Roll No and Name columns must be mapped.</span>', 'error');
            const mappingUI = document.getElementById('column-mapping-ui');
            if (mappingUI) mappingUI.style.display = 'block';
            return;
        }

        // Validate at least one subject is selected
        if (mapping.subjects.length === 0) {
            showStatus('<span style="color:#ff4444;">❌ Error: Please select at least one subject column.</span>', 'error');
            return;
        }

        console.log('📊 Sync Configuration:');
        console.log('  Roll No Column:', mapping.roll);
        console.log('  Name Column:', mapping.name);
        console.log('  DOB Column:', mapping.dob || 'Not mapped (optional)');
        console.log('  Subject Columns:', mapping.subjects);
        console.log('  ⚠️ Grade, Status, Percentage will be CALCULATED in JavaScript');
        console.log('  ⚠️ Metadata (CLASS, SECTION, etc.) ignored');

        // UI State: Loading
        syncButton.disabled = true;
        const originalBtnHtml = syncButton.innerHTML;
        syncButton.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Processing...';

        try {
            // Step 1: Network Check & Fetch
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Fetching data from Google Sheets...', 'loading');

            // Use GViz API for robust fetching
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&tq&cache_bust=${Date.now()}`;

            const response = await fetch(csvUrl);
            if (!response.ok) {
                if (response.status === 404) throw new Error('Sheet not found. Check the ID.');
                throw new Error('Could not reach Google Sheets. Ensure the sheet is Public (Anyone with link can view).');
            }

            const csvText = await response.text();

            // Check for HTML response (Private sheet)
            if (csvText.includes('<html') || csvText.startsWith('<!DOCTYPE')) {
                throw new Error('Access Denied: Sheet is private. Please change sharing to "Anyone with the link".');
            }

            // Step 2: Parse CSV
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Parsing spreadsheet content...', 'loading');
            const rawData = parseCSV(csvText);
            if (!rawData || rawData.length === 0) {
                throw new Error('Spreadsheet appears to be empty or misformatted.');
            }

            // Step 3: Transformation with Subject-Wise Marks
            showStatus('<i class="ph-bold ph-spinner ph-spin"></i> Processing subject marks...', 'loading');
            const examMeta = (window.ExamManager ? ExamManager.getAll() : []).find(e => e.id === examId);
            const examName = examMeta ? `${examMeta.name} (${examMeta.examTypeName || ''})` : 'Result';

            const results = rawData.map(row => {
                const subjects = {}; // Store subject-wise marks with EXACT names
                let totalMarks = 0;

                // Process each subject column (preserving exact names from sheet)
                mapping.subjects.forEach(subjectName => {
                    const rawValue = row[subjectName];
                    const marks = parseFloat(rawValue) || 0;

                    // Store with EXACT subject name from sheet header
                    subjects[subjectName] = marks;
                    totalMarks += marks;
                });

                // Get status (Pass/Fail)
                const resStatus = row[mapping.status] || (totalMarks > 0 ? 'Pass' : 'Absent');

                // Calculate computed values (JS-based)
                const maxMarksPerSubject = 100;
                const totalMaxMarks = mapping.subjects.length * maxMarksPerSubject;
                const percentage = calculatePercentage(totalMarks, totalMaxMarks);
                const grade = calculateGrade(percentage);
                const status = calculateStatus(subjects, 33);

                return {
                    rollNo: row[mapping.roll] || '',
                    name: row[mapping.name] || '',
                    dob: mapping.dob ? row[mapping.dob] : '',
                    examId: examId,
                    exam: examName,
                    subjects: subjects,
                    totalMarks: totalMarks,
                    maxMarks: totalMaxMarks,   // New field
                    percentage: percentage,    // New field
                    grade: grade,
                    status: status,
                    rank: null
                };
            }).filter(r => r.rollNo && r.name); // Only include rows with valid identity

            if (results.length === 0) {
                throw new Error('No valid results found after processing. Check your column mappings.');
            }

            console.log('📊 Processed Results Sample:', results[0]);
            console.log(`✓ Total Students: ${results.length}`);
            console.log(`✓ Subjects per Student: ${Object.keys(results[0].subjects).length}`);

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
