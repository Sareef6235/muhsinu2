/**
 * =====================================================
 * STATIC EXAM RESULTS PUBLISHER
 * For GitHub Pages / Vercel / Static Hosting
 * =====================================================
 * 
 * WHY THIS DESIGN IS REQUIRED:
 * 1. Static hosts have NO backend - cannot handle POST/PUT requests
 * 2. Admin must manually download and deploy the JSON file
 * 3. This prevents "undefined" values by enforcing strict normalization
 * 4. Blob API is the ONLY way to generate files client-side
 * 
 * FLOW:
 * Admin → Sync Data → Mark as Published → Click "PUBLISH FOR STATIC SITE"
 * → JSON auto-downloads → Admin uploads to /data/ → Git push → LIVE
 */

const StaticPublisher = (() => {
    'use strict';

    /**
     * =====================================================
     * 1. COLLECT SELECTED EXAM DATA
     * =====================================================
     * Reads the currently selected exam from the UI dropdown.
     * 
     * WHY: Static sites can't dynamically filter server-side.
     * We must build the exact structure the frontend expects.
     */
    const getSelectedExamData = () => {
        // Get UI reference
        const examSelect = document.getElementById('results-exam-select');
        if (!examSelect || !examSelect.value) {
            throw new Error('No exam selected. Please select a target exam first.');
        }

        const selectedExamId = examSelect.value;

        // Get exam metadata from ExamManager
        const examsMeta = window.ExamManager ? window.ExamManager.getAll() : [];
        const examMeta = examsMeta.find(e => e.id === selectedExamId);

        if (!examMeta) {
            throw new Error(`Exam metadata not found for ID: ${selectedExamId}`);
        }

        // Get synced results from ResultsManagement
        const allResults = window.ResultsManagement ? window.ResultsManagement.getAllResults() : {};
        const schoolId = window.SchoolManager ? window.SchoolManager.getActiveSchool() : 'default';

        // Navigate nested structure: results[schoolId][examId]
        const schoolResults = allResults[schoolId] || {};
        const examNode = schoolResults[selectedExamId];

        if (!examNode || !Array.isArray(examNode.data) || examNode.data.length === 0) {
            throw new Error('No synced data found for this exam. Please sync first.');
        }

        return {
            examId: selectedExamId,
            examName: examMeta.name,
            examData: examNode
        };
    };

    /**
     * =====================================================
     * 2. NORMALIZE STUDENT RESULT
     * =====================================================
     * Converts raw student object into strict contract format.
     * 
     * WHY: Prevents undefined/null values that break frontend dropdowns.
     * - roll MUST be string (handles numbers like 4055)
     * - subjects MUST be object with validated key-value pairs
     * - total MUST be number (auto-sum if missing)
     */
    const normalizeStudent = (student) => {
        // RULE 1: Roll number must be string and trimmed
        const roll = String(student.rollNo || student.roll || "").trim();
        if (!roll) return null; // Skip empty rolls

        // RULE 2: Name must exist
        const name = String(student.name || "").trim();
        if (!name) return null; // Skip unnamed students

        // RULE 3: Build subjects object (ONLY include valid marks)
        const subjects = {};
        if (student.subjects && typeof student.subjects === 'object') {
            Object.keys(student.subjects).forEach(subjectName => {
                const marks = Number(student.subjects[subjectName]);
                // Only include if it's a valid number (allows 0, rejects NaN)
                if (!isNaN(marks) && marks >= 0) {
                    subjects[subjectName.toUpperCase()] = marks;
                }
            });
        }

        // RULE 4: Calculate total (auto-sum if not provided)
        let total = Number(student.totalMarks || student.total || 0);
        if (total === 0 && Object.keys(subjects).length > 0) {
            // Auto-calculate from subjects
            total = Object.values(subjects).reduce((sum, mark) => sum + mark, 0);
        }

        return {
            roll: roll,
            name: name,
            subjects: subjects,
            total: total
        };
    };

    /**
     * =====================================================
     * 3. BUILD STRICT JSON STRUCTURE
     * =====================================================
     * Generates the exact contract format expected by the frontend.
     * 
     * WHY: Frontend dropdown relies on this exact structure.
     * Any deviation causes "undefined" options or crashes.
     */
    const buildPublishedJSON = () => {
        const { examId, examName, examData } = getSelectedExamData();

        // Normalize all students (filter out null results)
        const normalizedResults = examData.data
            .map(normalizeStudent)
            .filter(student => student !== null);

        if (normalizedResults.length === 0) {
            throw new Error('No valid student records found. All rows were filtered out.');
        }

        // Build strict contract
        return {
            meta: {
                generatedAt: new Date().toISOString()
            },
            exams: [
                {
                    examId: String(examId),          // STRICT: must be string
                    examName: String(examName),       // STRICT: must be string
                    published: true,                  // STRICT: must be boolean
                    results: normalizedResults        // STRICT: must be array of normalized objects
                }
            ]
        };
    };

    /**
     * =====================================================
     * 4. AUTO-DOWNLOAD JSON FILE
     * =====================================================
     * Triggers browser download using Blob API.
     * 
     * WHY: Static sites can't write files to disk.
     * We use Blob + createObjectURL to simulate file download.
     * This is the ONLY way to generate files in a browser.
     */
    const downloadJSON = (jsonData) => {
        // Convert to formatted JSON string
        const jsonString = JSON.stringify(jsonData, null, 2);

        // Create Blob (represents file data in memory)
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Create temporary URL pointing to the Blob
        const url = URL.createObjectURL(blob);

        // Create invisible download link
        const link = document.createElement('a');
        link.href = url;
        link.download = 'published-results.json'; // EXACT filename required

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    /**
     * =====================================================
     * 5. PUBLIC API: PUBLISH
     * =====================================================
     * Main entry point called by the "PUBLISH FOR STATIC SITE" button.
     */
    const publish = () => {
        try {
            console.log('📤 StaticPublisher: Starting publish process...');

            // Step 1: Collect and validate data
            const jsonData = buildPublishedJSON();

            // Step 2: Log preview (for debugging)
            console.log('📤 Generated JSON:', jsonData);
            console.log(`📤 Total exams: ${jsonData.exams.length}`);
            console.log(`📤 Total students: ${jsonData.exams[0].results.length}`);

            // Step 3: Trigger download
            downloadJSON(jsonData);

            // Step 4: Show success message with deployment instructions
            alert(
                '✅ SUCCESS!\n\n' +
                'File "published-results.json" has been generated.\n\n' +
                'DEPLOYMENT STEPS:\n' +
                '1. Open your project folder\n' +
                '2. Navigate to /data/ directory\n' +
                '3. Replace the old file with this new one\n' +
                '4. Commit: git add . && git commit -m "Update results"\n' +
                '5. Push: git push origin main\n\n' +
                'Your results portal will update automatically! 🚀'
            );

        } catch (error) {
            console.error('📤 StaticPublisher Error:', error);
            alert(
                '❌ PUBLISH FAILED\n\n' +
                'Reason: ' + error.message + '\n\n' +
                'Please ensure:\n' +
                '1. An exam is selected\n' +
                '2. Data has been synced\n' +
                '3. At least one student record exists'
            );
        }
    };

    /**
     * =====================================================
     * 6. DEBUG API (Optional)
     * =====================================================
     * Allows testing without triggering download.
     */
    const preview = () => {
        try {
            const jsonData = buildPublishedJSON();
            console.log('📤 JSON Preview:', JSON.stringify(jsonData, null, 2));
            return jsonData;
        } catch (error) {
            console.error('📤 Preview Error:', error);
            return null;
        }
    };

    // =====================================================
    // EXPOSE PUBLIC API
    // =====================================================
    return {
        publish,   // Main function called by UI button
        preview    // Debug function for testing
    };
})();

// =====================================================
// ATTACH TO WINDOW SCOPE
// =====================================================
// WHY: HTML onclick handlers require global scope access
window.StaticPublisher = StaticPublisher;

console.log('📤 StaticPublisher: Module loaded successfully');
