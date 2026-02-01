/**
 * NewsService - Dynamic News & Notice System
 * Handles data storage, retrieval, and image compression.
 * Compatible with future Firebase migration.
 */

export class NewsService {
    constructor() {
        this.STORAGE_KEY = 'mhm_news_data';
        this.news = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
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
        // Validation
        if (!newsItem.title || !newsItem.shortDescription) {
            throw new Error("Title and Short Description are required.");
        }

        // Auto-generate ID if missing
        if (!newsItem.id) {
            newsItem.id = this._generateSlug(newsItem.title);
            newsItem.createdAt = new Date().toISOString();
        }

        const existingIndex = this.news.findIndex(n => n.id === newsItem.id);

        if (existingIndex >= 0) {
            this.news[existingIndex] = { ...this.news[existingIndex], ...newsItem };
        } else {
            this.news.push(newsItem);
        }

        this._persist();
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
            alert("Storage Quota Exceeded! Please delete old news or use smaller images.");
        }
    }

    /**
     * Helper: Generate URL-friendly slug
     */
    _generateSlug(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '') + '-' + Date.now().toString().slice(-4);
    }

    /**
     * IMAGE COMPRESSION UTILITY
     * Compresses image to ensure it's under ~100KB
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

                    // Resize if too big (max width 800px)
                    const MAX_WIDTH = 800;
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Quality reduction loop
                    let quality = 0.9;
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
