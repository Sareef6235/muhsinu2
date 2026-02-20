/**
 * Deployment Manager
 * Handles GitHub repository connections and sync operations
 * @namespace DeploymentManager
 */
window.DeploymentManager = (function () {
    'use strict';

    const CONFIG_KEY = 'git_repos';
    let repos = [];

    /**
     * Initialize the module
     */
    function init() {
        // Load saved repos
        const saved = localStorage.getItem(CONFIG_KEY);
        if (saved) {
            try {
                repos = JSON.parse(saved);
                renderRepoList();
            } catch (e) {
                console.error('Failed to load repo config', e);
            }
        }

        // Check health/connection status
        checkConnectionStatus();
    }

    /**
     * Add a new repository
     */
    function addRepo() {
        const nameInput = document.getElementById('repo-name-input');
        const branchInput = document.getElementById('repo-branch-input');

        const name = nameInput.value.trim();
        const branch = branchInput.value.trim() || 'main';

        if (!name) {
            if (window.Toast) Toast.error('Repository name is required');
            else alert('Repository name is required');
            return;
        }

        // Check if already exists
        if (repos.some(r => r.name === name)) {
            if (window.Toast) Toast.warning('Repository already added');
            else alert('Repository already added');
            return;
        }

        const newRepo = {
            id: Date.now().toString(),
            name: name,
            branch: branch,
            addedAt: new Date().toISOString(),
            lastSync: null,
            status: 'pending'
        };

        repos.push(newRepo);
        saveConfig();
        renderRepoList();

        // Clear inputs
        nameInput.value = '';
        branchInput.value = '';

        if (window.Toast) Toast.success('Repository added successfully');
    }

    /**
     * Remove a repository
     */
    function removeRepo(id) {
        if (!confirm('Remove this repository connection?')) return;

        repos = repos.filter(r => r.id !== id);
        saveConfig();
        renderRepoList();
    }

    /**
     * Select a repo as active and update UI
     */
    function selectRepo(id) {
        const repo = repos.find(r => r.id === id);
        if (!repo) return;

        // Update active logic (mock for now, or actual selection)
        document.getElementById('active-repo-status').style.display = 'block';
        document.getElementById('status-repo-name').textContent = repo.name;
        document.getElementById('git-branch-name').textContent = repo.branch;

        // Setup direct links
        document.getElementById('btn-view-repo').onclick = () => window.open(`https://github.com/${repo.name}`, '_blank');
        document.getElementById('btn-view-actions').onclick = () => window.open(`https://github.com/${repo.name}/actions`, '_blank');

        // Scroll to status
        document.getElementById('active-repo-status').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Render the list of repositories
     */
    function renderRepoList() {
        const list = document.getElementById('repo-list');
        if (!list) return;

        if (repos.length === 0) {
            list.innerHTML = '<li style="padding: 20px; text-align: center; color: #666;">No repositories connected</li>';
            return;
        }

        list.innerHTML = repos.map(repo => `
            <li style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; color: #fff;">
                        <i class="ph-bold ph-git-branch" style="color: var(--primary-color);"></i> ${repo.name}
                    </div>
                    <div style="font-size: 0.85rem; color: #888; margin-top: 4px;">
                        Branch: ${repo.branch} • Added: ${new Date(repo.addedAt).toLocaleDateString()}
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-sm btn-secondary" onclick="DeploymentManager.selectRepo('${repo.id}')">
                        Select
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="DeploymentManager.removeRepo('${repo.id}')">
                        <i class="ph-bold ph-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="DeploymentManager.syncRepo('${repo.id}')" title="Trigger Sync">
                        <i class="ph-bold ph-arrows-clockwise"></i> Sync
                    </button>
                </div>
            </li>
        `).join('');
    }

    /**
     * Trigger a sync operation (Commit & Push)
     */
    async function syncRepo(id) {
        const repo = repos.find(r => r.id === id);
        if (!repo) return;

        const btn = event.currentTarget || document.querySelector(`button[onclick*="${id}"]`);
        const originalText = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Syncing...';

        try {
            if (window.Toast) Toast.info(`Starting sync for ${repo.name}...`);

            const response = await fetch('/api/git_sync.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    repo: repo.name,
                    branch: repo.branch,
                    message: `Auto-sync from Dashboard: ${new Date().toISOString()}`
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Sync failed');
            }

            // Update local state
            repo.lastSync = new Date().toISOString();
            repo.status = 'synced';
            saveConfig();

            // Update UI
            if (window.Toast) Toast.success('Sync completed successfully!');

            // Update status panel if visible
            document.getElementById('last-deploy-time').textContent = new Date().toLocaleString();

        } catch (error) {
            console.error('Sync error:', error);
            if (window.Toast) Toast.error(`Sync failed: ${error.message}`);
            else alert(`Sync failed: ${error.message}`);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
            renderRepoList();
        }
    }

    /**
     * Save current config to local storage
     */
    function saveConfig() {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(repos));
    }

    /**
     * Download config backup
     */
    function downloadConnections() {
        const blob = new Blob([localStorage.getItem(CONFIG_KEY)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'git_connections_backup.json';
        a.click();
    }

    /**
     * Upload config backup
     */
    function uploadConnections(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    repos = data;
                    saveConfig();
                    renderRepoList();
                    if (window.Toast) Toast.success('Connections imported');
                }
            } catch (err) {
                if (window.Toast) Toast.error('Invalid backup file');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Toggle Quick Edit View (Stub)
     */
    function toggleQuickEdit() {
        const section = document.getElementById('github-file-editor-section');
        if (section) {
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        }
    }

    /**
     * Check backend connection status
     */
    async function checkConnectionStatus() {
        try {
            const res = await fetch('/api/health.php');
            if (res.ok) {
                const statusBadge = document.getElementById('git-status-badge');
                if (statusBadge) {
                    statusBadge.innerHTML = '<i class="ph-bold ph-check-circle"></i> Server Online';
                    statusBadge.style.color = '#2ed573';
                    statusBadge.style.background = 'rgba(46, 213, 115, 0.1)';
                }
            }
        } catch (e) {
            console.warn('Server offline');
        }
    }

    // Public API
    return {
        init,
        addRepo,
        removeRepo,
        selectRepo,
        syncRepo,
        downloadConnections,
        uploadConnections,
        toggleQuickEdit
    };

})();

// Initialize on load
document.addEventListener('DOMContentLoaded', DeploymentManager.init);
