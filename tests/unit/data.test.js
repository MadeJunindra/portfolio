import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { SITE, PROJECTS, TESTIMONIALS } from "../../public/assets/js/data.js";
import { normalizeProjects, safeImage } from "../../public/assets/js/lib/sanitize.js";
import { visibleProjects } from "../../public/assets/js/sections/works.js";

const publicDir = fileURLToPath(new URL("../../public/", import.meta.url));

test("data.js: semua proyek lolos validasi tanpa kehilangan data", () => {
  const normalized = normalizeProjects(PROJECTS);
  assert.equal(normalized.length, PROJECTS.length);
  PROJECTS.forEach((raw, i) => {
    assert.ok(raw.title && raw.description, `proyek #${i} butuh title & description`);
    assert.equal(
      Object.keys(normalized[i].links).length,
      Object.keys(raw.links || {}).length,
      `link tidak valid di "${raw.title}"`,
    );
    assert.equal(normalized[i].accent, raw.accent, `accent tidak valid di "${raw.title}"`);
  });
});

test("data.js: gambar yang dirujuk benar-benar ada", () => {
  PROJECTS.filter((p) => p.image).forEach((p) => {
    assert.equal(safeImage(p.image), p.image, `path gambar tidak valid: ${p.image}`);
    assert.ok(existsSync(publicDir + p.image), `gambar hilang: ${p.image}`);
  });
  if (SITE.photo) assert.ok(existsSync(publicDir + SITE.photo), `foto hilang: ${SITE.photo}`);
});

test("data.js: testimoni berbentuk array", () => {
  assert.ok(Array.isArray(TESTIMONIALS));
});

test("visibleProjects: batas 6, filter, dan 'lihat semua'", () => {
  const list = normalizeProjects(PROJECTS);
  const all = visibleProjects(list, "all", false);
  assert.equal(all.shown.length, Math.min(6, list.length));
  assert.equal(all.hasMore, list.length > 6);
  assert.equal(visibleProjects(list, "all", true).shown.length, list.length);
  const pwa = visibleProjects(list, "pwa", false);
  assert.ok(pwa.shown.every(({ project }) => project.category === "pwa"));
  assert.equal(pwa.hasMore, false);
});
