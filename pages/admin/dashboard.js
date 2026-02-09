/**
 * ADMIN STATIC PUBLISHER
 * Generates strict 'published-results.json' for static hosting deployment.
 * 
 * WHY THIS DESIGN:
 * 1. Static site hosts (GitHub Pages/Vercel) have no backend to handle POST requests.
 * 2. This script converts synced results into a signed JSON structure.
 * 3. The admin downloads this file and manually uploads it to /data/.
 * 4. This prevents 'undefined' dropdown issues by enforcing strict data normalization.
 */
const StaticPublisher = (() => {
    'use strict';

    /**
     * 1. NORMALIZE RESULTS
     * Enforces strict data types and trims strings to prevent portal rendering issues.
     */
    const normalizeResults = (students) => {
        if (!Array.isArray(students)) return [];
        return students.map(student => ({
            roll: String(student.rollNo || student.roll || "").trim(),
            name: String(student.name || "Unknown").trim(),
            total: Number(student.totalMarks || student.total || 0)
        })).filter(s => s.roll && s.name); // Skip malformed rows
    };

    /**
     * 2. GENERATE PUBLISHED JSON
     * Aggregates only 'published' exams into the final contract structure.
     */
    const generatePublishedJSON = () => {
        // ResultsManagement stores data in localStorage via StorageManager
        const allResults = window.ResultsManagement ? window.ResultsManagement.getAllResults() : {};
        const examsMeta = window.ExamManager ? window.ExamManager.getAll() : [];

        const publishedExams = [];

        Object.keys(allResults).forEach(examId => {
            const node = allResults[examId];

            // RULE: Only include if explicitly published and contains results
            if (node && node.published === true && Array.isArray(node.data)) {
                const meta = examsMeta.find(e => e.id === examId);
                const examName = meta ? meta.name : (node.name || "Unnamed Exam");

                if (!examId || !examName) return; // Skip invalid entries

                publishedExams.push({
                    examId: String(examId),
                    examName: String(examName),
                    published: true,
                    results: normalizeResults(node.data)
                });
            }
        });

        return {
            meta: {
                generatedAt: new Date().toISOString(),
                published: true
            },
            exams: publishedExams
        };
    };

    /**
     * 3. DOWNLOAD HANDLER
     * Triggers a browser-safe JSON download.
     */
    const triggerDownload = (data) => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'published-results.json';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    /**
     * 4. PUBLIC API: PUBLISH / UNPUBLISH
     */
    const publish = (examId = null) => {
        try {
            // Update storage if specific examId provided
            if (examId && window.ResultsManagement) {
                const results = window.ResultsManagement.getAllResults();
                if (results[examId]) {
                    results[examId].published = true;
                    // Persist change back to localStorage
                    if (window.StorageManager) window.StorageManager.set('results', results);
                }
            }

            const data = generatePublishedJSON();
            if (data.exams.length === 0) {
                alert("No exams are currently marked as 'Published'.");
                return;
            }

            triggerDownload(data);
            alert("SUCCESS: 'published-results.json' has been generated!\n\nSTEPS TO GO LIVE:\n1. Upload this file to the /data/ folder of your website.\n2. Commit and push to GitHub/Vercel.\n3. The results portal will update automatically.");
        } catch (error) {
            console.error("StaticPublisher Error:", error);
            alert("Failed to generate JSON: " + error.message);
        }
    };

    const unpublish = (examId) => {
        try {
            if (!examId || !window.ResultsManagement) return;

            const results = window.ResultsManagement.getAllResults();
            if (results[examId]) {
                results[examId].published = false;
                if (window.StorageManager) window.StorageManager.set('results', results);
            }

            // Regenerate and download updated JSON
            const data = generatePublishedJSON();
            triggerDownload(data);
            alert("UPDATED: Exam unpublished.\n\nPlease upload the NEW 'published-results.json' to /data/ and redeploy.");
        } catch (error) {
            console.error("Unpublishing Failed:", error);
            alert("Failed to unpublish: " + error.message);
        }
    };

    return {
        normalizeResults,
        generatePublishedJSON,
        publish,
        unpublish
    };
})();

// Expose globally for UI button handlers
window.StaticPublisher = StaticPublisher;
