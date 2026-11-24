#!/usr/bin/env node
/**
 * Server statis lokal yang meniru Vercel: header dari vercel.json,
 * cleanUrls, dan halaman 404.html. Dipakai untuk `npm run dev` & tes E2E.
 *
 *   node scripts/serve.mjs [port]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, gzipSync } from "node:zlib";

const ROOT_DIR = resolve(fileURLToPath(new URL("..", import.meta.url)));
const config = JSON.parse(await readFile(join(ROOT_DIR, "vercel.json"), "utf8"));
const PUBLIC_DIR = join(ROOT_DIR, config.outputDirectory || "public");
const PORT = Number(process.argv[2] || process.env.PORT || 4321);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
};

/** Ubah pola Vercel ("/assets/(vendor|fonts)/(.*)") jadi RegExp. */
const toRegExp = (source) => new RegExp(`^${source.replace(/\//g, "\\/")}$`);
const headerRules = (config.headers || []).map((rule) => ({ re: toRegExp(rule.source), headers: rule.headers }));

async function resolveFile(pathname) {
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.(\/|\\|$))+/, "");
  const candidates = [safe, `${safe}.html`, join(safe, "index.html")];
  for (const candidate of candidates) {
    const file = join(PUBLIC_DIR, candidate);
    if (!file.startsWith(PUBLIC_DIR + sep) && file !== PUBLIC_DIR) continue; // cegah path traversal
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {
      /* coba kandidat berikutnya */
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  for (const rule of headerRules) {
    if (rule.re.test(pathname)) {
      rule.headers.forEach(({ key, value }) => {
        if (key === "Strict-Transport-Security") return; // tidak relevan di http lokal
        res.setHeader(
          key,
          key === "Content-Security-Policy" ? value.replace("; upgrade-insecure-requests", "") : value,
        );
      });
    }
  }
  const file = await resolveFile(pathname === "/" ? "/index.html" : pathname);
  const target = file || join(PUBLIC_DIR, "404.html");
  try {
    let body = await readFile(target);
    const type = TYPES[extname(target)] || "application/octet-stream";
    const headers = { "Content-Type": type, Vary: "Accept-Encoding" };
    // kompresi seperti Vercel (brotli/gzip) untuk file teks
    if (/text|javascript|json|xml|svg/.test(type)) {
      const accept = String(req.headers["accept-encoding"] || "");
      if (accept.includes("br")) {
        body = brotliCompressSync(body);
        headers["Content-Encoding"] = "br";
      } else if (accept.includes("gzip")) {
        body = gzipSync(body);
        headers["Content-Encoding"] = "gzip";
      }
    }
    res.writeHead(file ? 200 : 404, headers);
    res.end(body);
  } catch {
    res.writeHead(500).end("Server error");
  }
});

server.listen(PORT, () => console.log(`Server lokal: http://localhost:${PORT}`));
