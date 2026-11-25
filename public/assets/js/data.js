/**
 * DATA WEBSITE — cukup edit file ini untuk mengubah isi website.
 * Semua nilai divalidasi oleh lib/sanitize.js sebelum ditampilkan.
 */

// ---------- Profil ----------
export const SITE = {
  nick: "Dejun",
  name: "Made Junindra",
  role: "Web & App Developer",
  intro: "Saya membangun aplikasi web dan PWA yang rapi, cepat, dan benar-benar dipakai — dari ide sampai online.",
  photo: "images/profile.webp", // kosong = monogram "DJ"
  email: "dekjun84@gmail.com",
  whatsapp: "62XXXXXXXXXX", // GANTI: format 62xxxxxxxxxx tanpa + dan spasi
  location: "Indonesia",
  github: "https://github.com/MadeJunindra",
  cv: "", // contoh: "files/cv-dejun.pdf" (kosong = tombol disembunyikan)
  yearsExperience: "", // contoh: "3+" (kosong = tidak ditampilkan)
  available: true, // tampilkan label "Terbuka untuk proyek"
};

// ---------- Testimoni ----------
// Isi HANYA dengan testimoni asli dari klien. Kosong = bagian testimoni disembunyikan.
// Contoh:
// { quote: "Kerjanya rapi dan cepat.", name: "Nama Klien", role: "Pemilik, Nama Usaha" },
export const TESTIMONIALS = [];

