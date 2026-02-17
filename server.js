const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const filePath = "C:/Users/User/Documents/muhsin2/pages/results/published-results.json";

// Save JSON
app.post("/deploy", (req, res) => {
  const data = req.body;

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.log(err);
      return res.json({ success: false });
    }
    res.json({ success: true });
  });
});

// Get JSON (for search page)
app.get("/results", (req, res) => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } else {
    res.json({ exams: [] });
  }
});

app.listen(3000, () => {
  console.log("Server running → http://localhost:3000");
});
