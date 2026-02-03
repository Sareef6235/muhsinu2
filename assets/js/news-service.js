/**
 * News Service (Local Version)
 * Manages news and updates using the local Storage engine.
 */

import { Storage } from './core/storage.js';

const COLLECTION = 'news';

export class NewsService {

    constructor() {
        // Ensure default news exists
        const existing = Storage.getAll(COLLECTION);
        if (existing.length === 0) {
            Storage.init(COLLECTION, [
                {
                    id: 'news_init_1',
                    title: { en: 'Welcome to our new website!', ar: 'مرحبا بكم' },
                    shortDesc: 'We have launched our new digital platform.',
                    date: new Date().toISOString(),
                    image: null
                }
            ]);
        }
    }

    async getAllNews() {
        // Sort by date desc
        const news = Storage.getAll(COLLECTION);
        return news.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    async getLatestNews(limit = 3) {
        const news = await this.getAllNews();
        return news.slice(0, limit);
    }

    async saveNews(data, id = null) {
        if (id) {
            data.id = id;
        } else {
            data.id = 'news_' + Date.now();
            data.createdAt = new Date().toISOString();
        }

        // Ensure date field works
        if (!data.date) data.date = new Date().toISOString();

        Storage.save(COLLECTION, data);
        return data;
    }

    async deleteNews(id) {
        Storage.delete(COLLECTION, id);
    }
}

// Global Exposure
window.NewsService = NewsService;
