/**
 * RESULTS PUBLISHER - Static JSON Generator
 * Generates published-results.json based on ResultsManagement data.
 */
const ResultsPublisher = {
    publish() {
        // 1. Collect Data from existing ResultsManagement module
        if (!window.ResultsManagement || typeof window.ResultsManagement.getPublishedData !== 'function') {
            console.error("ResultsManagement module not found or missing getPublishedData method.");
            alert("Error: Admin Sync Module failed. Please reload the dashboard.");
            return;
        }

        const examsData = ResultsManagement.getPublishedData();

        if (!examsData || examsData.length === 0) {
            alert("Warning: No published exams found. Ensure you have synced and checked 'Published' for at least one exam.");
            return;
        }

        // 2. Map to the EXACT JSON Structure required
        const payload = {
            exams: examsData.map(exam => ({
                examId: exam.examId,
                examName: exam.examName,
                results: exam.results.map(r => ({
                    roll: String(r.roll).trim(),
                    name: r.name,
                    total: parseInt(r.total) || 0
                }))
            })),
            generatedAt: new Date().toISOString()
        };

        // 3. Convert to JSON String
        const jsonContent = JSON.stringify(payload, null, 2);

        // 4. Trigger Automatic Download (Browser-safe)
        try {
            const blob = new Blob([jsonContent], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "published-results.json";

            // Append to body and click (Defensive for some browsers)
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);

            // 5. Success Feedback
            console.log("JSON Generated Successfully:", payload.exams.length, "exams.");
            alert(`SUCCESS!\n\n/data/published-results.json has been generated.\n\nNow upload this file to your /data folder on GitHub/Vercel.`);

        } catch (error) {
            console.error("Download Failed:", error);
            alert("Failed to trigger download. Check console for technical logs.");
        }
    }
};

// Expose to window for dashboard.html onclick attributes
window.ResultsPublisher = ResultsPublisher;
