import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const filePath = path.join(process.cwd(), "data", "military-results.json");

        if (!fs.existsSync(filePath)) {
            return res.status(200).json([]);
        }

        const data = fs.readFileSync(filePath, "utf8");
        return res.status(200).json(JSON.parse(data));
    } catch (err) {
        console.error("API Error:", err);
        return res.status(500).json({
            success: false,
            message: "Retrieval failure."
        });
    }
}
