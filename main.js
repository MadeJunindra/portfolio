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

  /* ---------- Daftar isi ---------- */
  document.getElementById("tocList").innerHTML = projects.map((p, i) => `
    <li><a href="#p-${i + 1}">
      <span class="toc-num">${pad(i + 1)}</span>
      <span class="toc-title">${esc(p.title)}<span class="toc-sub">${esc(p.tagline)}</span></span>
      <span class="toc-arrow">→</span>
    </a></li>`).join("");

  /* ---------- Mockup ---------- */
  function screen(p, kind) {
    if (p.image) return `<img src="${esc(p.image)}" alt="Tampilan ${esc(p.title)}" loading="lazy" decoding="async" width="780" height="1560">`;
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

  /* ---------- Kupu-kupu (sayap dianimasikan di GPU) ---------- */
  const PALETTES = [["#ffc1d9", "#f06292"], ["#ffd6e6", "#ec6aa0"], ["#e3f1ff", "#7fb2ea"], ["#fff1c9", "#f2b84b"]];
  let bfIndex = 0;
  function butterfly(r) {
    const [a, b] = PALETTES[Math.floor(r() * PALETTES.length)];
    const id = `bf${bfIndex++}`;
    const wing = (side) => `<span class="wing ${side}"><svg viewBox="0 0 20 34" aria-hidden="true">
        <defs><linearGradient id="${id}${side}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
        <g fill="url(#${id}${side})" stroke="rgba(255,255,255,.85)" stroke-width=".6"><path d="M19 15C14 3 3 0 2 6c-1 6 6 10 17 10z"/><path d="M19 17c-9 0-14 4-12 10 2 5 9 2 12-8z"/></g></svg></span>`;
    return `${wing("wl")}${wing("wr")}<span class="bfly-body"></span>`;
  }
  document.querySelectorAll(".butterflies").forEach((el, k) => {
    const r = rngFrom(900 + k * 13);
    const n = +el.dataset.count || 3;
    let html = "";
    for (let i = 0; i < n; i++) {
      const size = 26 + r() * 22;
      const left = r() < .5 ? 3 + r() * 30 : 62 + r() * 33;
      html += `<span class="bfly" style="width:${size.toFixed(0)}px;height:${(size * .85).toFixed(0)}px;left:${left.toFixed(1)}%;top:${(68 + r() * 22).toFixed(1)}%;animation-delay:${(-r() * 14).toFixed(1)}s;animation-duration:${(11 + r() * 8).toFixed(1)}s">${butterfly(r)}</span>`;
    }
    el.innerHTML = html;
  });

  /* ---------- Padang rumput: digambar di Web Worker (thread terpisah) ---------- */
  const canvases = [...document.querySelectorAll("canvas.meadow, canvas.front-grass")];
  const optsOf = (cv) => ({
    W: Math.round(cv.clientWidth), H: Math.round(cv.clientHeight), dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    kind: cv.classList.contains("front-grass") ? "front" : "meadow", layout: cv.dataset.layout || "", seed: +cv.dataset.seed || 1,
  });
  // urutan: yang paling dekat layar lebih dulu
  const ordered = () => canvases.slice().sort((a, b) => Math.abs(a.getBoundingClientRect().top) - Math.abs(b.getBoundingClientRect().top));
  let drawAll;
  if (window.Worker && "transferControlToOffscreen" in HTMLCanvasElement.prototype) {
    const worker = new Worker("meadow.js");
    canvases.forEach((cv, id) => {
      cv.dataset.mid = id;
      const off = cv.transferControlToOffscreen();
      worker.postMessage({ type: "init", id, canvas: off }, [off]);
    });
    drawAll = () => ordered().forEach((cv) => { const o = optsOf(cv); if (o.W && o.H) worker.postMessage({ type: "draw", id: +cv.dataset.mid, ...o }); });
    drawAll();
  } else {
    // cadangan: gambar di halaman, satu per satu saat browser santai
    const s = document.createElement("script");
    s.src = "meadow.js";
    s.onload = () => {
      const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 50));
      drawAll = () => { const q = ordered(); const step = () => { const cv = q.shift(); if (!cv) return; const o = optsOf(cv); if (o.W && o.H) window.Meadow.render(cv, o); idle(step); }; idle(step); };
      drawAll();
    };
    document.head.appendChild(s);
  }
  let rt, lastW = innerWidth;
  addEventListener("resize", () => {
    if (innerWidth === lastW) return; // abaikan perubahan tinggi (address bar HP)
    lastW = innerWidth; clearTimeout(rt);
    rt = setTimeout(() => drawAll && drawAll(), 300);
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
