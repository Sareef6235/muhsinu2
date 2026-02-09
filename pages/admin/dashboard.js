/**
 * RESULTS PUBLISHER - Static JSON Generator
 * Generates published-results.json for manual upload to /data folder.
 */
const ResultsPublisher = {
    publish() {
        // 1. Collect published exams from ResultsManagement
        if (!window.ResultsManagement) {
            alert("ResultsManagement module not found.");
            return;
        }

        const exams = ResultsManagement.getPublishedData();

        if (!exams || exams.length === 0) {
            alert("No published exams found. Please sync and publish at least one exam first.");
            return;
        }

        // 2. Generate JSON structure
        const payload = {
            exams: exams.map(exam => ({
                examId: exam.examId,
                examName: exam.examName,
                results: exam.results.map(r => ({
                    roll: String(r.roll).trim(),
                    name: r.name,
                    total: r.total
                }))
            })),
            lastUpdated: new Date().toISOString()
        };

        // 3. Convert to JSON
        const json = JSON.stringify(payload, null, 2);

        // 4. Auto-download as published-results.json
        try {
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "published-results.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);

            // 5. UI feedback
            alert("SUCCESS: published-results.json has been generated.\n\nIMPORTANT NEXT STEPS:\n1. Move the downloaded file to the '/data' folder in your project.\n2. Commit and Push to GitHub/Vercel to update the public portal.");
        } catch (error) {
            console.error("Publishing Failed:", error);
            alert("Failed to generate JSON file. Check console for details.");
        }
    }
};

// Global expose
window.ResultsPublisher = ResultsPublisher;
