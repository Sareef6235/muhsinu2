/**
 * ==========================================
 * EXAM PORTAL - CORE UTILITIES
 * ==========================================
 * Shared logic for:
 * - Internationalization (I18N)
 * - Result calculations (Grades, Percentages)
 * - Column classification (for Sheets sync)
 * - PDF and QR generation wrappers
 */

export const ExamPortalDict = {
    en: { name: "Name", roll: "Register No", sub: "Subject", max: "Max", obt: "Obtained", stat: "Status", tot: "Total", perc: "Percentage", grd: "Grade", res: "Result", sign: "Principal Signature" },
    mal: { name: "പേര്", roll: "രജിസ്റ്റർ നമ്പർ", sub: "വിഷയം", max: "പരമാവധി", obt: "ലഭിച്ചത്", stat: "നില", tot: "ആകെ", perc: "ശതമാനം", grd: "ഗ്രേഡ്", res: "ഫലം", sign: "പ്രിൻസിപ്പൽ" },
    ar: { name: "الاسم", roll: "رقم التسجيل", sub: "المادة", max: "الحد الأقصى", obt: "المحصلة", stat: "الحالة", tot: "المجموع", perc: "النسبة", grd: "الدرجة", res: "النتيجة", sign: "توقيع المدير" },
    ta: { name: "பெயர்", roll: "பதிவு எண்", sub: "பாடம்", max: "அதிகபட்சம்", obt: "பெற்றது", stat: "நிலை", tot: "மொத்தம்", perc: "சதவீதம்", grd: "தரம்", res: "முடிவு", sign: "முதல்வர் கையொப்பം" },
    kn: { name: "ಹೆಸರು", roll: "ನೋಂದಣಿ ಸಂಖ್ಯೆ", sub: "ವಿಷಯ", max: "ಗರಿಷ್ಠ", obt: "ಗಳಿಸಿದ", stat: "ಸ್ಥಿತಿ", tot: "ಒಟ್ಟು", perc: "ಶೇಕಡಾವಾರು", grd: "ಶ್ರೇಣಿ", res: "ಫಲಿತಾಂಶ", sign: "ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ" },
    te: { name: "పేరు", roll: "రిజిస్టర్ నంబర్", sub: "విషయం", max: "గ్రేడ్", res: "ఫలితం", sign: "ప్రిన్సిపాల్ సంతకం" }, // Note: truncated in original te, keeping as is or fixing
    ur: { name: "نام", roll: "رجسٹریشن نمبر", sub: "مضمون", max: "زیادہ سے زیادہ", obt: "حاصل کردہ", stat: "حیثیت", tot: "کل", perc: "فیصد", grd: "گریڈ", res: "نتیجہ", sign: "پرنسپل کے دستخط" },
    hi: { name: "نام", roll: "पंजीकरण संख्या", sub: "विषय", max: "अधिकतम", obt: "प्राप्त", stat: "स्थिति", tot: "कुल", perc: "प्रतिशत", grd: "श्रेणी", res: "परिणाम", sign: "प्रधानाचार्य" }
};

export const ExamPortalUtils = {
    /**
     * Normalize header for comparison
     */
    normalizeHeader(h) {
        if (!h) return '';
        return h.toString()
            .toLowerCase()
            .replace(/['\s\-_]/g, '')
            .trim();
    },

    /**
     * Calculate grade based on percentage
     */
    calculateGrade(percentage, isPass = true) {
        if (!isPass) return 'F';
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C+';
        if (percentage >= 40) return 'C';
        return 'D';
    },

    /**
     * Calculate percentage
     */
    calculatePercentage(obtained, max) {
        if (!max || max === 0) return 0;
        return Number(((obtained / max) * 100).toFixed(2));
    },

    /**
     * Determine pass/fail status
     */
    calculateStatus(subjects, passMark = 35) {
        const marks = Object.values(subjects);
        if (marks.length === 0) return 'Absent';

        const hasFailed = marks.some(m => {
            const val = Number(m);
            return !isNaN(val) && val < passMark && val > 0;
        });

        const allZero = marks.every(m => Number(m) === 0);
        if (allZero) return 'Absent';

        return hasFailed ? 'Fail' : 'Pass';
    },

    /**
     * Generate QR Code (Wrapper for QRCode.js)
     */
    generateQR(elementId, text, size = 80) {
        const el = document.getElementById(elementId);
        if (!el || typeof QRCode === 'undefined') return;

        el.innerHTML = "";
        new QRCode(el, {
            text: text,
            width: size,
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    },

    /**
     * patterns for classifying columns
     */
    PATTERNS: {
        IDENTITY: {
            roll: ['rollno', 'roll', 'rollnumber', 'regno', 'registerno', 'registernumber', 'admissionno', 'admissionnumber', 'studentid', 'idno', 'id'],
            name: ['studentname', 'name', 'candidatename', 'fullname', 'student'],
            dob: ['dob', 'dateofbirth', 'birthdate'],
            status: ['status', 'result', 'passfail', 'resultstatus']
        },
        METADATA: [
            'class', 'section', 'batch', 'group', 'division', 'stream', 'year', 'semester',
            'total', 'grade', 'rank', 'percentage', 'remark', 'remarks', 'comment', 'comments',
            'exam', 'examname', 'examtype'
        ]
    },

    /**
     * Classify a column header
     */
    classifyColumn(header, sampleValue = '') {
        const normalized = this.normalizeHeader(header);
        if (!normalized) return { type: 'unknown', field: null };

        // 1. Check Identity
        for (const [field, patterns] of Object.entries(this.PATTERNS.IDENTITY)) {
            if (patterns.some(p => normalized === p || normalized.includes(p))) {
                return { type: 'identity', field: field };
            }
        }

        // 2. Check Metadata
        if (this.PATTERNS.METADATA.some(p => normalized === p || normalized.includes(p))) {
            return { type: 'metadata', field: normalized };
        }

        // 3. Subject Heuristic
        return { type: 'subject', field: header };
    },

    /**
     * Download PDF Wrapper (Wrapper for html2pdf.js)
     */
    downloadPDF(elementId, filename) {
        const element = document.getElementById(elementId);
        if (!element || typeof html2pdf === 'undefined') return;

        html2pdf().set({
            margin: 10,
            filename: filename || `Result_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(element).save();
    }
};

// Also export as global if needed for non-module scripts
if (typeof window !== 'undefined') {
    window.ExamPortalDict = ExamPortalDict;
    window.ExamPortalUtils = ExamPortalUtils;
}
