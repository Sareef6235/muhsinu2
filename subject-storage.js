/**
 * Subject Storage Utility
 * Manages subject data in localStorage
 * NO Firebase - Pure localStorage implementation
 */

const STORAGE_KEY = 'tuition_subjects';

const SubjectStorage = {
    /**
     * Get all subjects from localStorage
     * @returns {Array} Array of subject objects
     */
    getAll() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading subjects:', error);
            return [];
        }
    },

    /**
     * Get only active subjects
     * @returns {Array} Array of active subject objects
     */
    getActive() {
        return this.getAll().filter(subject => subject.active !== false);
    },

    /**
     * Get subject by ID
     * @param {string} id - Subject ID
     * @returns {Object|null} Subject object or null
     */
    getById(id) {
        const subjects = this.getAll();
        return subjects.find(s => s.id === id) || null;
    },

    /**
     * Save or update a subject
     * @param {Object} subject - Subject object {id?, name, price, active?}
     * @returns {Object} Saved subject with ID
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
                this._saveAll(subjects);
                return subjects[index];
            }
        }

        // Create new
        const newSubject = {
            id: this._generateId(),
            name: subject.name,
            price: Number(subject.price),
            active: subject.active !== false, // Default to true
            createdAt: now,
            updatedAt: now
        };

        subjects.push(newSubject);
        this._saveAll(subjects);
        return newSubject;
    },

    /**
     * Delete a subject by ID
     * @param {string} id - Subject ID
     * @returns {boolean} Success status
     */
    delete(id) {
        const subjects = this.getAll();
        const filtered = subjects.filter(s => s.id !== id);

        if (filtered.length < subjects.length) {
            this._saveAll(filtered);
            return true;
        }
        return false;
    },

    /**
     * Toggle subject active status
     * @param {string} id - Subject ID
     * @returns {Object|null} Updated subject or null
     */
    toggle(id) {
        const subjects = this.getAll();
        const subject = subjects.find(s => s.id === id);

        if (subject) {
            subject.active = !subject.active;
            subject.updatedAt = new Date().toISOString();
            this._saveAll(subjects);
            return subject;
        }
        return null;
    },

    /**
     * Get count of active subjects
     * @returns {number} Count of active subjects
     */
    getActiveCount() {
        return this.getActive().length;
    },

    /**
     * Private: Save all subjects to localStorage
     * @param {Array} subjects - Array of subjects
     */
    _saveAll(subjects) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
        } catch (error) {
            console.error('Error saving subjects:', error);
            throw new Error('Failed to save subjects. Storage might be full.');
        }
    },

    /**
     * Private: Generate unique ID
     * @returns {string} Unique ID
     */
    _generateId() {
        return 'subj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Initialize with default subjects (for first-time setup)
     * @param {Array} defaultSubjects - Array of {name, price}
     */
    initializeDefaults(defaultSubjects) {
        const existing = this.getAll();
        if (existing.length === 0 && defaultSubjects && defaultSubjects.length > 0) {
            defaultSubjects.forEach(subject => {
                this.save(subject);
            });
            console.log('Initialized with default subjects');
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubjectStorage;
}
