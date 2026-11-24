import { test } from "node:test";
import assert from "node:assert/strict";
import { html, raw, escapeHtml, render } from "../../public/assets/js/lib/html.js";

test("escapeHtml meng-escape semua karakter berbahaya", () => {
  assert.equal(escapeHtml(`<img src=x onerror="a">'\`&`), "&lt;img src=x onerror=&quot;a&quot;&gt;&#39;&#96;&amp;");
});

test("html`` meng-escape interpolasi secara default", () => {
  const evil = '<script>alert("x")</script>';
  assert.equal(String(html`<p>${evil}</p>`), "<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p>");
});

test("html`` aman di dalam atribut", () => {
  const attr = '" onmouseover="alert(1)';
  assert.equal(String(html`<a title="${attr}">x</a>`), '<a title="&quot; onmouseover=&quot;alert(1)">x</a>');
});

test("html`` bersarang & array tidak di-escape dua kali", () => {
  const items = ["a<b", "c"];
  const list = html`<ul>${items.map((i) => html`<li>${i}</li>`)}</ul>`;
  assert.equal(String(list), "<ul><li>a&lt;b</li><li>c</li></ul>");
});

test("null, undefined, false tidak dicetak", () => {
  assert.equal(String(html`[${null}${undefined}${false}${0}]`), "[0]");
});

test("raw() hanya untuk HTML tepercaya", () => {
  assert.equal(String(html`${raw("<b>ok</b>")}`), "<b>ok</b>");
});

test("render() menolak string mentah", () => {
  const el = { innerHTML: "" };
  assert.throws(() => render(el, "<b>x</b>"), TypeError);
  render(el, html`<i>${"<x>"}</i>`);
  assert.equal(el.innerHTML, "<i>&lt;x&gt;</i>");
});
