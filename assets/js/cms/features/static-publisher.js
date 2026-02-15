/**
 * Static Publisher - Export with Versioning
 * Publishes data as timestamped JSON files
 * @namespace StaticPublisher
 */
window.StaticPublisher = (function () {
    'use strict';

    /**
     * Publish data as timestamped JSON file
     * @param {Object} options - Publishing options
     * @returns {Promise<Object>} Publication result
     */
    async function publish(options = {}) {
        const {
            data = null,
            filename = 'results',
            preview = false,
            onPreview = null
        } = options;

        // Get data from DataManager if not provided
        const publishData = data || DataManager.get();

        if (!publishData) {
            throw new Error('No data available to publish');
        }

        // Show preview if requested
        if (preview && onPreview) {
            const shouldContinue = await onPreview(publishData);
            if (!shouldContinue) {
                return { cancelled: true };
            }
        }

        // Generate timestamped filename
        const timestamp = generateTimestamp();
        const fullFilename = `${filename}_${timestamp}.json`;

        // Prepare export data
        const exportData = {
            ...publishData,
            metadata: {
                ...publishData.metadata,
                publishedAt: new Date().toISOString(),
                publishedFrom: 'Admin CMS',
                version: timestamp
            }
        };

        // Create and download file
        const blob = new Blob(
            [JSON.stringify(exportData, null, 2)],
            { type: 'application/json' }
        );

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fullFilename;
        link.click();

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(link.href), 100);

        const result = {
            success: true,
            filename: fullFilename,
            timestamp,
            size: blob.size,
            recordCount: Array.isArray(exportData.data) ? exportData.data.length : 0
        };

        console.log(`🚀 Published: ${fullFilename} (${formatBytes(blob.size)})`);
        return result;
    }

    /**
     * Quick publish (no preview)
     * @param {string} filename - Base filename
     * @returns {Promise<Object>} Publication result
     */
    async function quickPublish(filename = 'results') {
        return publish({ filename, preview: false });
    }

    /**
     * Publish with preview modal
     * @param {string} filename - Base filename
     * @returns {Promise<Object>} Publication result
     */
    async function publishWithPreview(filename = 'results') {
        return publish({
            filename,
            preview: true,
            onPreview: showPreviewModal
        });
    }

    /**
     * Show preview modal
     * @private
     */
    function showPreviewModal(data) {
        return new Promise((resolve) => {
            const modal = createPreviewModal(data, (confirmed) => {
                document.body.removeChild(modal);
                resolve(confirmed);
            });
            document.body.appendChild(modal);
        });
    }

    /**
     * Create preview modal
     * @private
     */
    function createPreviewModal(data, callback) {
        const recordCount = Array.isArray(data.data) ? data.data.length : 0;
        const dataSize = JSON.stringify(data).length;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="glass-card" style="max-width: 600px; width: 90%; padding: 30px; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; color: var(--primary-color);">
                    <i class="ph-bold ph-rocket-launch"></i> Publish Preview
                </h3>
                
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <div style="color: #888; font-size: 0.85rem; margin-bottom: 5px;">Records</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${recordCount}</div>
                        </div>
                        <div>
                            <div style="color: #888; font-size: 0.85rem; margin-bottom: 5px;">File Size</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${formatBytes(dataSize)}</div>
                        </div>
                    </div>
                </div>

                <div style="background: rgba(255, 165, 0, 0.1); border: 1px solid rgba(255, 165, 0, 0.3); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: start; gap: 10px;">
                        <i class="ph-bold ph-info" style="color: orange; font-size: 1.2rem; margin-top: 2px;"></i>
                        <div style="color: #ccc; font-size: 0.9rem;">
                            This will download a timestamped JSON file with ${recordCount} records.
                            The file will be named: <strong style="color: #fff;">results_${generateTimestamp()}.json</strong>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button class="btn btn-md btn-secondary" id="cancel-publish">
                        Cancel
                    </button>
                    <button class="btn btn-md btn-primary" id="confirm-publish">
                        <i class="ph-bold ph-check"></i> Confirm & Publish
                    </button>
                </div>
            </div>
        `;

        // Event handlers
        modal.querySelector('#cancel-publish').onclick = () => callback(false);
        modal.querySelector('#confirm-publish').onclick = () => callback(true);
        modal.onclick = (e) => {
            if (e.target === modal) callback(false);
        };

        return modal;
    }

    /**
     * Generate timestamp for filename
     * @private
     */
    function generateTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
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
     * Check if publishing is available
     * @returns {boolean} True if data is available
     */
    function canPublish() {
        return DataManager.hasData();
    }

    // Public API
    return {
        publish,
        quickPublish,
        publishWithPreview,
        canPublish
    };
})();
