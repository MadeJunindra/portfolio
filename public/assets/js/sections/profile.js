/**
 * Profil: teks hero, foto/monogram, stack, tools, statistik, testimoni.
 */
import { $, $$ } from "../lib/dom.js";
import { html, raw, render } from "../lib/html.js";

const STACK = ["JavaScript", "Node.js", "Laravel", "PWA", "AI / LLM", "Vercel"];
const TOOLS = [
  ["HTML", "H5", "#c2410c"],
  ["CSS", "C3", "#3b5bdb"],
  ["JavaScript", "JS", "#806000"],
  ["Node.js", "N", "#237032"],
  ["Laravel", "L", "#e03131"],
  ["PHP", "php", "#5f3dc4"],
  ["PWA", "PWA", "#1d4ed8"],
  ["GSAP", "GS", "#1e6b31"],
  ["Apps Script", "AS", "#1864ab"],
  ["GitHub Actions", "GA", "#212529"],
  ["Vercel", "▲", "#0d0e1a"],
  ["AI / LLM", "AI", "#0e7490"],
];

/** Warna diterapkan lewat CSSOM (bukan atribut style) → CSP tanpa 'unsafe-inline'. */
export function applyColors(root = document) {
  $$("[data-color]", root).forEach((el) => el.style.setProperty("--c", el.dataset.color));
}

function initials(nick) {
  const letters = nick.replace(/[^A-Za-z]/g, "");
  if (letters.length <= 2) return letters.toUpperCase() || "DJ";
  return (letters[0] + letters[2]).toUpperCase();
}

export function initProfile(site, projects, testimonials) {
  $$("[data-site]").forEach((el) => {
    el.textContent = site[el.dataset.site] || "";
  });
  $("#fcStatus").hidden = !site.available;

  render(
    $("#portraitInner"),
    site.photo
      ? html`<img
          src="${site.photo}"
          alt="Foto ${site.name}"
          width="800"
          height="1000"
          decoding="async"
          fetchpriority="high"
        />`
      : html`<div class="monogram">
          <span class="grid-lines"></span>
          <div><b>${initials(site.nick)}</b><small>${site.role}</small></div>
        </div>`,
  );

  if (site.cv) {
    const cta = $("#ctaSecondary");
    cta.href = site.cv;
    cta.setAttribute("download", "");
    render(cta, html`Unduh CV ${raw('<svg aria-hidden="true"><use href="#i-arrow"/></svg>')}`);
  }

  render($("#stackList"), html`${STACK.map((s) => html`<li>${s}</li>`)}`);
  render(
    $("#tools"),
    html`${TOOLS.map(
      ([name, abbr, color]) =>
        html` <li class="tool">
          <span class="tool-badge" data-color="${color}" aria-hidden="true">${abbr}</span><span>${name}</span>
        </li>`,
    )}`,
  );

  // Statistik hanya dari data asli
  const techCount = new Set(projects.flatMap((p) => p.tech)).size;
  const kinds = new Set(projects.map((p) => p.category)).size;
  const stats = [];
  if (site.years) stats.push([site.years, "Tahun pengalaman"]);
  stats.push([String(projects.length), "Proyek di portofolio"], [`${techCount}+`, "Teknologi dipakai"]);
  if (!site.years) stats.push([String(kinds), "Jenis produk"]);
  render(
    $("#stats"),
    html`${stats
      .slice(0, 3)
      .map(([n, label]) => html` <div class="stat"><b data-count="${n}">${n}</b><small>${label}</small></div>`)}`,
  );
  $("#fcExpNum").textContent = site.years || String(projects.length);
  $("#fcExpLabel").textContent = site.years ? "Tahun pengalaman" : "Proyek dikerjakan";

  if (testimonials.length) {
    render(
      $("#testimonials"),
      html`${testimonials.map(
        (t) =>
          html` <figure class="card glass testi">
            <blockquote>“${t.quote}”</blockquote>
            <figcaption><b>${t.name}</b><small>${t.role}</small></figcaption>
          </figure>`,
      )}`,
    );
    $("#testimoni").hidden = false;
  }

  $("#year").textContent = String(new Date().getFullYear());
  applyColors();
}
