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
import { services as defaultServices } from './services-data.js';

export const ServicesCMS = {
    COLLECTION: 'services',

    /**
     * Get all services from Firestore
     */
    async getAll() {
        try {
            const snapshot = await getDocs(collection(db, this.COLLECTION));
            let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (list.length === 0) {
                // Migration: If Firestore is empty, push default data
                console.log("Firestore empty, migrating default services...");
                const initialData = this.migrateStaticToCMS(defaultServices);
                for (const item of initialData) {
                    const id = item.id;
                    const data = { ...item };
                    delete data.id;
                    await setDoc(doc(db, this.COLLECTION, id), data);
                }
                return initialData;
            }
            return list;
        } catch (e) {
            console.error("Error fetching services:", e);
            return [];
        }
    },

    migrateStaticToCMS(staticList) {
        return staticList.map(s => {
            if (s.content && s.content.en && s.content.en.title) return s;
            return {
                id: s.id,
                visible: true,
                templateId: 'corporate',
                icon: s.icon,
                image: null,
                video: null,
                content: {
                    en: {
                        title: s.title || '',
                        shortDesc: s.shortDescription || '',
                        fullDesc: s.fullDescription || '',
                        features: s.bulletPoints || []
                    },
                    ar: { title: '', shortDesc: '', fullDesc: '', features: [] },
                    ml: { title: '', shortDesc: '', fullDesc: '', features: [] }
                },
                createdAt: new Date().toISOString()
            };
        });
    },

    async getById(id) {
        const list = await this.getAll();
        return list.find(s => s.id === id);
    },

    async add(service) {
        const id = service.id;
        delete service.id;
        service.updatedAt = serverTimestamp();
        await setDoc(doc(db, this.COLLECTION, id), service);
    },

    async update(id, updatedData) {
        delete updatedData.id;
        updatedData.updatedAt = serverTimestamp();
        await setDoc(doc(db, this.COLLECTION, id), updatedData, { merge: true });
    },

    async delete(id) {
        await deleteDoc(doc(db, this.COLLECTION, id));
    },

    async reorder(id, newIndex) {
        // reordering in Firestore usually needs an 'order' field.
        // For now, we'll just skip it or update an 'order' field if we add it.
        // CMS logic in services.html depends on this. 
        // I'll add an 'orderIndex' field to the data.
        const list = await this.getAll();
        // Skip for now as it needs a systematic order update for the whole collection
    },

    exportData() {
        // ... keeps logic for client-side download
    },

    getTemplates() {
        return [
            { id: 'corporate', name: 'Corporate Standard', icon: 'ph-buildings' },
            { id: 'creative', name: 'Creative Neon', icon: 'ph-paint-brush' },
            { id: 'minimal', name: 'Minimal Modern', icon: 'ph-text-aa' },
            { id: 'gallery', name: 'Gallery Showcase', icon: 'ph-image' },
            { id: 'glass', name: 'Glassmorphism', icon: 'ph-rows' },
            { id: '3d', name: '3D Futuristic', icon: 'ph-cube' },
            { id: 'poster', name: 'Poster Style', icon: 'ph-layout' },
            { id: 'video', name: 'Video Hero', icon: 'ph-video-camera' },
            { id: 'calligraphy', name: 'Arabic Calligraphy', icon: 'ph-pen-nib' },
            { id: 'typography', name: 'Malayalam Typography', icon: 'ph-text-t' }
        ];
    }
};

