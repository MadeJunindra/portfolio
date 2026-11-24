/**
 * Animasi: Lenis (smooth scroll) + GSAP + ScrollTrigger.
 * Hanya transform & opacity (GPU). Tanpa GSAP atau dengan
 * "kurangi gerakan" → halaman tetap tampil normal.
 */
import { $, $$, hasFinePointer, prefersReducedMotion } from "../lib/dom.js";

const EASE = "expo.out";

function initSmoothScroll(gsap, ScrollTrigger) {
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    if (!/^#[\w-]*$/.test(id)) return;
    const target = id === "#top" || id === "#" ? 0 : document.getElementById(id.slice(1));
    if (target === null) return;
    event.preventDefault();
    if (lenis)
      lenis.scrollTo(target, { offset: target === 0 ? 0 : -90, duration: 1.4, easing: (t) => 1 - (1 - t) ** 4 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
    else target.scrollIntoView({ behavior: "smooth" });
    if (target !== 0) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  });
  document.addEventListener("modal:open", () => lenis?.stop());
  document.addEventListener("modal:close", () => lenis?.start());
}

function initChrome(gsap, ScrollTrigger) {
  gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  const navWrap = $(".nav-wrap");
  let hidden = false;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const hide = self.direction === 1 && self.scroll() > 500 && !$(".nav-links.open");
      if (hide !== hidden) {
        hidden = hide;
        navWrap.classList.toggle("hide", hide);
      }
    },
  });
  // nav muncul lagi saat elemen di dalamnya mendapat fokus keyboard
  navWrap.addEventListener("focusin", () => navWrap.classList.remove("hide"));
}

function initIntro(gsap) {
  gsap
    .timeline({ defaults: { ease: EASE, duration: 1.2 } })
    .from(".nav", { y: -30, opacity: 0, duration: 1 }, 0)
    .from(".hero .eyebrow", { y: 20, opacity: 0 }, 0.15)
    .from(".hn-nick", { yPercent: 40, opacity: 0, duration: 1.3 }, 0.2)
    .from(".hero-fullname, .hero-role, .hero-intro", { y: 26, opacity: 0, stagger: 0.08 }, 0.35)
    .from(".hero-cta .btn", { y: 20, opacity: 0, stagger: 0.08 }, 0.55)
    .from(".stack-row", { y: 16, opacity: 0 }, 0.7)
    .from(".portrait", { y: 60, rotation: -8, scale: 0.94, opacity: 0, duration: 1.5 }, 0.25)
    .from(
      ".float-card, .spark-orb",
      { y: 30, scale: 0.85, opacity: 0, stagger: 0.1, duration: 1.1, ease: "back.out(1.6)" },
      0.75,
    )
    .from(".backdrop .orb", { scale: 0.6, opacity: 0, stagger: 0.12, duration: 1.6 }, 0.2)
    .add(() => {
      $(".fc-exp").classList.add("float-a");
      $(".fc-status").classList.add("float-b");
      $(".fc-focus").classList.add("float-b");
      $(".spark-orb").classList.add("float-a");
    });
}

