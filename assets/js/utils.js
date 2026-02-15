/**
 * Antigravity Results System - Utilities
 * Includes JSON validation and error handling.
 */

export const DataValidator = {
    /**
     * Strict Schema Definition
     */
    schema: {
        requiredStudentFields: ['roll', 'name', 'total']
    },

    /**
     * Validates results JSON structure.
     */
    validateResults(json) {
        if (!json || typeof json !== 'object') return { valid: false, error: "Invalid JSON object" };
        if (!Array.isArray(json.exams)) return { valid: false, error: "Missing 'exams' array" };

        for (const exam of json.exams) {
            if (!exam.examId && !exam.id) return { valid: false, error: "Exam missing ID" };
            if (!exam.examName && !exam.name) return { valid: false, error: "Exam missing Name" };
            if (!Array.isArray(exam.results)) return { valid: false, error: `Exam ${exam.examName || 'unknown'} missing 'results' array` };

            for (const result of exam.results) {
                if (result.roll === undefined) return { valid: false, error: "Result missing Roll Number" };
                if (!result.name) return { valid: false, error: "Result missing Student Name" };
                if (result.total === undefined) return { valid: false, error: "Result missing Total marks" };

                // Type checking
                if (isNaN(parseFloat(result.total))) {
                    return { valid: false, error: `Invalid marks for student ${result.name}: Marks must be numeric.` };
                }
            }
        }

        return { valid: true };
    }
};

export const UIUtils = {
    showToast(message, type = 'info') {
        console.log(`[Toast ${type.toUpperCase()}]: ${message}`);

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `site-toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="ph-bold ${type === 'success' ? 'ph-check-circle' : 'ph-info'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Style (inline to avoid main.css dependency if not yet loaded)
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            padding: '15px 25px',
            background: type === 'success' ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 243, 255, 0.9)',
            color: '#000',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: '10000',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: 'translateY(100px)',
            opacity: '0'
        });

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
