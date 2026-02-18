require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* =========================
   LOCAL STORAGE FILE
========================= */
const dataPath = path.join(__dirname, "results.json");

if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify({ exams: [] }, null, 2));
}

/* =========================
   ROUTES
========================= */

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Operational",
    node: process.version
  });
});

// Deploy Route
app.post("/deploy", (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.exams) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload structure"
      });
    }

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    const count = data.exams?.[0]?.results?.length || 0;

    res.status(200).json({
      success: true,
      message: "Deployment successful",
      count
    });

  } catch (error) {
    console.error("DEPLOY ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Results Route
app.get("/results", (req, res) => {
  try {
    const raw = fs.readFileSync(dataPath);
    res.json(JSON.parse(raw));
  } catch (err) {
    res.json({ exams: [] });
  }
});

/* =========================
   STATIC FRONTEND
========================= */
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
