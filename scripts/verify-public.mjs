#!/usr/bin/env node
/**
 * Penjaga deploy: memastikan SEMUA file yang dirujuk website benar-benar ada.
 * Dijalankan Vercel sebagai build command → deploy dibatalkan bila ada file hilang
 * (mis. folder assets/ atau images/ lupa ter-upload).
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_DIR = resolve(fileURLToPath(new URL("../public", import.meta.url)));
const missing = new Set();
const checked = new Set();

async function exists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/** Kumpulkan rujukan lokal dari HTML, CSS, dan JS. */
function references(text, kind) {
  const refs = [];
  const patterns = {
    html: [/\s(?:src|href)="([^"#?]+)[^"]*"/g],
    css: [/url\(\s*["']?([^"')?#]+)/g],
    js: [
      /\bimport\s[^"']*["'](\.{1,2}\/[^"']+)["']/g,
      /\bfrom\s+["'](\.{1,2}\/[^"']+)["']/g,
      /\bimage:\s*"([^"]+)"/g,
      /\bphoto:\s*"([^"]+)"/g,
      /\bcv:\s*"([^"]+)"/g,
    ],
  }[kind];
  for (const re of patterns) for (const m of text.matchAll(re)) refs.push(m[1]);
  return refs.filter((r) => r && !/^(https?:|mailto:|data:|tel:|\/\/)/.test(r));
}

async function check(file) {
  if (checked.has(file)) return;
  checked.add(file);
  const kind = file.endsWith(".html") ? "html" : file.endsWith(".css") ? "css" : /\.m?js$/.test(file) ? "js" : null;
  if (!kind) return;
  const text = await readFile(file, "utf8");
  for (const ref of references(text, kind)) {
    // data.js memakai path relatif terhadap root situs (images/..., files/...)
    const base =
      kind === "js" && /^(images|files)\//.test(ref) ? PUBLIC_DIR : ref.startsWith("/") ? PUBLIC_DIR : dirname(file);
    const target = join(base, ref.replace(/^\//, ""), ref.endsWith("/") ? "index.html" : "");
    if (await exists(target)) await check(target);
    else missing.add(`${relative(PUBLIC_DIR, file)} → ${ref}`);
  }
}

const htmlFiles = (await readdir(PUBLIC_DIR)).filter((f) => f.endsWith(".html")).map((f) => join(PUBLIC_DIR, f));
for (const file of htmlFiles) await check(file);

if (missing.size) {
  console.error(`✗ ${missing.size} file yang dirujuk tidak ditemukan:`);
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}
console.log(`✓ Semua rujukan lokal valid (${checked.size} file diperiksa).`);
