require("dotenv").config();
const { Pool } = require("pg");

const db = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "postgres",
});

async function initDB() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS profile (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT,
      bio TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      quote TEXT,
      quote_author TEXT,
      photo_url TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      percentage INTEGER NOT NULL DEFAULT 80,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      icon TEXT,
      title TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS experiences (
      id SERIAL PRIMARY KEY,
      year_range TEXT,
      title TEXT NOT NULL,
      company TEXT,
      description TEXT,
      type TEXT DEFAULT 'experience',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS portfolio (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      category TEXT,
      link TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT,
      cover_url TEXT,
      published INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id SERIAL PRIMARY KEY,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS admin (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);

  // Seed default data if empty
  const profileRes = await db.query("SELECT COUNT(*) as c FROM profile");
  const profileCount = parseInt(profileRes.rows[0].c, 10);
  
  if (profileCount === 0) {
    await db.query(`INSERT INTO profile (id, name, tagline, bio, email, phone, location, quote, quote_author)
      VALUES (1, 'Welly Chandra', 'Network Engineer / ICT Trainer',
      'ICT Trainer dengan pengalaman 4 tahun di bidang pengajaran Teknologi Informasi. Telah mengajar lebih dari 100 kelas MikroTik, Fiber Optik, dan Networking Fundamental.',
      'toochwanzz@gmail.com', '+62 858 5570 7450', 'Tuban, Indonesia',
      'Do more than is required. What is the distance between someone who achieves their goals consistently and those who spend their lives merely following? The extra mile.',
      'Welly Chandra')`);

    for (const s of [["MikroTik", 92, 1], ["Networking", 88, 2], ["Fiber Optik", 82, 3], ["Linux / CLI", 75, 4]]) {
      await db.query("INSERT INTO skills (name, percentage, sort_order) VALUES ($1, $2, $3)", s);
    }

    for (const s of [
      ["📡", "Network Engineering", "Pengelolaan dan konfigurasi jaringan LAN/WAN/WiFi, router, switch, dan firewall.", 1],
      ["🎓", "ICT Training", "Pelatihan MikroTik, Fiber Optik, dan Networking Fundamental untuk lebih dari 100 kelas.", 2],
      ["🤝", "Education Management", "Supervisi divisi edukasi dan koordinasi kerja sama pelatihan.", 3],
    ]) {
      await db.query("INSERT INTO services (icon, title, description, sort_order) VALUES ($1, $2, $3, $4)", s);
    }

    for (const e of [
      ["Jan 2025 – Present", "Education Division Supervisor", "PT Axelerasi Bhinneka Teknologi", "Mengelola operasional divisi Edukasi, kerja sama dengan perusahaan/sekolah.", "experience", 1],
      ["Jun 2022 – Present", "Network Engineer", "PT Axelerasi Bhinneka Teknologi", "Mengelola LAN/WAN/WiFi, konfigurasi router & switch, troubleshooting jaringan.", "experience", 2],
      ["Jun 2022 – Present", "ICT Trainer", "PT Axelerasi Bhinneka Teknologi", "Menyampaikan pelatihan ICT, menyiapkan modul, evaluasi peserta.", "experience", 3],
      ["Jan 2025 – Present", "Ilmu Komunikasi", "Universitas Terbuka", "Menempuh pendidikan tinggi jurusan Ilmu Komunikasi secara jarak jauh.", "education", 1],
      ["Jul 2020 – Apr 2023", "Teknik Komputer dan Jaringan", "SMK Negeri 1 Tambakboyo", "Dasar-dasar jaringan komputer, konfigurasi perangkat keras.", "education", 2],
    ]) {
      await db.query("INSERT INTO experiences (year_range, title, company, description, type, sort_order) VALUES ($1, $2, $3, $4, $5, $6)", e);
    }

    for (const b of [
      ["Cara Konfigurasi MikroTik dari Nol", "cara-konfigurasi-mikrotik", "Panduan lengkap konfigurasi MikroTik untuk pemula...", "# Cara Konfigurasi MikroTik\n\nIsi artikel di sini...", 1],
      ["Fiber Optik vs Kabel LAN Biasa", "fiber-optik-vs-kabel-lan", "Perbandingan mendalam antara fiber optik dan kabel tembaga...", "# Fiber Optik vs Kabel LAN\n\nIsi artikel di sini...", 1],
    ]) {
      await db.query("INSERT INTO blogs (title, slug, excerpt, content, published) VALUES ($1, $2, $3, $4, $5)", b);
    }

    for (const p of [
      ["MikroTik Lab Setup", "Konfigurasi lab jaringan lengkap dengan MikroTik", "Networking", 1],
      ["Fiber Optic Installation", "Instalasi jaringan fiber optik enterprise", "Infrastructure", 2],
      ["Training Program Design", "Desain kurikulum pelatihan ICT 40 jam", "Education", 3],
    ]) {
      await db.query("INSERT INTO portfolio (title, description, category, sort_order) VALUES ($1, $2, $3, $4)", p);
    }
  }
}

initDB().catch(console.error);

module.exports = db;
