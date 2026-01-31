import admin from "firebase-admin";
import { readFileSync } from "fs";

// Load service account key
const serviceAccount = JSON.parse(
    readFileSync("./my-pc-895cd-firebase-adminsdk-fbsvc-b34d8c77ec.json", "utf8")
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const uid = "CU5fapPAJ3eFDc4BqMEQtDAqly03";

async function grantAdminRole() {
    try {
        const userRef = db.collection("users").doc(uid);
        await userRef.set({
            role: "admin",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`Successfully granted admin role to UID: ${uid}`);
        process.exit(0);
    } catch (error) {
        console.error("Error granting admin role:", error);
        process.exit(1);
    }
}

grantAdminRole();
