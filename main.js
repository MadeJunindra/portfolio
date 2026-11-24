/* =========================================================
   main.js — mengisi halaman dari data di projects.js
   Keamanan: semua teks di-escape, URL hanya https://,
   gambar hanya dari folder images/, warna hanya hex.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Sanitasi ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => { try { const x = new URL(String(u)); return x.protocol === "https:" ? x.href : ""; } catch (e) { return ""; } };
  const safeColor = (c) => (/^#[0-9a-f]{3,8}$/i.test(String(c)) ? c : "#7258ff");
  const safeImg = (s) => (/^images\/[\w.-]+\.(png|jpe?g|webp|avif|svg)$/i.test(String(s)) ? s : "");
  const safeFile = (s) => (/^files\/[\w.-]+\.pdf$/i.test(String(s)) ? s : "");
  const isEmail = (s) => /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/.test(String(s));
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const RAW = window.SITE || {};
  const SITE = {
    nick: String(RAW.nick || "Dejun").slice(0, 40),
    name: String(RAW.name || "").slice(0, 80),
    role: String(RAW.role || "").slice(0, 80),
    intro: String(RAW.intro || "").slice(0, 300),
    photo: safeImg(RAW.photo),
    email: isEmail(RAW.email) ? String(RAW.email) : "",
    whatsapp: String(RAW.whatsapp || "").replace(/\D/g, ""),
    location: String(RAW.location || "").slice(0, 80),
    github: safeUrl(RAW.github),
    cv: safeFile(RAW.cv),
    years: String(RAW.yearsExperience || "").slice(0, 6),
    available: RAW.available !== false,
  };
  const projects = (Array.isArray(window.PROJECTS) ? window.PROJECTS : []).map((p) => ({
    ...p,
    accent: safeColor(p.accent),
    image: safeImg(p.image),
    links: Object.fromEntries(Object.entries(p.links || {}).map(([k, u]) => [k, safeUrl(u)]).filter(([, u]) => u)),
  }));
  const testimonials = (Array.isArray(window.TESTIMONIALS) ? window.TESTIMONIALS : []).filter((t) => t && t.quote && t.name);

  /* ---------- Profil ---------- */
  $$("[data-site]").forEach((el) => { el.textContent = SITE[el.dataset.site] || ""; });
  document.title = `${SITE.nick} — ${SITE.name} · ${SITE.role}`;
  $("#fcStatus").hidden = !SITE.available;

  const portrait = $("#portraitInner");
  if (SITE.photo) {
    portrait.innerHTML = `<img src="${esc(SITE.photo)}" alt="Foto ${esc(SITE.name)}" width="800" height="1000" decoding="async" fetchpriority="high">`;
  } else {
    const ini = (SITE.nick.match(/[A-Za-z]/g) || ["D", "J"]).slice(0, 1).join("") + (SITE.nick.length > 2 ? SITE.nick.replace(/[^A-Za-z]/g, "").slice(2, 3) : "");
    portrait.innerHTML = `<div class="monogram"><span class="grid-lines"></span><div><b>${esc(ini.toUpperCase() || "DJ")}</b><small>${esc(SITE.role)}</small></div></div>`;
  }
  if (SITE.cv) {
    const cta = $("#ctaSecondary");
    cta.href = SITE.cv; cta.setAttribute("download", "");
    cta.innerHTML = `Unduh CV <svg><use href="#i-arrow"/></svg>`;
  }

  /* ---------- Stack & tools ---------- */
  const STACK = ["JavaScript", "Node.js", "Laravel", "PWA", "AI / LLM", "Vercel"];
  $("#stackList").innerHTML = STACK.map((s) => `<li>${esc(s)}</li>`).join("");
  const TOOLS = [
    ["HTML", "H5", "#e8590c"], ["CSS", "C3", "#3b5bdb"], ["JavaScript", "JS", "#d9a400"], ["Node.js", "N", "#2f9e44"],
    ["Laravel", "L", "#e03131"], ["PHP", "php", "#5f3dc4"], ["PWA", "PWA", "#7258ff"], ["GSAP", "GS", "#37b24d"],
    ["Apps Script", "AS", "#1c7ed6"], ["GitHub Actions", "GA", "#212529"], ["Vercel", "▲", "#0d0e1a"], ["AI / LLM", "AI", "#9b59f6"],
  ];
  $("#tools").innerHTML = TOOLS.map(([name, ab, col]) => `<li class="tool"><span class="tool-badge" style="background:${safeColor(col)}">${esc(ab)}</span><span>${esc(name)}</span></li>`).join("");

  /* ---------- Statistik (data asli) ---------- */
  const techCount = new Set(projects.flatMap((p) => p.tech || [])).size;
  const cats = new Set(projects.map((p) => p.category)).size;
  const stats = [];
  if (SITE.years) stats.push([SITE.years, "Tahun pengalaman"]);
  stats.push([String(projects.length), "Proyek di portofolio"], [techCount + "+", "Teknologi dipakai"]);
  if (!SITE.years) stats.push([String(cats), "Jenis produk"]);
  $("#stats").innerHTML = stats.slice(0, 3).map(([n, l]) => `<div class="stat"><b data-count="${esc(n)}">${esc(n)}</b><small>${esc(l)}</small></div>`).join("");
  $("#fcExpNum").textContent = SITE.years || String(projects.length);
  $("#fcExpLabel").textContent = SITE.years ? "Tahun pengalaman" : "Proyek dikerjakan";

  /* ---------- Ikon proyek ---------- */
  const ICONS = {
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>', wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>', camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4"/>',
    car: '<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/>', home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
  };
  const CAT = { all: "Semua", webapp: "Web App", pwa: "PWA", website: "Website", ai: "AI", desktop: "Desktop" };

  /* ---------- Kartu proyek ---------- */
  function screen(p, kind) {
    if (p.image) return `<img src="${esc(p.image)}" alt="Tampilan ${esc(p.title)}" loading="lazy" decoding="async" width="780" height="1560">`;
    return `<div class="mock" style="--c:${p.accent}">${kind === "laptop" ? "<div class=\"mock-top\"><i></i><i></i><i></i></div>" : ""}
      <div class="mock-hero"><b>${esc(p.title)}</b><small>${esc(p.tagline)}</small></div>
      <div class="mock-row"><i></i><i></i>${kind === "laptop" ? "<i></i>" : ""}</div><div class="mock-line"></div><div class="mock-line"></div></div>`;
  }
  const device = (p) => (p.device === "laptop"
    ? `<div class="dev dev-laptop"><div class="lid"><div class="scr">${screen(p, "laptop")}</div></div><div class="base"></div></div>`
    : `<div class="dev dev-phone"><div class="scr">${screen(p, "phone")}</div></div>`);
  const thumb = (p) => `<div class="thumb" style="--c:${p.accent}">${device(p)}</div>`;

  const worksEl = $("#works"), moreBtn = $("#moreBtn"), filtersEl = $("#filters");
  const LIMIT = 6;
  let active = "all", expanded = false;
  const usedCats = ["all", ...Object.keys(CAT).filter((k) => k !== "all" && projects.some((p) => p.category === k))];
  filtersEl.innerHTML = usedCats.map((k) => `<button type="button" role="tab" data-cat="${k}" aria-selected="${k === active}">${CAT[k]}</button>`).join("");

  function renderWorks() {
    const list = projects.map((p, i) => [p, i]).filter(([p]) => active === "all" || p.category === active);
    const shown = active === "all" && !expanded ? list.slice(0, LIMIT) : list;
    worksEl.innerHTML = shown.map(([p, i]) => `
      <button type="button" class="work" data-i="${i}" aria-label="Lihat detail ${esc(p.title)}">
        ${thumb(p)}
        <div class="work-meta"><div><h3>${esc(p.title)}</h3><small>${esc(CAT[p.category] || p.category)} · ${esc(p.year)}</small></div>
        <span class="work-go"><svg><use href="#i-arrow"/></svg></span></div>
      </button>`).join("");
    moreBtn.hidden = !(active === "all" && !expanded && list.length > LIMIT);
    document.dispatchEvent(new CustomEvent("works:render"));
  }
  renderWorks();

  /* ---------- Animasi ganti filter (Web Animations API, tanpa library) ---------- */
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canAnimate = !reduceMotion && typeof Element.prototype.animate === "function";
  const EASE = "cubic-bezier(.2,.8,.2,1)";
  let busy = false;

  // indikator "pill" yang meluncur ke filter aktif
  const pill = document.createElement("span");
  pill.className = "filter-pill"; pill.setAttribute("aria-hidden", "true");
  filtersEl.prepend(pill);
  function movePill(instant) {
    const b = $('button[aria-selected="true"]', filtersEl); if (!b) return;
    if (instant) pill.style.transition = "none";
    pill.style.width = b.offsetWidth + "px";
    pill.style.transform = `translateX(${b.offsetLeft}px)`;
    if (instant) { void pill.offsetWidth; pill.style.transition = ""; }
  }
  movePill(true);
  addEventListener("resize", () => movePill(true));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => movePill(true));

  function animateIn(fromIndex) {
    if (!canAnimate) return;
    [...worksEl.children].slice(fromIndex || 0).forEach((card, k) => {
      const delay = k * 70;
      card.animate([
        { opacity: 0, transform: "perspective(900px) translateY(36px) scale(.94) rotateX(-10deg)" },
        { opacity: 1, transform: "none" },
      ], { duration: 700, delay, easing: EASE, fill: "backwards" });
      const dev = $(".dev", card);
      if (dev) dev.animate([
        { transform: "translateX(-50%) translateY(45%)", opacity: 0 },
        { transform: "translateX(-50%)", opacity: 1 },
      ], { duration: 900, delay: delay + 120, easing: EASE, fill: "backwards" });
    });
  }
  function swapWorks(mutate) {
    if (!canAnimate) { mutate(); renderWorks(); return; }
    if (busy) return;
    busy = true;
    const oldCards = [...worksEl.children];
    const h0 = worksEl.offsetHeight;
    const outs = oldCards.map((c, k) => c.animate([
      { opacity: 1, transform: "none" },
      { opacity: 0, transform: "translateY(-14px) scale(.96)" },
    ], { duration: 260, delay: k * 25, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" }).finished);
    Promise.all(outs).then(() => {
      mutate();
      renderWorks();
      const h1 = worksEl.offsetHeight;
      if (h0 !== h1) worksEl.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 500, easing: EASE });
      animateIn(0);
      busy = false;
    }, () => { busy = false; });
  }
  filtersEl.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-cat]"); if (!b) return;
    if (b.dataset.cat === active || busy) return;
    $$("button[data-cat]", filtersEl).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    movePill(false);
    swapWorks(() => { active = b.dataset.cat; });
  });
  moreBtn.addEventListener("click", () => {
    const before = worksEl.children.length, h0 = worksEl.offsetHeight;
    expanded = true; renderWorks();
    if (canAnimate) {
      worksEl.animate([{ height: h0 + "px" }, { height: worksEl.offsetHeight + "px" }], { duration: 600, easing: EASE });
      animateIn(before);
    }
  });

  /* ---------- Modal detail ---------- */
  const modal = $("#modal"), modalBody = $("#modalBody");
  const LABEL = { live: "Lihat Live", demo: "Coba Demo", repo: "Kode di GitHub" };
  function openProject(i) {
    const p = projects[i]; if (!p) return;
    const links = Object.entries(p.links);
    modalBody.innerHTML = `
      <button type="button" class="modal-close" aria-label="Tutup"><svg><use href="#i-close"/></svg></button>
      ${thumb(p)}
      <div class="modal-content">
        <p class="eyebrow">${esc(CAT[p.category] || p.category)} · ${esc(p.year)}</p>
        <h3 id="modalTitle">${esc(p.title)}</h3>
        <p class="meta">${esc(p.tagline)}</p>
        <p class="desc">${esc(p.description)}</p>
        <div class="chips">${(p.highlights || []).map((h) => `<span class="chip hl">${esc(h)}</span>`).join("")}${(p.tech || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
        ${links.length ? `<div class="actions">${links.map(([k, u], n) => `<a class="btn ${n ? "btn-glass" : "btn-dark"}" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(LABEL[k] || k)} <svg><use href="#i-arrow"/></svg></a>`).join("")}</div>` : ""}
      </div>`;
    modal.showModal();
    document.dispatchEvent(new CustomEvent("modal:open"));
  }
  worksEl.addEventListener("click", (e) => { const w = e.target.closest(".work"); if (w) openProject(+w.dataset.i); });
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest(".modal-close")) modal.close(); });
  modal.addEventListener("close", () => document.dispatchEvent(new CustomEvent("modal:close")));

  /* ---------- Testimoni (hanya jika ada data asli) ---------- */
  if (testimonials.length) {
    $("#testimonials").innerHTML = testimonials.map((t) => `<figure class="card glass testi"><blockquote>“${esc(String(t.quote).slice(0, 400))}”</blockquote><figcaption><b>${esc(t.name)}</b><small>${esc(t.role || "")}</small></figcaption></figure>`).join("");
    $("#testimoni").hidden = false;
  }

  /* ---------- Kontak ---------- */
  const cEmail = $("#cEmail"), cWa = $("#cWa"), cGit = $("#cGit");
  if (SITE.email) { cEmail.href = "mailto:" + SITE.email; cEmail.textContent = SITE.email; } else cEmail.closest("li").hidden = true;
  const waOk = /^\d{8,15}$/.test(SITE.whatsapp);
  if (waOk) { cWa.href = "https://wa.me/" + SITE.whatsapp; cWa.textContent = "+" + SITE.whatsapp; } else cWa.closest("li").hidden = true;
  if (SITE.github) cGit.href = SITE.github; else cGit.closest("li").hidden = true;

  const form = $("#contactForm"), note = $("#formNote");
  const defaultNote = note.textContent;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const via = (e.submitter && e.submitter.dataset.via) || "wa";
    const f = Object.fromEntries(new FormData(form).entries());
    const clean = (s, n) => String(s || "").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim().slice(0, n);
    const name = clean(f.name, 80), email = clean(f.email, 120), type = clean(f.type, 40), msg = clean(f.message, 1500);
    $$("input, textarea", form).forEach((el) => el.classList.remove("invalid"));
    const bad = [];
    if (name.length < 2) bad.push(form.elements.name);
    if (!isEmail(email)) bad.push(form.elements.email);
    if (msg.length < 10) bad.push(form.elements.message);
    if (bad.length) {
      bad.forEach((el) => el.classList.add("invalid"));
      bad[0].focus();
      note.textContent = "Mohon lengkapi nama, email yang valid, dan pesan (min. 10 karakter).";
      note.classList.add("err");
      return;
    }
    const text = `Halo ${SITE.nick}, saya ${name} (${email}).\nJenis proyek: ${type}\n\n${msg}`;
    if (via === "wa") {
      if (!waOk) { note.textContent = "Nomor WhatsApp belum diatur — silakan kirim via Email."; note.classList.add("err"); return; }
      window.open("https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(text), "_blank", "noopener,noreferrer");
    } else {
      if (!SITE.email) { note.textContent = "Email belum diatur — silakan kirim via WhatsApp."; note.classList.add("err"); return; }
      location.href = "mailto:" + SITE.email + "?subject=" + encodeURIComponent("Proyek baru: " + type) + "&body=" + encodeURIComponent(text);
    }
    note.classList.remove("err");
    note.textContent = "Terima kasih! Pesan Anda dibuka di " + (via === "wa" ? "WhatsApp" : "aplikasi email") + ".";
    setTimeout(() => { note.textContent = defaultNote; }, 6000);
  });

  /* ---------- Menu HP ---------- */
  const menuBtn = $("#menuBtn"), navLinks = $("#navLinks");
  const setMenu = (open) => { navLinks.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open)); menuBtn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu"); };
  menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  $("#year").textContent = new Date().getFullYear();
})();
