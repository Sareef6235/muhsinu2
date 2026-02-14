/**
 * Antigravity Results System - Admin Results Management
 * Handles sync, publish, and stats for the admin dashboard.
 */

import AppState from './state.js';

const ResultsManagement = {
    init() {
        console.log("ResultsManagement Panel Initialized");
        this.bindEvents();
    },

    bindEvents() {
        const syncBtn = document.getElementById('btn-sync-results');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.handleSyncClick());
        }

        const publishBtn = document.getElementById('btn-publish-results');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.handlePublishClick());
        }
    },

    async handleSyncClick() {
        const btn = document.getElementById('btn-sync-results');
        if (!btn) return;

        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> SYNCING...';

        try {
            // Simulate API/Data sync delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real app, this would fetch from a database or remote source
            // For now, we update local state
            AppState.results.lastPublished = new Date().toLocaleString();

            // Show Success Notification
            this.notify("Sync Complete", "Stats updated successfully.");

            // Update UI Stats
            const statExams = document.getElementById('stat-exams-count');
            if (statExams) statExams.textContent = AppState.results.exams.length;

        } catch (error) {
            console.error("Sync Failed", error);
            this.notify("Sync Failed", "Check console for details.", "error");
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    },

    async handlePublishClick() {
        const btn = document.getElementById('btn-publish-results');
        if (!btn) return;

        btn.disabled = true;
        btn.textContent = "PUBLISHING...";

        try {
            // Simulate generation of published-results.json
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Logic to "Publish" would involve saving state to the JSON file
            // Since we are client-side only, we simulate success
            this.notify("Published!", "Static results are now live.");

        } catch (error) {
            this.notify("Publish Failed", error.message, "error");
        } finally {
            btn.disabled = false;
            btn.textContent = "PUBLISH FOR STATIC SITE";
        }
    },

    togglePublishState(examId) {
        const exam = AppState.results.exams.find(e => (e.examId || e.id) === examId);
        if (exam) {
            exam.published = !exam.published;
            this.notify("State Updated", `Exam is now ${exam.published ? 'Public' : 'Hidden'}.`);
            this.renderExamsList(); // Refresh list if exists
        }
    },

    copyPublicLink(examId) {
        const url = `${window.location.origin}/pages/results/index.html?exam=${examId}`;
        navigator.clipboard.writeText(url).then(() => {
            this.notify("Link Copied", "Shareable URL is in your clipboard.");
        });
    },

    notify(title, message, type = 'success') {
        // Simple alert for now, can be replaced with a glass toast later
        alert(`${title}: ${message}`);
    }
};

window.ResultsManagement = ResultsManagement;
export default ResultsManagement;
