import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.static(path.join(__dirname, "public")));


app.get("/api/joke", async (req, res) => {
  try {
    const r = await fetch("https://official-joke-api.appspot.com/random_joke");
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch joke" });
  }
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`Q6 running at http://localhost:${PORT}`));
