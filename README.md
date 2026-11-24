# Dejun — Portfolio

[![CI](https://github.com/MadeJunindra/dejun-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/MadeJunindra/dejun-portfolio/actions/workflows/ci.yml)

Portofolio pribadi **Made Junindra (Dejun)** — Web & App Developer.
Situs statis bertema _light glass_: HTML, CSS, dan JavaScript modul (ES modules) tanpa framework dan tanpa proses build.

🔗 **Live:** https://dejun-portfolio.vercel.app

| Lighthouse (lokal, dengan kompresi seperti Vercel) | Performance | Accessibility | Best Practices | SEO |
| -------------------------------------------------- | ----------- | ------------- | -------------- | --- |
| Desktop                                            | 100         | 100           | 100            | 100 |
| Mobile                                             | 98          | 100           | 100            | 100 |

## Mengubah isi

Semua konten ada di **`public/assets/js/data.js`**:

| Bagian         | Isi                                                                                     |
| -------------- | --------------------------------------------------------------------------------------- |
| `SITE`         | nama, peran, intro, **email**, **WhatsApp**, lokasi, GitHub, foto, CV, tahun pengalaman |
| `TESTIMONIALS` | testimoni **asli** dari klien (kosong = bagian disembunyikan)                           |
| `PROJECTS`     | daftar proyek                                                                           |

- Foto profil → `public/images/profile.webp` (±4:5), lalu `photo: "images/profile.webp"`.
- CV → `public/files/cv.pdf`, lalu `cv: "files/cv.pdf"`.
- Screenshot proyek → `public/images/nama.webp`, lalu isi `image` pada proyek.
- Nilai contoh (`email@anda.com`, `62XXXXXXXXXX`) otomatis disembunyikan sampai diganti.

Setelah mengedit, jalankan `npm run check` — tes akan memberi tahu jika ada data/gambar yang tidak valid.

## Menjalankan secara lokal

Butuh Node.js ≥ 20.

```bash
npm install
npm run dev        # http://localhost:4321 (header keamanan sama dengan Vercel)
```

| Perintah            | Fungsi                                                         |
| ------------------- | -------------------------------------------------------------- |
| `npm run check`     | **Semua pemeriksaan** (dipakai CI)                             |
| `npm run verify`    | Pastikan semua file yang dirujuk ada (juga dijalankan Vercel)  |
| `npm run lint`      | ESLint (JS), Stylelint (CSS), html-validate (HTML)             |
| `npm run format`    | Rapikan kode dengan Prettier                                   |
| `npm run test:unit` | Tes unit (`node:test`) untuk logika murni                      |
| `npm run test:e2e`  | Tes end-to-end Playwright (desktop & HP) + audit aksesibilitas |

## Struktur

```
public/                     ← yang di-deploy (outputDirectory Vercel)
├─ index.html, 404.html, robots.txt, sitemap.xml, site.webmanifest
├─ images/                  ← screenshot & gambar OG
└─ assets/
   ├─ css/style.css
   ├─ fonts/                ← Plus Jakarta Sans (lokal)
   ├─ vendor/               ← GSAP, ScrollTrigger, Lenis (versi di nama file)
   └─ js/
      ├─ main.js            ← titik masuk
      ├─ data.js            ← KONTEN
      ├─ lib/               ← logika murni & helper (sanitize, html, contact, dom)
      └─ sections/          ← profile, works, contact, nav, motion
scripts/                    ← serve.mjs (server lokal), verify-public.mjs (penjaga deploy)
tests/unit, tests/e2e       ← tes
.github/workflows/ci.yml    ← CI di setiap push & pull request
```

## Keputusan teknis

- **Tanpa framework & tanpa build** — situs satu halaman tidak membutuhkannya; lebih sedikit dependensi = lebih sedikit risiko. Kompresi dan cache ditangani Vercel.
- **Aman secara default** — semua HTML dibuat lewat `html\`\`` (`lib/html.js`) yang meng-escape setiap nilai; ESLint melarang `innerHTML` di tempat lain.
- **Progressive enhancement** — teks utama sudah ada di HTML (terbaca tanpa JavaScript & oleh mesin pencari); animasi bersifat tambahan dan otomatis mati bila library gagal dimuat atau pengguna memilih "kurangi gerakan".
- **Performa** — animasi hanya `transform`/`opacity` (GPU), tanpa `backdrop-filter` pada elemen yang bergerak, aset lokal dengan cache `immutable`.

## Keamanan

- CSP ketat **tanpa `'unsafe-inline'`**: `script-src 'self'`, `style-src 'self'`, `frame-ancestors 'none'`, `form-action 'none'`, `object-src 'none'`.
- HSTS (preload), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP.
- Validasi data: URL hanya `https://`, gambar hanya dari `images/`, warna hanya hex, teks dibatasi panjang & dibersihkan.
- Form kontak tidak mengirim data ke server mana pun (membuka WhatsApp/Gmail di perangkat pengunjung).
- Library pihak ketiga disimpan lokal; `npm audit` dijalankan di CI; Dependabot memperbarui dependensi tiap bulan.

## Deploy (Vercel)

Hubungkan repo ini di Vercel — konfigurasi sudah ada di `vercel.json` (output `public/`, build = `verify-public.mjs`).
Jika ada file yang dirujuk tetapi hilang, **deploy otomatis dibatalkan**.
