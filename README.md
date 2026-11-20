# Portofolio — Made Junindra

Website portofolio statis: judul huruf chrome (liquid metal), langit, dan padang rumput. HTML + CSS + JS, tanpa build.

## Mengubah isi
- **Proyek**: edit `projects.js` (judul, deskripsi, teknologi, link, screenshot).
- **Screenshot**: taruh gambar di `images/` lalu isi `image: "images/nama.png"`. Kosongkan untuk mockup otomatis.
- **Mockup**: `device: "phone"` atau `"laptop"`; `pills` = 2 label pink & biru di bawah judul.
- **Kontak**: di `index.html`, bagian `#kontak`, ganti nomor WhatsApp dan email.

## Deploy ke Vercel
1. Upload folder ini ke repo GitHub baru (mis. `portfolio`).
2. Buka vercel.com → **Add New → Project** → pilih repo tersebut.
3. Framework Preset: **Other**. Build Command & Output Directory biarkan kosong.
4. Klik **Deploy**. Setiap push ke GitHub akan otomatis ter-update.

Atau lewat CLI: `npm i -g vercel` lalu jalankan `vercel` di folder ini.
