/**
 * Subject Storage Utility
 * Manages subject data using namespaced StorageManager
 */
import StorageManager from './storage-manager.js';

const STORAGE_KEY = 'tuition_subjects';

const SubjectStorage = {
    /**
     * Get all subjects from storage (namespaced)
     */
    getAll() {
        return StorageManager.get(STORAGE_KEY, []);
    },

    /**
     * Get only active subjects
     */
    getActive() {
        return this.getAll().filter(subject => subject.active !== false);
    },

    /**
     * Get subject by ID
     */
    getById(id) {
        const subjects = this.getAll();
        return subjects.find(s => s.id === id) || null;
    },

    /**
     * Save or update a subject
     */
    save(subject) {
        const subjects = this.getAll();
        const now = new Date().toISOString();

        if (subject.id) {
            // Update existing
            const index = subjects.findIndex(s => s.id === subject.id);
            if (index !== -1) {
                subjects[index] = {
                    ...subjects[index],
                    ...subject,
                    updatedAt: now
                };
                StorageManager.set(STORAGE_KEY, subjects);
                return subjects[index];
            }
        }

        // Create new
        const newSubject = {
            id: 'subj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: subject.name,
            teacher: subject.teacher || '',
            price: Number(subject.price),
            active: subject.active !== false,
            createdAt: now,
            updatedAt: now
        };

        subjects.push(newSubject);
        StorageManager.set(STORAGE_KEY, subjects);
        return newSubject;
    },

    /**
     * Delete a subject by ID
     */
    delete(id) {
        let subjects = this.getAll();
        const filtered = subjects.filter(s => s.id !== id);
        if (filtered.length < subjects.length) {
            StorageManager.set(STORAGE_KEY, filtered);
            return true;
        }
        return false;
    },

    /**
     * Toggle subject active status
     */
    toggle(id) {
        const subjects = this.getAll();
        const subject = subjects.find(s => s.id === id);
        if (subject) {
            subject.active = !subject.active;
            subject.updatedAt = new Date().toISOString();
            StorageManager.set(STORAGE_KEY, subjects);
            return subject;
        }
        return null;
    },

    /**
     * Get count of active subjects
     */
    getActiveCount() {
        return this.getActive().length;
    }
};

window.SubjectStorage = SubjectStorage;
export default SubjectStorage;
