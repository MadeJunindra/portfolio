/* =========================================================
   motion.js — Lenis + GSAP + ScrollTrigger
   Prinsip: hanya animasi transform & opacity (GPU), halus,
   elegan, dan tetap ringan. Tanpa GSAP / "kurangi gerakan"
   → halaman tampil normal tanpa animasi.
   ========================================================= */
(function () {
  "use strict";
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Nav aktif & sembunyi (juga tanpa GSAP) ---------- */
  const navLinks = $$(".nav-links a");
  const sections = ["tentang", "layanan", "karya", "proses", "kontak"].map((id) => document.getElementById(id)).filter(Boolean);
  const setActive = (id) => navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => io.observe(s));
  const heroIO = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive("top"); }, { rootMargin: "-45% 0px -50% 0px" });
  heroIO.observe($(".hero"));

  // animasi CSS (orb melayang) berhenti saat hero tak terlihat
  const heroPause = new IntersectionObserver(([e]) => $(".hero-visual").classList.toggle("paused", !e.isIntersecting));
  heroPause.observe($(".hero"));

  if (!window.gsap || !window.ScrollTrigger || reduce) {
    // tanpa animasi: anchor tetap halus lewat CSS
    root.style.scrollBehavior = reduce ? "auto" : "smooth";
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Lenis ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (!/^#[\w-]*$/.test(id)) return;
    const target = id === "#top" || id === "#" ? 0 : document.getElementById(id.slice(1));
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -90, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else (target === 0 ? window.scrollTo({ top: 0, behavior: "smooth" }) : target.scrollIntoView({ behavior: "smooth" }));
  });
  document.addEventListener("modal:open", () => lenis && lenis.stop());
  document.addEventListener("modal:close", () => lenis && lenis.start());

  /* ---------- Progress & nav ---------- */
  gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  const navWrap = $(".nav-wrap");
  let navHidden = false;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (s) => {
      const hide = s.direction === 1 && s.scroll() > 500 && !$(".nav-links.open");
      if (hide !== navHidden) { navHidden = hide; navWrap.classList.toggle("hide", hide); }
    },
  });

  /* ---------- Intro hero ---------- */
  const ease = "expo.out";
  gsap.timeline({ defaults: { ease, duration: 1.2 } })
    .from(".nav", { y: -30, opacity: 0, duration: 1 }, 0)
    .from(".hero .eyebrow", { y: 20, opacity: 0 }, 0.15)
    .from(".hn-nick", { yPercent: 40, opacity: 0, duration: 1.3 }, 0.2)
    .from(".hero-fullname, .hero-role, .hero-intro", { y: 26, opacity: 0, stagger: 0.08 }, 0.35)
    .from(".hero-cta .btn", { y: 20, opacity: 0, stagger: 0.08 }, 0.55)
    .from(".stack-row", { y: 16, opacity: 0 }, 0.7)
    .from(".portrait", { y: 60, rotation: -8, scale: 0.94, opacity: 0, duration: 1.5 }, 0.25)
    .from(".float-card, .spark-orb", { y: 30, scale: 0.85, opacity: 0, stagger: 0.1, duration: 1.1, ease: "back.out(1.6)" }, 0.75)
    .from(".backdrop .orb", { scale: 0.6, opacity: 0, stagger: 0.12, duration: 1.6 }, 0.2)
    .add(() => {
      // melayang halus setelah intro (CSS, di GPU)
      $(".fc-exp").classList.add("float-a"); $(".fc-status").classList.add("float-b");
      $(".fc-focus").classList.add("float-b"); $(".spark-orb").classList.add("float-a");
    });

  /* ---------- Parallax ---------- */
  const heroST = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".portrait", { yPercent: -10, ease: "none", scrollTrigger: heroST });
  gsap.to(".hero-text", { yPercent: -8, opacity: 0.3, ease: "none", scrollTrigger: heroST });
  gsap.to(".backdrop .o1", { yPercent: -120, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
  gsap.to(".backdrop .o2", { yPercent: -80, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

  /* ---------- Reveal section ---------- */
  const reveal = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 40, opacity: 0, duration: 1.1, ease, stagger: 0.08, ...vars,
    scrollTrigger: { trigger: trigger || targets, start: "top 85%" },
  });
  $$(".sec-head, .about-left, .about-right, .tools-panel .sec-head").forEach((el) => reveal(el, el));
  reveal(".about", ".about", { y: 60, scale: 0.98, stagger: 0 });
  reveal(".stat", ".stats", { y: 24 });
  reveal(".service", ".services", { y: 50 });
  reveal(".tools-panel", ".tools-panel", { y: 60, scale: 0.98 });
  reveal(".tool", ".tools", { y: 20, scale: 0.9, stagger: 0.035 });
  reveal(".step", ".process", { y: 40, stagger: 0.1 });
  reveal(".contact", ".contact", { y: 60, scale: 0.98 });
  reveal(".contact-list li", ".contact-list", { x: -20, y: 0 });

  // angka statistik menghitung naik
  $$(".stat b").forEach((b) => {
    const m = String(b.dataset.count || "").match(/^(\d+)(.*)$/); if (!m) return;
    const end = +m[1], suffix = m[2], o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: b, start: "top 90%" },
      onUpdate: () => { b.textContent = Math.round(o.v) + suffix; } });
  });

  // kartu karya (dirender ulang saat filter)
  function revealWorks() {
    gsap.fromTo(".work", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease, stagger: 0.07, clearProps: "transform,opacity" });
    ScrollTrigger.refresh();
  }
  let worksShown = false;
  ScrollTrigger.create({ trigger: "#works", start: "top 85%", once: true, onEnter: () => { worksShown = true; revealWorks(); } });
  gsap.set(".work", { opacity: 0 });
  document.addEventListener("works:render", () => { if (worksShown) revealWorks(); else gsap.set(".work", { opacity: 0 }); });

  /* ---------- Interaksi mouse (desktop) ---------- */
  if (fine) {
    // tombol magnetik
    $$(".magnetic").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" }), my = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.25); my((e.clientY - r.top - r.height / 2) * 0.35); });
      el.addEventListener("pointerleave", () => { mx(0); my(0); });
    });
    // potret & kartu hero ikut gerak mouse (kedalaman)
    const hv = $(".hero-visual");
    const layers = [[".portrait", 14], [".fc-exp", 26], [".fc-status", 22], [".fc-focus", 30], [".spark-orb", 36]]
      .map(([s, d]) => [$(s), d]).filter(([el]) => el);
    const qs = layers.map(([el, d]) => [gsap.quickTo(el, "x", { duration: 1, ease: "power3" }), d]);
    const qsy = layers.map(([el, d]) => [gsap.quickTo(el, "y", { duration: 1, ease: "power3" }), d]);
    $(".hero").addEventListener("pointermove", (e) => {
      const r = hv.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / innerWidth, py = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      qs.forEach(([q, d]) => q(px * d)); qsy.forEach(([q, d]) => q(py * d));
    });
    // kartu layanan & karya: kilau mengikuti kursor + tilt halus
    const tilt = (sel) => document.addEventListener("pointermove", (e) => {
      const card = e.target.closest(sel); if (!card) return;
      const r = card.getBoundingClientRect();
      gsap.to(card, { y: -6, rotationY: ((e.clientX - r.left) / r.width - 0.5) * 6, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 6, transformPerspective: 900, duration: 0.6, ease: "power3", overwrite: "auto" });
    }, { passive: true });
    tilt(".service"); tilt(".work");
    document.addEventListener("pointerout", (e) => {
      const card = e.target.closest(".service, .work");
      if (card && !card.contains(e.relatedTarget)) gsap.to(card, { y: 0, rotationY: 0, rotationX: 0, duration: 0.8, ease: "power3" });
    });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
