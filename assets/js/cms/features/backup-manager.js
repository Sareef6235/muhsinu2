/**
 * Backup Manager - Auto Backup System
 * Creates and manages backups before destructive operations
 * @namespace BackupManager
 */
window.BackupManager = (function () {
    'use strict';

    const STORAGE_KEY = 'cms_backups';
    const MAX_BACKUPS = 5;

    /**
     * Create a backup
     * @param {Object} data - Data to backup
     * @param {string} label - Backup label (optional)
     * @returns {Object} Backup metadata
     */
    function create(data, label = 'Auto Backup') {
        if (!data) {
            throw new Error('Cannot backup null or undefined data');
        }

        const timestamp = new Date().toISOString();
        const backup = {
            id: generateId(),
            timestamp,
            label,
            data: JSON.parse(JSON.stringify(data)), // Deep clone
            size: JSON.stringify(data).length
        };

        // Get existing backups
        const backups = list();

        // Add new backup
        backups.unshift(backup);

        // Keep only last MAX_BACKUPS
        const trimmed = backups.slice(0, MAX_BACKUPS);

        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
            console.log(`💾 Backup created: ${label} (${formatBytes(backup.size)})`);

            return {
                id: backup.id,
                timestamp: backup.timestamp,
                label: backup.label,
                size: backup.size
            };
        } catch (error) {
            console.error('Failed to create backup:', error);
            throw new Error('Backup failed: ' + error.message);
        }
    }

    /**
     * Restore a backup
     * @param {string} id - Backup ID or timestamp
     * @returns {Object} Restored data
     */
    function restore(id) {
        const backups = list();
        const backup = backups.find(b => b.id === id || b.timestamp === id);

        if (!backup) {
            throw new Error('Backup not found');
        }

        console.log(`♻️ Restoring backup: ${backup.label}`);
        return JSON.parse(JSON.stringify(backup.data)); // Deep clone
    }

    /**
     * List all backups
     * @returns {Array} Array of backup metadata
     */
    function list() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to list backups:', error);
            return [];
        }
    }

    /**
     * Delete a specific backup
     * @param {string} id - Backup ID
     */
    function deleteBackup(id) {
        const backups = list();
        const filtered = backups.filter(b => b.id !== id);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        console.log(`🗑️ Backup deleted: ${id}`);
    }

    /**
     * Clear all backups
     */
    function clear() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🗑️ All backups cleared');
    }

    /**
     * Get backup statistics
     * @returns {Object} Statistics
     */
    function getStats() {
        const backups = list();
        const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

        return {
            count: backups.length,
            totalSize,
            totalSizeFormatted: formatBytes(totalSize),
            oldest: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
            newest: backups.length > 0 ? backups[0].timestamp : null
        };
    }

    /**
     * Generate unique ID
     * @private
     */
    function generateId() {
        return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Format bytes to human-readable string
     * @private
     */
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Check if backups are available
     * @returns {boolean} True if backups exist
     */
    function hasBackups() {
        return list().length > 0;
    }

    /**
     * Get latest backup
     * @returns {Object|null} Latest backup or null
     */
    function getLatest() {
        const backups = list();
        return backups.length > 0 ? backups[0] : null;
    }

    // Public API
    return {
        create,
        restore,
        list,
        delete: deleteBackup,
        clear,
        getStats,
        hasBackups,
        getLatest
    };
})();
