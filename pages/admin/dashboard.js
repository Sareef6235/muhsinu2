/**
 * ADMIN STATIC PUBLISHER
 * Generates published-results.json for static hosting deployment
 */
const StaticPublisher = (() => {
    'use strict';

    const publish = () => {
        try {
            // 1. Get all results from ResultsManagement/StorageManager
            // ResultsManagement stores data as results[schoolId][examId]
            const allResults = window.ResultsManagement ? window.ResultsManagement.getAllResults() : {};
            const examsMeta = window.ExamManager ? window.ExamManager.getAll() : [];
            const activeSchoolId = window.SchoolManager ? window.SchoolManager.getActiveSchool() : 'default';

            const schoolResults = allResults[activeSchoolId] || allResults; // Handle potential structure variation

            const publishedExams = [];

            // 2. Filter and Map published exams
            Object.keys(schoolResults).forEach(examId => {
                const examNode = schoolResults[examId];

                // Only include if marked as published
                if (examNode && examNode.published && Array.isArray(examNode.data)) {
                    const meta = examsMeta.find(e => e.id === examId);

                    publishedExams.push({
                        examId: examId,
                        examName: meta ? meta.name : (examNode.name || "Unnamed Exam"),
                        results: examNode.data.map(r => ({
                            roll: String(r.rollNo || r.roll).trim(),
                            name: r.name,
                            total: r.totalMarks || r.total
                        }))
                    });
                }
            });

            if (publishedExams.length === 0) {
                alert("No exams are currently marked as 'Published'. Please sync and publish at least one exam first.");
                return;
            }

            // 3. Generate JSON
            const output = {
                exams: publishedExams,
                generatedAt: new Date().toISOString(),
                schoolId: activeSchoolId
            };

            const jsonString = JSON.stringify(output, null, 2);

            // 4. Trigger Download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'published-results.json';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // 5. Instruction Message
            alert("SUCCESS: published-results.json has been generated!\n\nSTEPS TO GO LIVE:\n1. Upload this file to the /data/ folder of your website.\n2. Commit and push to GitHub/Vercel.\n3. The results portal will update automatically.");

        } catch (error) {
            console.error("StaticPublisher Error:", error);
            alert("Failed to generate JSON: " + error.message);
        }
    };

    return { publish };
})();

// Expose to window
window.StaticPublisher = StaticPublisher;
