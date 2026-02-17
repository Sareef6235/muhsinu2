const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(".")); // Serve project root for local accessibility

const filePath = path.join(__dirname, "pages", "results", "published-results.json");

// Ensure the directory exists
const dir = path.dirname(filePath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Unified Deployment Endpoints (Support for both standard and legacy)
const saveHandler = (req, res) => {
    const data = req.body;
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error("Save Error:", err);
            return res.json({ success: false, message: "Server Error during save" });
        }
        console.log("JSON Updated Successfully");
        res.json({ success: true });
    });
};

app.post("/deploy", saveHandler);
app.post("/save-json", saveHandler);

// Unified Retrieval Endpoints (Support for both search and sync)
const getHandler = (req, res) => {
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, "utf8");
            res.json(JSON.parse(data));
        } catch (e) {
            console.error("Parse Error:", e);
            res.json({ exams: [] });
        }
    } else {
        res.json({ exams: [] });
    }
};

app.get("/results", getHandler);
app.get("/get-json", getHandler);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🛡  Secure Deployment Server Running`);
    console.log(`→ Local:  http://localhost:${PORT}`);
    console.log(`→ Target: ${filePath}\n`);
});