function initScrollEffects(gsap, ScrollTrigger) {
  const heroST = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".portrait", { yPercent: -10, ease: "none", scrollTrigger: heroST });
  gsap.to(".hero-text", { yPercent: -8, opacity: 0.3, ease: "none", scrollTrigger: heroST });
  gsap.to(".backdrop .o1", { yPercent: -120, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
  gsap.to(".backdrop .o2", { yPercent: -80, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

  const reveal = (targets, trigger, vars = {}) =>
    gsap.from(targets, {
      y: 40,
      opacity: 0,
      duration: 1.1,
      ease: EASE,
      stagger: 0.08,
      ...vars,
      scrollTrigger: { trigger: trigger || targets, start: "top 85%" },
    });
  $$(".sec-head, .about-left, .about-right").forEach((el) => reveal(el, el));
  reveal(".about", ".about", { y: 60, scale: 0.98, stagger: 0 });
  reveal(".stat", ".stats", { y: 24 });
  reveal(".service", ".services", { y: 50 });
  reveal(".tools-panel", ".tools-panel", { y: 60, scale: 0.98 });
  reveal(".tool", ".tools", { y: 20, scale: 0.9, stagger: 0.035 });
  reveal(".step", ".process", { y: 40, stagger: 0.1 });
  reveal(".contact", ".contact", { y: 60, scale: 0.98 });
  reveal(".contact-list li", ".contact-list", { x: -20, y: 0 });

  $$(".stat b").forEach((el) => {
    const match = String(el.dataset.count || "").match(/^(\d+)(.*)$/);
    if (!match) return;
    const end = Number(match[1]);
    const suffix = match[2];
    const counter = { v: 0 };
    gsap.to(counter, {
      v: end,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => {
        el.textContent = Math.round(counter.v) + suffix;
      },
    });
  });

  // kartu karya muncul saat pertama kali terlihat (ganti filter dianimasikan works.js)
  let worksShown = false;
  gsap.set("#works > li", { opacity: 0 });
  ScrollTrigger.create({
    trigger: "#works",
    start: "top 85%",
    once: true,
    onEnter: () => {
      worksShown = true;
      gsap.fromTo(
        "#works > li",
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: EASE, stagger: 0.08, clearProps: "transform,opacity" },
      );
      gsap.from("#works .dev", {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: EASE,
        stagger: 0.08,
        delay: 0.15,
        clearProps: "opacity",
      });
    },
  });
  document.addEventListener("works:render", () => {
    if (!worksShown) gsap.set("#works > li", { opacity: 0 });
    ScrollTrigger.refresh();
  });
}

function initPointer(gsap) {
  $$(".magnetic").forEach((el) => {
    const mx = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const my = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
    el.addEventListener("pointermove", (event) => {
      const r = el.getBoundingClientRect();
      mx((event.clientX - r.left - r.width / 2) * 0.25);
      my((event.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener("pointerleave", () => {
      mx(0);
      my(0);
    });
  });

  const visual = $(".hero-visual");
  const layers = [
    [".portrait", 14],
    [".fc-exp", 26],
    [".fc-status", 22],
    [".fc-focus", 30],
    [".spark-orb", 36],
  ]
    .map(([selector, depth]) => ({ el: $(selector), depth }))
    .filter(({ el }) => el)
    .map(({ el, depth }) => ({
      depth,
      x: gsap.quickTo(el, "x", { duration: 1, ease: "power3" }),
      y: gsap.quickTo(el, "y", { duration: 1, ease: "power3" }),
    }));
  $(".hero").addEventListener("pointermove", (event) => {
    const r = visual.getBoundingClientRect();
    const px = (event.clientX - (r.left + r.width / 2)) / window.innerWidth;
    const py = (event.clientY - (r.top + r.height / 2)) / window.innerHeight;
    layers.forEach((layer) => {
      layer.x(px * layer.depth);
      layer.y(py * layer.depth);
    });
  });

  document.addEventListener(
    "pointermove",
    (event) => {
      const card = event.target.closest(".service, .work");
      if (!card) return;
      const r = card.getBoundingClientRect();
      gsap.to(card, {
        y: -6,
        rotationY: ((event.clientX - r.left) / r.width - 0.5) * 6,
        rotationX: -((event.clientY - r.top) / r.height - 0.5) * 6,
        transformPerspective: 900,
        duration: 0.6,
        ease: "power3",
        overwrite: "auto",
      });
    },
    { passive: true },
  );
  document.addEventListener("pointerout", (event) => {
    const card = event.target.closest(".service, .work");
    if (card && !card.contains(event.relatedTarget))
      gsap.to(card, { y: 0, rotationY: 0, rotationX: 0, duration: 0.8, ease: "power3" });
  });
}

export function initMotion() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || prefersReducedMotion()) {
    document.documentElement.classList.add("no-motion");
    return false;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  initSmoothScroll(gsap, ScrollTrigger);
  initChrome(gsap, ScrollTrigger);
  initIntro(gsap);
  initScrollEffects(gsap, ScrollTrigger);
  if (hasFinePointer()) initPointer(gsap);
  window.addEventListener("load", () => ScrollTrigger.refresh());
  return true;
}
