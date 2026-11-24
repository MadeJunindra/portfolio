# Portofolio — Made Junindra

Website portofolio statis: judul chrome (liquid metal), langit, awan, dan padang rumput.
HTML + CSS + JS murni, tanpa proses build. Siap deploy ke Vercel.

## Struktur
| File | Isi |
| --- | --- |
| `index.html` | Kerangka halaman |
| `style.css` | Semua tampilan |
| `projects.js` | **Data proyek** — edit di sini |
| `main.js` | Membuat slide proyek, kupu-kupu, awan penyambung, mengatur rumput |
| `meadow.js` | Menggambar rumput (dijalankan di Web Worker) |
| `motion.js` | Animasi: Lenis smooth scroll, GSAP + ScrollTrigger, kursor, tombol magnetik, tilt 3D |
| `fonts/` | Font lokal (DM Sans, Poppins, Great Vibes) |
| `vendor/` | GSAP 3.12.5, ScrollTrigger, Lenis 1.1.20 (disimpan lokal) |
| `vercel.json` | Header keamanan & cache |

## Mengubah isi
- **Proyek**: edit `projects.js`. `links` hanya menerima URL `https://`. `image` hanya dari folder `images/`. `accent` harus warna hex (mis. `#2f7d5b`).
- **Kontak**: di `index.html` bagian `#kontak`, ganti nomor WhatsApp dan email.

## Animasi
- Loader pembuka → intro judul memantul (elastic)
- Smooth scroll (Lenis) yang tersinkron dengan ScrollTrigger
- Parallax: judul, awan, rumput, mockup, nomor slide
- Teks judul muncul per huruf, kartu & pill "pop"
- Pita teks berjalan yang kecepatannya ikut kecepatan scroll
- Kursor kustom, tombol magnetik, tilt 3D di mockup, percikan kilau saat klik
- Nav sembunyi saat scroll turun, muncul saat naik; indikator bagian aktif
- Progress bar & tombol "kembali ke atas" dengan cincin progres
- Menghormati pengaturan **"Kurangi gerakan"** (prefers-reduced-motion): animasi dimatikan otomatis

## Performa (target: mengikuti refresh rate layar, 60/120/144 Hz)
- **Judul chrome = gambar WebP** yang sudah dirender (`images/title/`). Efek logamnya berat, jadi dihitung sekali saat build, bukan di browser pengunjung.
- **Rumput digambar di Web Worker** (`meadow.js`, OffscreenCanvas) = thread terpisah, tidak mengganggu animasi/scroll. Browser lama otomatis pakai cara cadangan.
- **Semua animasi hanya `transform`/`opacity`** → dikerjakan GPU (kursor, kupu-kupu, loader, awan, dekorasi).
- Tanpa `backdrop-filter` & `filter: blur` di elemen yang bergerak.
- Setup animasi dipecah kecil-kecil selama loader; posisi ScrollTrigger dihitung saat loader masih menutup layar.
- Font & gambar lokal + preload; screenshot WebP (46 KB, sebelumnya 500 KB).
- Animasi di bagian yang tidak terlihat dijeda otomatis.

Mengubah tulisan judul: render ulang gambar di `images/title/` (lihat riwayat proyek), lalu ganti file WebP-nya.

## Keamanan
- **Content-Security-Policy ketat**: hanya script dari domain sendiri (`script-src 'self'`), tanpa inline script, tanpa `eval`. Script sisipan (XSS) dari luar tidak akan dijalankan.
- **Library disimpan lokal**, bukan dari CDN → tidak terpengaruh jika CDN pihak ketiga diretas.
- **Anti-clickjacking**: `frame-ancestors 'none'` + `X-Frame-Options: DENY` (situs tidak bisa disisipkan di iframe orang lain).
- **HSTS**: browser dipaksa selalu memakai HTTPS.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (kamera, mikrofon, lokasi, dll. dimatikan), `Cross-Origin-Opener-Policy`.
- **Sanitasi data**: semua teks di-escape sebelum masuk HTML; URL divalidasi hanya `https://`; link luar memakai `rel="noopener noreferrer"`.
- Tidak ada form, database, login, atau API key → tidak ada data yang bisa dicuri dari situs ini.

Cek header setelah online: https://securityheaders.com (masukkan URL Vercel Anda).

## Deploy ke Vercel
Upload semua isi folder ini ke repo GitHub, lalu Import di Vercel (Framework Preset: **Other**). Setiap push otomatis ter-deploy.
