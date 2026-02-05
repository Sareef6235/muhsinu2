/**
 * migration-utility.js
 * Handles moving legacy (mhm_v2_) data to new school-specific namespaces.
 */
import StorageManager from './storage-manager.js';

const MigrationUtility = {
    KEYS_TO_MIGRATE: [
        'exam_results_cache',
        'exam_results_last_sync',
        'exam_system_settings',
        'examMeta',
        'tuition_subjects',
        'fee_receipts',
        'works',
        'academic_years',
        'exam_types'
    ],

    /**
     * Check if legacy data exists for migration.
     */
    hasLegacyData() {
        const results = localStorage.getItem(StorageManager.LEGACY_PREFIX + 'exam_results_cache');
        return !!results;
    },

    /**
     * Perform the migration to the CURRENTLY ACTIVE school namespace.
     * @returns {Object} result summary
     */
    async migrateToActiveSchool() {
        const activeSchoolRaw = localStorage.getItem(StorageManager.LEGACY_PREFIX + StorageManager.ACTIVE_SCHOOL_KEY);
        if (!activeSchoolRaw) return { success: false, message: 'No active school selected for migration.' };

        const school = JSON.parse(activeSchoolRaw);
        if (school.id === 'default') return { success: false, message: 'Target is already the legacy system.' };

        const targetPrefix = `school_${school.id}_`;
        console.log(`🚀 Starting Migration to: ${targetPrefix}`);

        const summary = {
            totalMigrated: 0,
            keysProcessed: [],
            errors: []
        };

        this.KEYS_TO_MIGRATE.forEach(key => {
            try {
                const legacyVal = localStorage.getItem(StorageManager.LEGACY_PREFIX + key);
                if (legacyVal !== null) {
                    // Only migrate if target is empty (don't overwrite new data)
                    const targetVal = localStorage.getItem(targetPrefix + key);
                    if (targetVal === null) {
                        localStorage.setItem(targetPrefix + key, legacyVal);
                        summary.totalMigrated++;
                        summary.keysProcessed.push(key);
                    }
                }
            } catch (e) {
                summary.errors.push(`${key}: ${e.message}`);
            }
        });

        return {
            success: true,
            message: `Successfully migrated ${summary.totalMigrated} data objects.`,
            summary
        };
    }
};

window.MigrationUtility = MigrationUtility;
export default MigrationUtility;
