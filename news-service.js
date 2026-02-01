/**
 * NewsService - Dynamic News & Notice System
 * Handles data storage, retrieval, and image compression.
 * Compatible with future Firebase migration.
 */

export class NewsService {
    constructor() {
        this.STORAGE_KEY = 'mhm_news_data';
        this.news = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        this.LAST_ID_KEY = 'mhm_last_news_id';
    }

    /**
     * Get all published news sorted by date (newest first)
     */
    getPublishedNews() {
        return this.news
            .filter(item => item.status === 'published')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * Get all news (for admin)
     */
    getAllNews() {
        return this.news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Get single news item by ID
     */
    getNewsById(id) {
        return this.news.find(item => item.id === id);
    }

    /**
     * Create or Update a news item
     */
    async saveNews(newsItem) {
        // Validation - Basic check for main title
        if (!newsItem.title || (!newsItem.title.en && !newsItem.title.ml && !newsItem.title.ar)) {
            throw new Error("Title is required (at least one language).");
        }

        // Auto-generate ID if missing
        if (!newsItem.id) {
            const seedTitle = newsItem.title.en || newsItem.title.ml || "news";
            newsItem.id = this._generateSlug(seedTitle);
            newsItem.createdAt = new Date().toISOString();
        }

        const existingIndex = this.news.findIndex(n => n.id === newsItem.id);

        if (existingIndex >= 0) {
            this.news[existingIndex] = { ...this.news[existingIndex], ...newsItem };
        } else {
            this.news.push(newsItem);
        }

        this._persist();

        // Track last published for highlight effect
        if (newsItem.status === 'published') {
            localStorage.setItem(this.LAST_ID_KEY, newsItem.id);
            this._incrementBadgeCount();
        }

        return newsItem;
    }

    /**
     * Delete news item
     */
    deleteNews(id) {
        this.news = this.news.filter(n => n.id !== id);
        this._persist();
    }

    /**
     * Persist to LocalStorage (Mocking DB save)
     */
    _persist() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.news));
        } catch (e) {
            console.error("Storage Error:", e);
            alert("Storage Quota Exceeded! Please delete old news or use smaller images.");
        }
    }

    _incrementBadgeCount() {
        const count = parseInt(localStorage.getItem('mhm_unread_news') || '0');
        localStorage.setItem('mhm_unread_news', count + 1);
        window.dispatchEvent(new Event('news-updated'));
    }

    static getBadgeCount() {
        return parseInt(localStorage.getItem('mhm_unread_news') || '0');
    }

    static clearBadgeCount() {
        localStorage.setItem('mhm_unread_news', '0');
        window.dispatchEvent(new Event('news-updated'));
    }

    /**
     * Helper: Generate URL-friendly slug
     */
    _generateSlug(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '') + '-' + Math.random().toString(36).substring(2, 6);
    }

    /**
     * IMAGE COMPRESSION UTILITY
     */
    static async compressImage(file) {
        return new Promise((resolve, reject) => {
            const MAX_SIZE_KB = 100;
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    const MAX_WIDTH = 800;
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    let quality = 0.8;
                    let dataUrl = canvas.toDataURL('image/jpeg', quality);

                    while (dataUrl.length > MAX_SIZE_KB * 1024 && quality > 0.1) {
                        quality -= 0.1;
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }

                    resolve(dataUrl);
                };
            };
            reader.onerror = error => reject(error);
        });
    }
}

