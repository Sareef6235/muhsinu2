import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Shared Auth Nav Guard
 * Toggles visibility of elements and provides global auth helpers.
 */

window.currentUser = null;
window.userData = null;

onAuthStateChanged(auth, async (user) => {
    window.currentUser = user;
    const adminElements = document.querySelectorAll('.admin-only');
    const authOnlyElements = document.querySelectorAll('.auth-only');
    const guestOnlyElements = document.querySelectorAll('.guest-only');

    if (!user) {
        window.userData = null;
        adminElements.forEach(el => el.style.display = 'none');
        authOnlyElements.forEach(el => el.style.display = 'none');
        guestOnlyElements.forEach(el => el.style.display = 'block');
        return;
    }

    // User is logged in
    authOnlyElements.forEach(el => el.style.display = 'block');
    guestOnlyElements.forEach(el => el.style.display = 'none');

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            window.userData = userDoc.data();
            if (window.userData.role === 'admin') {
                console.log("👑 Admin detected, revealing protected elements...");
                adminElements.forEach(el => el.style.display = 'block');
            } else {
                adminElements.forEach(el => el.style.display = 'none');
            }
        }
    } catch (e) {
        console.error("Auth Nav Guard Error:", e);
    }
});

/**
 * Global Logout Helper
 */
window.logout = async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (e) {
        console.error("Logout Error:", e);
    }
};

/**
 * Route Protection Helper
 * @param {string} roleRequired - 'student' or 'admin'
 */
window.requireAuth = (roleRequired = 'student') => {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                return;
            }

            if (roleRequired === 'admin') {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (!userDoc.exists() || userDoc.data().role !== 'admin') {
                    alert("Unauthorized access. Admin privileges required.");
                    window.location.href = 'index.html';
                    return;
                }
            }
            resolve(user);
        });
    });
};

