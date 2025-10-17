require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const entriesRoutes = require("./routes/entries");
const aiRoutes = require("./routes/ai");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// API Routes
app.use("/api/entries", entriesRoutes);
app.use("/api/ai", aiRoutes);

// Serve frontend
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/home.html"));
});

app.get("/settings", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/settings.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
