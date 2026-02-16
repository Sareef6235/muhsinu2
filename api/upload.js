import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const data = req.body;
            const dataDir = path.join(process.cwd(), 'data');

            // Ensure data directory exists
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            const filePath = path.join(dataDir, 'published-results.json');
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

            return res.status(200).json({
                success: true,
                message: 'Deployment Success: Cloud Source Updated.'
            });
        } catch (err) {
            console.error("API Error:", err);
            return res.status(500).json({
                success: false,
                message: 'Internal System Failure: Synchronization Interrupted.'
            });
        }
    }
    res.status(405).json({ message: 'Method not allowed' });
}