// ---------- Proyek ----------
// - category: "webapp" | "pwa" | "website" | "ai" | "desktop"
// - image: screenshot di folder images/ (kosong = mockup otomatis)
// - links: hanya URL https:// (live, demo, repo)
export const PROJECTS = [
  {
    title: "Arah Pasar",
    tagline: "Analisa arah pasar & sinyal trading",
    description:
      "Aplikasi analisa pasar yang memberi arah bullish/bearish, saran BUY/SELL, level entry, stop loss, dan 3 target profit. Skor -100 s.d. +100 dihitung dari tren EMA 20/50/200, timeframe lebih besar, struktur swing, MACD, dan RSI. Dilengkapi kalender berita Forex Factory.",
    category: "webapp",
    year: 2026,
    tech: ["Node.js", "Lightweight Charts", "Binance API", "Twelve Data"],
    highlights: ["Kripto, emas, forex & saham", "927 emiten IDX bisa dicari", "Stop loss berbasis ATR"],
    image: "",
    accent: "#6d5dfc",
    icon: "chart",
    device: "laptop",
    links: { repo: "https://github.com/MadeJunindra/arah-pasar" },
  },
  {
    title: "Catatan Keuangan",
    tagline: "PWA keuangan pribadi, jalan offline",
    description:
      "Catat pemasukan, pengeluaran, transfer, dan tabungan di banyak rekening. Ada fitur bagi gaji, jatah aman belanja harian sampai tanggal gajian, serta pencatatan saham & kripto dengan harga beli rata-rata.",
    category: "pwa",
    year: 2026,
    tech: ["JavaScript", "PWA", "Service Worker", "LocalStorage"],
    highlights: ["Bisa dipasang di HP", "100% offline", "Multi-rekening & multi-mata uang"],
    image: "images/keuangan.webp",
    accent: "#0f9f84",
    icon: "wallet",
    device: "phone",
    links: { repo: "https://github.com/MadeJunindra/Keuangan" },
  },
  {
    title: "Catatan Fotokopi",
    tagline: "Pencatat transaksi usaha fotokopi",
    description:
      "PWA untuk mencatat order fotokopi: nama, rangkap, isian, qty, harga per lembar, dan status bayar. Laporan pendapatan bisa diekspor ke PDF/JPG, data disinkron ke Google Sheets, dan aplikasi memperbarui dirinya sendiri lewat GitHub Actions.",
    category: "pwa",
    year: 2026,
    tech: ["JavaScript", "PWA", "jsPDF", "Google Apps Script", "GitHub Actions"],
    highlights: ["Ekspor laporan PDF/JPG", "Sinkron Google Sheets", "Update otomatis"],
    image: "images/fotokopi.webp",
    accent: "#3b5bdb",
    icon: "receipt",
    device: "phone",
    links: { repo: "https://github.com/MadeJunindra/Fotocopy_pwa" },
  },
  {
    title: "AI Asisten SharePoint",
    tagline: "Cari, baca, dan susun SOP dengan AI",
    description:
      "Web app yang terhubung ke SharePoint perusahaan: mencari dokumen, merangkum isinya, dan membantu menyusun draf SOP baru. Login memakai Microsoft Entra ID.",
    category: "ai",
    year: 2026,
    tech: ["AI / LLM", "Microsoft Graph", "Entra ID", "SharePoint"],
    highlights: ["Pencarian dokumen", "Draf SOP otomatis", "Login akun kantor"],
    image: "",
    accent: "#8b5cf6",
    icon: "bot",
    device: "laptop",
    links: {},
  },
  {
    title: "Photobooth by Nolo",
    tagline: "Aplikasi photobooth desktop",
    description:
      "Aplikasi photobooth untuk acara: ambil foto beruntun dari kamera, susun ke template strip, lalu cetak atau bagikan. Dibuat untuk usaha rental Nolo ID.",
    category: "desktop",
    year: 2026,
    tech: ["Desktop App", "Kamera", "Template Cetak"],
    highlights: ["Layout strip foto", "Siap dipakai di acara"],
    image: "",
    accent: "#e8590c",
    icon: "camera",
    device: "laptop",
    links: {},
  },
  {
    title: "Sakbiksi Transport Bali",
    tagline: "Website layanan transportasi di Bali",
    description:
      "Website jasa transportasi & sewa kendaraan di Bali, dibangun dengan Laravel. Menampilkan armada, layanan, dan kontak pemesanan.",
    category: "website",
    year: 2025,
    tech: ["Laravel", "PHP", "Vite", "Blade"],
    highlights: ["Domain sendiri", "Backend Laravel"],
    image: "",
    accent: "#d08a1e",
    icon: "car",
    device: "laptop",
    links: {
      live: "https://www.sakbiksi.com",
      repo: "https://github.com/MadeJunindra/sakbiksit_transport",
    },
  },
  {
    title: "Mooi Nails",
    tagline: "Website salon kuku + price list",
    description:
      "Website untuk salon kuku dengan daftar harga layanan, katalog produk ala marketplace, dan dukungan dua bahasa (Indonesia / English).",
    category: "website",
    year: 2026,
    tech: ["HTML", "CSS", "JavaScript", "i18n ID/EN"],
    highlights: ["Price list layanan", "Katalog produk", "Dwibahasa"],
    image: "",
    accent: "#d6336c",
    icon: "sparkle",
    device: "phone",
    links: {},
  },
  {
    title: "Undangan Digital",
    tagline: "Theme engine undangan pernikahan",
    description:
      "Prototipe undangan digital dengan theme engine: satu isi undangan bisa tampil dalam beberapa arah desain berbeda hanya dengan mengganti tema.",
    category: "website",
    year: 2026,
    tech: ["HTML", "CSS Variables", "JavaScript"],
    highlights: ["Ganti tema instan", "Mobile-first"],
    image: "",
    accent: "#a0703a",
    icon: "mail",
    device: "phone",
    links: {},
  },
  {
    title: "Maha Digital",
    tagline: "Landing page agensi digital",
    description:
      "Landing page untuk agensi digital “Beyond Digital Into Possibilities”, lengkap dengan konsep konten Instagram pertama untuk peluncuran brand.",
    category: "website",
    year: 2026,
    tech: ["HTML", "CSS", "Branding"],
    highlights: ["Landing page", "Konten sosial media"],
    image: "",
    accent: "#5f3dc4",
    icon: "globe",
    device: "laptop",
    links: {},
  },
  {
    title: "Villa Kita",
    tagline: "Website villa & penginapan",
    description: "Website promosi villa dengan galeri, fasilitas, dan ajakan pemesanan langsung.",
    category: "website",
    year: 2026,
    tech: ["HTML", "CSS", "JavaScript"],
    highlights: ["Galeri & fasilitas", "Pemesanan langsung"],
    image: "",
    accent: "#2f9e44",
    icon: "home",
    device: "phone",
    links: {},
  },
];
