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
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Subject Storage Utility (Firebase Version)
 * Manages subject data in Firestore
 */
const COLLECTION_NAME = 'subjects';

export const SubjectStorage = {
    /**
     * Get all subjects from Firestore
     */
    async getAll() {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching subjects:', error);
            return [];
        }
    },

    /**
     * Get only active subjects
     */
    async getActive() {
        try {
            const q = query(collection(db, COLLECTION_NAME), where("active", "==", true));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching active subjects:', error);
            return [];
        }
    },

    /**
     * Subscribe to live updates
     */
    subscribe(callback) {
        return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
            const subjects = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(subjects);
        });
    },

    /**
     * Save or update a subject
     */
    async save(subject) {
        const data = {
            name: subject.name,
            price: Number(subject.price),
            active: subject.active !== false,
            rtl: !!subject.rtl,
            updatedAt: serverTimestamp()
        };

        if (subject.id) {
            await setDoc(doc(db, COLLECTION_NAME, subject.id), data, { merge: true });
            return { id: subject.id, ...data };
        } else {
            data.createdAt = serverTimestamp();
            const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
            return { id: docRef.id, ...data };
        }
    },

    /**
     * Delete a subject
     */
    async delete(id) {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    /**
     * Toggle status
     */
    async toggle(id) {
        // First get current state
        const subjects = await this.getAll();
        const subject = subjects.find(s => s.id === id);
        if (subject) {
            await setDoc(doc(db, COLLECTION_NAME, id), {
                active: !subject.active,
                updatedAt: serverTimestamp()
            }, { merge: true });
        }
    }
};

// Export to window for non-module compatibility if needed
window.SubjectStorage = SubjectStorage;
