(function () {
  /* ---------- Sanitasi data (keamanan) ----------
     Semua isi projects.js divalidasi sebelum masuk ke HTML:
     - URL hanya boleh https:// (menolak javascript:, data:, dll.)
     - warna hanya format hex, gambar hanya dari folder images/
     - teks selalu di-escape */
  const safeUrl = (u) => { try { const x = new URL(String(u)); return x.protocol === "https:" ? x.href : ""; } catch (e) { return ""; } };
  const safeColor = (c) => (/^#[0-9a-f]{3,8}$/i.test(String(c)) ? c : "#3355d1");
  const safeImg = (s) => (/^images\/[\w.-]+\.(png|jpe?g|webp|avif|svg)$/i.test(String(s)) ? s : "");
  const projects = (Array.isArray(window.PROJECTS) ? window.PROJECTS : []).map((p) => ({
    ...p,
    accent: safeColor(p.accent),
    image: safeImg(p.image),
    links: Object.fromEntries(Object.entries(p.links || {}).map(([k, u]) => [k, safeUrl(u)]).filter(([, u]) => u)),
  }));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const rngFrom = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICONS = {
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.2" fill="currentColor"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z"/>',
    bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4"/><circle cx="9" cy="13.5" r="1.2" fill="currentColor"/><circle cx="15" cy="13.5" r="1.2" fill="currentColor"/>',
    car: '<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/><circle cx="7.5" cy="13" r="1" fill="currentColor"/><circle cx="16.5" cy="13" r="1" fill="currentColor"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.globe}</svg>`;

  /* ---------- Judul chrome (liquid metal) ---------- */
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };

  // Filter chrome: bentuk digoyang (liquid) -> peta tinggi -> cahaya dipetakan berpita (pantulan logam) -> kilap
  function chromeFilter(defs, id, tint, wobble, blur) {
    const f = el("filter", { id, x: "-60%", y: "-60%", width: "220%", height: "220%", "color-interpolation-filters": "sRGB" }, defs);
    el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.0065", numOctaves: "1", seed: "4", result: "noise" }, f);
    el("feDisplacementMap", { in: "SourceGraphic", in2: "noise", scale: wobble, xChannelSelector: "R", yChannelSelector: "G", result: "shape" }, f);
    el("feGaussianBlur", { in: "shape", stdDeviation: blur, result: "h" }, f);
    const d = el("feDiffuseLighting", { in: "h", surfaceScale: "16", diffuseConstant: "1.15", "lighting-color": "#fff", result: "diff" }, f);
    el("feDistantLight", { azimuth: "225", elevation: "30" }, d);
    el("feGaussianBlur", { in: "diff", stdDeviation: "1.6", result: "diffS" }, f);
    const ct = el("feComponentTransfer", { in: "diffS", result: "metal" }, f);
    const tv = "0.14 0.42 0.88 1 0.5 0.26 0.62 0.95 1";
    ["feFuncR", "feFuncG", "feFuncB"].forEach((fn) => el(fn, { type: "table", tableValues: tv }, ct));
    el("feFlood", { "flood-color": tint, result: "tint" }, f);
    el("feComposite", { in: "metal", in2: "tint", operator: "arithmetic", k1: "1", k2: "0", k3: "0", k4: "0", result: "tinted" }, f);
    const s = el("feSpecularLighting", { in: "h", surfaceScale: "16", specularConstant: "1.5", specularExponent: "45", "lighting-color": "#fff", result: "spec" }, f);
    el("feDistantLight", { azimuth: "235", elevation: "48" }, s);
    el("feComposite", { in: "tinted", in2: "spec", operator: "arithmetic", k1: "0", k2: "1", k3: "1", k4: "0", result: "lit" }, f);
    el("feComposite", { in: "lit", in2: "shape", operator: "in", result: "clip" }, f);
    el("feDropShadow", { in: "clip", dx: "0", dy: "10", stdDeviation: "12", "flood-color": "#3a2a7a", "flood-opacity": ".25" }, f);
  }

  const HEART = "M0 34 C-14 22 -58 2 -50 -28 C-44 -50 -14 -50 0 -26 C14 -50 44 -50 50 -28 C58 2 14 22 0 34Z";
  const STAR = "M0 -56 C4 -14 14 -4 56 0 C14 4 4 14 0 56 C-4 14 -14 4 -56 0 C-14 -4 -4 -14 0 -56Z";

  async function buildTitle() {
    const svg = document.getElementById("chromeTitle");
    if (!svg) return;
    try { await document.fonts.load('500 220px "Gluten"'); } catch (e) {}
    svg.innerHTML = "";
    const FS = 230, STROKE = 4, GAP = -14, LINE_H = FS * .78, SIDE = 120, TOP = 60;
    const lines = ["Porto", "folio"];
    const defs = el("defs", {}, svg);
    chromeFilter(defs, "chrome", "#e4e8f6", 18, 10);
    chromeFilter(defs, "chromePink", "#ff5fa8", 6, 6);
    chromeFilter(defs, "chromeLilac", "#c39bff", 4, 5);
    // bola chrome kecil (gradien, tanpa filter)
    [["chromePink", "#ffd1e6", "#e0408a", "#5e0d36"], ["chromeLilac", "#efe2ff", "#9a6cf0", "#33186e"]].forEach(([id, a, b, c]) => {
      const g = el("radialGradient", { id: "sph-" + id, cx: ".35", cy: ".3", r: ".75" }, defs);
      el("stop", { offset: "0", "stop-color": "#fff" }, g);
      el("stop", { offset: ".18", "stop-color": a }, g);
      el("stop", { offset: ".6", "stop-color": b }, g);
      el("stop", { offset: "1", "stop-color": c }, g);
    });

    const probe = el("text", { "font-family": "Gluten", "font-weight": "500", "font-size": FS }, svg);
    const widthOf = (ch) => { probe.textContent = ch; return probe.getComputedTextLength(); };
    const rows = lines.map((line) => { const ws = [...line].map(widthOf); return { line, ws, total: ws.reduce((a, b) => a + b, 0) + GAP * (ws.length - 1) }; });
    probe.remove();
    const inner = Math.max(...rows.map((r) => r.total)) + STROKE * 2;
    const W = inner + SIDE * 2, H = TOP + FS * .78 + LINE_H + 70;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    // dekorasi di belakang
    const deco = (shape, x, y, sc, filter, cls, delay) => {
      const g = el("g", { class: cls, style: `animation-delay:${delay}s` }, svg);
      if (shape === "dot") el("circle", { cx: x, cy: y, r: 40 * sc, fill: `url(#sph-${filter})` }, g);
      else el("path", { d: shape, transform: `translate(${x} ${y}) scale(${sc})`, fill: "#fff", filter: `url(#${filter})` }, g);
    };
    deco(HEART, SIDE * .45, H * .42, 1, "chromePink", "deco-float", 0);
    deco(HEART, W - SIDE * .5, H * .78, .85, "chromePink", "deco-float", -2);
    deco(STAR, W - SIDE * .55, H * .18, .9, "chromePink", "deco-twinkle", -1);
    deco(STAR, SIDE * .7, H * .82, .55, "chromeLilac", "deco-twinkle", -2.5);
    deco("dot", W * .55, TOP * .45, .35, "chromePink", "deco-float", -1.5);
    deco("dot", SIDE * .55, TOP * .9, .28, "chromeLilac", "deco-float", -3);
    deco("dot", W - SIDE * .25, H * .5, .3, "chromeLilac", "deco-float", -.5);

    // huruf: satu grup, satu filter -> huruf yang bersentuhan menyatu seperti cairan
    const word = el("g", { filter: "url(#chrome)" }, svg);
    const r = rngFrom(11);
    rows.forEach((row, li) => {
      let x = (W - row.total) / 2 + (li ? FS * .12 : -FS * .08);
      const base = TOP + FS * .78 + li * LINE_H;
      [...row.line].forEach((ch, k) => {
        const w = row.ws[k];
        const rot = ((r() - .5) * 14).toFixed(1), dy = ((r() - .5) * 26).toFixed(1);
        const t = el("text", {
          x, y: base + +dy, "font-family": "Gluten", "font-weight": "500", "font-size": FS,
          fill: "#fff", stroke: "#fff", "stroke-width": STROKE, "stroke-linejoin": "round",
          transform: `rotate(${rot} ${x + w / 2} ${base - FS * .35})`,
        }, word);
        t.textContent = ch;
        x += w + GAP;
      });
    });
    document.dispatchEvent(new CustomEvent("title:ready"));
  }
  buildTitle();

  /* ---------- Daftar isi ---------- */
  document.getElementById("tocList").innerHTML = projects.map((p, i) => `
    <li><a href="#p-${i + 1}">
      <span class="toc-num">${pad(i + 1)}</span>
      <span class="toc-title">${esc(p.title)}<span class="toc-sub">${esc(p.tagline)}</span></span>
      <span class="toc-arrow">→</span>
    </a></li>`).join("");

  /* ---------- Mockup ---------- */
  function screen(p, kind) {
    if (p.image) return `<img src="${esc(p.image)}" alt="Tampilan ${esc(p.title)}" loading="lazy">`;
    const host = (p.links && p.links.live) ? p.links.live.replace(/^https?:\/\//, "") : p.title.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".app";
    const bar = kind === "laptop" ? `<div class="mock-bar"><i></i><i></i><i></i><span>${esc(host)}</span></div>` : "";
    const tab = kind === "phone" ? `<div class="mock-tab"><i></i><i></i><i></i><i></i></div>` : "";
    return `<div class="mock" style="--c:${esc(p.accent)}">${bar}
      <div class="mock-hero"><b>${esc(p.title)}</b><small>${esc(p.tagline)}</small><span class="cta">Mulai →</span>${icon(p.icon)}</div>
      <div class="mock-row"><div></div><div></div>${kind === "laptop" ? "<div></div>" : ""}</div>
      <div class="mock-list"><div></div><div></div>${kind === "phone" ? "<div></div>" : ""}</div>${tab}</div>`;
  }
  function device(p) {
    if (p.device === "laptop") return `<div class="laptop"><div class="lid"><div class="lid-screen">${screen(p, "laptop")}</div></div><div class="base"></div></div>`;
    return `<div class="phone"><div class="phone-screen"><span class="island"></span>${screen(p, "phone")}</div></div>`;
  }

  /* ---------- Slide proyek ---------- */
  const labels = { live: "Lihat Live ↗", demo: "Coba Demo ↗", repo: "Kode di GitHub ↗" };
  document.getElementById("slides").innerHTML = projects.map((p, i) => {
    const pills = p.pills || [p.category];
    const hl = p.highlights || [];
    const links = Object.entries(p.links || {}).filter(([, u]) => u);
    return `
    <section class="slide${i % 2 ? " flip" : ""}" id="p-${i + 1}">
      <div class="sky soft"></div>
      <div class="clouds" aria-hidden="true"><span class="cloud c${(i % 5) + 1}"></span><span class="cloud c${((i + 2) % 5) + 1}"></span></div>
      <canvas class="meadow" data-seed="${(i % 3) * 31 + 5}" data-layout="slide"></canvas>
      <span class="slide-num">${pad(i + 1)}</span>
      <div class="wrap slide-inner">
        <div class="slide-text">
          <div class="slide-logo" style="--c:${esc(p.accent)}">${icon(p.icon)}</div>
          <h2>${esc(p.title)}</h2>
          <div class="pills">${pills.map((t, k) => `<span class="pill ${k % 2 ? "blue" : "pink"}">${esc(t)}</span>`).join("")}</div>
          <p class="desc">${esc(p.description)}</p>
          ${hl.length > 2 ? `<ul class="hl">${hl.slice(2).map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
          <p class="tech"><b>Tools:</b> ${(p.tech || []).map(esc).join(" · ")}</p>
          ${links.length ? `<div class="actions">${links.map(([k, u], n) => `<a class="btn ${n ? "btn-glass" : "btn-blue"}" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${labels[k] || esc(k)}</a>`).join("")}</div>` : ""}
        </div>
        <div class="stage" data-cursor="Lihat">
          <div class="tilt">${device(p)}</div>
          ${hl[0] ? `<span class="badge-float b1">${esc(hl[0])}</span>` : ""}
          ${hl[1] ? `<span class="badge-float b2">${esc(hl[1])}</span>` : ""}
        </div>
      </div>
      <canvas class="front-grass" data-seed="${(i % 2) * 17 + 3}"></canvas>
      <div class="butterflies" data-count="${2 + (i % 2)}"></div>
    </section>`;
  }).join("");

  /* ---------- Gelembung ---------- */
  document.querySelectorAll(".bubbles").forEach((el, k) => {
    const r = rngFrom(400 + k);
    let html = "";
    for (let i = 0; i < 9; i++) {
      const s = 12 + r() * 46;
      html += `<span class="bubble" style="width:${s}px;height:${s}px;left:${(r() * 96).toFixed(1)}%;top:${(r() * 55).toFixed(1)}%;animation-delay:${(-r() * 9).toFixed(1)}s;animation-duration:${(7 + r() * 6).toFixed(1)}s"></span>`;
    }
    el.innerHTML = html;
  });

  /* ---------- Kupu-kupu ---------- */
  const PALETTES = [["#ffc1d9", "#f06292"], ["#ffd6e6", "#ec6aa0"], ["#e3f1ff", "#7fb2ea"], ["#fff1c9", "#f2b84b"]];
  function butterfly(idx, r) {
    const [a, b] = PALETTES[Math.floor(r() * PALETTES.length)];
    const id = `bf${idx}`;
    return `<svg viewBox="0 0 40 34" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <g class="wl" fill="url(#${id})" stroke="rgba(255,255,255,.8)" stroke-width=".6">
        <path d="M19 15C14 3 3 0 2 6c-1 6 6 10 17 10z"/><path d="M19 17c-9 0-14 4-12 10 2 5 9 2 12-8z"/></g>
      <g class="wr" fill="url(#${id})" stroke="rgba(255,255,255,.8)" stroke-width=".6">
        <path d="M21 15C26 3 37 0 38 6c1 6-6 10-17 10z"/><path d="M21 17c9 0 14 4 12 10-2 5-9 2-12-8z"/></g>
      <rect x="19.2" y="9" width="1.6" height="17" rx=".8" fill="#5a3a4a"/>
      <path d="M20 9c-1-3-3-5-5-6M20 9c1-3 3-5 5-6" stroke="#5a3a4a" stroke-width=".7" fill="none"/></svg>`;
  }
  let bfIndex = 0;
  document.querySelectorAll(".butterflies").forEach((el, k) => {
    const r = rngFrom(900 + k * 13);
    const n = +el.dataset.count || 3;
    let html = "";
    for (let i = 0; i < n; i++) {
      const size = 26 + r() * 22;
      const left = r() < .5 ? 3 + r() * 30 : 62 + r() * 33;
      html += `<span class="bfly" style="width:${size}px;height:${size * .85}px;left:${left.toFixed(1)}%;top:${(68 + r() * 22).toFixed(1)}%;animation-delay:${(-r() * 14).toFixed(1)}s;animation-duration:${(11 + r() * 8).toFixed(1)}s">${butterfly(bfIndex++, r)}</span>`;
    }
    el.innerHTML = html;
  });

  /* ---------- Padang rumput (canvas) ---------- */
  const LAYOUTS = {
    cover: [
      { cx: .1, w: .3, h: .78 }, { cx: .52, w: .36, h: .98 }, { cx: .9, w: .3, h: .74 },
      { cx: .3, w: .32, h: .6 }, { cx: .74, w: .34, h: .58 }, { cx: .5, w: .75, h: .3 },
    ],
    footer: [
      { cx: .2, w: .4, h: .85 }, { cx: .78, w: .38, h: .95 }, { cx: .5, w: .35, h: .6 }, { cx: .5, w: .9, h: .28 },
    ],
  };
  function slideLayout(r) {
    const hills = [];
    const n = 3 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++) hills.push({ cx: (i + .5) / n + (r() - .5) * .12, w: .28 + r() * .14, h: .62 + r() * .32 });
    hills.push({ cx: .2 + r() * .6, w: .45 + r() * .2, h: .4 + r() * .1 });
    hills.push({ cx: .5, w: .85, h: .22 });
    return hills;
  }

  const SHADES = 28;
  const shade = (i, hue) => `hsl(${hue} ${58 + (i / SHADES) * 12}% ${18 + (i / SHADES) * 52}%)`;
  const HUES = [88, 100, 112];

  function strokeBlades(ctx, blades) {
    // blades diurutkan dari belakang ke depan, dikelompokkan per warna dalam potongan kecil supaya cepat
    const CHUNK = 500;
    for (let s = 0; s < blades.length; s += CHUNK) {
      const groups = new Map();
      for (let j = s; j < Math.min(s + CHUNK, blades.length); j++) {
        const b = blades[j]; const key = b.c + "|" + b.w;
        (groups.get(key) || groups.set(key, []).get(key)).push(b);
      }
      for (const [key, list] of groups) {
        const [c, w] = key.split("|");
        ctx.strokeStyle = c; ctx.lineWidth = +w; ctx.beginPath();
        for (const b of list) { ctx.moveTo(b.x, b.y); ctx.quadraticCurveTo(b.x + b.bend * .4, b.y - b.l * .6, b.x + b.bend, b.y - b.l); }
        ctx.stroke();
      }
    }
  }

  function drawMeadow(cv) {
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = "round";
    const r = rngFrom(+cv.dataset.seed || 1);
    const hills = LAYOUTS[cv.dataset.layout] || slideLayout(r);
    const density = W < 700 ? 0.11 : 0.085; // helai per px²
    const scaleK = Math.max(.75, Math.min(1.25, W / 1200));

    hills.forEach((h) => {
      const cx = h.cx * W, hw = h.w * W, peak = h.h * H * .92;
      const topAt = (x) => { const u = (x - cx) / hw; return u * u >= 1 ? H : H - peak * Math.sqrt(1 - u * u); };

      // badan bukit
      const g = ctx.createLinearGradient(0, H - peak, 0, H);
      g.addColorStop(0, "#6fb53a"); g.addColorStop(.35, "#3f8a22"); g.addColorStop(1, "#1d4a10");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - hw, H);
      for (let x = cx - hw; x <= cx + hw; x += 6) ctx.lineTo(x, topAt(x));
      ctx.lineTo(cx + hw, H); ctx.closePath(); ctx.fill();

      // bayangan lembut di sisi kanan (cahaya dari kiri atas)
      const sg = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
      sg.addColorStop(0, "rgba(255,255,200,.10)"); sg.addColorStop(.55, "rgba(0,0,0,0)"); sg.addColorStop(1, "rgba(0,30,0,.28)");
      ctx.fillStyle = sg; ctx.fill();

      // helai rumput
      const area = hw * 2 * peak * .6;
      const n = Math.floor(area * density);
      const blades = [];
      for (let k = 0; k < n; k++) {
        const x = cx - hw + r() * hw * 2;
        const top = topAt(x);
        if (top >= H - 2) continue;
        const t = Math.pow(r(), 1.7);           // lebih rapat di dekat puncak
        const y = top + (H - top) * t + 2;
        const persp = .75 + (y / H) * .7;
        const l = (5 + r() * 11) * persp * scaleK;
        const side = (cx - x) / hw;            // +1 kiri (terang), -1 kanan (gelap)
        let light = .82 - t * .75 + side * .12 + (r() - .5) * .22;
        light = Math.max(0, Math.min(.999, light));
        blades.push({ x, y, l, bend: (r() - .5) * l * .9, c: shade(Math.floor(light * SHADES), HUES[Math.floor(r() * 3)]), w: persp > 1.15 ? 1.6 : 1.1 });
      }
      blades.sort((a, b) => a.y - b.y);
      strokeBlades(ctx, blades);

      // bunga kecil
      const fl = Math.floor(hw / 70);
      for (let k = 0; k < fl; k++) {
        const x = cx - hw * .85 + r() * hw * 1.7, top = topAt(x);
        if (top >= H - 4) continue;
        const y = top + (H - top) * (.05 + r() * .4);
        const cluster = 2 + Math.floor(r() * 4);
        const petal = r() < .6 ? "#ffffff" : (r() < .5 ? "#cfe3ff" : "#ffd3e6");
        for (let c = 0; c < cluster; c++) {
          const fx = x + (r() - .5) * 18, fy = y + (r() - .5) * 8, fr = (1.6 + r() * 1.6) * (.8 + y / H * .6);
          ctx.fillStyle = petal;
          for (let a = 0; a < 5; a++) { ctx.beginPath(); ctx.arc(fx + Math.cos(a * 1.257) * fr, fy + Math.sin(a * 1.257) * fr, fr * .75, 0, 7); ctx.fill(); }
          ctx.fillStyle = "#f5c518"; ctx.beginPath(); ctx.arc(fx, fy, fr * .55, 0, 7); ctx.fill();
        }
      }
    });

    // kabut cahaya
    const fog = ctx.createLinearGradient(0, 0, W, 0);
    fog.addColorStop(0, "rgba(255,255,255,.10)"); fog.addColorStop(.5, "rgba(255,255,255,0)"); fog.addColorStop(1, "rgba(255,255,255,.06)");
    ctx.fillStyle = fog; ctx.fillRect(0, 0, W, H);
  }

  function drawFrontGrass(cv) {
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = "round";
    const r = rngFrom(+cv.dataset.seed || 1);
    const blades = [];
    const n = Math.floor(W * 2.2);
    for (let k = 0; k < n; k++) {
      const x = r() * W, y = H - r() * H * .35 + 4;
      const l = 18 + r() * 42;
      const light = Math.max(0, Math.min(.999, .25 + r() * .4 + (y < H * .8 ? .15 : 0)));
      blades.push({ x, y, l, bend: (r() - .5) * 26, c: shade(Math.floor(light * SHADES), HUES[Math.floor(r() * 3)]), w: 1.8 });
    }
    blades.sort((a, b) => a.y - b.y);
    strokeBlades(ctx, blades);
  }

  // Rumput digambar SEKALI per varian, lalu disalin (drawImage) ke canvas lain yang sama -> sangat cepat
  const cache = new Map();
  const keyOf = (cv) => `${cv.className}|${cv.dataset.layout || ""}|${cv.dataset.seed}|${cv.clientWidth}x${cv.clientHeight}`;
  function paint(cv) {
    const key = keyOf(cv);
    if (!cv.clientWidth || !cv.clientHeight) return;
    const src = cache.get(key);
    if (src && src !== cv) {
      cv.width = src.width; cv.height = src.height;
      cv.getContext("2d").drawImage(src, 0, 0);
    } else {
      (cv.classList.contains("front-grass") ? drawFrontGrass : drawMeadow)(cv);
      cache.set(key, cv);
    }
    cv.dataset.drawn = key;
  }
  const canvases = [...document.querySelectorAll("canvas.meadow, canvas.front-grass")];

  // yang terlihat di layar pertama digambar langsung
  canvases.filter((c) => c.getBoundingClientRect().top < innerHeight * 1.5).forEach(paint);
  // sisanya digambar satu per satu saat browser sedang santai (bukan saat scroll)
  const idle = window.requestIdleCallback || ((fn) => setTimeout(() => fn({ timeRemaining: () => 8 }), 60));
  const queue = canvases.filter((c) => !c.dataset.drawn);
  const pump = (deadline) => {
    while (queue.length && deadline.timeRemaining() > 4) {
      const c = queue.shift();
      if (!c.dataset.drawn) paint(c);
      if (!cache.has(keyOf(c))) break; // gambar baru yang berat: lanjut di jeda berikutnya
    }
    if (queue.length) idle(pump, { timeout: 500 });
  };
  addEventListener("load", () => idle(pump, { timeout: 500 }), { once: true });
  // jaga-jaga: kalau pengguna scroll lebih cepat dari antrian
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting && !e.target.dataset.drawn) paint(e.target); });
  }, { rootMargin: "600px 0px" });
  canvases.forEach((c) => io.observe(c));

  let rt, lastW = innerWidth;
  addEventListener("resize", () => {
    if (innerWidth === lastW) return; // abaikan perubahan tinggi (address bar HP)
    lastW = innerWidth;
    clearTimeout(rt);
    rt = setTimeout(() => { cache.clear(); canvases.forEach((c) => { delete c.dataset.drawn; }); canvases.forEach(paint); }, 300);
  });

  /* ---------- Lapisan awan penyambung antar bagian ---------- */
  const sections = [...document.querySelectorAll("main > section, #slides > section")];
  sections.forEach((sec, i) => {
    const r = rngFrom(300 + i * 7);
    const makeSeam = (pos) => {
      const s = document.createElement("div");
      s.className = "seam seam-" + pos; s.setAttribute("aria-hidden", "true");
      let html = "", x = -4;
      while (x < 104) {
        const w = 110 + r() * 170;
        const off = -w * (.42 + r() * .2);
        html += `<span class="puff" style="width:${w.toFixed(0)}px;height:${w.toFixed(0)}px;left:${x.toFixed(1)}%;${pos === "bottom" ? "bottom" : "top"}:${off.toFixed(0)}px;animation-delay:${(-r() * 12).toFixed(1)}s"></span>`;
        x += 5 + r() * 7;
      }
      if (pos === "bottom") for (let k = 0; k < 3; k++)
        html += `<span class="sparkle" style="left:${(10 + r() * 80).toFixed(1)}%;bottom:${(40 + r() * 70).toFixed(0)}px;animation-delay:${(-r() * 3).toFixed(1)}s"></span>`;
      s.innerHTML = html;
      sec.appendChild(s);
    };
    if (i > 0) makeSeam("top");
    if (i < sections.length - 1) makeSeam("bottom");
  });

  // beri tahu motion.js bahwa konten dinamis sudah siap
  document.dispatchEvent(new CustomEvent("content:ready"));

  document.getElementById("year").textContent = new Date().getFullYear();
})();
