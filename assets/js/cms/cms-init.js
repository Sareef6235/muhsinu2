/**
 * CMS Initialization & Orchestration
 * Initializes all CMS modules and sets up integrations
 * @namespace CMS
 */
window.CMS = (function () {
    'use strict';

    let initialized = false;

    /**
     * Initialize CMS system
     */
    function init() {
        if (initialized) {
            console.warn('CMS already initialized');
            return;
        }

        console.log('🚀 Initializing CMS...');

        // Initialize core modules (auto-init on load)
        // Toast, DataManager, ValidationEngine, BackupManager

        // Set up DataManager listeners
        setupDataListeners();

        // Set up UI state management
        setupUIStateManagement();

        initialized = true;
        console.log('✅ CMS initialized successfully');

        // Log system status
        logSystemStatus();
    }

    /**
     * Set up DataManager event listeners
     * @private
     */
    function setupDataListeners() {
        DataManager.onChange((event, data, metadata) => {
            console.log(`📊 DataManager event: ${event}`, metadata);

            // Update UI based on data state
            updateUIState();

            // Show toast notification
            if (event === 'load') {
                Toast.success(`Data loaded: ${metadata.recordCount} records`, 3000);
            } else if (event === 'clear') {
                Toast.info('Data cleared', 2000);
            }
        });
    }

    /**
     * Set up UI state management
     * @private
     */
    function setupUIStateManagement() {
        // Update UI state on page load
        updateUIState();

        // Update UI state periodically (in case of external changes)
        setInterval(updateUIState, 5000);
    }

    /**
     * Update UI based on data state
     * @private
     */
    function updateUIState() {
        const hasData = DataManager.hasData();

        // Update publish button state
        const publishButtons = document.querySelectorAll('[data-cms-action="publish"]');
        publishButtons.forEach(btn => {
            btn.disabled = !hasData;
            if (!hasData) {
                btn.title = 'No data loaded';
            } else {
                btn.title = 'Publish data as JSON file';
            }
        });

        // Update data indicators
        const dataIndicators = document.querySelectorAll('[data-cms-indicator="has-data"]');
        dataIndicators.forEach(indicator => {
            if (hasData) {
                indicator.classList.add('active');
                indicator.classList.remove('inactive');
            } else {
                indicator.classList.add('inactive');
                indicator.classList.remove('active');
            }
        });

        // Update record count displays
        if (hasData) {
            const stats = DataManager.getStats();
            const countDisplays = document.querySelectorAll('[data-cms-display="record-count"]');
            countDisplays.forEach(display => {
                display.textContent = stats.recordCount;
            });
        }
    }

    /**
     * Log system status
     * @private
     */
    function logSystemStatus() {
        console.group('📊 CMS System Status');
        console.log('Data loaded:', DataManager.hasData());
        console.log('Data stats:', DataManager.getStats());
        console.log('Backup stats:', BackupManager.getStats());
        console.groupEnd();
    }

    /**
     * Quick publish action
     */
    async function quickPublish() {
        if (!DataManager.hasData()) {
            Toast.warning('No data to publish', 3000);
            return;
        }

        try {
            const result = await StaticPublisher.quickPublish();
            Toast.success(
                `✅ Published ${result.recordCount} records as ${result.filename}`,
                5000
            );
        } catch (error) {
            Toast.error(`Publish failed: ${error.message}`, 5000);
            console.error('Publish error:', error);
        }
    }

    /**
     * Publish with preview
     */
    async function publishWithPreview() {
        if (!DataManager.hasData()) {
            Toast.warning('No data to publish', 3000);
            return;
        }

        try {
            const result = await StaticPublisher.publishWithPreview();

            if (result.cancelled) {
                Toast.info('Publish cancelled', 2000);
                return;
            }

            Toast.success(
                `✅ Published ${result.recordCount} records as ${result.filename}`,
                5000
            );
        } catch (error) {
            Toast.error(`Publish failed: ${error.message}`, 5000);
            console.error('Publish error:', error);
        }
    }

    /**
     * Import JSON file
     */
    async function importJSON() {
        try {
            const result = await JSONImporter.importWithPicker({
                validate: true,
                backup: true
            });

            Toast.success(
                `✅ Imported ${result.recordCount} records from ${result.filename}`,
                5000
            );

            // Update UI
            updateUIState();
        } catch (error) {
            if (error.message !== 'No file selected') {
                Toast.error(`Import failed: ${error.message}`, 6000);
                console.error('Import error:', error);
            }
        }
    }

    /**
     * Clear all data with confirmation
     */
    function clearData() {
        if (!DataManager.hasData()) {
            Toast.info('No data to clear', 2000);
            return;
        }

        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            // Create backup before clearing
            try {
                BackupManager.create(DataManager.get(), 'Before Clear');
            } catch (error) {
                console.warn('Backup failed:', error);
            }

            DataManager.clear();
            Toast.success('Data cleared', 3000);
        }
    }

    /**
     * Get system status
     * @returns {Object} System status
     */
    function getStatus() {
        return {
            initialized,
            hasData: DataManager.hasData(),
            dataStats: DataManager.getStats(),
            backupStats: BackupManager.getStats()
        };
    }

    // Public API
    return {
        init,
        quickPublish,
        publishWithPreview,
        importJSON,
        clearData,
        getStatus,
        updateUIState
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', CMS.init);
} else {
    CMS.init();
}
