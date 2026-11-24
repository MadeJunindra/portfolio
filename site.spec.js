import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

const DATA_JS = readFileSync(new URL("../../public/assets/js/data.js", import.meta.url), "utf8");

/** Kumpulkan error konsol, pelanggaran CSP, dan request gagal. */
function watchProblems(page) {
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
  });
  return problems;
}

/** Ganti data.js dengan kontak contoh yang valid (untuk tes form). */
async function withContacts(page) {
  const body = DATA_JS.replace('"email@anda.com"', '"tes@contoh.co"').replace('"62XXXXXXXXXX"', '"6281234567890"');
  await page.route("**/assets/js/data.js", (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body }),
  );
}

test.describe("Halaman utama", () => {
  test("tampil tanpa error, tanpa pelanggaran CSP, tanpa file hilang", async ({ page }) => {
    const problems = watchProblems(page);
    const response = await page.goto("/");
    await expect(page.locator("h1")).toContainText("Dejun");
    await page.waitForLoadState("networkidle");
    expect(response.status()).toBe(200);
    expect(problems).toEqual([]);
  });

  test("header keamanan aktif (CSP tanpa unsafe-inline)", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("script-src 'self'");
    expect(h["content-security-policy"]).not.toContain("unsafe-inline");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("tidak ada scroll horizontal", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("aksesibilitas: tidak ada pelanggaran serius (axe)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact));
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  });

  test("SEO: judul, deskripsi, canonical, OG, dan JSON-LD", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Dejun/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /^https:\/\/.+\.jpg$/);
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    expect(ld["@type"]).toBe("Person");
    expect(await page.locator("h1").count()).toBe(1);
  });
});

test.describe("Karya", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#karya");
  });

  test("filter menampilkan kategori yang benar", async ({ page }) => {
    const pwa = page.locator('#filters button[data-cat="pwa"]');
    await pwa.click();
    await expect(pwa).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#works .work")).toHaveCount(2);
    for (const text of await page.locator("#works .work small").allTextContents()) expect(text).toContain("PWA");
    await page.locator('#filters button[data-cat="all"]').click();
    await expect(page.locator("#works .work")).toHaveCount(6);
  });

  test("tombol 'Lihat Semua' menampilkan semua proyek", async ({ page }) => {
    await page.locator("#moreBtn").click();
    await expect(page.locator("#works .work")).toHaveCount(10);
    await expect(page.locator("#moreBtn")).toBeHidden();
  });

  test("modal detail: buka, tutup dengan Escape, fokus kembali", async ({ page }) => {
    const card = page.locator("#works .work").nth(1);
    await card.click();
    const modal = page.locator("#modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("#modalTitle")).toHaveText("Catatan Keuangan");
    await expect(modal.locator(".modal-close")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();
    await expect(card).toBeFocused();
  });
});

test.describe("Kontak", () => {
  test("kontak contoh (placeholder) tidak ditampilkan", async ({ page }) => {
    await page.goto("/#kontak");
    await expect(page.locator('button[data-via="wa"]')).toBeHidden();
    await expect(page.locator('button[data-via="email"]')).toBeHidden();
    await expect(page.locator("#formNote")).toContainText("belum diatur");
  });

  test("validasi per kolom", async ({ page }) => {
    await withContacts(page);
    await page.goto("/#kontak");
    await page.fill('input[name="name"]', "Made");
    await page.fill('input[name="email"]', "made@gmail");
    await page.fill('textarea[name="message"]', "dddd");
    await page.locator('button[data-via="wa"]').click();
    await expect(page.locator("#err-email")).toBeVisible();
    await expect(page.locator("#err-message")).toContainText("sekarang 4");
    await expect(page.locator('input[name="email"]')).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#err-name")).toBeHidden();
  });

  for (const [via, host] of [
    ["wa", "wa.me"],
    ["email", "mail.google.com"],
  ]) {
    test(`kirim via ${via} membuka ${host} dengan pesan terisi`, async ({ page, context }) => {
      await withContacts(page);
      await context.route(/wa\.me|mail\.google\.com/, (route) => route.fulfill({ status: 200, body: "ok" }));
      await page.goto("/#kontak");
      await page.fill('input[name="name"]', "Made Tes");
      await page.fill('input[name="email"]', "made@gmail.com");
      await page.fill('textarea[name="message"]', "Halo, saya mau buat aplikasi kasir.");
      const [popup] = await Promise.all([
        context.waitForEvent("page"),
        page.locator(`button[data-via="${via}"]`).click(),
      ]);
      await popup.waitForLoadState();
      const url = new URL(popup.url());
      expect(url.hostname).toBe(host);
      expect(decodeURIComponent(url.search)).toContain("aplikasi kasir");
      await expect(page.locator("#formNote [data-copy]")).toBeVisible();
    });
  }
});

test.describe("Navigasi & ketahanan", () => {
  test("menu HP buka/tutup", async ({ page, isMobile }) => {
    test.skip(!isMobile, "khusus HP");
    await page.goto("/");
    const btn = page.locator("#menuBtn");
    await btn.click();
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#navLinks")).toHaveClass(/open/);
    await page.keyboard.press("Escape");
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    await expect(btn).toBeFocused();
  });

  test("halaman 404", async ({ page }) => {
    const res = await page.goto("/halaman-tidak-ada");
    expect(res.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("tidak ditemukan");
  });

  test("tetap terbaca tanpa JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Dejun");
    await expect(page.locator(".hero-intro")).toContainText("aplikasi web");
    await ctx.close();
  });

  test("tetap tampil normal jika library animasi gagal dimuat", async ({ page }) => {
    const problems = watchProblems(page);
    await page.route("**/assets/vendor/**", (route) => route.abort());
    await page.goto("/");
    await expect(page.locator(".hn-nick")).toBeVisible();
    await expect(page.locator("#works .work").first()).toBeVisible();
    expect(problems.filter((p) => !p.includes("vendor") && !p.includes("net::ERR_FAILED"))).toEqual([]);
  });
});
