const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors()); // Allow cross-origin requests

// Route to stream YouTube audio
app.get("/audio", (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: "Missing 'url' parameter" });
    }

    console.log(`Fetching audio for: ${videoUrl}`);

    // Use yt-dlp to extract audio-only stream
    const ytProcess = spawn("yt-dlp", [
        "-f", "bestaudio",
        "-o", "-",
        "--quiet",
        "--no-playlist",
        videoUrl,
    ], { stdio: ["ignore", "pipe", "ignore"] });

    res.setHeader("Content-Type", "audio/mpeg");
    
    ytProcess.stdout.pipe(res);

    ytProcess.on("error", (err) => {
        console.error("yt-dlp error:", err);
        res.status(500).json({ error: "Failed to fetch audio" });
    });

    res.on("close", () => {
        ytProcess.kill();
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
