import nodemailer from "nodemailer";
import multer from "multer";
import express from 'express'; // Ensure express is imported if used explicitly, though initialized below
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

dotenv.config();

// --- Configuration ---
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.ADMIN_CHAT_ID;
const githubToken = process.env.GITHUB_TOKEN;
const repoOwner = process.env.REPO_OWNER;
const repoName = process.env.REPO_NAME;
const uploadPath = process.env.UPLOAD_PATH || "assets/gallery";
const port = process.env.PORT || 3000;

// Firebase Init
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}
const db = admin.database();

// Telegram Bot Init
let bot;
if (botToken) {
    bot = new TelegramBot(botToken);
} else {
    console.warn("⚠️ TELEGRAM_BOT_TOKEN is missing. Bot features will be disabled.");
}
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Multer Config (Memory Storage for direct email attachment)
const upload = multer({ storage: multer.memoryStorage() });

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Diagnostic: Check if API is alive
app.get('/api/ping', (req, res) => res.json({ success: true, message: "API is online!" }));

// API: Handle Student Creations Submission (with File Support)
app.post('/api/submit-creation', upload.single('file'), async (req, res) => {
    const { name, className, type, title, content } = req.body;
    const file = req.file; // The uploaded file (if any)

    // Basic Validation
    if (!name || (!content && !file)) {
        return res.status(400).json({ success: false, error: "Missing required fields (Name and either Content or File)" });
    }

    try {
        // 1. Prepare Email Options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "123v213@gmail.com", // Target email address
            subject: `New ${type} Submission: ${title || 'Untitled'}`,
            text: `Submission Details:\n-------------------\nStudent Name: ${name}\nClass: ${className}\nWork Type: ${type}\nWork Title: ${title}\n\nContent/Message:\n${content || '(See attached file)'}`,
            attachments: []
        };

        // 2. Attach File if exists
        if (file) {
            mailOptions.attachments.push({
                filename: file.originalname,
                content: file.buffer
            });
        }

        // 3. Send Email via Nodemailer
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent for: ${title}`);

        // 4. GitHub Upload (Keep logic for Stories/Poems)
        if (type === 'Story' || type === 'Poem') {
            const timestamp = Date.now();
            const safeTitle = (title || "Untitled").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
            const safeName = name.replace(/[^a-zA-Z0-9]/g, "") || "Student";
            const filename = `${safeTitle}_by_${safeName}_${timestamp}.txt`;
            const filePath = `hn/assets/creations/stories/${filename}`;

            const fileContent = `Title: ${title}\nStudent: ${name}\nClass: ${className}\nType: ${type}\nDate: ${new Date().toLocaleString()}\n\n---\n\n${content}`;
            const base64Content = Buffer.from(fileContent).toString('base64');

            await axios.put(
                `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
                {
                    message: `New submission: ${title} by ${name}`,
                    content: base64Content
                },
                { headers: { Authorization: `token ${githubToken}` } }
            );
            console.log(`✅ GitHub upload success: ${filename}`);
        }

        res.json({ success: true, message: "Submission received! Email sent and gallery updated (if applicable)." });

    } catch (error) {
        console.error("❌ Submission processing failed:", error.message);
        res.status(500).json({ success: false, error: "Failed to process submission. Please try again." });
    }
});

// Handle Webhook POST requests (Telegram)
app.post(`/bot${botToken}`, (req, res) => {
    if (bot) {
        bot.processUpdate(req.body);
    }
    res.sendStatus(200);
});

// Serve Static Files (Frontend) after API routes
app.use(express.static(__dirname));

// Serve index.html as the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`📡 Server is listening on port ${port}`);

    // Auto-connect Webhook on Render
    const externalUrl = process.env.RENDER_EXTERNAL_URL;
    if (externalUrl && botToken && bot) {
        bot.setWebHook(`${externalUrl}/bot${botToken}`)
            .then(() => console.log(`🔗 Webhook successfully set to: ${externalUrl}/bot${botToken}`))
            .catch(err => console.error("❌ Failed to set webhook:", err.message));
    } else {
        console.log("⚠️ Webhook skip: Missing token, external URL, or bot not initialized.");
    }
});

// --- BOT LOGIC ---
if (bot) {
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
}
