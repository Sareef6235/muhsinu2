document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Booking Modal Logic
    const bookingLinks = document.querySelectorAll('a[href="#booking"]');
    const bookingModal = document.querySelector('.dialog-lightbox-message');
    const bookingModalInner = document.querySelector('.elementor-location-popup');

    if (bookingModal && bookingModalInner) {
        bookingLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                bookingModal.style.display = 'flex';
                bookingModalInner.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            });
        });

        // Close when clicking outside content
        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                bookingModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });

        // Ensure inner Elementor popup is visible when parent is shown
        if (bookingModal.style.display !== 'none') {
            bookingModalInner.style.display = 'block';
        }
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Dropdown Toggle on Mobile
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });

    // Close menu when clicking a link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (!item.classList.contains('dropdown-toggle')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    });

    // Creating a placeholder assets folder if not exists logic is handled by tool creation usually, 
    // but here we just ensure JS is ready.
    // Contact Form Handling (Now handled in index.html for Google Forms)

    // Tuition Booking Logic (Checkboxes + UPI)
    const tuitionForm = document.getElementById('tuition-form');
    const totalPriceEl = document.getElementById('g-total-price');
    const classRadios = document.querySelectorAll('#g-class-radios input[name="class"]');
    const sessionsList = document.getElementById('sessions-list');
    const maxSubjects = 8;

    function calculateTotal() {
        if (!totalPriceEl) return 0;
        let subjectTotal = 0;
        let multiplier = 1;

        const checkedCbs = document.querySelectorAll('#g-subject-checkboxes input[type="checkbox"]:checked');
        checkedCbs.forEach(cb => {
            subjectTotal += parseInt(cb.dataset.price) || 0;
        });

        const selectedClass = document.querySelector('#g-class-radios input[name="class"]:checked');
        if (selectedClass) {
            multiplier = parseFloat(selectedClass.dataset.multiplier) || 1;
        }

        const total = Math.round(subjectTotal * multiplier);
        totalPriceEl.textContent = "₹" + total;
        return total;
    }

    if (tuitionForm) {
        classRadios.forEach(radio => {
            radio.addEventListener('change', calculateTotal);
        });

        // Also listen to checkboxes for price update
        const checkboxes = document.querySelectorAll('#g-subject-checkboxes input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', calculateTotal);
        });

        tuitionForm.addEventListener("submit", async (e) => {
            const checkedSubjects = Array.from(document.querySelectorAll('#g-subject-checkboxes input[type="checkbox"]:checked'));
            const selectedClass = document.querySelector('#g-class-radios input[name="class"]:checked');
            const firstName = document.getElementById('g-fname').value;
            const lastName = document.getElementById('g-lname').value;
            const email = document.getElementById('g-email').value;

            if (checkedSubjects.length === 0) {
                e.preventDefault();
                alert("കുറഞ്ഞത് ഒരു subject എങ്കിലും select ചെയ്യണം");
                return;
            }

            const subjectsList = checkedSubjects.map(cb => cb.value.split(' (₹')[0]);
            const amount = calculateTotal();

            // Populate Hidden Google Form Fields
            document.getElementById('g-booking-subjects-hidden').value = checkedSubjects.map(cb => cb.value).join(", ");
            document.getElementById('g-booking-class-hidden').value = selectedClass.value;
            document.getElementById('g-booking-price-hidden').value = "₹" + amount;

            // 1. Write to Firestore asynchronously
            if (window.db && window.firestoreUtils) {
                try {
                    const { collection, addDoc, serverTimestamp } = window.firestoreUtils;
                    await addDoc(collection(window.db, "bookings"), {
                        firstName,
                        lastName,
                        email,
                        subjects: subjectsList,
                        class: selectedClass.value,
                        total: amount,
                        createdAt: serverTimestamp()
                    });
                    console.log("Booking saved to Firestore ✅");
                } catch (err) {
                    console.error("Firestore Save Error:", err);
                }
            }

            // Success feedback
            alert("Booking Submitted Successfully! We will contact you soon.");

            // Allow Google Form submission via iframe to proceed
            window.submitted = true;

            // Reset after delay
            setTimeout(() => {
                tuitionForm.reset();
                if (totalPriceEl) totalPriceEl.textContent = '₹0';
                const dialog = document.querySelector('.dialog-lightbox-message');
                if (dialog) {
                    dialog.style.display = 'none';
                    document.body.style.overflow = '';
                }
            }, 1000);
        });
    }

    // Global Modal Functions
    window.closeBookingModal = function () {
        document.getElementById('booking-modal').classList.remove('active');
    };

    function saveSession(session) {
        let sessions = JSON.parse(localStorage.getItem('madrasa_sessions')) || [];
        sessions.unshift(session);
        localStorage.setItem('madrasa_sessions', JSON.stringify(sessions));
        renderSessions();
    }

    function renderSessions() {
        if (!sessionsList) return;
        const sessions = JSON.parse(localStorage.getItem('madrasa_sessions')) || [];
        if (sessions.length === 0) {
            sessionsList.innerHTML = '<p class="no-sessions">No sessions booked yet.</p>';
            return;
        }
        sessionsList.innerHTML = sessions.map(s => `
            <div class="session-card">
                <h4>${s.subject} Session</h4>
                <p><strong>Student:</strong> ${s.name}</p>
                <p><strong>Class:</strong> ${s.class} | <strong>Date:</strong> ${s.date}</p>
                <p class="price"><strong>Paid:</strong> ${s.price} via ${s.method}</p>
            </div>
        `).join('');
    }

    renderSessions();
    console.log("Madrasa Website Loaded");
});
