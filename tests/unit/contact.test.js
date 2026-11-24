import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateContact,
  buildMessage,
  whatsappUrl,
  gmailUrl,
  mailtoUrl,
  MIN_MESSAGE,
} from "../../public/assets/js/lib/contact.js";

test("isian valid lolos", () => {
  const r = validateContact({
    name: "Made",
    email: "made@gmail.com",
    type: "PWA",
    message: "Mau buat aplikasi kasir.",
  });
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, {});
});

test("setiap kolom punya pesan error sendiri", () => {
  const r = validateContact({ name: "M", email: "made@gmail", message: "dddd" });
  assert.equal(r.ok, false);
  assert.match(r.errors.name, /nama/i);
  assert.match(r.errors.email, /email/i);
  assert.match(r.errors.message, new RegExp(`minimal ${MIN_MESSAGE}`));
  assert.match(r.errors.message, /sekarang 4/);
});

test("pesan dibersihkan & dibatasi", () => {
  const r = validateContact({ name: " Made\u0000 ", email: "a@b.co", message: "x".repeat(5000) });
  assert.equal(r.values.name, "Made");
  assert.equal(r.values.message.length, 1500);
  assert.equal(r.values.type, "Lainnya");
});

test("URL WhatsApp, Gmail & mailto di-encode dengan benar", () => {
  const text = buildMessage("Dejun", { name: "A&B", email: "a@b.co", type: "PWA", message: "Halo? #1 & 2" });
  const wa = whatsappUrl("6281234567890", text);
  assert.ok(wa.startsWith("https://wa.me/6281234567890?text="));
  assert.equal(decodeURIComponent(wa.split("text=")[1]), text);
  const gm = new URL(gmailUrl("me@x.com", "Proyek & Ide", text));
  assert.equal(gm.hostname, "mail.google.com");
  assert.equal(gm.searchParams.get("to"), "me@x.com");
  assert.equal(gm.searchParams.get("su"), "Proyek & Ide");
  assert.equal(gm.searchParams.get("body"), text);
  assert.ok(mailtoUrl("me@x.com", "S", "B&C").endsWith("subject=S&body=B%26C"));
});
