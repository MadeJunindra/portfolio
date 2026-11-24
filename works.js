/**
 * Karya: filter kategori, kartu proyek, animasi ganti filter, modal detail.
 */
import { $, $$, emit, prefersReducedMotion } from "../lib/dom.js";
import { html, raw, render } from "../lib/html.js";
import { applyColors } from "./profile.js";

export const CATEGORY_LABEL = {
  all: "Semua",
  webapp: "Web App",
  pwa: "PWA",
  website: "Website",
  ai: "AI",
  desktop: "Desktop",
};
const LINK_LABEL = { live: "Lihat Live", demo: "Coba Demo", repo: "Kode di GitHub" };
const LIMIT = 6;
const EASE = "cubic-bezier(.2,.8,.2,1)";
const ARROW = raw('<svg aria-hidden="true"><use href="#i-arrow"/></svg>');

/** Daftar proyek yang ditampilkan untuk filter & status "lihat semua". */
export function visibleProjects(projects, category, expanded, limit = LIMIT) {
  const list = projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => category === "all" || project.category === category);
  const shown = category === "all" && !expanded ? list.slice(0, limit) : list;
  return { shown, hasMore: category === "all" && !expanded && list.length > limit };
}

function screen(p) {
  if (p.image)
    return html`<img
      src="${p.image}"
      alt="Tampilan ${p.title}"
      loading="lazy"
      decoding="async"
      width="780"
      height="1560"
    />`;
  return html`<div class="mock" data-color="${p.accent}">
    ${p.device === "laptop" ? raw('<div class="mock-top"><i></i><i></i><i></i></div>') : ""}
    <div class="mock-hero"><b>${p.title}</b><small>${p.tagline}</small></div>
    <div class="mock-row"><i></i><i></i>${p.device === "laptop" ? raw("<i></i>") : ""}</div>
    <div class="mock-line"></div>
    <div class="mock-line"></div>
  </div>`;
}

function thumb(p) {
  const dev =
    p.device === "laptop"
      ? html`<div class="dev dev-laptop">
          <div class="lid"><div class="scr">${screen(p)}</div></div>
          <div class="base"></div>
        </div>`
      : html`<div class="dev dev-phone"><div class="scr">${screen(p)}</div></div>`;
  return html`<div class="thumb" data-color="${p.accent}">${dev}</div>`;
}

