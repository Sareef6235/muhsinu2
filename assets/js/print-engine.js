/**
 * print-engine.js
 * Manages dynamic result templates and PDF generation (Native Browser Print)
 */

window.PrintEngine = {
    templates: [
        { id: 'modern', name: 'Standard Card', class: 'tpl-modern' },
        { id: 'certificate', name: 'Official Certificate', class: 'tpl-certificate' },
        { id: 'classic', name: 'Classic Academic', class: 'tpl-classic' }
    ],

    currentTemplate: 'certificate',
    currentData: null,

    init(data) {
        this.currentData = data;
        return this;
    },

    setTemplate(id) {
        this.currentTemplate = id;
        this.render();
    },

    render() {
        const container = document.getElementById('print-area-content');
        if (!container || !this.currentData) return;

        // Set Class for CSS Styling
        document.body.setAttribute('data-print-template', this.currentTemplate);

        // Generate HTML
        container.innerHTML = this.getTemplateHTML(this.currentTemplate, this.currentData);
    },

    getTemplateHTML(id, data) {
        // School Info (Safe Fallback)
        const activeSchool = window.SchoolManager ? window.SchoolManager.getActive() : null;
        const schoolName = activeSchool ? activeSchool.name : 'MIFTHAHUL HUDA ACADEMY';
        const schoolLogo = activeSchool && activeSchool.logo ? `<img src="${activeSchool.logo}" class="cert-logo">` : '<div class="cert-logo-placeholder">MH</div>';
        const schoolAddr = activeSchool ? activeSchool.address : 'Excellence in Education';

        const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        // Common Rows
        const marksRows = Object.entries(data.subjects || {}).map(([sub, mark]) => `
            <tr>
                <td class="col-sub">${sub}</td>
                <td class="col-mark center">${mark}</td>
                <td class="col-grade center">${this.calculateGrade(mark)}</td>
            </tr>
         `).join('');

        // CERTIFICATE TEMPLATE
        if (id === 'certificate') {
            return `
                <div class="cert-border">
                    <div class="cert-header">
                        ${schoolLogo}
                        <div class="cert-school-text">
                            <h1>${schoolName}</h1>
                            <p>${schoolAddr}</p>
                        </div>
                    </div>
                    
                    <div class="cert-title">STATEMENT OF MARKS</div>
                    
                    <div class="cert-student-info">
                        <div class="info-row">
                            <span class="label">Name of Student:</span>
                            <span class="value main">${data.name}</span>
                        </div>
                        <div class="info-grid">
                            <div class="info-row">
                                <span class="label">Roll Number:</span>
                                <span class="value">${data.rollNo}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Class/Section:</span>
                                <span class="value">${data.class || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="info-row">
                            <span class="label">Examination:</span>
                            <span class="value">${data.exam}</span>
                        </div>
                    </div>

                    <table class="cert-table">
                        <thead>
                            <tr>
                                th>SUBJECTS</th>
                                <th class="center">MARKS OBTAINED</th>
                                <th class="center">GRADE</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${marksRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td class="total-label">GRAND TOTAL</td>
                                <td class="total-val center">${data.totalMarks || '-'} / ${Object.keys(data.subjects || {}).length * 100}</td>
                                <td class="total-grade center">${data.grade || '-'}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div class="cert-summary">
                        <div class="summary-box">
                            <p>RESULT STATUS</p>
                            <h3>${(data.status || 'PASS').toUpperCase()}</h3>
                        </div>
                        <div class="summary-box rank-box">
                            <p>CLASS RANK</p>
                            <h3>${data.rank || '-'}</h3>
                        </div>
                    </div>

                    <div class="cert-footer">
                        <div class="date-sec">
                            Date of Issue: <b>${dateStr}</b>
                        </div>
                        <div class="signature-sec">
                            <div class="sign-box">
                                <div class="line"></div>
                                <p>Class Teacher</p>
                            </div>
                            <div class="sign-box">
                                <div class="line"></div>
                                <p>Principal</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="cert-watermark">OFFICIAL TRANSCRIPT</div>
                </div>
             `;
        }

        // MODERN CARD (Default Fallback)
        return `
            <div class="simple-report">
                <h2>${schoolName}</h2>
                <h3>exam Result: ${data.exam}</h3>
                <hr>
                <div class="student-details">
                    <p><b>Name:</b> ${data.name}</p>
                    <p><b>Roll No:</b> ${data.rollNo}</p>
                </div>
                <table class="simple-table">
                    <thead><tr><th>Subject</th><th>Mark</th></tr></thead>
                    <tbody>
                        ${Object.entries(data.subjects).map(([s, m]) => `<tr><td>${s}</td><td><b>${m}</b></td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="final-row">
                    Total: <b>${data.totalMarks}</b> | Grade: <b>${data.grade}</b> | Result: <b>${data.status}</b>
                </div>
                <div class="footer-note">Generated on ${dateStr}</div>
            </div>
         `;
    },

    calculateGrade(mark) {
        // Simple Utility for Mark Sheet
        const m = parseFloat(mark);
        if (isNaN(m)) return '-';
        if (m >= 90) return 'A+';
        if (m >= 80) return 'A';
        if (m >= 70) return 'B+';
        if (m >= 60) return 'B';
        if (m >= 50) return 'C+';
        if (m >= 40) return 'C';
        return 'D';
    },

    print(data) {
        this.currentData = data;
        this.render();
        window.print();
    }
};

export default PrintEngine;
