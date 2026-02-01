import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Shared Auth Nav Guard
 * Toggles visibility of elements with 'admin-only' class based on Firestore role.
 */
onAuthStateChanged(auth, async (user) => {
    const adminElements = document.querySelectorAll('.admin-only');

    if (!user) {
        adminElements.forEach(el => el.style.display = 'none');
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
            console.log("👑 Admin detected, revealing hidden navigation...");
            adminElements.forEach(el => el.style.display = 'block');
        } else {
            adminElements.forEach(el => el.style.display = 'none');
        }
    } catch (e) {
        console.error("Auth Nav Guard Error:", e);
        adminElements.forEach(el => el.style.display = 'none');
    }
});
