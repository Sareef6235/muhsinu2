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

    // Tuition Booking Logic
    // Tuition Booking Logic (Checkboxes + UPI)
    const tuitionForm = document.getElementById('tuition-form');
    const totalPriceDisplay = document.getElementById('total-price');
    const subjectCheckboxes = document.querySelectorAll('#subject-checkboxes input[type="checkbox"]');
    const classRadios = document.querySelectorAll('input[name="class"]');
    const totalPriceEl = document.getElementById('total-price');
    const sessionsList = document.getElementById('sessions-list');
    const maxSubjects = 8;

    function calculateTotal() {
        if (!totalPriceEl) return 0;
        let subjectTotal = 0;
        let multiplier = 1;

        const checkedCbs = document.querySelectorAll('#subject-checkboxes input[type="checkbox"]:checked');
        checkedCbs.forEach(cb => {
            subjectTotal += parseInt(cb.dataset.price) || 0;
        });

        const selectedClass = document.querySelector('input[name="class"]:checked');
        if (selectedClass) {
            multiplier = parseFloat(selectedClass.dataset.multiplier) || 1;
        }

        const total = Math.round(subjectTotal * multiplier);
        totalPriceEl.textContent = "₹" + total;
        return total;
    }

    function loadSubjects() {
        const subjectGrid = document.getElementById('subject-checkboxes');
        if (!subjectGrid) return;

        const subjects = JSON.parse(localStorage.getItem("subjects")) || [
            { name: "QURA'N HIFZ", value: "QURAN HIFZ", price: 800 },
            { name: "FIQH", value: "FIQH", price: 100 },
            { name: "LISAN QURA'N", value: "LISAN QURAN", price: 650 },
            { name: "AQEEDA", value: "AQEEDA", price: 550 },
            { name: "THAJVEETH", value: "THAJVEETH", price: 700 },
            { name: "THAREEKH", value: "THAREEKH", price: 500 },
            { name: "AQLAQH", value: "AQLAQH", price: 450 },
            { name: "THAFHEEMU THILAVAH", value: "THAFHEEMU THILAVAH", price: 600 },
            { name: "THAFSEER", value: "THAFSEER", price: 650 },
            { name: "DUROOS – ARABIC – MALAYALAM", value: "DUROOS ARABIC MALAYALAM", price: 700 },
            { name: "الدينيات – والأخلاق – والإملاء", value: "الدينيات والأخلاق والإملاء", price: 500, rtl: true }
        ];

        subjectGrid.innerHTML = subjects.map(s => `
            <label ${s.rtl ? 'dir="rtl"' : ''}>
                <input type="checkbox" name="subject[]" value="${s.value || s.name}" data-price="${s.price}">
                ${s.name} <span style="font-size: 0.8rem; opacity: 0.6;">(₹${s.price})</span>
            </label>
        `).join('');

        // Re-attach event listeners
        const newCheckboxes = subjectGrid.querySelectorAll('input[type="checkbox"]');
        newCheckboxes.forEach(cb => {
            cb.addEventListener('change', function () {
                const checkedCount = subjectGrid.querySelectorAll('input[type="checkbox"]:checked').length;
                if (checkedCount > maxSubjects) {
                    this.checked = false;
                    alert("Maximum 8 subjects മാത്രം select ചെയ്യാം");
                    return;
                }
                calculateTotal();
            });
        });
    }

    if (tuitionForm) {
        loadSubjects();

        classRadios.forEach(radio => {
            radio.addEventListener('change', calculateTotal);
        });

        // Detect which button was clicked
        let submitType = "pay";
        const btnRegister = document.getElementById('btn-submit-only');
        const btnPay = document.getElementById('btn-pay-submit');

        if (btnRegister) btnRegister.addEventListener('click', () => submitType = "register");
        if (btnPay) btnPay.addEventListener('click', () => submitType = "pay");

        // Single Form URL for all bookings
        const BOOKING_FORM_URL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfzhjNS8F_8_BvbwYFFZMxqfmdJqMTJx2rik6C29szqPPc9EA/formResponse";

        tuitionForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const fname = document.getElementById('fname').value;
            const lname = document.getElementById('lname').value;
            const email = document.getElementById('email').value;
            const amount = calculateTotal();
            const checkedSubjects = Array.from(document.querySelectorAll('#subject-checkboxes input[type="checkbox"]:checked'));
            const selectedClass = document.querySelector('input[name="class"]:checked');

            if (checkedSubjects.length === 0) {
                alert("കുറഞ്ഞത് ഒരു subject എങ്കിലും select ചെയ്യണം");
                return;
            }

            const subjectsText = checkedSubjects.map(cb => cb.value).join(", ");

            // Populate Hidden Google Form Fields
            document.getElementById('booking-subjects-hidden').value = subjectsText;
            document.getElementById('booking-class-hidden').value = selectedClass.value;
            document.getElementById('booking-price-hidden').value = "₹" + amount;

            if (submitType === "register") {
                // Flow 1: Just Register (No Payment)
                tuitionForm.action = BOOKING_FORM_URL;
                tuitionForm.submit();
                alert("Registration Successful! We will contact you soon.");
                tuitionForm.reset();
                totalPriceEl.textContent = '₹0';
            } else {
                // Flow 2: Pay & Book (Show Modal First)
                tuitionForm.action = BOOKING_FORM_URL;

                document.getElementById('modal-name').textContent = `${fname} ${lname}`;
                document.getElementById('modal-subjects').textContent = subjectsText;
                document.getElementById('modal-class').textContent = selectedClass.value;
                document.getElementById('modal-price').textContent = "₹" + amount;

                const modal = document.getElementById('booking-modal');
                const modalPayBtn = document.getElementById('modal-pay-btn');

                modal.classList.add('active');

                modalPayBtn.onclick = () => {
                    const sessionData = {
                        id: Date.now(),
                        name: `${fname} ${lname}`,
                        subject: subjectsText,
                        class: selectedClass.value,
                        price: "₹" + amount,
                        method: "UPI (Paid)",
                        date: new Date().toLocaleDateString()
                    };
                    saveSession(sessionData);

                    tuitionForm.submit();

                    const upiId = "mmuhsinu2-1@okaxis";
                    const payeeName = "Mo Mhn";
                    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent("Tuition Fee - " + subjectsText)}`;

                    window.location.href = upiUrl;

                    modal.classList.remove('active');
                    tuitionForm.reset();
                    totalPriceEl.textContent = '₹0';
                };
            }
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
