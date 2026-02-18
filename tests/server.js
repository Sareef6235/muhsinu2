// server.js (Root Backend)
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { createClient } = require("@supabase/supabase-js");

const app = express();

/* =========================
   MIDDLEWARE (PRODUCTION)
========================= */
app.use(cors()); // Allow cross-origin requests
app.use(express.json({ limit: "50mb" })); // Support large payloads
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(".")); // Serve all static files from root

/* =========================
   DATA NODE: LOCAL
========================= */
const localFilePath = path.join(__dirname, "pages", "results", "published-results.json");
const localDir = path.dirname(localFilePath);
if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
if (!fs.existsSync(localFilePath)) fs.writeFileSync(localFilePath, JSON.stringify({ exams: [] }, null, 2));

/* =========================
   DATA NODE: MONGODB
========================= */
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("✅ Database: MongoDB Connected"))
        .catch(err => console.error("❌ Database: MongoDB Connection Error:", err));
}
const MongoResult = mongoose.model("MongoResult", new mongoose.Schema({}, { strict: false }));

/* =========================
   DATA NODE: SUPABASE
========================= */
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log("✅ Database: Supabase Connected");
}

/* =========================
   API ROUTES
========================= */

// Health Check
app.get("/health", (req, res) => res.json({
    status: "Operational",
    node: process.version,
    uptime: process.uptime()
}));

// Unified Deployment Route
app.post("/deploy", async (req, res) => {
    try {
        const data = req.body;
        if (!data) return res.status(400).json({ success: false, message: "No payload received" });

        const results = data.exams?.[0]?.results || data.results || (Array.isArray(data) ? data : null);
        if (!results || !Array.isArray(results)) {
            return res.status(400).json({ success: false, message: "Invalid payload: Expected results array" });
        }

        console.log(`🚀 Syncing ${results.length} records...`);

        // 1. MongoDB Sync
        if (mongoose.connection.readyState === 1) {
            await MongoResult.deleteMany({});
            await MongoResult.insertMany(results);
        }

        // 2. Supabase Sync (Chunked)
        if (supabase) {
            await supabase.from("results").delete().neq("id", 0);
            const CHUNK = 500;
            for (let i = 0; i < results.length; i += CHUNK) {
                await supabase.from("results").insert(results.slice(i, i + CHUNK));
            }
        }

        // 3. Local JSON Sync (Persistence)
        const finalData = data.exams ? data : { exams: [{ results }] };
        fs.writeFileSync(localFilePath, JSON.stringify(finalData, null, 2));

        res.status(200).json({
            success: true,
            message: "Cloud and Local nodes synchronized successfully",
            count: results.length
        });

    } catch (error) {
        console.error("❌ Deployment Crash:", error);
        res.status(500).json({ success: false, message: "Internal server error during sync", error: error.message });
    }
});

// Unified Results Retrieval
app.get("/results", async (req, res) => {
    try {
        // Priority: Mongo > Supabase > Local
        if (mongoose.connection.readyState === 1) {
            const mData = await MongoResult.find({});
            if (mData.length > 0) return res.json({ exams: [{ results: mData }] });
        }
        if (supabase) {
            const { data: sData } = await supabase.from("results").select("*");
            if (sData?.length > 0) return res.json({ exams: [{ results: sData }] });
        }
        if (fs.existsSync(localFilePath)) {
            return res.json(JSON.parse(fs.readFileSync(localFilePath, "utf8")));
        }
        res.json({ exams: [] });
    } catch (err) {
        res.status(500).json({ success: false, message: "Data retrieval failure" });
    }
});

/* =========================
   STARTUP
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Secure Result Engine Online`);
    console.log(`🌍 Endpoint: http://localhost:${PORT}`);
    console.log(`📦 Payload Limit: 50MB | Sync Nodes: Mongo, Supabase, Local\n`);
});
