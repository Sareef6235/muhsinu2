const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static(".")); // Serve project files for local testing

const filePath = path.join(__dirname, "pages/results/published-results.json");

// API to save JSON
app.post("/save-json", (req, res) => {
    const data = req.body;

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ success: false, message: "Failed to save JSON" });
        }
        res.send({ success: true, message: "JSON saved successfully" });
    });
});

// API to load JSON
app.get("/get-json", (req, res) => {
    if (!fs.existsSync(filePath)) {
        return res.send([]);
    }
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ success: false, message: "Failed to load JSON" });
        }
        try {
            res.send(JSON.parse(data));
        } catch (e) {
            res.send([]);
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
