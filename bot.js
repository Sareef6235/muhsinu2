import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import admin from 'firebase-admin';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Admin initialization
const serviceAccountPath = path.join(__dirname, 'my-pc-895cd-firebase-adminsdk-fbsvc-b34d8c77ec.json');
if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://my-pc-895cd-default-rtdb.firebaseio.com"
    });
    console.log("Firebase Admin initialized successfully.");
} else {
    console.warn("Firebase Service Account file not found. Database features will be limited.");
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/creations.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'creations.html'));
});

app.get('/exam_result.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'exam_result.html'));
});

app.get('/meelad_result.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'meelad_result.html'));
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API ping endpoint
app.get('/api/ping', (req, res) => {
    res.json({ success: true, message: 'Backend is active and running!' });
});

// API endpoint for creation submission
app.post('/api/submit-creation', upload.single('file'), async (req, res) => {
    try {
        const { name, className, type, title, content } = req.body;
        const file = req.file;

        console.log('Received submission:', { name, className, type, title });

        // Validate required fields
        if (!name || !className || !type || !title) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const REPO_OWNER = process.env.REPO_OWNER || 'Sareef6235';
        const REPO_NAME = process.env.REPO_NAME || 'muhsinu2';

        if (!GITHUB_TOKEN) {
            console.error('GitHub token not configured');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: GitHub token missing'
            });
        }

        let uploadResult;

        // Handle file upload for drawings
        if (type === 'Drawing' && file) {
            const timestamp = Date.now();
            const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `${name.replace(/\s+/g, '_')}_${sanitizedTitle}_${timestamp}${path.extname(file.originalname)}`;
            const filePath = `hn/assets/creations/drawings/${fileName}`;

            // Upload to GitHub
            const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

            try {
                const response = await axios.put(githubApiUrl, {
                    message: `Add drawing: ${title} by ${name}`,
                    content: file.buffer.toString('base64'),
                    branch: 'main'
                }, {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });

                uploadResult = { success: true, path: filePath, url: response.data.content.download_url };
            } catch (error) {
                console.error('GitHub upload error:', error.response?.data || error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to upload file to GitHub: ' + (error.response?.data?.message || error.message)
                });
            }
        }
        // Handle text content for stories/poems
        else if ((type === 'Story' || type === 'Poem') && content) {
            const timestamp = Date.now();
            const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `${name.replace(/\s+/g, '_')}_${sanitizedTitle}_${timestamp}.txt`;
            const filePath = `hn/assets/creations/stories/${fileName}`;

            const fileContent = `Title: ${title}
Student: ${name}
Class: ${className}
Type: ${type}
Date: ${new Date().toLocaleDateString()}
---

${content}`;

            const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

            try {
                const response = await axios.put(githubApiUrl, {
                    message: `Add ${type.toLowerCase()}: ${title} by ${name}`,
                    content: Buffer.from(fileContent).toString('base64'),
                    branch: 'main'
                }, {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });

                uploadResult = { success: true, path: filePath, url: response.data.content.download_url };
            } catch (error) {
                console.error('GitHub upload error:', error.response?.data || error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to upload content to GitHub: ' + (error.response?.data?.message || error.message)
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                error: 'Invalid submission: Either file (for drawings) or content (for stories/poems) is required'
            });
        }

        res.json({
            success: true,
            message: 'Submission received successfully!',
            data: uploadResult
        });

    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
    console.log(`API endpoints available at: http://localhost:${PORT}/api/*`);
});
