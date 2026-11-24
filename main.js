/**
 * Titik masuk aplikasi. Urutan: data → render → navigasi → animasi.
 */
import { SITE, PROJECTS, TESTIMONIALS } from "./data.js";
import { normalizeSite, normalizeProjects, normalizeTestimonials } from "./lib/sanitize.js";
import { initProfile } from "./sections/profile.js";
import { initWorks } from "./sections/works.js";
import { initContact } from "./sections/contact.js";
import { initNav } from "./sections/nav.js";
import { initMotion } from "./sections/motion.js";

const site = normalizeSite(SITE);
const projects = normalizeProjects(PROJECTS);
const testimonials = normalizeTestimonials(TESTIMONIALS);

document.title = `${site.nick} — ${site.name} · ${site.role}`;
initProfile(site, projects, testimonials);
initWorks(projects);
initContact(site);
initNav();
initMotion();
document.documentElement.classList.add("js-ready");
