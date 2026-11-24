/**
 * Logika form kontak (murni, tanpa DOM) → mudah dites.
 */
import { cleanText, isEmail } from "./sanitize.js";

export const MIN_MESSAGE = 10;
export const MAX_MESSAGE = 1500;

/** Validasi isian form. Mengembalikan { ok, values, errors: { field: pesan } }. */
export function validateContact(input) {
  const values = {
    name: cleanText(input.name, 80),
    email: cleanText(input.email, 120),
    type: cleanText(input.type, 40) || "Lainnya",
    message: cleanText(input.message, MAX_MESSAGE),
  };
  const errors = {};
  if (values.name.length < 2) errors.name = "Isi nama Anda (min. 2 huruf).";
  if (!isEmail(values.email)) errors.email = "Format email belum benar, contoh: nama@gmail.com";
  if (values.message.length < MIN_MESSAGE) {
    errors.message = `Pesan terlalu pendek — minimal ${MIN_MESSAGE} karakter (sekarang ${values.message.length}).`;
  }
  return { ok: Object.keys(errors).length === 0, values, errors };
}

export function buildMessage(nick, { name, email, type, message }) {
  return `Halo ${nick}, saya ${name} (${email}).\nJenis proyek: ${type}\n\n${message}`;
}

export const subjectFor = (type) => `Proyek baru: ${type}`;

export function whatsappUrl(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function gmailUrl(to, subject, body) {
  const q = (v) => encodeURIComponent(v);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${q(to)}&su=${q(subject)}&body=${q(body)}`;
}

export function mailtoUrl(to, subject, body) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
