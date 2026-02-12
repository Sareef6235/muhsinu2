/**
 * form-wizard.js
 * Professional Multi-Step Form Engine
 */

class FormWizard {
    constructor(config = {}) {
        this.config = {
            containerId: 'wizard-container',
            stepClass: 'form-step',
            activeClass: 'active',
            storageKey: 'wizard_progress',
            onStepChange: null,
            validate: true,
            persist: true,
            ...config
        };

        this.currentStep = 1;
        this.steps = document.querySelectorAll(`.${this.config.stepClass}`);
        this.totalSteps = this.steps.length;

        this.init();
    }

    init() {
        if (this.config.persist) {
            this.restoreState();
        }
        this.updateUI();
        this.bindGlobal();
    }

    bindGlobal() {
        // Expose to window for inline onclick handlers
        window.nextStep = (step) => this.goToStep(step);
        window.prevStep = () => this.goToStep(this.currentStep - 1);
    }

    async goToStep(targetStep) {
        if (targetStep > this.currentStep) {
            // Validate current step before proceeding
            if (this.config.validate && !this.validateCurrentStep()) {
                console.warn('Validation failed for step', this.currentStep);
                return;
            }
        }

        if (targetStep < 1 || targetStep > this.totalSteps) return;

        // Animate Out
        const currentEl = document.querySelector(`.${this.config.stepClass}.${this.config.activeClass}`);
        if (currentEl) {
            currentEl.style.opacity = '0';
            currentEl.style.transform = 'translateY(-10px)';
        }

        // Delay for animation
        setTimeout(() => {
            this.currentStep = targetStep;
            this.updateUI();

            if (this.config.persist) {
                this.saveState();
            }

            if (this.config.onStepChange) {
                this.config.onStepChange(this.currentStep);
            }
        }, 300);
    }

    validateCurrentStep() {
        const currentStepEl = this.steps[this.currentStep - 1];
        const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            // Clear previous errors
            this.clearError(input);

            if (!input.value.trim()) {
                this.showError(input, 'This field is required');
                isValid = false;
            } else if (input.type === 'email' && !this.isValidEmail(input.value)) {
                this.showError(input, 'Invalid email address');
                isValid = false;
            }
        });

        return isValid;
    }

    showError(input, msg) {
        input.classList.add('input-error');
        const error = document.createElement('span');
        error.className = 'error-message';
        error.textContent = msg;
        input.parentNode.appendChild(error);
    }

    clearError(input) {
        input.classList.remove('input-error');
        const err = input.parentNode.querySelector('.error-message');
        if (err) err.remove();
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    updateUI() {
        this.steps.forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add(this.config.activeClass);
                step.style.display = 'block';
                // Trigger reflow for animation
                void step.offsetWidth;
                step.style.opacity = '1';
                step.style.transform = 'translateY(0)';
            } else {
                step.classList.remove(this.config.activeClass);
                step.style.display = 'none';
            }
        });

        // Update progress tracker if exists
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach((p, idx) => {
            const stepNum = idx + 1;
            p.classList.remove('active', 'completed');
            if (stepNum === this.currentStep) p.classList.add('active');
            if (stepNum < this.currentStep) p.classList.add('completed');
        });
    }

    saveState() {
        const formData = {};
        const allInputs = document.querySelectorAll(`.${this.config.stepClass} input, .${this.config.stepClass} select`);

        allInputs.forEach(input => {
            if (input.id) formData[input.id] = input.value;
        });

        const state = {
            currentStep: this.currentStep,
            data: formData
        };
        localStorage.setItem(this.config.storageKey, JSON.stringify(state));
    }

    restoreState() {
        const saved = localStorage.getItem(this.config.storageKey);
        if (!saved) return;

        try {
            const state = JSON.parse(saved);
            this.currentStep = state.currentStep || 1;

            // Restore input values
            Object.keys(state.data || {}).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = state.data[id];
            });
        } catch (e) {
            console.error('Failed to restore wizard state', e);
        }
    }

    reset() {
        localStorage.removeItem(this.config.storageKey);
        location.reload();
    }
}

// Export for module use
export default FormWizard;
