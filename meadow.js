/* =========================================================
   meadow.js — menggambar padang rumput.
   Dipakai di Web Worker (OffscreenCanvas) supaya proses berat
   ini TIDAK mengganggu animasi & scroll di thread utama.
   Jika browser tidak mendukung, file ini dipakai langsung di halaman.
   ========================================================= */
(function (scope) {
  "use strict";
  const rngFrom = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
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

  function drawMeadow(cv, o) {
    const W = o.W, H = o.H;
    if (!W || !H) return;
    const dpr = o.dpr;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = "round";
    const r = rngFrom(+o.seed || 1);
    const hills = LAYOUTS[o.layout] || slideLayout(r);
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

  function drawFrontGrass(cv, o) {
    const W = o.W, H = o.H;
    if (!W || !H) return;
    const dpr = o.dpr;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = "round";
    const r = rngFrom(+o.seed || 1);
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


  // Satu varian digambar sekali, varian yang sama tinggal disalin (drawImage)
  const cache = new Map();
  function render(canvas, o) {
    const key = `${o.kind}|${o.layout || ""}|${o.seed}|${o.W}x${o.H}|${o.dpr}`;
    const src = cache.get(key);
    if (src && src !== canvas) {
      canvas.width = src.width; canvas.height = src.height;
      canvas.getContext("2d").drawImage(src, 0, 0);
    } else {
      (o.kind === "front" ? drawFrontGrass : drawMeadow)(canvas, o);
      cache.set(key, canvas);
    }
  }

  const isWorker = typeof WorkerGlobalScope !== "undefined" && scope instanceof WorkerGlobalScope;
  if (isWorker) {
    const canvases = new Map();
    const queue = [];
    let busy = false;
    const next = () => {
      const job = queue.shift();
      if (!job) { busy = false; return; }
      busy = true;
      const cv = canvases.get(job.id);
      if (cv) render(cv, job);
      setTimeout(next, 0); // beri jeda agar pesan baru (mis. resize) bisa masuk
    };
    scope.onmessage = (e) => {
      const m = e.data || {};
      if (m.type === "init" && m.canvas) canvases.set(m.id, m.canvas);
      if (m.type === "draw") {
        for (let i = queue.length - 1; i >= 0; i--) if (queue[i].id === m.id) queue.splice(i, 1);
        queue.push(m);
        if (!busy) next();
      }
    };
  } else {
    scope.Meadow = { render };
  }
})(self);
