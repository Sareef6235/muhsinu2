/**
 * Analytics Engine
 * Calculates advanced metrics for teacher and subject performance.
 */
const AnalyticsEngine = (function () {
    'use strict';

    function calculate(examId) {
        // Ensure ResultsManagement is available
        if (!window.ResultsManagement) {
            console.error("ResultsManagement module not found.");
            return null;
        }

        const allResults = window.ResultsManagement.getAllResults();
        // Filter by exam
        const validResults = allResults.filter(r => r.examId === examId);

        if (validResults.length === 0) return null;

        // 1. Aggregation Map: Subject -> { totalMarks, count, passCount, topScore, scores[] }
        const map = {};

        validResults.forEach(r => {
            if (!r.subjects) return;
            Object.entries(r.subjects).forEach(([subName, mark]) => {
                const score = parseFloat(mark);
                if (isNaN(score)) return; // Skip non-numeric grades if analyzing marks

                if (!map[subName]) {
                    map[subName] = {
                        sum: 0, count: 0, pass: 0,
                        top: -1,
                        scores: [],
                        grades: { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0 }
                    };
                }

                // Stats
                map[subName].sum += score;
                map[subName].count++;
                map[subName].scores.push(score);
                if (score >= 30) map[subName].pass++; // Assuming 30 is pass
                if (score > map[subName].top) map[subName].top = score;

                // Grade Est. (Simple logic, can be customized)
                let g = 'F';
                if (score >= 90) g = 'A+';
                else if (score >= 80) g = 'A';
                else if (score >= 60) g = 'B';
                else if (score >= 40) g = 'C';
                else if (score >= 30) g = 'D';
                else g = 'E'; // or F

                // Increment grade bucket
                if (map[subName].grades[g] !== undefined) map[subName].grades[g]++;
            });
        });

        // 2. Finalize Metrics
        const metrics = Object.entries(map).map(([subject, data]) => {
            return {
                subject,
                avg: (data.sum / data.count).toFixed(1),
                passPct: ((data.pass / data.count) * 100).toFixed(1),
                top: data.top,
                count: data.count,
                grades: data.grades
            };
        });

        return metrics;
    }

    function render(examId) {
        const tbody = document.getElementById('analytics-table-body');
        const avgDisplay = document.getElementById('analytics-avg');
        const topSubDisplay = document.getElementById('analytics-top-sub');
        const lowSubDisplay = document.getElementById('analytics-low-sub');

        if (!tbody) return;

        if (!examId) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#666">Select an exam to view analysis.</td></tr>';
            return;
        }

        const data = calculate(examId);

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#666">No result data found for this exam. Sync results first.</td></tr>';
            return;
        }

        // Global Stats
        const globalAvg = (data.reduce((acc, cur) => acc + parseFloat(cur.passPct), 0) / data.length).toFixed(1);

        // Sort by Pass %
        data.sort((a, b) => parseFloat(b.passPct) - parseFloat(a.passPct));

        // Update Cards
        if (avgDisplay) avgDisplay.textContent = `${globalAvg}%`;
        if (topSubDisplay) topSubDisplay.textContent = data[0].subject;
        if (lowSubDisplay) lowSubDisplay.textContent = data[data.length - 1].subject;

        // Render Table
        tbody.innerHTML = data.map(row => {
            // Try to find teacher if mapped
            // Placeholder logic for teacher mapping
            const teacher = "N/A";

            return `
            <tr>
                <td>
                    <div style="font-weight:bold; color:white;">${row.subject}</div>
                    <div style="font-size:0.8rem; color:#888;">${teacher}</div>
                </td>
                <td>${row.avg}</td>
                <td>
                    <span class="status-badge ${parseFloat(row.passPct) > 80 ? 'approved' : parseFloat(row.passPct) < 50 ? 'pending' : ''}">
                        ${row.passPct}%
                    </span>
                </td>
                <td>${row.top}</td>
                <td>
                    <div style="display:flex; gap:4px; font-size:0.7rem;">
                        <span style="color:#00e5ff">A+: ${row.grades['A+']}</span>
                        <span style="color:#2ed573">A: ${row.grades['A']}</span>
                        <span style="color:#ff4757">F: ${row.grades['E'] + row.grades['F']}</span>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    }

    // Sync Dropdown
    function syncDropdown() {
        const select = document.getElementById('analytics-exam-select');
        if (!select) return;

        // Ensure ResultsManagement is available
        if (!window.ResultsManagement) return;

        const exams = window.ResultsManagement.getExamList();
        if (exams.length === 0) {
            select.innerHTML = '<option value="">No Exams Found</option>';
            return;
        }

        const cur = select.value;
        select.innerHTML = '<option value="">-- Select Exam --</option>' +
            exams.map(e => `<option value="${e.id}" ${cur === e.id ? 'selected' : ''}>${e.displayName}</option>`).join('');
    }

    return { calculate, render, syncDropdown };
})();

window.AnalyticsEngine = AnalyticsEngine;
