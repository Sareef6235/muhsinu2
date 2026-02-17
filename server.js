const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ✅ Use portable path (IMPORTANT for Render)
const filePath = path.join(__dirname, "published-results.json");


// ==========================
// SAVE JSON (Deploy)
// ==========================
app.post("/deploy", (req, res) => {
  const data = req.body;

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.log("Write Error:", err);
      return res.json({ success: false });
    }

    console.log("JSON Saved Successfully");
    res.json({ success: true });
  });
});


// ==========================
// GET JSON (Search Page)
// ==========================
app.get("/results", (req, res) => {

  if (!fs.existsSync(filePath)) {
    return res.json({ exams: [] });
  }

  try {
    const raw = fs.readFileSync(filePath);
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    console.log("Read Error:", err);
    res.json({ exams: [] });
  }

});


// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
