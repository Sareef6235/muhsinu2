/**
 * Validation Engine - Schema Validation
 * Validates imported data against defined schemas
 * @namespace ValidationEngine
 */
window.ValidationEngine = (function () {
    'use strict';

    // Default schema for results data
    const DEFAULT_SCHEMA = {
        metadata: {
            required: false,
            type: 'object'
        },
        data: {
            required: true,
            type: 'array',
            minLength: 1
        }
    };

    /**
     * Validate data against schema
     * @param {Object} data - Data to validate
     * @param {Object} schema - Validation schema (optional, uses default)
     * @returns {Object} Validation result { valid: boolean, errors: array }
     */
    function validate(data, schema = DEFAULT_SCHEMA) {
        const errors = [];

        if (!data || typeof data !== 'object') {
            errors.push('Data must be an object');
            return { valid: false, errors };
        }

        // Validate each schema field
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            // Check required
            if (rules.required && (value === undefined || value === null)) {
                errors.push(`Field "${field}" is required`);
                continue;
            }

            // Skip validation if field is optional and not present
            if (!rules.required && (value === undefined || value === null)) {
                continue;
            }

            // Check type
            if (rules.type) {
                const actualType = Array.isArray(value) ? 'array' : typeof value;
                if (actualType !== rules.type) {
                    errors.push(`Field "${field}" must be of type ${rules.type}, got ${actualType}`);
                    continue;
                }
            }

            // Check array length
            if (rules.type === 'array' && rules.minLength !== undefined) {
                if (value.length < rules.minLength) {
                    errors.push(`Field "${field}" must have at least ${rules.minLength} items, got ${value.length}`);
                }
            }

            // Check string length
            if (rules.type === 'string' && rules.minLength !== undefined) {
                if (value.length < rules.minLength) {
                    errors.push(`Field "${field}" must be at least ${rules.minLength} characters`);
                }
            }

            // Custom validator
            if (rules.validator && typeof rules.validator === 'function') {
                const customResult = rules.validator(value);
                if (customResult !== true) {
                    errors.push(customResult || `Field "${field}" failed custom validation`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate JSON string
     * @param {string} jsonString - JSON string to validate
     * @returns {Object} { valid: boolean, data: object|null, error: string|null }
     */
    function validateJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return {
                valid: true,
                data,
                error: null
            };
        } catch (error) {
            return {
                valid: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Validate file type
     * @param {File} file - File to validate
     * @param {Array} allowedTypes - Allowed MIME types
     * @returns {Object} { valid: boolean, error: string|null }
     */
    function validateFileType(file, allowedTypes = ['application/json']) {
        if (!file) {
            return { valid: false, error: 'No file provided' };
        }

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Invalid file type. Expected ${allowedTypes.join(', ')}, got ${file.type}`
            };
        }

        return { valid: true, error: null };
    }

    /**
     * Validate file size
     * @param {File} file - File to validate
     * @param {number} maxSizeMB - Maximum size in MB
     * @returns {Object} { valid: boolean, error: string|null }
     */
    function validateFileSize(file, maxSizeMB = 10) {
        if (!file) {
            return { valid: false, error: 'No file provided' };
        }

        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            return {
                valid: false,
                error: `File too large. Maximum size is ${maxSizeMB}MB, got ${(file.size / 1024 / 1024).toFixed(2)}MB`
            };
        }

        return { valid: true, error: null };
    }

    /**
     * Create custom schema
     * @param {Object} schemaDefinition - Schema definition
     * @returns {Object} Schema object
     */
    function createSchema(schemaDefinition) {
        return { ...schemaDefinition };
    }

    /**
     * Get default schema
     * @returns {Object} Default schema
     */
    function getDefaultSchema() {
        return { ...DEFAULT_SCHEMA };
    }

    // Public API
    return {
        validate,
        validateJSON,
        validateFileType,
        validateFileSize,
        createSchema,
        getDefaultSchema
    };
})();
