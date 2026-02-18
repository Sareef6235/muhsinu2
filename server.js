import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ===================================================
   GLOBAL SAFETY (PREVENT SERVER CRASH)
=================================================== */

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED PROMISE REJECTION:", reason);
});

/* ===================================================
   MIDDLEWARE
=================================================== */

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ===================================================
   MONGODB CONNECTION
=================================================== */

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

/* ===================================================
   SCHEMA
=================================================== */

const resultSchema = new mongoose.Schema({}, { strict: false });
const Result = mongoose.models.Result || mongoose.model("Result", resultSchema);

/* ===================================================
   API ROUTES
=================================================== */

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "Operational",
    node: process.version,
    uptime: process.uptime()
  });
});

// Deploy (Save Results)
app.post("/api/deploy", async (req, res) => {
  try {
    await connectDB();

    if (!req.body) {
      return res.status(400).json({ success: false, message: "Request body missing" });
    }

    // Extract results safely
    const results =
      req.body.exams?.[0]?.results ||
      req.body.results ||
      (Array.isArray(req.body) ? req.body : null);

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({
        success: false,
        message: "Invalid results format. Expected array."
      });
    }

    console.log(`Received ${results.length} records`);

    // Replace all data with new deployment (Sync behavior)
    // Note: For production, you might want a more granular update strategy.
    // But matching previous fs behavior:
    await Result.deleteMany({});
    await Result.insertMany(results);

    return res.status(200).json({
      success: true,
      message: "Cloud Sync Successful",
      count: results.length
    });

  } catch (error) {
    console.error("DEPLOY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during sync"
    });
  }
});

// Get Results
app.get("/api/results", async (req, res) => {
  try {
    await connectDB();
    const data = await Result.find({});
    return res.status(200).json({ exams: [{ results: data }] });
  } catch (error) {
    console.error("RESULT FETCH ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to read results"
    });
  }
});

// Git Sync (Kept from previous verified step)
app.post("/git-sync", (req, res) => {
  const { message, branch } = req.body;
  const commitMsg = message || "Auto-sync from Dashboard";
  const targetBranch = branch || "main";

  console.log(`[GIT] Starting sync: ${commitMsg} on ${targetBranch}`);

  const cmd = `git add . && git commit -m "${commitMsg}" && git push origin ${targetBranch}`;

  exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[GIT ERROR] ${error.message}`);
      return res.status(500).json({
        success: false,
        message: "Git sync failed",
        details: stderr || error.message
      });
    }
    console.log(`[GIT SUCCESS] ${stdout}`);
    return res.status(200).json({
      success: true,
      message: "Git sync completed successfully",
      output: stdout
    });
  });
});

/* ===================================================
   STATIC FRONTEND
=================================================== */

app.use(express.static(path.join(__dirname, "public")));
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

/* ===================================================
   GLOBAL 404 HANDLER
=================================================== */

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* ===================================================
   START SERVER
=================================================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log(" Secure Result System Running");
  console.log(" Port:", PORT);
  console.log(" Mode:", process.env.NODE_ENV || "development");
  console.log("=================================");
});
