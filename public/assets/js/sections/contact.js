/**
 * Kontak: daftar kontak + form yang membuka WhatsApp / Gmail.
 * Tidak ada data yang dikirim ke server mana pun.
 */
import { $ } from "../lib/dom.js";
import { html, render } from "../lib/html.js";
import {
  MIN_MESSAGE,
  MAX_MESSAGE,
  validateContact,
  buildMessage,
  subjectFor,
  whatsappUrl,
  gmailUrl,
  mailtoUrl,
} from "../lib/contact.js";

export function initContact(site) {
  const hasWa = Boolean(site.whatsapp);
  const hasEmail = Boolean(site.email);

  /* ---------- Daftar kontak ---------- */
  const cEmail = $("#cEmail");
  const cWa = $("#cWa");
  const cGit = $("#cGit");
  if (hasEmail) {
    cEmail.href = `mailto:${site.email}`;
    cEmail.textContent = site.email;
  } else cEmail.closest("li").hidden = true;
  if (hasWa) {
    cWa.href = `https://wa.me/${site.whatsapp}`;
    cWa.textContent = `+${site.whatsapp}`;
  } else cWa.closest("li").hidden = true;
  if (site.github) cGit.href = site.github;
  else cGit.closest("li").hidden = true;

  /* ---------- Form ---------- */
  const form = $("#contactForm");
  const note = $("#formNote");
  const fields = { name: form.elements.name, email: form.elements.email, message: form.elements.message };
  $('button[data-via="wa"]', form).hidden = !hasWa;
  $('button[data-via="email"]', form).hidden = !hasEmail;

  const channels = [hasWa && "WhatsApp", hasEmail && "Gmail / aplikasi email"].filter(Boolean).join(" atau ");
  const defaultNote = channels
    ? `Pesan akan dibuka di ${channels} Anda — tidak ada data yang disimpan di website ini.`
    : "Kontak belum diatur oleh pemilik website.";
  const setNote = (content, isError = false) => {
    if (typeof content === "string") note.textContent = content;
    else render(note, content);
    note.classList.toggle("err", isError);
  };
  setNote(defaultNote);

  // Belum ada email/WhatsApp → sembunyikan form (jangan tampilkan form yang tidak bisa dipakai)
  if (!channels) {
    form.hidden = true;
    const fallback = $("#contactFallback");
    fallback.hidden = false;
    const gh = $("#fallbackGithub");
    if (site.github) gh.href = site.github;
    else gh.hidden = true;
    console.info("[portfolio] Form kontak nonaktif: isi `email` atau `whatsapp` di public/assets/js/data.js.");
    return;
  }

  // penghitung karakter
  const counter = $("#msgCount");
  const updateCount = () => {
    const n = fields.message.value.trim().length;
    counter.textContent = n < MIN_MESSAGE ? `${n}/${MIN_MESSAGE} karakter minimum` : `${n}/${MAX_MESSAGE}`;
    counter.classList.toggle("ok", n >= MIN_MESSAGE);
  };
  fields.message.addEventListener("input", updateCount);
  updateCount();

  const setError = (name, message = "") => {
    const input = fields[name];
    const tip = $(`#err-${name}`);
    input.classList.toggle("invalid", Boolean(message));
    input.setAttribute("aria-invalid", String(Boolean(message)));
    tip.textContent = message;
    tip.hidden = !message;
  };
  Object.keys(fields).forEach((name) => fields[name].addEventListener("input", () => setError(name)));

  let lastMessage = "";
  note.addEventListener("click", async (event) => {
    if (!event.target.closest("[data-copy]")) return;
    try {
      await navigator.clipboard.writeText(lastMessage);
      setNote("Pesan tersalin ✓ — tempel di aplikasi chat/email Anda.");
    } catch {
      setNote("Tidak bisa menyalin otomatis. Pilih teks pesan lalu salin manual.", true);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const via = event.submitter?.dataset.via || (hasWa ? "wa" : "email");
    const { ok, values, errors } = validateContact(Object.fromEntries(new FormData(form)));
    Object.keys(fields).forEach((name) => setError(name, errors[name]));
    if (!ok) {
      fields[Object.keys(errors)[0]].focus();
      setNote("Periksa kembali kolom yang ditandai merah.", true);
      return;
    }
    lastMessage = buildMessage(site.nick, values);
    const subject = subjectFor(values.type);
    if (via === "wa" && hasWa) {
      window.open(whatsappUrl(site.whatsapp, lastMessage), "_blank", "noopener,noreferrer");
      setNote(
        html`Membuka WhatsApp… Tidak terbuka? <button type="button" class="link-btn" data-copy>Salin pesan</button>`,
      );
    } else if (hasEmail) {
      window.open(gmailUrl(site.email, subject, lastMessage), "_blank", "noopener,noreferrer");
      setNote(
        html`Membuka Gmail… Pakai aplikasi lain?
          <a class="link-btn" href="${mailtoUrl(site.email, subject, lastMessage)}">Buka aplikasi email</a> ·
          <button type="button" class="link-btn" data-copy>Salin pesan</button>`,
      );
    }
  });
}
