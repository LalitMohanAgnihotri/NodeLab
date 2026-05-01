import { createServer } from "http";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const PORT = 3000;
const DATA_FILE = path.join("data", "links.json");

const serveFile = async (res, filePath, contentType) => {
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not Found");
  }
};

const loadLinks = async () => {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return data.trim() ? JSON.parse(data) : {};
  } catch {
    await writeFile(DATA_FILE, "{}");
    return {};
  }
};

const saveLinks = async (links) => {
  await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
};

const server = createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  
  if (req.method === "GET" && req.url === "/") {
    return serveFile(res, path.join("public", "index.html"), "text/html");
  }

  
  if (req.method === "GET" && req.url === "/style.css") {
    return serveFile(res, path.join("public", "style.css"), "text/css");
  }

  
  if (req.method === "GET" && req.url === "/links") {
    const links = await loadLinks();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(links));
  }

  
  if (req.method === "POST" && req.url === "/shorten") {
    let body = "";

    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
      try {
        const { longUrl, customAlias } = JSON.parse(body);

        if (!longUrl) {
          res.writeHead(400);
          return res.end("URL is required");
        }

        const links = await loadLinks();
        const shortCode =
          customAlias || crypto.randomBytes(4).toString("hex");

        if (links[shortCode]) {
          res.writeHead(409);
          return res.end("Short code already exists");
        }

        links[shortCode] = longUrl;
        await saveLinks(links);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ shortCode }));
      } catch {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
    return;
  }

  
  if (req.method === "GET") {
    const links = await loadLinks();
    const shortCode = req.url.slice(1);

    if (links[shortCode]) {
      res.writeHead(302, { Location: links[shortCode] });
      return res.end();
    }
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
