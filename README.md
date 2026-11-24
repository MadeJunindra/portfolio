# Dejun — Portfolio (Light Glass UI)

Website portofolio statis bertema kaca (glassmorphism) terang. HTML + CSS + JS murni, tanpa build. Siap deploy ke Vercel.

## Mengubah isi — cukup edit `projects.js`
| Bagian | Yang diisi |
| --- | --- |
| `window.SITE` | nama, peran, intro, **email**, **WhatsApp**, lokasi, GitHub, foto, CV, tahun pengalaman |
| `window.TESTIMONIALS` | testimoni **asli** dari klien (kosong = bagian disembunyikan) |
| `window.PROJECTS` | daftar proyek |

- **Foto profil**: simpan di `images/profile.webp` (rasio ±4:5), lalu isi `photo: "images/profile.webp"`. Kosong = monogram "DJ".
- **CV**: simpan PDF di `files/cv-dejun.pdf`, isi `cv: "files/cv-dejun.pdf"` → tombol "Unduh CV" muncul.
- **Tahun pengalaman**: isi `yearsExperience: "3+"` → muncul di statistik & kartu hero.
- Screenshot proyek: `images/nama.webp`, isi `image` pada proyek.

## Struktur
| File | Isi |
| --- | --- |
| `index.html` | Struktur halaman |
| `style.css` | Tampilan (glass, layout, responsif) |
| `projects.js` | **Semua data** |
| `main.js` | Mengisi halaman dari data, filter karya, modal, form kontak, menu HP |
| `motion.js` | Animasi: Lenis smooth scroll + GSAP + ScrollTrigger |
| `vendor/` | GSAP 3.12.5, ScrollTrigger, Lenis 1.1.20 (lokal) |
| `fonts/` | Plus Jakarta Sans (lokal) |
| `vercel.json` | Header keamanan & cache |

## Form kontak
Tidak ada server/database: form membuka **WhatsApp** atau **aplikasi email** pengunjung dengan pesan yang sudah terisi. Tidak ada data yang disimpan → tidak ada data yang bisa dicuri. Input divalidasi & dibatasi panjangnya.

## Performa
- Kaca dibuat dengan gradien + border + bayangan (tanpa `backdrop-filter` mahal).
- Animasi hanya `transform`/`opacity` (GPU) → mengikuti refresh rate layar (60/120/144 Hz).
- Font & library lokal, gambar WebP, animasi berhenti saat tidak terlihat.
- Menghormati "Kurangi gerakan" (prefers-reduced-motion).

## Keamanan
- CSP ketat: `script-src 'self'`, tanpa inline script, tanpa eval, `font-src 'self'`, `worker-src 'none'`, `form-action 'none'`, `frame-ancestors 'none'`.
- HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP/CORP.
- Semua data di-escape; URL hanya `https://`; gambar hanya dari `images/`; link luar `rel="noopener noreferrer"`.

## Deploy
Upload semua isi folder ini ke repo GitHub yang terhubung ke Vercel (timpa semua file lama). Vercel deploy otomatis.
