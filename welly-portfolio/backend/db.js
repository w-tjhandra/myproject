const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "data.db"));

db.exec(`
  PRAGMA journal_mode=WAL;

  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    bio TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    quote TEXT,
    quote_author TEXT,
    photo_url TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    percentage INTEGER NOT NULL DEFAULT 80,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_range TEXT,
    title TEXT NOT NULL,
    company TEXT,
    description TEXT,
    type TEXT DEFAULT 'experience',
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    link TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    cover_url TEXT,
    published INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

// Seed default data if empty
const profileCount = db.prepare("SELECT COUNT(*) as c FROM profile").get().c;
if (profileCount === 0) {
  db.prepare(`INSERT INTO profile (id, name, tagline, bio, email, phone, location, quote, quote_author)
    VALUES (1, 'Welly Chandra', 'Network Engineer / ICT Trainer',
    'ICT Trainer dengan pengalaman 4 tahun di bidang pengajaran Teknologi Informasi. Telah mengajar lebih dari 100 kelas MikroTik, Fiber Optik, dan Networking Fundamental.',
    'toochwanzz@gmail.com', '+62 858 5570 7450', 'Tuban, Indonesia',
    'Do more than is required. What is the distance between someone who achieves their goals consistently and those who spend their lives merely following? The extra mile.',
    'Welly Chandra')`).run();

  const insertSkill = db.prepare("INSERT INTO skills (name, percentage, sort_order) VALUES (?, ?, ?)");
  [["MikroTik", 92, 1], ["Networking", 88, 2], ["Fiber Optik", 82, 3], ["Linux / CLI", 75, 4]].forEach(s => insertSkill.run(...s));

  const insertService = db.prepare("INSERT INTO services (icon, title, description, sort_order) VALUES (?, ?, ?, ?)");
  [
    ["📡", "Network Engineering", "Pengelolaan dan konfigurasi jaringan LAN/WAN/WiFi, router, switch, dan firewall.", 1],
    ["🎓", "ICT Training", "Pelatihan MikroTik, Fiber Optik, dan Networking Fundamental untuk lebih dari 100 kelas.", 2],
    ["🤝", "Education Management", "Supervisi divisi edukasi dan koordinasi kerja sama pelatihan.", 3],
  ].forEach(s => insertService.run(...s));

  const insertExp = db.prepare("INSERT INTO experiences (year_range, title, company, description, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
  [
    ["Jan 2025 – Present", "Education Division Supervisor", "PT Axelerasi Bhinneka Teknologi", "Mengelola operasional divisi Edukasi, kerja sama dengan perusahaan/sekolah.", "experience", 1],
    ["Jun 2022 – Present", "Network Engineer", "PT Axelerasi Bhinneka Teknologi", "Mengelola LAN/WAN/WiFi, konfigurasi router & switch, troubleshooting jaringan.", "experience", 2],
    ["Jun 2022 – Present", "ICT Trainer", "PT Axelerasi Bhinneka Teknologi", "Menyampaikan pelatihan ICT, menyiapkan modul, evaluasi peserta.", "experience", 3],
    ["Jan 2025 – Present", "Ilmu Komunikasi", "Universitas Terbuka", "Menempuh pendidikan tinggi jurusan Ilmu Komunikasi secara jarak jauh.", "education", 1],
    ["Jul 2020 – Apr 2023", "Teknik Komputer dan Jaringan", "SMK Negeri 1 Tambakboyo", "Dasar-dasar jaringan komputer, konfigurasi perangkat keras.", "education", 2],
  ].forEach(e => insertExp.run(...e));

  const insertBlog = db.prepare("INSERT INTO blogs (title, slug, excerpt, content, published) VALUES (?, ?, ?, ?, ?)");
  [
    ["Cara Konfigurasi MikroTik dari Nol", "cara-konfigurasi-mikrotik", "Panduan lengkap konfigurasi MikroTik untuk pemula...", "# Cara Konfigurasi MikroTik\n\nIsi artikel di sini...", 1],
    ["Fiber Optik vs Kabel LAN Biasa", "fiber-optik-vs-kabel-lan", "Perbandingan mendalam antara fiber optik dan kabel tembaga...", "# Fiber Optik vs Kabel LAN\n\nIsi artikel di sini...", 1],
  ].forEach(b => insertBlog.run(...b));

  const insertPortfolio = db.prepare("INSERT INTO portfolio (title, description, category, sort_order) VALUES (?, ?, ?, ?)");
  [
    ["MikroTik Lab Setup", "Konfigurasi lab jaringan lengkap dengan MikroTik", "Networking", 1],
    ["Fiber Optic Installation", "Instalasi jaringan fiber optik enterprise", "Infrastructure", 2],
    ["Training Program Design", "Desain kurikulum pelatihan ICT 40 jam", "Education", 3],
  ].forEach(p => insertPortfolio.run(...p));
}

module.exports = db;
