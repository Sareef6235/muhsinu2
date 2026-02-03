/**
 * FORMINATOR PLUGIN
 * Advanced form builder with validation
 */

window.Forminator = {
    version: '1.0.0',

    init() {
        console.log('📋 Forminator initialized');
        this.scanForms();
    },

    scanForms() {
        document.querySelectorAll('.forminator-custom-form').forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        });
    },

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        // Mock validation
        let valid = true;
        form.querySelectorAll('input[required]').forEach(input => {
            if (!input.value) {
                valid = false;
                input.style.borderColor = 'red';
            }
        });

        if (valid) {
            alert('Form submitted successfully!');
            form.reset();
        } else {
            alert('Please fill all required fields.');
        }
    }
};

export default window.Forminator;
