/**
 * Validasi & normalisasi data. Semua fungsi murni (tanpa DOM) → mudah dites.
 */

/** URL hanya diterima jika https:// (menolak javascript:, data:, http:, dll.) */
export function safeUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

/** Warna hanya format hex (#abc, #aabbcc, #aabbccdd). */
export function safeColor(value, fallback = "#2563eb") {
  return /^#[0-9a-f]{3,8}$/i.test(String(value)) ? String(value) : fallback;
}

/** Gambar hanya dari folder images/ dengan ekstensi gambar. */
export function safeImage(value) {
  return /^images\/[\w.-]+\.(png|jpe?g|webp|avif|svg)$/i.test(String(value)) ? String(value) : "";
}

/** File unduhan (CV) hanya PDF dari folder files/. */
export function safeFile(value) {
  return /^files\/[\w.-]+\.pdf$/i.test(String(value)) ? String(value) : "";
}

export function isEmail(value) {
  return /^[^\s@<>()"']+@[^\s@<>()"']+\.[^\s@<>()"']{2,}$/.test(String(value));
}

/** Nilai contoh dari template dianggap belum diisi. */
export function isPlaceholderEmail(value) {
  return /@(anda|example|contoh)\.com$/i.test(String(value));
}

/** Buang karakter kontrol, rapikan spasi tepi, batasi panjang. */
export function cleanText(value, max = 500) {
  return (
    String(value ?? "")
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
      .trim()
      .slice(0, max)
  );
}

/** Nomor WhatsApp: hanya digit, 9–15 angka (format internasional tanpa +). */
export function normalizeWhatsapp(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return /^\d{9,15}$/.test(digits) ? digits : "";
}

export function normalizeSite(raw = {}) {
  const email = isEmail(raw.email) && !isPlaceholderEmail(raw.email) ? String(raw.email) : "";
  return {
    nick: cleanText(raw.nick || "Dejun", 40),
    name: cleanText(raw.name, 80),
    role: cleanText(raw.role, 80),
    intro: cleanText(raw.intro, 300),
    photo: safeImage(raw.photo),
    email,
    whatsapp: normalizeWhatsapp(raw.whatsapp),
    location: cleanText(raw.location, 80),
    github: safeUrl(raw.github),
    cv: safeFile(raw.cv),
    years: cleanText(raw.yearsExperience, 6),
    available: raw.available !== false,
  };
}

const CATEGORIES = new Set(["webapp", "pwa", "website", "ai", "desktop"]);

export function normalizeProjects(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((p) => p && typeof p === "object" && p.title)
    .map((p) => ({
      title: cleanText(p.title, 80),
      tagline: cleanText(p.tagline, 120),
      description: cleanText(p.description, 1200),
      category: CATEGORIES.has(p.category) ? p.category : "website",
      year: cleanText(p.year, 4),
      tech: (Array.isArray(p.tech) ? p.tech : [])
        .map((t) => cleanText(t, 40))
        .filter(Boolean)
        .slice(0, 12),
      highlights: (Array.isArray(p.highlights) ? p.highlights : [])
        .map((t) => cleanText(t, 80))
        .filter(Boolean)
        .slice(0, 6),
      image: safeImage(p.image),
      accent: safeColor(p.accent),
      device: p.device === "laptop" ? "laptop" : "phone",
      links: Object.fromEntries(
        Object.entries(p.links || {})
          .filter(([key]) => ["live", "demo", "repo"].includes(key))
          .map(([key, url]) => [key, safeUrl(url)])
          .filter(([, url]) => url),
      ),
    }));
}

export function normalizeTestimonials(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((t) => t && t.quote && t.name)
    .map((t) => ({ quote: cleanText(t.quote, 400), name: cleanText(t.name, 80), role: cleanText(t.role, 100) }));
}
