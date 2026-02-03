/**
 * Bookings Manager (Local)
 * Handles tuition booking records with local storage.
 */

import { Storage } from './core/storage.js';

const COLLECTION = 'bookings';

export const BookingsManager = {

    async getAll() {
        const list = Storage.getAll(COLLECTION);
        // Sort by createdAt desc
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    async add(booking) {
        booking.id = 'bk_' + Date.now();
        booking.createdAt = new Date().toISOString();
        Storage.save(COLLECTION, booking);
        return booking;
    },

    async delete(id) {
        Storage.delete(COLLECTION, id);
    },

    async getStats() {
        const list = await this.getAll();
        return {
            total: list.length,
            recent: list.filter(b => {
                const d = new Date(b.createdAt);
                const now = new Date();
                return (now - d) < (7 * 24 * 60 * 60 * 1000); // Last 7 days
            }).length
        };
    }
};

window.BookingsManager = BookingsManager;
