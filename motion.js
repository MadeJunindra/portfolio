/* =========================================================
   motion.js — Lenis (smooth scroll) + GSAP + ScrollTrigger
   Semua animasi interaktif ada di sini. Jika library gagal
   dimuat atau pengguna memilih "kurangi gerakan", website
   tetap tampil normal tanpa animasi.
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const loader = $("#loader");

  /* ---------- Hemat tenaga: jeda animasi CSS di bagian yang tidak terlihat ---------- */
  const visIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle("offscreen", !e.isIntersecting));
  }, { rootMargin: "150px 0px" });
  $$("main > section, #slides > section").forEach((s) => visIO.observe(s));

  // Tanpa GSAP (gagal dimuat) atau reduce motion → tampil statis
  if (!window.gsap || !window.ScrollTrigger || reduce) {
    root.classList.add("no-motion");
    if (loader) loader.remove();
    basicUi();
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // dikunci selama loader
  }

  /* ---------- Link anchor halus ---------- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (!/^#[\w-]*$/.test(id)) return; // hanya id sederhana
    const target = id === "#top" || id === "#" ? 0 : document.getElementById(id.slice(1));
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
    else target.scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Pecah teks jadi huruf ---------- */
  function split(el) {
    if (!el || el.dataset.split) return [];
    el.dataset.split = "1";
    const label = el.textContent.trim().replace(/\s+/g, " ");
    el.setAttribute("aria-label", label);
    const chars = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = "split-word"; w.setAttribute("aria-hidden", "true");
            [...part].forEach((ch) => {
              const m = document.createElement("span"); m.className = "split-mask";
              const c = document.createElement("span"); c.className = "split-char"; c.textContent = ch;
              m.appendChild(c); w.appendChild(m); chars.push(c);
            });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return chars;
  }

  /* ---------- Loader → intro ---------- */
  const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
  intro
    .from(".cover .sky", { scale: 1.15, duration: 2.2 }, 0)
    .from(".cover .meadow", { yPercent: 35, duration: 1.8 }, 0.1)
    .from(".hero-title", { y: 140, scale: 0.6, rotation: -6, opacity: 0, duration: 1.6, ease: "elastic.out(1, 0.55)" }, 0.35)
    .from(".hero-sub", { y: 30, opacity: 0, scale: 0.8, duration: 0.9, ease: "back.out(2.4)" }, 0.95)
    .from(".nav", { yPercent: -160, opacity: 0, duration: 1 }, 0.8)
    .from(".cover-foot p", { y: 24, opacity: 0, stagger: 0.12, duration: 0.9 }, 1.05)
    .from(".scroll-cue", { opacity: 0, y: -10, duration: 0.8 }, 1.3);

  const loaderNum = $("#loaderNum"), loaderBar = $("#loaderBar");
  const prog = { v: 0 };
  const load = gsap.to(prog, {
    v: 90, duration: 1.4, ease: "power2.out",
    onUpdate: () => { loaderNum.textContent = Math.round(prog.v); loaderBar.style.transform = `scaleX(${prog.v / 100})`; },
  });
  const ready = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true }))),
    new Promise((r) => setTimeout(r, 900)),
  ]);
  const failSafe = new Promise((r) => setTimeout(r, 4000)); // jangan pernah macet di loader
  Promise.race([ready, failSafe]).then(() => {
    load.kill();
    gsap.timeline()
      .to(prog, { v: 100, duration: 0.35, ease: "power1.out", onUpdate: () => { loaderNum.textContent = Math.round(prog.v); loaderBar.style.transform = `scaleX(${prog.v / 100})`; } })
      .to(".loader-inner", { y: -30, opacity: 0, duration: 0.5, ease: "power3.in" })
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "-=0.15")
      .add(() => intro.play(), "-=0.55")
      .add(() => { loader.remove(); if (lenis) lenis.start(); ScrollTrigger.refresh(); });
  });

  /* ---------- Progres scroll & tombol ke atas ---------- */
  gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  const toTop = $("#toTop"), ring = $("#topRing");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      ring.style.strokeDashoffset = String(132 - 132 * self.progress);
      toTop.classList.toggle("show", self.scroll() > innerHeight * 0.8);
    },
  });

  /* ---------- Nav: sembunyi saat turun, muncul saat naik ---------- */
  const nav = $(".nav");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => nav.classList.toggle("nav-hidden", self.direction === 1 && self.scroll() > 400),
  });
  const navMap = { isi: "#isi", tentang: "#tentang", kontak: "#kontak" };
  const setActive = (key) => $$(".nav nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === navMap[key]));
  [["#isi", "isi"], ["#slides", "isi"], ["#tentang", "tentang"], ["#kontak", "kontak"]].forEach(([sel, key]) => {
    ScrollTrigger.create({ trigger: sel, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && setActive(key) });
  });
  ScrollTrigger.create({ trigger: ".cover", start: "top top", end: "bottom 50%", onToggle: (s) => s.isActive && setActive("") });

  /* ---------- Cover: parallax saat scroll ---------- */
  const coverST = { trigger: ".cover", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".hero-title", { yPercent: -45, opacity: 0, ease: "none", scrollTrigger: coverST });
  gsap.to(".cover .meadow", { yPercent: 10, ease: "none", scrollTrigger: coverST });
  gsap.to(".cover .clouds", { yPercent: 25, ease: "none", scrollTrigger: coverST });
  gsap.to(".cover .bubbles", { yPercent: -40, ease: "none", scrollTrigger: coverST });
  gsap.to(".cover-foot", { opacity: 0, y: -40, ease: "none", scrollTrigger: { trigger: ".cover", start: "top top", end: "40% top", scrub: true } });

  // dekorasi chrome di judul: muncul "pop" setelah judul jadi
  function decoIn() {
    const decos = $$("#chromeTitle .deco-float, #chromeTitle .deco-twinkle");
    gsap.from(decos, { scale: 0, rotation: -120, transformOrigin: "50% 50%", opacity: 0, duration: 1.1, stagger: 0.08, ease: "back.out(2.2)", delay: 1.2 });
  }
  if ($("#chromeTitle g")) decoIn(); else document.addEventListener("title:ready", decoIn, { once: true });

  // judul melayang naik-turun: digerakkan sebagai satu gambar di GPU, berhenti saat tidak terlihat
  gsap.to("#chromeTitle", {
    y: -12, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1,
    scrollTrigger: { trigger: ".cover", start: "top top", end: "bottom top", toggleActions: "play pause resume pause" },
  });

  /* ---------- Judul section: huruf naik bergelombang ---------- */
  $$(".section-title").forEach((t) => {
    const chars = split(t);
    gsap.from(chars, {
      yPercent: 120, rotation: 10, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.025,
      scrollTrigger: { trigger: t, start: "top 85%" },
    });
  });
  $$(".kicker").forEach((k) => gsap.from(k, { opacity: 0, x: -24, letterSpacing: ".5em", duration: 1, ease: "expo.out", scrollTrigger: { trigger: k, start: "top 88%" } }));

  /* ---------- Daftar isi ---------- */
  gsap.from(".toc-list li", {
    y: 50, opacity: 0, rotationX: -40, transformPerspective: 800, transformOrigin: "50% 0%",
    duration: 0.9, ease: "expo.out", stagger: { each: 0.06, grid: "auto", from: "start" },
    scrollTrigger: { trigger: ".toc-list", start: "top 80%" },
  });

  /* ---------- Marquee: kecepatan ikut kecepatan scroll ---------- */
  const track = $("#marquee");
  if (track) {
    const words = ["Web App", "Progressive Web App", "Website", "AI Assistant", "UI / UX", "Laravel", "Node.js", "Smooth Motion"];
    const chunk = words.map((w) => `<span>${w.replace(/[<>&]/g, "")}<i>✦</i></span>`).join("");
    track.innerHTML = chunk + chunk + chunk + chunk;
    const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
    let dir = 1;
    const boost = gsap.quickTo(loop, "timeScale", { duration: 0.6, ease: "power3.out" });
    const onVel = (v) => { if (v) dir = v > 0 ? 1 : -1; boost(dir * (1 + Math.min(Math.abs(v || 0) * 0.15, 5))); };
    if (lenis) lenis.on("scroll", (l) => onVel(l.velocity));
    else ScrollTrigger.create({ onUpdate: (s) => onVel(s.getVelocity() / 300) });
    gsap.from(".marquee", { rotation: -8, xPercent: -10, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".marquee", start: "top 95%" } });
  }

  /* ---------- Slide proyek ---------- */
  $$(".slide").forEach((slide) => {
    const flip = slide.classList.contains("flip");
    const title = $("h2", slide);
    const chars = split(title);
    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: slide, start: "top 62%" } });
    tl.from($(".slide-logo", slide), { scale: 0, rotation: -120, duration: 1, ease: "back.out(2)" })
      .from(chars, { yPercent: 120, rotation: 8, duration: 1, stagger: 0.022 }, 0.1)
      .from($$(".pill", slide), { scale: 0, y: 20, duration: 0.7, stagger: 0.08, ease: "back.out(3)" }, 0.45)
      .from($$(".desc, .hl li, .tech, .actions .btn", slide), { y: 28, opacity: 0, duration: 0.9, stagger: 0.06, clearProps: "y" }, 0.55)
      .from($(".tilt", slide), { y: 180, rotation: flip ? -22 : 22, opacity: 0, duration: 1.5 }, 0.15)
      .from($$(".badge-float", slide), { scale: 0, opacity: 0, duration: 0.8, stagger: 0.15, ease: "back.out(2.5)" }, 0.9)
      .from($(".slide-num", slide), { opacity: 0, scale: 2.4, rotation: 20, duration: 1.1 }, 0.2);

    // parallax lapisan: device lebih cepat, rumput lebih lambat
    const st = { trigger: slide, start: "top bottom", end: "bottom top", scrub: true };
    gsap.fromTo($(".stage", slide), { y: 70 }, { y: -70, ease: "none", scrollTrigger: st });
    gsap.fromTo($(".meadow", slide), { yPercent: 10 }, { yPercent: -4, ease: "none", scrollTrigger: st });
    gsap.fromTo($(".slide-num", slide), { y: -40 }, { y: 60, ease: "none", scrollTrigger: st });
  });

  /* ---------- Tentang & kontak ---------- */
  gsap.from(".about-card", { x: -80, rotation: -4, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".about", start: "top 65%" } });
  gsap.from(".skill-stack .skill", { x: 90, rotation: 4, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.12, clearProps: "transform", scrollTrigger: { trigger: ".skill-stack", start: "top 75%" } });
  gsap.from(".contact .lead", { y: 30, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".contact .lead", start: "top 88%" } });
  gsap.from(".contact-links .btn", { y: 40, scale: 0.7, opacity: 0, duration: 1, ease: "back.out(2.2)", stagger: 0.1, clearProps: "scale", scrollTrigger: { trigger: ".contact-links", start: "top 90%" } });
  gsap.from(".script-sm", { opacity: 0, x: 40, rotation: -8, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".footer", start: "top 98%" } });

  /* ---------- Interaksi mouse (desktop) ---------- */
  if (finePointer) {
    root.classList.add("has-cursor");
    const dot = $(".cursor-dot"), ringEl = $(".cursor-ring"), label = $(".cursor-label");
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" }), dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ringEl, "x", { duration: 0.45, ease: "power3" }), ry = gsap.quickTo(ringEl, "y", { duration: 0.45, ease: "power3" });
    addEventListener("pointermove", (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      const lab = e.target.closest("[data-cursor]");
      const hov = e.target.closest("a, button, .toc-list a, .skill");
      root.classList.toggle("cursor-label-on", !!lab);
      root.classList.toggle("cursor-hover", !!hov && !lab);
      label.textContent = lab ? lab.dataset.cursor : "";
    });
    document.addEventListener("pointerleave", () => gsap.to(".cursor", { opacity: 0, duration: 0.2 }));
    document.addEventListener("pointerenter", () => gsap.to(".cursor", { opacity: 1, duration: 0.2 }));

    // tombol magnetik
    $$(".btn, .nav-brand").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" }), my = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.35); my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("pointerleave", () => { gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" }); });
    });

    // tilt 3D pada mockup
    $$(".stage").forEach((stage) => {
      const t = $(".tilt", stage);
      const rX = gsap.quickTo(t, "rotationX", { duration: 0.6, ease: "power3" }), rY = gsap.quickTo(t, "rotationY", { duration: 0.6, ease: "power3" });
      gsap.set(t, { transformPerspective: 1000 });
      stage.addEventListener("pointermove", (e) => {
        const r = stage.getBoundingClientRect();
        rY(((e.clientX - r.left) / r.width - 0.5) * 18); rX(-((e.clientY - r.top) / r.height - 0.5) * 14);
      });
      stage.addEventListener("pointerleave", () => { rX(0); rY(0); });
    });

    // judul cover ikut gerak mouse sedikit
    const hx = gsap.quickTo("#chromeTitle", "x", { duration: 1.2, ease: "power3" }), hy = gsap.quickTo("#chromeTitle", "rotation", { duration: 1.2, ease: "power3" });
    $(".cover").addEventListener("pointermove", (e) => { const p = e.clientX / innerWidth - 0.5; hx(p * 30); hy(p * 3); });
  }

  /* ---------- Percikan kilau saat klik/tap ---------- */
  const colors = ["#d63a7e", "#1f3fae", "#a585ff", "#ffc93f"];
  let bursts = 0;
  addEventListener("pointerdown", (e) => {
    if (bursts > 24) return; // batasi elemen agar ringan
    for (let i = 0; i < 6; i++) {
      const s = document.createElement("span");
      s.className = "burst"; s.style.color = colors[i % colors.length];
      document.body.appendChild(s); bursts++;
      const a = (i / 6) * Math.PI * 2 + Math.random() * 0.5, d = 30 + Math.random() * 30;
      gsap.fromTo(s, { x: e.clientX - 5, y: e.clientY - 5, scale: 0.4, rotation: 0, opacity: 1 },
        { x: e.clientX - 5 + Math.cos(a) * d, y: e.clientY - 5 + Math.sin(a) * d, scale: 1, rotation: 90, opacity: 0, duration: 0.7, ease: "power3.out", onComplete: () => { s.remove(); bursts--; } });
    }
  }, { passive: true });

  /* ---------- Refresh saat ukuran berubah / font siap ---------- */
  document.addEventListener("title:ready", () => ScrollTrigger.refresh());
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => ScrollTrigger.refresh(), 300); });

  /* ---------- UI dasar (juga dipakai tanpa animasi) ---------- */
  function basicUi() {
    const toTopEl = document.getElementById("toTop");
    if (!toTopEl) return;
    addEventListener("scroll", () => toTopEl.classList.toggle("show", scrollY > innerHeight * 0.8), { passive: true });
    const track = document.getElementById("marquee");
    if (track) track.innerHTML = ["Web App", "PWA", "Website", "AI Assistant"].map((w) => `<span>${w}<i>✦</i></span>`).join("");
  }
})();
