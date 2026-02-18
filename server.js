require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();

/* ===================================================
   GLOBAL SAFETY (PREVENT SERVER CRASH)
=================================================== */

// Catch unexpected errors
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
   STORAGE SETUP
=================================================== */

const DATA_PATH = path.join(__dirname, "results.json");

try {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ exams: [] }, null, 2));
    console.log("Local results.json created");
  }
} catch (err) {
  console.error("File Init Error:", err);
}

/* ===================================================
   HEALTH CHECK
=================================================== */

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Operational",
    node: process.version,
    uptime: process.uptime()
  });
});

/* ===================================================
   DEPLOY ROUTE (CRASH SAFE)
=================================================== */

app.post("/deploy", (req, res) => {
  try {

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body missing"
      });
    }

    // Extract results safely from multiple formats
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

    // Save safely to file
    fs.writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 2));

    return res.status(200).json({
      success: true,
      message: "Deployment successful",
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

/* ===================================================
   GIT SYNC ROUTE (NEW)
=================================================== */

app.post("/git-sync", (req, res) => {
  const { message, branch } = req.body;
  const commitMsg = message || "Auto-sync from Dashboard";
  const targetBranch = branch || "main";

  console.log(`[GIT] Starting sync: ${commitMsg} on ${targetBranch}`);

  // Chained Git Commands
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
   RESULTS ROUTE (SAFE)
=================================================== */

app.get("/results", (req, res) => {
  try {

    if (!fs.existsSync(DATA_PATH)) {
      return res.json({ exams: [] });
    }

    const raw = fs.readFileSync(DATA_PATH, "utf8");

    if (!raw) {
      return res.json({ exams: [] });
    }

    const parsed = JSON.parse(raw);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("RESULT FETCH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to read results"
    });
  }
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
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
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
