/**
 * News Service - REBUILT FOR LOCAL CMS (V2)
 * Manages news, notices, and updates entirely client-side.
 */
import StorageManager from './storage-manager.js';

export class NewsService {
    constructor() {
        this.STORAGE_KEY = 'site_news';
        this.news = [];
        this.init();
    }

    init() {
        this.news = StorageManager.get(this.STORAGE_KEY, [
            {
                id: 'n1',
                title: 'Admission Open 2026',
                desc: 'We are now accepting registrations for the new academic session. Join our community today!',
                date: new Date().toISOString(),
                status: 'published',
                category: 'Admission',
                image: ''
            },
            {
                id: 'n2',
                title: 'Annual Arts Festival',
                desc: 'Get ready for the grand cultural event of the year. Talent and creativity at its best.',
                date: new Date().toISOString(),
                status: 'published',
                category: 'Event',
                image: ''
            }
        ]);
        StorageManager.set(this.STORAGE_KEY, this.news);
    }

    sync() {
        this.news = StorageManager.get(this.STORAGE_KEY, []);
        window.dispatchEvent(new CustomEvent('news-updated'));
        return this.news;
    }

    getPublishedNews() {
        return this.news.filter(n => n.status === 'published');
    }

    getAllNews() {
        return this.news;
    }

    async saveNews(newsItem) {
        const id = newsItem.id || 'news_' + Date.now();
        const updatedItem = {
            ...newsItem,
            id,
            date: newsItem.date || new Date().toISOString(),
            status: newsItem.status || 'published'
        };

        this.news = this.news.filter(n => n.id !== id);
        this.news.unshift(updatedItem);
        StorageManager.set(this.STORAGE_KEY, this.news);
        this.sync();
        return updatedItem;
    }

    async deleteNews(id) {
        this.news = this.news.filter(n => n.id !== id);
        StorageManager.set(this.STORAGE_KEY, this.news);
        this.sync();
    }
}

const newsInstance = new NewsService();
export default newsInstance;