export function initWorks(projects) {
  const worksEl = $("#works");
  const moreBtn = $("#moreBtn");
  const filtersEl = $("#filters");
  const canAnimate = !prefersReducedMotion() && typeof Element.prototype.animate === "function";
  let active = "all";
  let expanded = false;
  let busy = false;

  /* ---------- Filter (tombol toggle dengan aria-pressed) ---------- */
  const cats = [
    "all",
    ...Object.keys(CATEGORY_LABEL).filter((k) => k !== "all" && projects.some((p) => p.category === k)),
  ];
  render(
    filtersEl,
    html`<span class="filter-pill" aria-hidden="true"></span>${cats.map(
      (k) =>
        html` <button type="button" data-cat="${k}" aria-pressed="${String(k === active)}">
            ${CATEGORY_LABEL[k]}
          </button>`,
    )}`,
  );
  const pill = $(".filter-pill", filtersEl);

  function movePill(instant) {
    const btn = $('button[aria-pressed="true"]', filtersEl);
    if (!btn) return;
    if (instant) pill.style.transition = "none";
    pill.style.width = `${btn.offsetWidth}px`;
    pill.style.transform = `translateX(${btn.offsetLeft}px)`;
    if (instant) {
      void pill.offsetWidth; // paksa reflow agar transisi tidak berjalan
      pill.style.transition = "";
    }
  }

  /* ---------- Kartu ---------- */
  function renderWorks() {
    const { shown, hasMore } = visibleProjects(projects, active, expanded);
    render(
      worksEl,
      html`${shown.map(
        ({ project: p, index }) =>
          html` <li>
            <button type="button" class="work" data-i="${index}" aria-haspopup="dialog">
              ${thumb(p)}
              <span class="sr-only">Lihat detail: </span>
              <span class="work-meta"
                ><span
                  ><span class="work-title">${p.title}</span>
                  <small>${CATEGORY_LABEL[p.category]} · ${p.year}</small></span
                >
                <span class="work-go">${ARROW}</span></span
              >
            </button>
          </li>`,
      )}`,
    );
    moreBtn.hidden = !hasMore;
    applyColors(worksEl);
    emit("works:render");
  }

  function animateIn(from = 0) {
    if (!canAnimate) return;
    [...worksEl.children].slice(from).forEach((item, k) => {
      const delay = k * 70;
      item.animate(
        [
          { opacity: 0, transform: "perspective(900px) translateY(36px) scale(.94) rotateX(-10deg)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 700, delay, easing: EASE, fill: "backwards" },
      );
      const dev = $(".dev", item);
      if (dev) {
        dev.animate(
          [
            { transform: "translateX(-50%) translateY(45%)", opacity: 0 },
            { transform: "translateX(-50%)", opacity: 1 },
          ],
          { duration: 900, delay: delay + 120, easing: EASE, fill: "backwards" },
        );
      }
    });
  }

  function animateHeight(from) {
    const to = worksEl.offsetHeight;
    if (canAnimate && from !== to)
      worksEl.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 500, easing: EASE });
  }

  async function swap(category) {
    if (!canAnimate) {
      active = category;
      renderWorks();
      return;
    }
    busy = true;
    const h0 = worksEl.offsetHeight;
    try {
      await Promise.all(
        [...worksEl.children].map(
          (item, k) =>
            item.animate(
              [
                { opacity: 1, transform: "none" },
                { opacity: 0, transform: "translateY(-14px) scale(.96)" },
              ],
              { duration: 260, delay: k * 25, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" },
            ).finished,
        ),
      );
    } finally {
      active = category;
      renderWorks();
      animateHeight(h0);
      animateIn(0);
      busy = false;
    }
  }

  filtersEl.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-cat]");
    if (!btn || btn.dataset.cat === active || busy) return;
    $$("button[data-cat]", filtersEl).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    movePill(false);
    swap(btn.dataset.cat);
  });

  moreBtn.addEventListener("click", () => {
    const before = worksEl.children.length;
    const h0 = worksEl.offsetHeight;
    expanded = true;
    renderWorks();
    animateHeight(h0);
    animateIn(before);
    worksEl.children[before]?.querySelector(".work")?.focus({ preventScroll: true });
  });

  /* ---------- Modal ---------- */
  const modal = $("#modal");
  const body = $("#modalBody");
  let opener = null;

  function openProject(index, trigger) {
    const p = projects[index];
    if (!p) return;
    opener = trigger;
    const links = Object.entries(p.links);
    render(
      body,
      html` <button type="button" class="modal-close" aria-label="Tutup detail proyek">
          ${raw('<svg aria-hidden="true"><use href="#i-close"/></svg>')}
        </button>
        ${thumb(p)}
        <div class="modal-content">
          <p class="eyebrow">${CATEGORY_LABEL[p.category]} · ${p.year}</p>
          <h2 id="modalTitle" class="modal-title">${p.title}</h2>
          <p class="meta">${p.tagline}</p>
          <p class="desc">${p.description}</p>
          <ul class="chips" aria-label="Sorotan dan teknologi">
            ${p.highlights.map((h) => html`<li class="chip hl">${h}</li>`)}${p.tech.map((t) => html`<li class="chip">${t}</li>`)}
          </ul>
          ${
            links.length
              ? html`<div class="actions">
                  ${links.map(
                    ([key, url], n) =>
                      html` <a
                        class="btn ${n ? "btn-glass" : "btn-dark"}"
                        href="${url}"
                        target="_blank"
                        rel="noopener noreferrer"
                        >${LINK_LABEL[key]} ${ARROW}<span class="sr-only"> (tab baru)</span></a
                      >`,
                  )}
                </div>`
              : ""
          }
        </div>`,
    );
    applyColors(body);
    modal.showModal();
    $(".modal-close", body).focus();
    emit("modal:open");
  }

  worksEl.addEventListener("click", (event) => {
    const card = event.target.closest(".work");
    if (card) openProject(Number(card.dataset.i), card);
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest(".modal-close")) modal.close();
  });
  modal.addEventListener("close", () => {
    emit("modal:close");
    opener?.focus({ preventScroll: true });
  });

  renderWorks();
  movePill(true);
  window.addEventListener("resize", () => movePill(true));
  document.fonts?.ready.then(() => movePill(true));
}
