/**
 * Antigravity Results System - Utilities
 * Includes JSON validation and error handling.
 */

export const DataValidator = {
    /**
     * Validates results JSON structure.
     * Expects: { exams: [ { examId, examName, results: [ { roll, name, total } ] } ] }
     */
    validateResults(json) {
        if (!json || typeof json !== 'object') return { valid: false, error: "Invalid JSON object" };
        if (!Array.isArray(json.exams)) return { valid: false, error: "Missing 'exams' array" };

        for (const exam of json.exams) {
            if (!exam.examId && !exam.id) return { valid: false, error: "Exam missing ID" };
            if (!exam.examName && !exam.name) return { valid: false, error: "Exam missing Name" };
            if (!Array.isArray(exam.results)) return { valid: false, error: `Exam ${exam.examName} missing 'results' array` };

            for (const result of exam.results) {
                if (result.roll === undefined) return { valid: false, error: "Result missing Roll Number" };
                if (!result.name) return { valid: false, error: "Result missing Student Name" };
                if (result.total === undefined) return { valid: false, error: "Result missing Total marks" };
            }
        }

        return { valid: true };
    }
};

export const UIUtils = {
    showToast(message, type = 'info') {
        console.log(`[Toast ${type.toUpperCase()}]: ${message}`);
        // Can be expanded to show a real UI toast
        alert(message);
    }
};
