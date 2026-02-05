/**
 * Analytics Engine
 * Handles all statistical calculations for the dashboard.
 * School-Aware & Event-Driven.
 */
const AnalyticsEngine = (function () {
    'use strict';

    function getExamList() {
        return window.ExamManager ? window.ExamManager.getActive() : [];
    }

    function getAllResults() {
        // Results are stored in 'exam_results_cache' (global array, filtering needed)
        // ResultsManagement handles filtering, but we can access raw data
        return window.ResultsManagement ? window.ResultsManagement.getAllResults() : [];
    }

    // Filter results by specific exam
    function getResultsForExam(examId) {
        return getAllResults().filter(r => r.examId === examId);
    }

    // CALCULATE: Overview Stats (Pass %, Top Score, Average)
    function calculateExamStats(examId) {
        const results = getResultsForExam(examId);
        if (results.length === 0) return null;

        const totalStudents = results.length;
        const passed = results.filter(r => r.status === 'Pass').length;
        const failed = totalStudents - passed;
        const passPercentage = ((passed / totalStudents) * 100).toFixed(1);

        // Find Topper
        const topper = results.reduce((prev, current) => (prev.totalMarks > current.totalMarks) ? prev : current);

        // Subject Averages
        const subjectStats = {};
        results.forEach(student => {
            if (!student.subjects) return;
            Object.entries(student.subjects).forEach(([subject, marks]) => {
                if (!subjectStats[subject]) subjectStats[subject] = { total: 0, count: 0 };
                const val = parseFloat(marks);
                if (!isNaN(val)) {
                    subjectStats[subject].total += val;
                    subjectStats[subject].count++;
                }
            });
        });

        const subjectAverages = Object.entries(subjectStats).map(([sub, data]) => ({
            subject: sub,
            average: (data.total / data.count).toFixed(1)
        })).sort((a, b) => b.average - a.average);

        return {
            totalStudents,
            passed,
            failed,
            passPercentage,
            topper,
            subjectAverages
        };
    }

    // UI: Render Main Analytics View
    function renderDashboard() {
        const container = document.getElementById('analytics-view');
        if (!container) return;

        const exams = getExamList();
        const selectedExamId = document.getElementById('analytics-exam-select')?.value;
        const targetExam = selectedExamId ? exams.find(e => e.id === selectedExamId) : exams[0];

        // 1. SELECTOR
        let html = `
            <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h3>Performance Analytics</h3>
                <select id="analytics-exam-select" class="form-input" style="width:250px;" onchange="AnalyticsEngine.renderDashboard()">
                    ${exams.map(e => `<option value="${e.id}" ${targetExam && targetExam.id === e.id ? 'selected' : ''}>${e.displayName}</option>`).join('')}
                </select>
            </div>
        `;

        if (!targetExam) {
            container.innerHTML = html + `<div style="text-align:center; padding:50px; color:#666;">No active exams found for analysis.</div>`;
            return;
        }

        const stats = calculateExamStats(targetExam.id);

        if (!stats) {
            container.innerHTML = html + `<div style="text-align:center; padding:50px; color:#666;">No result data uploaded for <b>${targetExam.displayName}</b> yet.</div>`;
            return;
        }

        // 2. KEY METRICS CARDS
        html += `
            <div class="grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-bottom:30px;">
                <div class="glass-card" style="padding:20px; text-align:center; border-left: 4px solid var(--primary-color);">
                    <div style="font-size:2rem; font-weight:bold;">${stats.passPercentage}%</div>
                    <div style="color:#888; font-size:0.9rem;">Pass Rate</div>
                </div>
                <div class="glass-card" style="padding:20px; text-align:center; border-left: 4px solid #2ed573;">
                    <div style="font-size:2rem; font-weight:bold;">${stats.totalStudents}</div>
                    <div style="color:#888; font-size:0.9rem;">Total Students</div>
                </div>
                <div class="glass-card" style="padding:20px; text-align:center; border-left: 4px solid #ffa502;">
                    <div style="font-size:2rem; font-weight:bold;">${stats.topper.totalMarks}</div>
                    <div style="color:#888; font-size:0.9rem;">Highest Score</div>
                </div>
                 <div class="glass-card" style="padding:20px; text-align:center; border-left: 4px solid #ff4757;">
                    <div style="font-size:2rem; font-weight:bold;">${stats.failed}</div>
                    <div style="color:#888; font-size:0.9rem;">Needs Improvement</div>
                </div>
            </div>
        `;

        // 3. TOPPER & SUBJECTS GRID
        html += `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-bottom:30px;" class="analytics-split">
                
                <!-- TOP PERFORMER -->
                <div class="glass-card" style="padding:25px; position:relative; overflow:hidden;">
                     <div style="position:absolute; top:-10px; right:-10px; width:80px; height:80px; background:linear-gradient(135deg, transparent 50%, var(--primary-color) 50%); opacity:0.1;"></div>
                    <h4 style="margin-bottom:20px; color:var(--primary-color);"><i class="ph-bold ph-trophy"></i> Top Performer</h4>
                    
                    <div style="display:flex; align-items:center; gap:20px;">
                        <div style="width:60px; height:60px; background:var(--primary-color); color:#000; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:bold;">
                            ${stats.topper.name.charAt(0)}
                        </div>
                        <div>
                            <div style="font-size:1.2rem; font-weight:bold;">${stats.topper.name}</div>
                            <div style="color:#888;">Roll No: ${stats.topper.rollNo}</div>
                            <div style="margin-top:5px; font-size:0.9rem;">Scored <b>${stats.topper.totalMarks}</b> with Grade <b>${stats.topper.grade}</b></div>
                        </div>
                    </div>
                </div>

                <!-- SUBJECT AVERAGES -->
                <div class="glass-card" style="padding:25px;">
                    <h4 style="margin-bottom:20px; color:var(--primary-color);"><i class="ph-bold ph-chart-bar"></i> Subject Averages</h4>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${stats.subjectAverages.map(sub => `
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                <span style="color:#ccc;">${sub.subject}</span>
                                <div style="flex:1; margin:0 15px; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                                    <div style="width:${Math.min(100, (sub.average / 50) * 100)}%; height:100%; background:var(--primary-color);"></div> 
                                    <!-- Assuming 50 is max roughly, scalable? -->
                                </div>
                                <span style="font-weight:bold;">${sub.average}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Save selection memory
        if (selectedExamId) localStorage.setItem('analytics_last_exam', selectedExamId);
    }

    function init() {
        renderDashboard();
    }

    // Alias for compatibility
    function syncDropdown() {
        renderDashboard();
    }

    return {
        init,
        renderDashboard,
        syncDropdown
    };
})();

// Expose
window.AnalyticsEngine = AnalyticsEngine;
