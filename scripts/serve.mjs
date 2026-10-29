#!/usr/bin/env node
// Serveur local sans dépendance qui imite la configuration Vercel du site
// (vercel.json : cleanUrls: true, trailingSlash: false).
//
//   node scripts/serve.mjs [port]        (défaut : 4173)
//
// - /support            -> support.html (200)
// - /support.html       -> redirection 308 vers /support (comme Vercel)
// - /support/           -> redirection 308 vers /support (trailingSlash: false)
// - /index, /index.html -> redirection 308 vers /
// - fichier absent      -> 404.html avec le statut 404
// Les en-têtes de vercel.json sont appliqués. Usage local uniquement.

import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2] || process.env.PORT || 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
const extraHeaders = Object.fromEntries((vercel.headers || []).flatMap((h) => h.headers.map((x) => [x.key, x.value])));

const isFile = (p) => existsSync(p) && statSync(p).isFile();

function send(res, status, file, extra = {}) {
  const body = readFileSync(file);
  res.writeHead(status, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-store", ...extraHeaders, ...extra });
  res.end(body);
}

function redirect(res, location) {
  res.writeHead(308, { Location: location, ...extraHeaders });
  res.end();
}

createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const query = url.search;
  let path = decodeURIComponent(url.pathname);

  if (path.length > 1 && path.endsWith("/")) return redirect(res, path.replace(/\/+$/, "") + query);
  if (/\/index(\.html)?$/.test(path)) return redirect(res, path.replace(/index(\.html)?$/, "") + query);
  if (path.endsWith(".html")) return redirect(res, path.slice(0, -5) + query);

  const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
  const target = join(ROOT, safe);
  if (!target.startsWith(ROOT) || /(^|[/\\])\./.test(safe)) return send(res, 404, join(ROOT, "404.html"));
  if (path === "/") return send(res, 200, join(ROOT, "index.html"));
  if (isFile(target)) return send(res, 200, target);
  if (isFile(`${target}.html`)) return send(res, 200, `${target}.html`);
  return send(res, 404, join(ROOT, "404.html"));
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Centre d'aide servi sur http://127.0.0.1:${PORT} (cleanUrls, trailingSlash: false)`);
});
