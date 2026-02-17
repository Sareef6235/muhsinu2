// server.js
require('dotenv').config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// ==========================
// MIDDLEWARE
// ==========================
app.use(express.json({ limit: "15mb" }));
app.use(express.static(".")); // Serve frontend static files from root

// ==========================
// LOCAL JSON FILE
// ==========================
const localFilePath = path.join(__dirname, "pages", "results", "published-results.json");
const localDir = path.dirname(localFilePath);
if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
if (!fs.existsSync(localFilePath)) fs.writeFileSync(localFilePath, JSON.stringify({ exams: [] }, null, 2));

// ==========================
// MONGODB ATLAS
// ==========================
let mongoConnected = false;
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("✅ MongoDB Connected");
            mongoConnected = true;
        })
        .catch(err => console.error("❌ MongoDB Connection Error:", err));
}
const mongoSchema = new mongoose.Schema({}, { strict: false });
const MongoResult = mongoose.model("MongoResult", mongoSchema);

// ==========================
// SUPABASE
// ==========================
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log("✅ Supabase Connected");
}

// ==========================
// UNIFIED HANDLERS
// ==========================

// ROBUST DEPLOY HANDLER (WITH CHUNKED SUPABASE SYNC)
const deployHandler = async (req, res) => {
    try {
        const data = req.body;
        if (!data) return res.status(400).json({ success: false, message: "No data received" });

        const results = data.exams?.[0]?.results || data.results || (Array.isArray(data) ? data : null);

        if (!results || !Array.isArray(results)) {
            return res.status(400).json({
                success: false,
                message: "Invalid structure. Expected results array or exams[0].results"
            });
        }

        console.log(`🚀 Deploying ${results.length} records...`);

        // 1. MongoDB Sync
        if (MongoResult && mongoose.connection.readyState === 1) {
            await MongoResult.deleteMany({});
            await MongoResult.insertMany(results);
            console.log(" - MongoDB Synced");
        }

        // 2. Supabase Sync (Safe Chunked Version)
        if (supabase) {
            const { error: deleteError } = await supabase.from("results").delete().neq("id", 0);
            if (deleteError) {
                console.error(" ! Supabase Delete Error:", deleteError.message);
                throw new Error(deleteError.message);
            }

            // Chunked Insert (500 per batch)
            const CHUNK_SIZE = 500;
            for (let i = 0; i < results.length; i += CHUNK_SIZE) {
                const chunk = results.slice(i, i + CHUNK_SIZE);
                const { error } = await supabase.from("results").insert(chunk);
                if (error) {
                    console.error(" ! Supabase Insert Error:", error.message);
                    throw new Error(error.message);
                }
            }
            console.log(" - Supabase Synced (Chunked)");
        }

        // 3. Local JSON Sync
        const finalData = Array.isArray(data) ? {
            meta: { generatedAt: new Date().toISOString(), published: true },
            exams: [{ examId: "deployed_sync", results: data }]
        } : data;

        fs.writeFileSync(localFilePath, JSON.stringify(finalData, null, 2));
        console.log(" - Local JSON Saved");

        res.json({
            success: true,
            message: "Deployment completed successfully across all nodes",
            count: results.length
        });

    } catch (error) {
        console.error("❌ DEPLOYMENT CRASH:", error);
        res.status(500).json({
            success: false,
            message: "Server internal error during deployment",
            error: error.message
        });
    }
};

const resultsHandler = async (req, res) => {
    if (mongoose.connection.readyState === 1) {
        try {
            const mongoData = await MongoResult.find({});
            if (mongoData.length > 0) return res.json({ exams: [{ results: mongoData }] });
        } catch (err) { console.error("Mongo fetch error:", err); }
    }

    if (supabase) {
        try {
            const { data: supaData, error } = await supabase.from("results").select("*");
            if (!error && supaData?.length > 0) return res.json({ exams: [{ results: supaData }] });
        } catch (err) { console.error("Supabase fetch error:", err); }
    }

    try {
        if (fs.existsSync(localFilePath)) {
            const raw = fs.readFileSync(localFilePath, "utf8");
            return res.json(JSON.parse(raw));
        }
    } catch (err) { console.error("Local JSON fetch error:", err); }

    res.json({ exams: [] });
};

// ==========================
// ROUTES & ALIASES
// ==========================
app.post("/deploy", deployHandler);
app.post("/save-json", deployHandler);

app.get("/results", resultsHandler);
app.get("/get-json", resultsHandler);

app.get("/health", (req, res) => res.json({ status: "Operational", node: process.version }));

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Secure Result System Running`);
    console.log(`→ Local:  http://localhost:${PORT}`);
    console.log(`→ Mode:   ${process.env.MONGO_URI ? "Cloud-Synchronized" : "Local-Only"}\n`);
});
