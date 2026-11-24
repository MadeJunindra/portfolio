/**
 * Navigasi: menu HP, penanda bagian aktif, jeda animasi hero saat tak terlihat.
 */
import { $, $$ } from "../lib/dom.js";

export function initNav() {
  const menuBtn = $("#menuBtn");
  const links = $("#navLinks");

  const setMenu = (open) => {
    links.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  };
  menuBtn.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && links.classList.contains("open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  // tandai bagian yang sedang dibaca
  const anchors = $$("a", links);
  const setActive = (id) =>
    anchors.forEach((a) => {
      const active = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id || "top");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  ["top", "tentang", "layanan", "karya", "proses", "kontak"]
    .map((id) => (id === "top" ? $(".hero") : document.getElementById(id)))
    .filter(Boolean)
    .forEach((section) => observer.observe(section));

  // animasi CSS di hero berhenti saat tidak terlihat (hemat baterai)
  const heroVisual = $(".hero-visual");
  new IntersectionObserver(([entry]) => heroVisual.classList.toggle("paused", !entry.isIntersecting)).observe(
    $(".hero"),
  );
}
