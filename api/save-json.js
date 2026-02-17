import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const dataDir = path.join(process.cwd(), "data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const filePath = path.join(dataDir, "military-results.json");
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));

        return res.status(200).json({
            success: true,
            message: "Military Intelligence Source Updated."
        });
    } catch (err) {
        console.error("API Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Persistence Failure."
        });
    }
}
