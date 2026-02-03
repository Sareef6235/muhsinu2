/**
 * Testimonials CMS (Local Version)
 * Manages user testimonials using LocalStorage.
 */

import { Storage } from '../core/storage.js';

const COLLECTION = 'site_testimonials';

export const TestimonialsCMS = {

    /**
     * Get all testimonials
     */
    async getAll() {
        const list = Storage.getAll(COLLECTION);
        if (list.length === 0) {
            console.log("Testimonials CMS empty, loading defaults...");
            const defaults = [
                {
                    id: 'tm_1',
                    name: 'Parent Name',
                    role: 'Parent of Class 5 Student',
                    content: 'The best institution for moral and academic growth. My child has improved significantly.',
                    rating: 5,
                    active: true
                },
                {
                    id: 'tm_2',
                    name: 'Alumni Name',
                    role: 'Class of 2024',
                    content: 'A perfect blend of tradition and modernity. The teachers are very supportive.',
                    rating: 5,
                    active: true
                }
            ];
            defaults.forEach(item => Storage.save(COLLECTION, item));
            return defaults;
        }
        return list;
    },

    /**
     * Save Testimonial
     */
    async save(data) {
        if (!data.id) data.id = 'tm_' + Date.now();
        Storage.save(COLLECTION, data);
        return data;
    },

    /**
     * Delete Testimonial
     */
    async delete(id) {
        Storage.delete(COLLECTION, id);
    }
};

window.TestimonialsCMS = TestimonialsCMS;
