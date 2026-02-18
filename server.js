// server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// ==========================
// MIDDLEWARE (PRODUCTION SAFE)
// ==========================
app.use(cors()); // Essential for Cloud -> Cloud communication
app.use(express.json({ limit: "50mb" })); // Support for massive institutional files
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(".")); // Root static serving

// ==========================
// DATA PATHS
// ==========================
const localFilePath = path.join(__dirname, "pages", "results", "published-results.json");
const localDir = path.dirname(localFilePath);
if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
if (!fs.existsSync(localFilePath)) fs.writeFileSync(localFilePath, JSON.stringify({ exams: [] }, null, 2));

// ==========================
// DATABASE NODE: MONGODB
// ==========================
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("✅ Node 1: MongoDB ATLAS Connected"))
        .catch(err => console.error("❌ Node 1: MongoDB Connection FAIL:", err));
}
const MongoResult = mongoose.model("MongoResult", new mongoose.Schema({}, { strict: false }));

// ==========================
// DATABASE NODE: SUPABASE
// ==========================
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log("✅ Node 2: Supabase CLOUD Connected");
}

// ==========================
// SYSTEM HANDLERS
// ==========================

const deployHandler = async (req, res) => {
    try {
        const data = req.body;
        if (!data) return res.status(400).json({ success: false, message: "Empty payload received" });

        const results = data.exams?.[0]?.results || data.results || (Array.isArray(data) ? data : null);
        if (!results || !Array.isArray(results)) {
            return res.status(400).json({ success: false, message: "Invalid JSON structure: Expected results array" });
        }

        console.log(`🚀 Deployment Start: ${results.length} records incoming from ${req.headers.origin || 'unknown origin'}`);

        // 1. Cloud Sync (MongoDB)
        if (mongoose.connection.readyState === 1) {
            await MongoResult.deleteMany({});
            await MongoResult.insertMany(results);
            console.log(" - MongoDB: Synchronized");
        }

        // 2. Cloud Sync (Supabase)
        if (supabase) {
            await supabase.from("results").delete().neq("id", 0);
            const CHUNK_SIZE = 500;
            for (let i = 0; i < results.length; i += CHUNK_SIZE) {
                const { error } = await supabase.from("results").insert(results.slice(i, i + CHUNK_SIZE));
                if (error) throw new Error("Supabase Sync Failure: " + error.message);
            }
            console.log(" - Supabase: Synchronized (Chunked)");
        }

        // 3. Persistent Local Sync
        fs.writeFileSync(localFilePath, JSON.stringify(data.exams ? data : { exams: [{ results }] }, null, 2));
        console.log(" - Local Node: Synchronized");

        res.status(200).json({
            success: true,
            message: "Production Cloud Sync Complete",
            count: results.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ CRITICAL SYSTEM ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Cloud deployment failed. System integrity protected.",
            error: error.message
        });
    }
};

const resultsHandler = async (req, res) => {
    try {
        // Priority: MongoDB > Supabase > Local
        if (mongoose.connection.readyState === 1) {
            const mongoData = await MongoResult.find({});
            if (mongoData.length > 0) return res.json({ exams: [{ results: mongoData }] });
        }

        if (supabase) {
            const { data: supaData } = await supabase.from("results").select("*");
            if (supaData?.length > 0) return res.json({ exams: [{ results: supaData }] });
        }

        if (fs.existsSync(localFilePath)) {
            return res.json(JSON.parse(fs.readFileSync(localFilePath, "utf8")));
        }

        res.json({ exams: [] });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to retrieve results" });
    }
};

// ==========================
// ROUTES
// ==========================
app.post("/deploy", deployHandler);
app.get("/results", resultsHandler);
app.get("/health", (req, res) => res.json({ status: "Operational", node: process.version, environment: process.env.NODE_ENV || "development" }));

// ==========================
// START
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n✅ Result System V3 (Standardized) Online`);
    console.log(`🌍 PORT: ${PORT} | CHUNK_SIZE: 500 | LIMIT: 50MB\n`);
});
