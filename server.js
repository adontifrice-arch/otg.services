import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 8080;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": status === 200 ? "public, max-age=300" : "no-store",
  });
  res.end(body);
}

function safeJoin(base, requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const clean = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(base, clean);
  if (!full.startsWith(base)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  let urlPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  let file = safeJoin(root, urlPath);

  if (!file) {
    send(res, 400, "Bad request");
    return;
  }

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  }

  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    // SPA-style fallback for clean URLs without .html
    const htmlTry = safeJoin(root, `${urlPath.replace(/\/$/, "")}.html`);
    if (htmlTry && fs.existsSync(htmlTry) && fs.statSync(htmlTry).isFile()) {
      file = htmlTry;
    } else {
      send(res, 404, "Page introuvable");
      return;
    }
  }

  const body = fs.readFileSync(file);
  const type = types[path.extname(file).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": body.length,
    "Cache-Control": "public, max-age=300",
  });
  res.end(body);
});

server.listen(port, () => {
  console.log(`Off The Grid http://127.0.0.1:${port}`);
});
