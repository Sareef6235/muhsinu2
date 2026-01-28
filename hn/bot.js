import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import dotenv from "dotenv";
import admin from "firebase-admin";
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

dotenv.config();

// Config from .env
const botToken = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_CHAT_ID;
const githubToken = process.env.GITHUB_TOKEN;
const repoOwner = process.env.REPO_OWNER;
const repoName = process.env.REPO_NAME;
const uploadPath = process.env.UPLOAD_PATH;
const databaseURL = process.env.FIREBASE_DATABASE_URL;
const renderUrl = process.env.RENDER_EXTERNAL_URL;
const port = process.env.PORT || 3000;

// Initialize Firebase Admin
try {
    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    } else {
        // If local, try to read the file
        const keyData = JSON.parse(fs.readFileSync('./my-pc-895cd-firebase-adminsdk-fbsvc-b34d8c77ec.json', 'utf8'));
        credential = admin.credential.cert(keyData);
    }

    admin.initializeApp({
        credential: credential,
        databaseURL: databaseURL
    });
    console.log("✅ Firebase Admin initialized.");
} catch (error) {
    console.error("❌ Firebase initialization failed:", error.message);
}

const db = admin.database();

// Initialize Bot
const bot = new TelegramBot(botToken);

// Set Webhook for Render
if (renderUrl) {
    bot.setWebHook(`${renderUrl}/bot${botToken}`);
    console.log(`📡 Webhook set to: ${renderUrl}/bot${botToken}`);
} else {
    console.log("⚠️ RENDER_EXTERNAL_URL not found, using polling mode (not recommended for production).");
    // bot = new TelegramBot(botToken, { polling: true }); // Need to redeclare if switching modes
}

const app = express();
app.use(bodyParser.json());

// Handle Webhook POST requests
app.post(`/bot${botToken}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.get('/', (req, res) => res.send('🤖 Madrasa Admin Bot is running!'));

app.listen(port, () => {
    console.log(`📡 Server is listening on port ${port}`);
});

// --- BOT LOGIC ---

bot.on('message', (msg) => {
    const chatId = msg.chat.id.toString();
    const text = msg.text;

    if (text === '/id') {
        bot.sendMessage(chatId, `🆔 Your Chat ID: ${chatId}`);
        return;
    }

    // Live Notice Trigger for groups
    if (msg.chat.type.includes("group")) {
        db.ref("notice").set(true);
    }
});

bot.on("photo", async (msg) => {
    const chatId = msg.chat.id.toString();

    // 🔒 Admin only check
    if (chatId !== adminId) {
        bot.sendMessage(chatId, "❌ Unauthorized. Only the Admin can upload images to the Gallery.");
        return;
    }

    try {
        bot.sendMessage(chatId, "⏳ Processing image upload to GitHub...");

        const photo = msg.photo[msg.photo.length - 1];
        const file = await bot.getFile(photo.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;

        const image = await axios.get(fileUrl, { responseType: "arraybuffer" });
        const base64Image = Buffer.from(image.data).toString("base64");
        const filename = `img_${Date.now()}.jpg`;

        // Upload to GitHub
        await axios.put(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${uploadPath}/${filename}`,
            {
                message: "Upload image from Telegram admin",
                content: base64Image,
            },
            {
                headers: {
                    Authorization: `token ${githubToken}`,
                },
            }
        );

        // Update Firebase for live sync
        const githubRawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${uploadPath}/${filename}`;
        db.ref("gallery").push({
            url: githubRawUrl,
            timestamp: Date.now()
        });

        bot.sendMessage(chatId, "✅ Success! Image uploaded to GitHub and live on Website Gallery.");
    } catch (err) {
        console.error("❌ Upload error:", err.message);
        bot.sendMessage(chatId, "❌ Upload failed. Please check the logs.");
    }
});
