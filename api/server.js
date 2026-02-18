import express from "express";
import mongoose from "mongoose";

const app = express();

app.use(express.json({ limit: "50mb" }));

/* ===============================
   MongoDB Connection
=============================== */

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false
    }).then(m => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/* ===============================
   Schema (Flexible)
=============================== */

const resultSchema = new mongoose.Schema({}, { strict: false });
const Result = mongoose.models.Result || mongoose.model("Result", resultSchema);

/* ===============================
   HEALTH
=============================== */

app.get("/api/health", (req, res) => {
  res.json({
    status: "Operational",
    node: process.version
  });
});

/* ===============================
   DEPLOY
=============================== */

app.post("/api/deploy", async (req, res) => {
  try {

    await connectDB();

    const results =
      req.body.exams?.[0]?.results ||
      req.body.results ||
      (Array.isArray(req.body) ? req.body : null);

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({
        success: false,
        message: "Invalid results format"
      });
    }

    await Result.deleteMany({});
    await Result.insertMany(results);

    res.json({
      success: true,
      message: "Cloud Sync Successful",
      count: results.length
    });

  } catch (err) {
    console.error("DEPLOY ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* ===============================
   GET RESULTS
=============================== */

app.get("/api/results", async (req, res) => {
  try {

    await connectDB();

    const data = await Result.find({});

    res.json({
      exams: [{ results: data }]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default app;
