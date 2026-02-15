/**
 * Data Manager - Central State Management
 * Single source of truth for CMS data
 * @namespace DataManager
 */
window.DataManager = (function () {
    'use strict';

    let currentData = null;
    let listeners = [];
    let metadata = {
        loadedAt: null,
        source: null,
        recordCount: 0
    };

    /**
     * Load data into the manager
     * @param {Object} data - Data to load
     * @param {string} source - Source identifier (e.g., 'import', 'sheet', 'sync')
     */
    function load(data, source = 'unknown') {
        if (!data) {
            throw new Error('Cannot load null or undefined data');
        }

        currentData = data;
        metadata = {
            loadedAt: new Date().toISOString(),
            source: source,
            recordCount: Array.isArray(data.data) ? data.data.length : 0
        };

        notifyListeners('load', currentData);
        console.log(`📊 DataManager: Loaded ${metadata.recordCount} records from ${source}`);
    }

    /**
     * Get current data
     * @returns {Object|null} Current data or null
     */
    function get() {
        return currentData;
    }

    /**
     * Get metadata about current data
     * @returns {Object} Metadata object
     */
    function getMetadata() {
        return { ...metadata };
    }

    /**
     * Check if data is loaded
     * @returns {boolean} True if data exists
     */
    function hasData() {
        return currentData !== null;
    }

    /**
     * Clear all data
     */
    function clear() {
        currentData = null;
        metadata = {
            loadedAt: null,
            source: null,
            recordCount: 0
        };
        notifyListeners('clear', null);
        console.log('🗑️ DataManager: Data cleared');
    }

    /**
     * Subscribe to data changes
     * @param {Function} callback - Callback function (event, data)
     * @returns {Function} Unsubscribe function
     */
    function onChange(callback) {
        listeners.push(callback);

        // Return unsubscribe function
        return () => {
            listeners = listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all listeners of changes
     * @private
     */
    function notifyListeners(event, data) {
        listeners.forEach(callback => {
            try {
                callback(event, data, metadata);
            } catch (error) {
                console.error('DataManager listener error:', error);
            }
        });
    }

    /**
     * Export data with metadata
     * @returns {Object} Data with metadata
     */
    function exportData() {
        if (!hasData()) {
            throw new Error('No data to export');
        }

        return {
            ...currentData,
            metadata: {
                ...currentData.metadata,
                exportedAt: new Date().toISOString(),
                exportedFrom: 'Admin CMS'
            }
        };
    }

    /**
     * Get data statistics
     * @returns {Object} Statistics object
     */
    function getStats() {
        if (!hasData()) {
            return {
                hasData: false,
                recordCount: 0,
                loadedAt: null,
                source: null
            };
        }

        return {
            hasData: true,
            recordCount: metadata.recordCount,
            loadedAt: metadata.loadedAt,
            source: metadata.source,
            dataKeys: Object.keys(currentData),
            hasMetadata: !!currentData.metadata
        };
    }

    // Public API
    return {
        load,
        get,
        getMetadata,
        hasData,
        clear,
        onChange,
        exportData,
        getStats
    };
})();
