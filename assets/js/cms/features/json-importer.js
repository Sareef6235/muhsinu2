/**
 * JSON Importer - Import with Validation
 * Imports JSON files with schema validation and auto-backup
 * @namespace JSONImporter
 */
window.JSONImporter = (function () {
    'use strict';

    /**
     * Import JSON file
     * @param {File} file - File to import
     * @param {Object} options - Import options
     * @returns {Promise<Object>} Import result
     */
    async function importFile(file, options = {}) {
        const {
            validate = true,
            backup = true,
            schema = null
        } = options;

        // Validate file type
        const typeValidation = ValidationEngine.validateFileType(file);
        if (!typeValidation.valid) {
            throw new Error(typeValidation.error);
        }

        // Validate file size (10MB max)
        const sizeValidation = ValidationEngine.validateFileSize(file, 10);
        if (!sizeValidation.valid) {
            throw new Error(sizeValidation.error);
        }

        // Read file
        const content = await readFile(file);

        // Parse JSON
        const jsonValidation = ValidationEngine.validateJSON(content);
        if (!jsonValidation.valid) {
            throw new Error(`Invalid JSON: ${jsonValidation.error}`);
        }

        const data = jsonValidation.data;

        // Validate against schema
        if (validate) {
            const schemaValidation = ValidationEngine.validate(data, schema);
            if (!schemaValidation.valid) {
                throw new Error(`Schema validation failed:\n${schemaValidation.errors.join('\n')}`);
            }
        }

        // Create backup if data exists
        if (backup && DataManager.hasData()) {
            try {
                BackupManager.create(DataManager.get(), 'Before Import');
                console.log('💾 Backup created before import');
            } catch (error) {
                console.warn('Backup failed:', error);
                // Continue with import even if backup fails
            }
        }

        // Load data into DataManager
        DataManager.load(data, 'import');

        const result = {
            success: true,
            filename: file.name,
            size: file.size,
            recordCount: Array.isArray(data.data) ? data.data.length : 0,
            backupCreated: backup && DataManager.hasData()
        };

        console.log(`📥 Imported: ${file.name} (${result.recordCount} records)`);
        return result;
    }

    /**
     * Import from file input element
     * @param {HTMLInputElement} input - File input element
     * @param {Object} options - Import options
     * @returns {Promise<Object>} Import result
     */
    async function importFromInput(input, options = {}) {
        if (!input.files || input.files.length === 0) {
            throw new Error('No file selected');
        }

        return importFile(input.files[0], options);
    }

    /**
     * Show file picker and import
     * @param {Object} options - Import options
     * @returns {Promise<Object>} Import result
     */
    async function importWithPicker(options = {}) {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json,.json';

            input.onchange = async () => {
                try {
                    const result = await importFromInput(input, options);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            input.click();
        });
    }

    /**
     * Read file as text
     * @private
     */
    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));

            reader.readAsText(file);
        });
    }

    /**
     * Import with UI feedback
     * @param {File} file - File to import
     * @returns {Promise<Object>} Import result
     */
    async function importWithFeedback(file) {
        Toast.info('Importing file...', 2000);

        try {
            const result = await importFile(file, {
                validate: true,
                backup: true
            });

            Toast.success(
                `✅ Imported ${result.recordCount} records from ${result.filename}`,
                5000
            );

            return result;
        } catch (error) {
            Toast.error(`Import failed: ${error.message}`, 6000);
            throw error;
        }
    }

    /**
     * Validate file before import (preview)
     * @param {File} file - File to validate
     * @returns {Promise<Object>} Validation result
     */
    async function validateFile(file) {
        try {
            // Validate file type
            const typeValidation = ValidationEngine.validateFileType(file);
            if (!typeValidation.valid) {
                return { valid: false, error: typeValidation.error };
            }

            // Validate file size
            const sizeValidation = ValidationEngine.validateFileSize(file, 10);
            if (!sizeValidation.valid) {
                return { valid: false, error: sizeValidation.error };
            }

            // Read and parse
            const content = await readFile(file);
            const jsonValidation = ValidationEngine.validateJSON(content);

            if (!jsonValidation.valid) {
                return { valid: false, error: `Invalid JSON: ${jsonValidation.error}` };
            }

            // Validate schema
            const schemaValidation = ValidationEngine.validate(jsonValidation.data);
            if (!schemaValidation.valid) {
                return {
                    valid: false,
                    error: `Schema validation failed:\n${schemaValidation.errors.join('\n')}`
                };
            }

            // Return preview data
            const data = jsonValidation.data;
            return {
                valid: true,
                data,
                recordCount: Array.isArray(data.data) ? data.data.length : 0,
                size: file.size,
                filename: file.name
            };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    // Public API
    return {
        importFile,
        importFromInput,
        importWithPicker,
        importWithFeedback,
        validateFile
    };
})();
