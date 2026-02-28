require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");

const db = require("./db");
const { authMiddleware, SECRET } = require("./middleware");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── UPLOADS SETUP ───────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post("/api/auth/setup", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Required fields missing" });
  const existing = db.prepare("SELECT id FROM admin LIMIT 1").get();
  if (existing) return res.status(400).json({ error: "Admin already configured. Use /api/auth/reset." });
  const hash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO admin (id, username, password_hash) VALUES (1, ?, ?)").run(username, hash);
  res.json({ ok: true, message: "Admin account created" });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare("SELECT * FROM admin WHERE username = ?").get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET, { expiresIn: "7d" });
  res.json({ token, username: admin.username });
});

app.post("/api/auth/change-password", authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = db.prepare("SELECT * FROM admin WHERE id = ?").get(req.user.id);
  if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
    return res.status(400).json({ error: "Current password wrong" });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE admin SET password_hash = ? WHERE id = ?").run(hash, req.user.id);
  res.json({ ok: true });
});

app.post("/api/auth/reset", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Required fields missing" });
  const existing = db.prepare("SELECT id FROM admin LIMIT 1").get();
  if (existing) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("UPDATE admin SET username = ?, password_hash = ? WHERE id = 1").run(username, hash);
  } else {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO admin (id, username, password_hash) VALUES (1, ?, ?)").run(username, hash);
  }
  res.json({ ok: true, message: "Admin credentials reset successfully" });
});

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
app.get("/api/profile", (req, res) => {
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  const skills = db.prepare("SELECT * FROM skills ORDER BY sort_order").all();
  const services = db.prepare("SELECT * FROM services ORDER BY sort_order").all();
  const social = db.prepare("SELECT * FROM social_links").all();
  res.json({ profile, skills, services, social });
});

app.get("/api/experiences", (req, res) => {
  const experiences = db.prepare("SELECT * FROM experiences WHERE type = 'experience' ORDER BY sort_order").all();
  const education = db.prepare("SELECT * FROM experiences WHERE type = 'education' ORDER BY sort_order").all();
  res.json({ experiences, education });
});

app.get("/api/portfolio", (req, res) => {
  res.json(db.prepare("SELECT * FROM portfolio ORDER BY sort_order, id DESC").all());
});

app.get("/api/blogs", (req, res) => {
  const { all } = req.query;
  const query = all
    ? "SELECT id, title, slug, excerpt, cover_url, published, created_at FROM blogs ORDER BY created_at DESC"
    : "SELECT id, title, slug, excerpt, cover_url, published, created_at FROM blogs WHERE published = 1 ORDER BY created_at DESC";
  res.json(db.prepare(query).all());
});

app.get("/api/blogs/:slug", (req, res) => {
  const blog = db.prepare("SELECT * FROM blogs WHERE slug = ? AND published = 1").get(req.params.slug);
  if (!blog) return res.status(404).json({ error: "Not found" });
  res.json(blog);
});

