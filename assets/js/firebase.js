import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDY3La232JPHrnwPL_VfwQKJ07JLIEHAZE",
    authDomain: "my-pc-895cd.firebaseapp.com",
    projectId: "my-pc-895cd",
    storageBucket: "my-pc-895cd.appspot.com",
    messagingSenderId: "338865612196",
    appId: "1:338865612196:web:65e1001f301cb001099684",
    measurementId: "G-9KXY469D1E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;
