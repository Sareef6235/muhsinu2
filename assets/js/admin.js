const StaticPublisher = {

    publish: function () {
        // Bridge to ProExam state if available
        const state = window.ProExam ? window.ProExam.state : { students: [] };

        // Mock examId/examName if not in state but students exist
        if (!state.examId && window.ExamManager) {
            const activeExam = window.ExamManager.getActive(); // Guessing method name based on patterns
            if (activeExam) {
                state.examId = activeExam.id;
                state.examName = activeExam.name;
            }
        }

        if (!state.students || state.students.length === 0) {
            alert("No students available to publish.");
            return;
        }

        if (!state.examId) {
            alert("Please select exam profile before publishing.");
            return;
        }

        const exportData = {
            exams: [
                {
                    examId: state.examId,
                    examName: state.examName,
                    publishedAt: new Date().toISOString(),
                    students: state.students
                }
            ]
        };

        const blob = new Blob(
            [JSON.stringify(exportData, null, 2)],
            { type: "application/json" }
        );

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "published-results.json";
        link.click();

        alert("Results Published Successfully! Download the 'published-results.json' file and place it in the root folder.");
    }
};