// ─── UPLOAD ───────────────────────────────────────────────────────────────────
app.post("/api/upload", authMiddleware, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ─── ADMIN API — PROFILE ──────────────────────────────────────────────────────
app.put("/api/admin/profile", authMiddleware, (req, res) => {
  const { name, tagline, bio, email, phone, location, quote, quote_author, photo_url } = req.body;
  db.prepare(`UPDATE profile SET name=?, tagline=?, bio=?, email=?, phone=?, location=?, quote=?, quote_author=?, photo_url=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`)
    .run(name, tagline, bio, email, phone, location, quote, quote_author, photo_url);
  res.json({ ok: true });
});

// ─── ADMIN API — SKILLS ───────────────────────────────────────────────────────
app.get("/api/admin/skills", authMiddleware, (req, res) => {
  res.json(db.prepare("SELECT * FROM skills ORDER BY sort_order").all());
});
app.post("/api/admin/skills", authMiddleware, (req, res) => {
  const { name, percentage, sort_order } = req.body;
  const r = db.prepare("INSERT INTO skills (name, percentage, sort_order) VALUES (?, ?, ?)").run(name, percentage || 80, sort_order || 0);
  res.json({ id: r.lastInsertRowid });
});
app.put("/api/admin/skills/:id", authMiddleware, (req, res) => {
  const { name, percentage, sort_order } = req.body;
  db.prepare("UPDATE skills SET name=?, percentage=?, sort_order=? WHERE id=?").run(name, percentage, sort_order, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/admin/skills/:id", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM skills WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ─── ADMIN API — SERVICES ─────────────────────────────────────────────────────
app.get("/api/admin/services", authMiddleware, (req, res) => {
  res.json(db.prepare("SELECT * FROM services ORDER BY sort_order").all());
});
app.post("/api/admin/services", authMiddleware, (req, res) => {
  const { icon, title, description, sort_order } = req.body;
  const r = db.prepare("INSERT INTO services (icon, title, description, sort_order) VALUES (?, ?, ?, ?)").run(icon, title, description, sort_order || 0);
  res.json({ id: r.lastInsertRowid });
});
app.put("/api/admin/services/:id", authMiddleware, (req, res) => {
  const { icon, title, description, sort_order } = req.body;
  db.prepare("UPDATE services SET icon=?, title=?, description=?, sort_order=? WHERE id=?").run(icon, title, description, sort_order, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/admin/services/:id", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM services WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ─── ADMIN API — EXPERIENCE / EDUCATION ──────────────────────────────────────
app.get("/api/admin/experiences", authMiddleware, (req, res) => {
  res.json(db.prepare("SELECT * FROM experiences ORDER BY type, sort_order").all());
});
app.post("/api/admin/experiences", authMiddleware, (req, res) => {
  const { year_range, title, company, description, type, sort_order } = req.body;
  const r = db.prepare("INSERT INTO experiences (year_range, title, company, description, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run(year_range, title, company, description, type || "experience", sort_order || 0);
  res.json({ id: r.lastInsertRowid });
});
app.put("/api/admin/experiences/:id", authMiddleware, (req, res) => {
  const { year_range, title, company, description, type, sort_order } = req.body;
  db.prepare("UPDATE experiences SET year_range=?, title=?, company=?, description=?, type=?, sort_order=? WHERE id=?").run(year_range, title, company, description, type, sort_order, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/admin/experiences/:id", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM experiences WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ─── ADMIN API — PORTFOLIO ────────────────────────────────────────────────────
app.get("/api/admin/portfolio", authMiddleware, (req, res) => {
  res.json(db.prepare("SELECT * FROM portfolio ORDER BY sort_order, id DESC").all());
});
app.post("/api/admin/portfolio", authMiddleware, (req, res) => {
  const { title, description, image_url, category, link, sort_order } = req.body;
  const r = db.prepare("INSERT INTO portfolio (title, description, image_url, category, link, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run(title, description, image_url, category, link, sort_order || 0);
  res.json({ id: r.lastInsertRowid });
});
app.put("/api/admin/portfolio/:id", authMiddleware, (req, res) => {
  const { title, description, image_url, category, link, sort_order } = req.body;
  db.prepare("UPDATE portfolio SET title=?, description=?, image_url=?, category=?, link=?, sort_order=? WHERE id=?").run(title, description, image_url, category, link, sort_order, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/admin/portfolio/:id", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM portfolio WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ─── ADMIN API — BLOGS ────────────────────────────────────────────────────────
app.get("/api/admin/blogs", authMiddleware, (req, res) => {
  res.json(db.prepare("SELECT * FROM blogs ORDER BY created_at DESC").all());
});
app.post("/api/admin/blogs", authMiddleware, (req, res) => {
  const { title, slug, excerpt, content, cover_url, published } = req.body;
  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  try {
    const r = db.prepare("INSERT INTO blogs (title, slug, excerpt, content, cover_url, published) VALUES (?, ?, ?, ?, ?, ?)").run(title, finalSlug, excerpt, content, published ? 1 : 0);
    res.json({ id: r.lastInsertRowid, slug: finalSlug });
  } catch (e) {
    res.status(400).json({ error: "Slug already exists" });
  }
});
app.put("/api/admin/blogs/:id", authMiddleware, (req, res) => {
  const { title, slug, excerpt, content, cover_url, published } = req.body;
  db.prepare("UPDATE blogs SET title=?, slug=?, excerpt=?, content=?, cover_url=?, published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").run(title, slug, excerpt, content, cover_url, published ? 1 : 0, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/admin/blogs/:id", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM blogs WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  // Check if admin exists
  const admin = db.prepare("SELECT id FROM admin LIMIT 1").get();
  if (!admin) {
    console.log("⚠️  No admin account yet. POST /api/auth/setup to create one.");
  }
});
