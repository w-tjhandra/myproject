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
app.post("/api/auth/setup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Required fields missing" });
    const existing = (await db.query("SELECT id FROM admin LIMIT 1")).rows[0];
    if (existing) return res.status(400).json({ error: "Admin already configured. Use /api/auth/reset." });
    const hash = bcrypt.hashSync(password, 10);
    await db.query("INSERT INTO admin (username, password_hash) VALUES ($1, $2)", [username, hash]);
    res.json({ ok: true, message: "Admin account created" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = (await db.query("SELECT * FROM admin WHERE username = $1", [username])).rows[0];
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET, { expiresIn: "7d" });
    res.json({ token, username: admin.username });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = (await db.query("SELECT * FROM admin WHERE id = $1", [req.user.id])).rows[0];
    if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
      return res.status(400).json({ error: "Current password wrong" });
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    await db.query("UPDATE admin SET password_hash = $1 WHERE id = $2", [hash, req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/reset", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Required fields missing" });
    const existing = (await db.query("SELECT id FROM admin LIMIT 1")).rows[0];
    const hash = bcrypt.hashSync(password, 10);
    if (existing) {
      await db.query("UPDATE admin SET username = $1, password_hash = $2 WHERE id = $3", [username, hash, existing.id]);
    } else {
      await db.query("INSERT INTO admin (username, password_hash) VALUES ($1, $2)", [username, hash]);
    }
    res.json({ ok: true, message: "Admin credentials reset successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
app.get("/api/profile", async (req, res) => {
  try {
    const profile = (await db.query("SELECT * FROM profile WHERE id = 1")).rows[0];
    const skills = (await db.query("SELECT * FROM skills ORDER BY sort_order")).rows;
    const services = (await db.query("SELECT * FROM services ORDER BY sort_order")).rows;
    const social = (await db.query("SELECT * FROM social_links")).rows;
    res.json({ profile, skills, services, social });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/experiences", async (req, res) => {
  try {
    const experiences = (await db.query("SELECT * FROM experiences WHERE type = 'experience' ORDER BY sort_order")).rows;
    const education = (await db.query("SELECT * FROM experiences WHERE type = 'education' ORDER BY sort_order")).rows;
    res.json({ experiences, education });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/portfolio", async (req, res) => {
  try {
    res.json((await db.query("SELECT * FROM portfolio ORDER BY sort_order, id DESC")).rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/blogs", async (req, res) => {
  try {
    const { all } = req.query;
    const query = all
      ? "SELECT id, title, slug, excerpt, cover_url, published, created_at FROM blogs ORDER BY created_at DESC"
      : "SELECT id, title, slug, excerpt, cover_url, published, created_at FROM blogs WHERE published = 1 ORDER BY created_at DESC";
    res.json((await db.query(query)).rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/blogs/:slug", async (req, res) => {
  try {
    const blog = (await db.query("SELECT * FROM blogs WHERE slug = $1 AND published = 1", [req.params.slug])).rows[0];
    if (!blog) return res.status(404).json({ error: "Not found" });
    res.json(blog);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── UPLOAD ───────────────────────────────────────────────────────────────────
app.post("/api/upload", authMiddleware, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ─── ADMIN API — PROFILE ──────────────────────────────────────────────────────
app.put("/api/admin/profile", authMiddleware, async (req, res) => {
  try {
    const { name, tagline, bio, email, phone, location, quote, quote_author, photo_url } = req.body;
    await db.query(`UPDATE profile SET name=$1, tagline=$2, bio=$3, email=$4, phone=$5, location=$6, quote=$7, quote_author=$8, photo_url=$9, updated_at=CURRENT_TIMESTAMP WHERE id=1`,
      [name, tagline, bio, email, phone, location, quote, quote_author, photo_url]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ADMIN API — SKILLS ───────────────────────────────────────────────────────
app.get("/api/admin/skills", authMiddleware, async (req, res) => {
  try {
    res.json((await db.query("SELECT * FROM skills ORDER BY sort_order")).rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/admin/skills", authMiddleware, async (req, res) => {
  try {
    const { name, percentage, sort_order } = req.body;
    const r = await db.query("INSERT INTO skills (name, percentage, sort_order) VALUES ($1, $2, $3) RETURNING id", [name, percentage || 80, sort_order || 0]);
    res.json({ id: r.rows[0].id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put("/api/admin/skills/:id", authMiddleware, async (req, res) => {
  try {
    const { name, percentage, sort_order } = req.body;
    await db.query("UPDATE skills SET name=$1, percentage=$2, sort_order=$3 WHERE id=$4", [name, percentage, sort_order, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete("/api/admin/skills/:id", authMiddleware, async (req, res) => {
  try {
    await db.query("DELETE FROM skills WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ADMIN API — SERVICES ─────────────────────────────────────────────────────
app.get("/api/admin/services", authMiddleware, async (req, res) => {
  try {
    res.json((await db.query("SELECT * FROM services ORDER BY sort_order")).rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/admin/services", authMiddleware, async (req, res) => {
  try {
    const { icon, title, description, sort_order } = req.body;
    const r = await db.query("INSERT INTO services (icon, title, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING id", [icon, title, description, sort_order || 0]);
    res.json({ id: r.rows[0].id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put("/api/admin/services/:id", authMiddleware, async (req, res) => {
  try {
    const { icon, title, description, sort_order } = req.body;
    await db.query("UPDATE services SET icon=$1, title=$2, description=$3, sort_order=$4 WHERE id=$5", [icon, title, description, sort_order, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete("/api/admin/services/:id", authMiddleware, async (req, res) => {
  try {
    await db.query("DELETE FROM services WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ADMIN API — EXPERIENCE / EDUCATION ──────────────────────────────────────
app.get("/api/admin/experiences", authMiddleware, async (req, res) => {
  try {
    res.json((await db.query("SELECT * FROM experiences ORDER BY type, sort_order")).rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/admin/experiences", authMiddleware, async (req, res) => {
  try {
    const { year_range, title, company, description, type, sort_order } = req.body;
    const r = await db.query("INSERT INTO experiences (year_range, title, company, description, type, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [year_range, title, company, description, type || "experience", sort_order || 0]);
    res.json({ id: r.rows[0].id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put("/api/admin/experiences/:id", authMiddleware, async (req, res) => {
  try {
    const { year_range, title, company, description, type, sort_order } = req.body;
    await db.query("UPDATE experiences SET year_range=$1, title=$2, company=$3, description=$4, type=$5, sort_order=$6 WHERE id=$7", [year_range, title, company, description, type, sort_order, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete("/api/admin/experiences/:id", authMiddleware, async (req, res) => {
  try {
    await db.query("DELETE FROM experiences WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ADMIN API — PORTFOLIO ────────────────────────────────────────────────────
app.get("/api/admin/portfolio", authMiddleware, async (req, res) => {
  try {
    res.json((await db.query("SELECT * FROM portfolio ORDER BY sort_order, id DESC")).rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/admin/portfolio", authMiddleware, async (req, res) => {
  try {
    const { title, description, image_url, category, link, sort_order } = req.body;
    const r = await db.query("INSERT INTO portfolio (title, description, image_url, category, link, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [title, description, image_url, category, link, sort_order || 0]);
    res.json({ id: r.rows[0].id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put("/api/admin/portfolio/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, image_url, category, link, sort_order } = req.body;
    await db.query("UPDATE portfolio SET title=$1, description=$2, image_url=$3, category=$4, link=$5, sort_order=$6 WHERE id=$7", [title, description, image_url, category, link, sort_order, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete("/api/admin/portfolio/:id", authMiddleware, async (req, res) => {
  try {
    await db.query("DELETE FROM portfolio WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ADMIN API — BLOGS ────────────────────────────────────────────────────────
app.get("/api/admin/blogs", authMiddleware, async (req, res) => {
  try {
    res.json((await db.query("SELECT * FROM blogs ORDER BY created_at DESC")).rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/admin/blogs", authMiddleware, async (req, res) => {
  try {
    const { title, slug, excerpt, content, cover_url, published } = req.body;
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    try {
      const r = await db.query("INSERT INTO blogs (title, slug, excerpt, content, cover_url, published) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [title, finalSlug, excerpt, content, cover_url, published ? 1 : 0]);
      res.json({ id: r.rows[0].id, slug: finalSlug });
    } catch (e) {
      res.status(400).json({ error: "Slug already exists" });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put("/api/admin/blogs/:id", authMiddleware, async (req, res) => {
  try {
    const { title, slug, excerpt, content, cover_url, published } = req.body;
    await db.query("UPDATE blogs SET title=$1, slug=$2, excerpt=$3, content=$4, cover_url=$5, published=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7", [title, slug, excerpt, content, cover_url, published ? 1 : 0, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete("/api/admin/blogs/:id", authMiddleware, async (req, res) => {
  try {
    await db.query("DELETE FROM blogs WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  // Check if admin exists
  try {
    const admin = (await db.query("SELECT id FROM admin LIMIT 1")).rows[0];
    if (!admin) {
      console.log("⚠️  No admin account yet. POST /api/auth/setup to create one.");
    }
  } catch (e) {
    console.error("Database connection failed:", e.message);
  }
});
