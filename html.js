/**
 * Template HTML yang AMAN SECARA DEFAULT.
 *
 *   html`<p>${userText}</p>`   → userText otomatis di-escape
 *   html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`  → aman bersarang
 *   raw(trustedString)          → hanya untuk HTML konstan milik kode ini
 *
 * Ini satu-satunya tempat yang boleh menyentuh innerHTML (dijaga ESLint).
 */

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" };

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"'`]/g, (ch) => ESCAPES[ch]);
}

class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

/** Tandai string sebagai HTML tepercaya (JANGAN dipakai untuk data pengguna). */
export const raw = (value) => new SafeHtml(String(value));

function toHtml(value) {
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(toHtml).join("");
  if (value === null || value === undefined || value === false) return "";
  return escapeHtml(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, i) => {
    out += toHtml(value) + strings[i + 1];
  });
  return new SafeHtml(out);
}

/** Pasang hasil html`` ke elemen. Menolak string mentah. */
export function render(element, content) {
  if (!(content instanceof SafeHtml)) throw new TypeError("render() hanya menerima html`` atau raw()");
  element.innerHTML = content.value;
}
