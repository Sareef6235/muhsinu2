/**
 * booking_logic.js
 * Professional Booking Submission System
 */
import StorageManager from './storage-manager.js';

const BookingSystem = {
    CONFIG: {
        STORAGE_KEY: 'site_bookings',
        BASE_PRICES: {
            'Malayalam': 500,
            'Arabic': 600,
            'Maths': 700
        }
    },

    init() {
        this.form = document.getElementById('bookingForm');
        this.totalPriceEl = document.getElementById('total-price');
        this.submitBtn = this.form?.querySelector('button[type="submit"]');

        if (!this.form) return;

        this.bindEvents();
        this.calculatePrice(); // Initial calc
    },

    bindEvents() {
        // Price triggers
        this.form.querySelectorAll('input[name="subject"], input[name="class"]').forEach(input => {
            input.addEventListener('change', () => this.calculatePrice());
        });

        // Submit handler
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    calculatePrice() {
        if (!this.totalPriceEl) return;

        let subjectPrice = 0;
        let classMultiplier = 1;

        const selectedSubject = this.form.querySelector('input[name="subject"]:checked');
        if (selectedSubject) {
            subjectPrice = this.CONFIG.BASE_PRICES[selectedSubject.value] || 0;
        }

        const selectedClass = this.form.querySelector('input[name="class"]:checked');
        if (selectedClass) {
            const classVal = selectedClass.value;
            if (['+1', '+2'].includes(classVal)) {
                classMultiplier = 1.5;
            } else if (parseInt(classVal) >= 6) {
                classMultiplier = 1.2;
            }
        }

        const total = Math.round(subjectPrice * classMultiplier);
        this.totalPriceEl.textContent = `₹${total}`;
        this.currentTotal = total;
    },

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        // 1. Validation
        if (!this.validateForm()) return;

        // 2. Loading State
        this.setLoading(true);

        // 3. Collect Data
        const formData = new FormData(this.form);
        const bookingData = {
            id: `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date().toISOString(),
            status: 'pending',
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            class: formData.get('class'),
            subject: formData.get('subject'),
            total: this.currentTotal
        };

        // 4. Persistence
        try {
            const existing = StorageManager.get(this.CONFIG.STORAGE_KEY, []);

            // Check for duplicate (same email + subject in last 30 mins)
            const isDuplicate = existing.some(b =>
                b.email === bookingData.email &&
                b.subject === bookingData.subject &&
                (Date.now() - new Date(b.timestamp).getTime() < 30 * 60 * 1000)
            );

            if (isDuplicate) {
                throw new Error('A similar booking was recently submitted. Please wait before trying again.');
            }

            existing.push(bookingData);
            StorageManager.set(this.CONFIG.STORAGE_KEY, existing);

            // 5. Success UI
            this.showSuccess(bookingData);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    },

    validateForm() {
        let isValid = true;
        this.clearErrors();

        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.markError(field, 'Required field');
                isValid = false;
            }
        });

        const email = this.form.querySelector('input[type="email"]');
        if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            this.markError(email, 'Invalid email format');
            isValid = false;
        }

        const phone = this.form.querySelector('input[name="phone"]');
        if (phone && phone.value && !/^\d{10,12}$/.test(phone.value.replace(/\D/g, ''))) {
            this.markError(phone, 'Invalid phone number (10-12 digits)');
            isValid = false;
        }

        return isValid;
    },

    setLoading(loading) {
        this.isSubmitting = loading;
        if (!this.submitBtn) return;

        this.submitBtn.disabled = loading;
        if (loading) {
            this.originalBtnContent = this.submitBtn.innerHTML;
            this.submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
        } else {
            this.submitBtn.innerHTML = this.originalBtnContent;
        }
    },

    markError(field, msg) {
        field.classList.add('input-error');
        const err = document.createElement('div');
        err.className = 'error-feedback';
        err.textContent = msg;
        field.parentNode.appendChild(err);
    },

    clearErrors() {
        this.form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        this.form.querySelectorAll('.error-feedback').forEach(el => el.remove());
    },

    showSuccess(data) {
        const container = this.form.parentNode;
        container.innerHTML = `
            <div class="success-card animate-fade-in">
                <i class="ph-bold ph-check-circle" style="font-size: 4rem; color: #00ffa3;"></i>
                <h2>Booking Confirmed!</h2>
                <p>Thank you, <strong>${data.name}</strong>. Your request has been received.</p>
                <div class="booking-id">ID: ${data.id}</div>
                <div style="margin-top: 20px; color: #888; font-size: 0.9rem;">
                    Status: <span style="color: #ffaa00;">Pending Verification</span>
                </div>
                <button onclick="location.reload()" class="btn-outline" style="margin-top: 30px;">
                    Make Another Booking
                </button>
            </div>
        `;
    },

    showError(msg) {
        alert(msg); // Simplified for this demo
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => BookingSystem.init());

export default BookingSystem;
