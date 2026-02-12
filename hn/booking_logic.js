// Booking Form Price Calculator
const subjectRadios = document.querySelectorAll('input[name="subject"]');
const classRadios = document.querySelectorAll('input[name="class"]');
const totalPriceEl = document.getElementById('total-price');

function calculatePrice() {
    let subjectPrice = 0;
    let classMultiplier = 1;

    // Base prices for subjects
    const subjectPrices = {
        'Malayalam': 500,
        'Arabic': 600,
        'Maths': 700
    };

    // Get selected subject
    const selectedSubject = document.querySelector('input[name="subject"]:checked');
    if (selectedSubject) {
        subjectPrice = subjectPrices[selectedSubject.value] || 0;
    }

    // Get selected class (simplified multiplier logic)
    // 1-5: 1x, 6-10: 1.2x, +1/+2: 1.5x
    const selectedClass = document.querySelector('input[name="class"]:checked');
    if (selectedClass) {
        const classVal = selectedClass.value;
        if (classVal === '+1' || classVal === '+2') {
            classMultiplier = 1.5;
        } else if (parseInt(classVal) >= 6) {
            classMultiplier = 1.2;
        }
    }

    const total = Math.round(subjectPrice * classMultiplier);
    totalPriceEl.textContent = `₹${total}`;
}

subjectRadios.forEach(radio => radio.addEventListener('change', calculatePrice));
classRadios.forEach(radio => radio.addEventListener('change', calculatePrice));
