/**
 * certificate-engine.js
 * Generates professional A4 certificates using pure CSS @media print.
 * No external libraries used.
 */
const CertificateEngine = {
    /**
     * Generate and trigger printing of a certificate
     * @param {Object} studentData - Result record
     * @param {Object} schoolData - active school config
     */
    printTemplate(student, school = {}) {
        const printWindow = window.open('', '_blank');
        const schoolName = school.name || 'MIFTHAHUL HUDA ACADEMY';
        const logoHtml = school.logo ? `<img src="${school.logo}" class="school-logo">` : '';

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Certificate - ${student.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #000;
            --secondary: #666;
            --border: #ddd;
        }
        @page { size: A4; margin: 0; }
        body { margin: 0; padding: 0; font-family: 'Outfit', sans-serif; color: var(--primary); }
        
        .certificate-container {
            width: 210mm;
            height: 297mm;
            padding: 20mm;
            box-sizing: border-box;
            position: relative;
            background: #fff;
            border: 15mm solid #f8f8f8;
        }

        .inner-border {
            border: 1px solid #000;
            height: 100%;
            padding: 10mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            text-align: center;
        }

        .header { margin-bottom: 20px; }
        .school-logo { max-height: 80px; margin-bottom: 10px; }
        .school-name { 
            font-family: 'Playfair Display', serif; 
            font-size: 28pt; 
            margin: 0; 
            text-transform: uppercase; 
        }
        .school-address { font-size: 10pt; color: var(--secondary); margin-top: 5px; }

        .cert-title {
            font-size: 32pt;
            font-weight: 700;
            margin: 30px 0;
            letter-spacing: 2px;
            color: #000;
        }

        .cert-body { font-size: 14pt; line-height: 1.6; margin-bottom: 40px; }
        .student-name { 
            display: block; 
            font-size: 36pt; 
            font-family: 'Playfair Display', serif; 
            text-decoration: underline; 
            margin: 15px 0;
        }

        .marks-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            text-align: left;
        }
        .marks-table th { background: #eee; border: 1px solid #000; padding: 8px 12px; font-size: 10pt; }
        .marks-table td { border: 1px solid #000; padding: 8px 12px; font-size: 11pt; }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 20px;
        }
        .summary-item { border: 1px solid #000; padding: 10px; }
        .summary-label { font-size: 8pt; text-transform: uppercase; display: block; margin-bottom: 5px; }
        .summary-value { font-size: 16pt; font-weight: 700; }

        .footer-signatures {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            padding: 0 40px;
            padding-bottom: 20px;
        }
        .sig-box { text-align: center; width: 150px; }
        .sig-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; font-size: 10pt; }

        @media print {
            .certificate-container { border: none; }
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="inner-border">
            <div class="header">
                ${logoHtml}
                <h1 class="school-name">${schoolName}</h1>
                <div class="school-address">${school.address || ''}</div>
            </div>

            <div class="cert-title">STATEMENT OF RESULTS</div>

            <div class="cert-body">
                This is to certify that accurately reflects the academic performance of
                <span class="student-name">${student.name}</span>
                (Roll No: <b>${student.rollNo}</b>) in the <b>${student.exam}</b> exam.
            </div>

            <table class="marks-table">
                <thead>
                    <tr>
                        <th>SUBJECT</th>
                        <th>MARKS OBTAINED</th>
                        <th>REMARKS</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(student.subjects || {}).map(([sub, mark]) => `
                        <tr>
                            <td>${sub}</td>
                            <td>${mark}</td>
                            <td>-</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="summary-grid">
                <div class="summary-item">
                    <span class="summary-label">Total Marks</span>
                    <span class="summary-value">${student.totalMarks}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Grade</span>
                    <span class="summary-value">${student.grade || '-'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Result Status</span>
                    <span class="summary-value">${student.status.toUpperCase()}</span>
                </div>
            </div>

            <div class="footer-signatures">
                <div class="sig-box">
                    <div class="sig-line">Class Teacher</div>
                </div>
                <div class="sig-box">
                    <div class="sig-line">Principal</div>
                </div>
            </div>
        </div>
    </div>
    <script>
        window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
        };
    </script>
</body>
</html>`;

        printWindow.document.write(html);
        printWindow.document.close();
    }
};

window.CertificateEngine = CertificateEngine;
export default CertificateEngine;
