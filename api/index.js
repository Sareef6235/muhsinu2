import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import path from 'path';

const app = express();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => {
    res.json({ success: true, message: 'Vercel Backend is active!' });
});

app.post('/api/submit-creation', upload.single('file'), async (req, res) => {
    try {
        const { name, className, type, title, content } = req.body;
        const file = req.file;

        if (!name || !className || !type || !title) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const REPO_OWNER = process.env.REPO_OWNER || 'Sareef6235';
        const REPO_NAME = process.env.REPO_NAME || 'muhsinu2';

        if (!GITHUB_TOKEN) {
            return res.status(500).json({ success: false, error: 'Server configuration error: GITHUB_TOKEN missing' });
        }

        let uploadResult;

        if (type === 'Drawing' && file) {
            const timestamp = Date.now();
            const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `${name.replace(/\s+/g, '_')}_${sanitizedTitle}_${timestamp}${path.extname(file.originalname)}`;
            const filePath = `assets/creations/drawings/${fileName}`;
            const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

            const response = await axios.put(githubApiUrl, {
                message: `Add drawing: ${title} by ${name}`,
                content: file.buffer.toString('base64'),
                branch: 'main'
            }, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' }
            });
            uploadResult = { success: true, path: filePath, url: response.data.content.download_url };
        }
        else if ((type === 'Story' || type === 'Poem') && content) {
            const timestamp = Date.now();
            const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `${name.replace(/\s+/g, '_')}_${sanitizedTitle}_${timestamp}.txt`;
            const filePath = `assets/creations/stories/${fileName}`;
            const fileContent = `Title: ${title}\nStudent: ${name}\nClass: ${className}\nType: ${type}\nDate: ${new Date().toLocaleDateString()}\n---\n\n${content}`;
            const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

            const response = await axios.put(githubApiUrl, {
                message: `Add ${type.toLowerCase()}: ${title} by ${name}`,
                content: Buffer.from(fileContent).toString('base64'),
                branch: 'main'
            }, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' }
            });
            uploadResult = { success: true, path: filePath, url: response.data.content.download_url };
        } else {
            return res.status(400).json({ success: false, error: 'Invalid submission requirements' });
        }

        res.json({ success: true, message: 'Submission received successfully!', data: uploadResult });
    } catch (error) {
        console.error('Submission error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default app;
