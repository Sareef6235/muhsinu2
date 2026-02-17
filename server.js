const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// ==========================
// MIDDLEWARE
// ==========================
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));


// ==========================
// FILE PATH (Portable)
// ==========================
const filePath = path.join(__dirname, "published-results.json");


// ==========================
// ENSURE FILE EXISTS
// ==========================
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({ exams: [] }, null, 2));
  console.log("New JSON file created");
}


// ==========================
// SAVE JSON (Deploy)
// ==========================
app.post("/deploy", (req, res) => {

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ success: false, message: "Empty Data" });
  }

  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), (err) => {
    if (err) {
      console.error("Write Error:", err);
      return res.status(500).json({ success: false });
    }

    console.log("JSON Saved Successfully");
    res.json({ success: true });
  });
});


// ==========================
// GET JSON (Search Page)
// ==========================
app.get("/results", (req, res) => {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    console.error("Read Error:", err);
    res.status(500).json({ exams: [] });
  }
});


// ==========================
// ROOT TEST ROUTE
// ==========================
app.get("/health", (req, res) => {
  res.send("Server Running OK");
});


// ==========================
// START SERVER (Render Safe)
// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
