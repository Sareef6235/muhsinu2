/**
 * Gallery Database Layer - Firestore Implementation
 */

import { db } from './firebase-config.js';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class GalleryDB {
    constructor() {
        this.COLLECTION = 'gallery';
    }

    async init() {
        console.log('📁 Gallery Firestore Layer Ready');
        return true;
    }

    // --- Media Operations ---
    async addMedia(item) {
        try {
            const data = {
                ...item,
                createdAt: serverTimestamp()
            };
            const docRef = await addDoc(collection(db, this.COLLECTION), data);
            return docRef.id;
        } catch (e) {
            console.error("Error adding media:", e);
            throw e;
        }
    }

    async getAllMedia() {
        try {
            const q = query(collection(db, this.COLLECTION), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error fetching media:", e);
            return [];
        }
    }

    async deleteMedia(id) {
        try {
            await deleteDoc(doc(db, this.COLLECTION, id));
            return true;
        } catch (e) {
            console.error("Error deleting media:", e);
            throw e;
        }
    }

    // --- Settings Operations ---
    async saveSetting(key, value) {
        try {
            await setDoc(doc(db, 'settings', key), { value, updatedAt: serverTimestamp() });
            return true;
        } catch (e) {
            console.error("Error saving setting:", e);
            throw e;
        }
    }

    async getSetting(key) {
        try {
            const docSnap = await getDoc(doc(db, 'settings', key));
            return docSnap.exists() ? docSnap.data().value : null;
        } catch (e) {
            console.error("Error fetching setting:", e);
            return null;
        }
    }
}

// Global DB instance
window.galleryDB = new GalleryDB();
window.galleryDB.init();

export { GalleryDB };
export const galleryDB = window.galleryDB;
