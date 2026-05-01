import express from "express";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const app = express();
const PORT = 3000;
const DATA_FILE = path.join("data", "links.json");


app.use(express.json());
app.use(express.static("public"));


const loadLinks = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return data.trim() ? JSON.parse(data) : {};
  } catch {
    await fs.writeFile(DATA_FILE, "{}");
    return {};
  }
};


const saveLinks = async (links) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
};


app.get("/links", async (req, res) => {
  const links = await loadLinks();
  res.json(links);
});


app.post("/shorten", async (req, res) => {
  try {
    const { longUrl, customAlias } = req.body;

    if (!longUrl) {
      return res.status(400).send("URL is required");
    }

    const links = await loadLinks();
    const shortCode =
      customAlias || crypto.randomBytes(4).toString("hex");

    if (links[shortCode]) {
      return res.status(409).send("Short code already exists");
    }

    links[shortCode] = longUrl;
    await saveLinks(links);

    res.json({ shortCode });
  } catch (err) {
    res.status(400).send("Invalid request");
  }
});


app.get("/:code", async (req, res) => {
  const links = await loadLinks();
  const shortCode = req.params.code;

  if (links[shortCode]) {
    return res.redirect(links[shortCode]);
  }

  res.status(404).send("Not Found");
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});