import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDY3La232JPHrnwPL_VfwQKJ07JLIEHAZE",
    authDomain: "my-pc-895cd.firebaseapp.com",
    databaseURL: "https://my-pc-895cd-default-rtdb.firebaseio.com",
    projectId: "my-pc-895cd",
    storageBucket: "my-pc-895cd.firebasestorage.app",
    messagingSenderId: "970176385787",
    appId: "1:970176385787:web:d21a6d1ef8079934fb565e",
    measurementId: "G-NKFHNQ88XG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
