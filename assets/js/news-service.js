import { db } from "./firebase.js";
import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    query,
    where,
    addDoc,
    serverTimestamp,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class NewsService {
    constructor() {
        this.COLLECTION = 'news';
        this.LAST_ID_KEY = 'mhm_last_news_id';
    }

    /**
     * Get all published news sorted by date (newest first)
     */
    async getPublishedNews() {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where("status", "==", "published"),
                orderBy("date", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error fetching published news:", e);
            return [];
        }
    }

    /**
     * Get all news (for admin)
     */
    async getAllNews() {
        try {
            const q = query(collection(db, this.COLLECTION), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error fetching all news:", e);
            return [];
        }
    }

    /**
     * Get single news item by ID
     */
    async getNewsById(id) {
        try {
            const news = await this.getAllNews();
            return news.find(item => item.id === id);
        } catch (e) {
            return null;
        }
    }

    /**
     * Create or Update a news item
     */
    async saveNews(newsItem) {
        if (!newsItem.title || (!newsItem.title.en && !newsItem.title.ml && !newsItem.title.ar)) {
            throw new Error("Title is required (at least one language).");
        }

        const data = {
            ...newsItem,
            updatedAt: serverTimestamp()
        };

        if (!newsItem.id) {
            data.createdAt = serverTimestamp();
            const docRef = await addDoc(collection(db, this.COLLECTION), data);
            data.id = docRef.id;
        } else {
            await setDoc(doc(db, this.COLLECTION, newsItem.id), data, { merge: true });
        }

        if (newsItem.status === 'published') {
            localStorage.setItem(this.LAST_ID_KEY, newsItem.id || data.id);
        }

        return data;
    }

    /**
     * Delete news item
     */
    async deleteNews(id) {
        await deleteDoc(doc(db, this.COLLECTION, id));
    }

    static async compressImage(file) {
        // ... keeps existing compression logic locally before upload/save
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

