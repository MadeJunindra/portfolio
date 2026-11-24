import { test } from "node:test";
import assert from "node:assert/strict";
import {
  safeUrl,
  safeColor,
  safeImage,
  safeFile,
  isEmail,
  isPlaceholderEmail,
  cleanText,
  normalizeWhatsapp,
  normalizeSite,
  normalizeProjects,
  normalizeTestimonials,
} from "../../public/assets/js/lib/sanitize.js";

test("safeUrl hanya menerima https", () => {
  assert.equal(safeUrl("https://github.com/x"), "https://github.com/x");
  assert.equal(safeUrl("http://example.com"), "");
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("data:text/html,<script>"), "");
  assert.equal(safeUrl("bukan url"), "");
  assert.equal(safeUrl(undefined), "");
});

test("safeColor hanya hex", () => {
  assert.equal(safeColor("#abc"), "#abc");
  assert.equal(safeColor("#AABBCC"), "#AABBCC");
  assert.equal(safeColor("red; background:url(x)"), "#7258ff");
  assert.equal(safeColor("expression(alert(1))", "#000"), "#000");
});

test("safeImage & safeFile membatasi folder dan ekstensi", () => {
  assert.equal(safeImage("images/a.webp"), "images/a.webp");
  assert.equal(safeImage("../secret.png"), "");
  assert.equal(safeImage("images/../x.png"), "");
  assert.equal(safeImage("images/x.svg?x=1"), "");
  assert.equal(safeImage("https://evil.com/a.png"), "");
  assert.equal(safeFile("files/cv.pdf"), "files/cv.pdf");
  assert.equal(safeFile("files/cv.exe"), "");
});

test("validasi email & deteksi placeholder", () => {
  assert.ok(isEmail("nama@gmail.com"));
  assert.ok(!isEmail("nama@gmail"));
  assert.ok(!isEmail("a b@c.com"));
  assert.ok(!isEmail('"><script>@x.com'));
  assert.ok(isPlaceholderEmail("email@anda.com"));
  assert.ok(!isPlaceholderEmail("dejun@gmail.com"));
});

test("cleanText membuang karakter kontrol & membatasi panjang", () => {
  assert.equal(cleanText("  halo\u0000\u0007 dunia  "), "halo dunia");
  assert.equal(cleanText("abcdef", 3), "abc");
  assert.equal(cleanText(null), "");
  assert.equal(cleanText("baris1\nbaris2"), "baris1\nbaris2");
});

test("normalizeWhatsapp menerima 9–15 digit saja", () => {
  assert.equal(normalizeWhatsapp("+62 812-3456-7890"), "6281234567890");
  assert.equal(normalizeWhatsapp("62XXXXXXXXXX"), "");
  assert.equal(normalizeWhatsapp("123"), "");
});

test("normalizeSite mengosongkan nilai contoh & tidak valid", () => {
  const site = normalizeSite({
    nick: "Dejun",
    email: "email@anda.com",
    whatsapp: "62XXXXXXXXXX",
    github: "javascript:alert(1)",
    photo: "../x.png",
  });
  assert.equal(site.email, "");
  assert.equal(site.whatsapp, "");
  assert.equal(site.github, "");
  assert.equal(site.photo, "");
  assert.equal(site.available, true);
});

test("normalizeProjects menyaring data berbahaya", () => {
  const [p] = normalizeProjects([
    {
      title: "Uji",
      category: "tidak-ada",
      accent: "red",
      device: "tablet",
      links: { repo: "https://github.com/x", live: "javascript:alert(1)", evil: "https://x.com" },
    },
    null,
    { tagline: "tanpa judul" },
  ]);
  assert.equal(p.category, "website");
  assert.equal(p.accent, "#7258ff");
  assert.equal(p.device, "phone");
  assert.deepEqual(p.links, { repo: "https://github.com/x" });
  assert.equal(normalizeProjects("bukan array").length, 0);
});

test("normalizeTestimonials butuh quote & nama", () => {
  assert.equal(normalizeTestimonials([{ quote: "Bagus" }, { quote: "Mantap", name: "A" }]).length, 1);
});
