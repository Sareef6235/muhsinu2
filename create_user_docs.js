import admin from "firebase-admin";
import { readFileSync } from "fs";

// Load service account key
const serviceAccount = JSON.parse(
    readFileSync("./my-pc-895cd-firebase-adminsdk-fbsvc-b34d8c77ec.json", "utf8")
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

/**
 * Ensures all Firebase Auth users have corresponding Firestore documents
 * Creates missing documents with default student role
 */
async function ensureUserDocuments() {
    try {
        console.log("🔍 Fetching all Firebase Auth users...");
        const listUsersResult = await auth.listUsers();
        const users = listUsersResult.users;

        console.log(`📊 Found ${users.length} users in Firebase Auth`);

        let created = 0;
        let existing = 0;
        let updated = 0;

        for (const user of users) {
            const userRef = db.collection("users").doc(user.uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                // Create missing user document
                console.log(`⚠️  Missing document for ${user.email} (${user.uid})`);
                await userRef.set({
                    email: user.email,
                    role: "student",
                    approved: false,
                    active: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Created document for ${user.email}`);
                created++;
            } else {
                const data = userDoc.data();
                // Ensure required fields exist
                const updates = {};

                if (!data.email) updates.email = user.email;
                if (!data.role) updates.role = "student";
                if (data.approved === undefined) updates.approved = false;
                if (data.active === undefined) updates.active = true;

                if (Object.keys(updates).length > 0) {
                    await userRef.update(updates);
                    console.log(`🔧 Updated missing fields for ${user.email}:`, Object.keys(updates));
                    updated++;
                } else {
                    existing++;
                }
            }
        }

        console.log("\n📈 Summary:");
        console.log(`   ✅ Created: ${created}`);
        console.log(`   🔧 Updated: ${updated}`);
        console.log(`   ✔️  Already existed: ${existing}`);
        console.log(`   📊 Total: ${users.length}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

// Run the function
ensureUserDocuments();
