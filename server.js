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
app.use(express.json({ limit: "10mb" }));
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

const deployHandler = async (req, res) => {
    const data = req.body;
    const results = data.exams?.[0]?.results || data.results || (Array.isArray(data) ? data : null);

    if (!results) return res.json({ success: false, message: "Invalid JSON structure" });

    try {
        const resultsArray = Array.isArray(results) ? results : [results];

        // MongoDB
        if (mongoConnected) {
            await MongoResult.deleteMany({});
            await MongoResult.insertMany(resultsArray);
            console.log(" - MongoDB updated");
        }

        // Supabase
        if (supabase) {
            await supabase.from("results").delete().neq("id", "0");
            await supabase.from("results").insert(resultsArray);
            console.log(" - Supabase updated");
        }

        // Local JSON
        const finalData = Array.isArray(data) ? {
            meta: { generatedAt: new Date().toISOString(), published: true },
            exams: [{ results: data }]
        } : data;
        fs.writeFileSync(localFilePath, JSON.stringify(finalData, null, 2));
        console.log(" - Local JSON updated");

        res.json({ success: true, message: "Deployed to all systems" });
    } catch (err) {
        console.error("Deploy Error:", err);
        res.json({ success: false, message: "Deployment failed", error: err.message });
    }
};

const resultsHandler = async (req, res) => {
    // MongoDB first
    if (mongoConnected) {
        try {
            const mongoData = await MongoResult.find({});
            if (mongoData.length > 0) return res.json({ exams: [{ results: mongoData }] });
        } catch (err) { console.error("Mongo fetch error:", err); }
    }

    // Supabase fallback
    if (supabase) {
        try {
            const { data: supaData, error } = await supabase.from("results").select("*");
            if (!error && supaData?.length > 0) return res.json({ exams: [{ results: supaData }] });
        } catch (err) { console.error("Supabase fetch error:", err); }
    }

    // Local JSON fallback
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
app.post("/save-json", deployHandler); // Alias for legacy support

app.get("/results", resultsHandler);
app.get("/get-json", resultsHandler); // Alias for legacy support

// ==========================
// HEALTH CHECK
// ==========================
app.get("/health", (req, res) => res.send("🛡 Result Cloud Server: Operational"));

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Secure Result System Running`);
    console.log(`→ Local:  http://localhost:${PORT}`);
    console.log(`→ Mode:   ${mongoConnected || process.env.MONGO_URI ? "Cloud-Synchronized" : "Local-Only"}\n`);
});
