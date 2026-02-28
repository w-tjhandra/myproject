import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { Modal, Field, inputStyle, btnStyle } from "../components/UI";

// ── Reusable CRUD table ────────────────────────────────────────────────────
function Table({ cols, rows, onEdit, onDelete }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e5e5" }}>
            {cols.map(c => <th key={c.key} style={{ padding: "10px 12px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</th>)}
            <th style={{ padding: "10px 12px", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={cols.length + 1} style={{ padding: "32px", textAlign: "center", color: "#aaa" }}>Belum ada data</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={row.id || i} style={{ borderBottom: "1px solid #f0f0f0" }}>
              {cols.map(c => (
                <td key={c.key} style={{ padding: "12px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key] || <span style={{ color: "#ccc" }}>—</span>}
                </td>
              ))}
              <td style={{ padding: "12px", textAlign: "right", whiteSpace: "nowrap" }}>
                <button onClick={() => onEdit(row)} style={{ ...btnStyle("secondary"), marginRight: 8, fontSize: 12, padding: "6px 14px" }}>Edit</button>
                <button onClick={() => onDelete(row)} style={{ ...btnStyle("danger"), fontSize: 12, padding: "6px 14px" }}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, onAdd, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: 28, marginBottom: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
        {onAdd && <button onClick={onAdd} style={btnStyle("primary")}>+ Tambah</button>}
      </div>
      {children}
    </div>
  );
}

// ── Image upload helper inside modal ──────────────────────────────────────
function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.upload(file);
      onChange(res.url);
    } catch (err) { alert("Upload gagal: " + err.message); }
    finally { setUploading(false); }
  };
  return (
    <div>
      <input style={{ ...inputStyle, marginBottom: 8 }} value={value || ""} onChange={e => onChange(e.target.value)} placeholder="URL gambar atau upload di bawah" />
      <label style={{ display: "inline-block", cursor: "pointer", fontSize: 13, color: "#555", padding: "8px 14px", border: "1px dashed #ccc", borderRadius: 4 }}>
        {uploading ? "Uploading..." : "📁 Upload gambar"}<input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      </label>
      {value && <img src={value} alt="preview" style={{ marginTop: 10, maxHeight: 100, maxWidth: "100%", borderRadius: 4, objectFit: "cover" }} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState("");

  // Data states
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [services, setServices] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [blogs, setBlogs] = useState([]);

  // Modal states
  const [modal, setModal] = useState(null); // { type, data }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const closeModal = () => setModal(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [p, sk, sv, ex, po, bl] = await Promise.all([
      api.getProfile().catch(() => null),
      api.getSkills().catch(() => []),
      api.getServices().catch(() => []),
      api.getExperiencesAdmin().catch(() => []),
      api.getPortfolioAdmin().catch(() => []),
      api.getBlogsAdmin().catch(() => []),
    ]);
    if (p) { setProfile(p.profile); setSkills(p.skills); setServices(p.services); }
    if (sk.length) setSkills(sk);
    if (sv.length) setServices(sv);
    setExperiences(ex);
    setPortfolio(po);
    setBlogs(bl);
  };

  const TABS = [
    { id: "profile", label: "👤 Profil" },
    { id: "skills", label: "⚡ Skills" },
    { id: "services", label: "🛠 Services" },
    { id: "experiences", label: "💼 Resume" },
    { id: "portfolio", label: "🖼 Portfolio" },
    { id: "blogs", label: "✍ Blog" },
  ];

  // ── Profile form ──────────────────────────────────────────────────────────
  const ProfileForm = () => {
    const [form, setForm] = useState(profile || {});
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const save = async () => {
      setSaving(true);
      try { await api.updateProfile(form); showToast("Profil tersimpan!"); } catch (e) { alert(e.message); }
      setSaving(false);
    };
    return (
      <Section title="Info Profil">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[["name","Nama"], ["tagline","Tagline (pisah dengan /)"], ["email","Email"], ["phone","Telepon"], ["location","Lokasi"]].map(([k, label]) => (
            <Field key={k} label={label}><input style={inputStyle} value={form[k] || ""} onChange={e => set(k, e.target.value)} /></Field>
          ))}
        </div>
        <Field label="Bio"><textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.bio || ""} onChange={e => set("bio", e.target.value)} /></Field>
        <Field label="Quote"><textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.quote || ""} onChange={e => set("quote", e.target.value)} /></Field>
        <Field label="Nama di Quote"><input style={inputStyle} value={form.quote_author || ""} onChange={e => set("quote_author", e.target.value)} /></Field>
        <Field label="Foto Profil"><ImageUploader value={form.photo_url} onChange={v => set("photo_url", v)} /></Field>
        <div style={{ marginTop: 20 }}>
          <button onClick={save} disabled={saving} style={btnStyle("primary")}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</button>
        </div>
      </Section>
    );
  };

  // ── Generic list section with add/edit modal ──────────────────────────────
  const renderSkills = () => (
    <Section title="Skills" onAdd={() => setModal({ type: "skill", data: {} })}>
      <Table
        cols={[{ key: "name", label: "Nama" }, { key: "percentage", label: "%" }]}
        rows={skills}
        onEdit={row => setModal({ type: "skill", data: row })}
        onDelete={async row => { if (confirm(`Hapus "${row.name}"?`)) { await api.deleteSkill(row.id); setSkills(s => s.filter(x => x.id !== row.id)); showToast("Dihapus!"); } }}
      />
    </Section>
  );

  const renderServices = () => (
    <Section title="What I Do" onAdd={() => setModal({ type: "service", data: {} })}>
      <Table
        cols={[{ key: "icon", label: "Icon" }, { key: "title", label: "Judul" }, { key: "description", label: "Deskripsi" }]}
        rows={services}
        onEdit={row => setModal({ type: "service", data: row })}
        onDelete={async row => { if (confirm(`Hapus "${row.title}"?`)) { await api.deleteService(row.id); setServices(s => s.filter(x => x.id !== row.id)); showToast("Dihapus!"); } }}
      />
    </Section>
  );

  const renderExperiences = () => (
    <>
      <Section title="Experiences" onAdd={() => setModal({ type: "experience", data: { type: "experience" } })}>
        <Table
          cols={[{ key: "year_range", label: "Tahun" }, { key: "title", label: "Posisi" }, { key: "company", label: "Perusahaan" }]}
          rows={experiences.filter(e => e.type === "experience")}
          onEdit={row => setModal({ type: "experience", data: row })}
          onDelete={async row => { if (confirm(`Hapus?`)) { await api.deleteExperience(row.id); setExperiences(s => s.filter(x => x.id !== row.id)); showToast("Dihapus!"); } }}
        />
      </Section>
      <Section title="Education" onAdd={() => setModal({ type: "experience", data: { type: "education" } })}>
        <Table
          cols={[{ key: "year_range", label: "Tahun" }, { key: "title", label: "Jurusan" }, { key: "company", label: "Institusi" }]}
          rows={experiences.filter(e => e.type === "education")}
          onEdit={row => setModal({ type: "experience", data: row })}
          onDelete={async row => { if (confirm(`Hapus?`)) { await api.deleteExperience(row.id); setExperiences(s => s.filter(x => x.id !== row.id)); showToast("Dihapus!"); } }}
        />
      </Section>
    </>
  );

  const renderPortfolio = () => (
    <Section title="Portfolio" onAdd={() => setModal({ type: "portfolio", data: {} })}>
      <Table
        cols={[
          { key: "image_url", label: "Gambar", render: v => v ? <img src={v} style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 3 }} /> : "—" },
          { key: "title", label: "Judul" }, { key: "category", label: "Kategori" },
        ]}
        rows={portfolio}
        onEdit={row => setModal({ type: "portfolio", data: row })}
        onDelete={async row => { if (confirm(`Hapus "${row.title}"?`)) { await api.deletePortfolio(row.id); setPortfolio(s => s.filter(x => x.id !== row.id)); showToast("Dihapus!"); } }}
      />
    </Section>
  );

  const renderBlogs = () => (
    <Section title="Blog Posts" onAdd={() => setModal({ type: "blog", data: { published: true } })}>
      <Table
        cols={[
          { key: "cover_url", label: "Cover", render: v => v ? <img src={v} style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 3 }} /> : "—" },
          { key: "title", label: "Judul" },
          { key: "published", label: "Status", render: v => <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: v ? "#d1fae5" : "#fee2e2", color: v ? "#065f46" : "#991b1b" }}>{v ? "Published" : "Draft"}</span> },
          { key: "created_at", label: "Tanggal", render: v => v ? new Date(v).toLocaleDateString("id-ID") : "" },
        ]}
        rows={blogs}
        onEdit={row => setModal({ type: "blog", data: row })}
        onDelete={async row => { if (confirm(`Hapus "${row.title}"?`)) { await api.deleteBlog(row.id); setBlogs(s => s.filter(x => x.id !== row.id)); showToast("Dihapus!"); } }}
      />
    </Section>
  );

  // ── Modals ────────────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!modal) return null;
    const { type, data } = modal;

    // SKILL modal
    if (type === "skill") {
      return <GenericModal title={data.id ? "Edit Skill" : "Tambah Skill"} data={data}
        fields={[["name","Nama Skill","text"], ["percentage","Persentase (0-100)","number"], ["sort_order","Urutan","number"]]}
        onSave={async (form) => {
          if (form.id) await api.updateSkill(form.id, form); else await api.createSkill(form);
          const fresh = await api.getSkills(); setSkills(fresh); showToast("Tersimpan!"); closeModal();
        }} />;
    }
    if (type === "service") {
      return <GenericModal title={data.id ? "Edit Service" : "Tambah Service"} data={data}
        fields={[["icon","Icon (emoji)","text"], ["title","Judul","text"], ["description","Deskripsi","textarea"], ["sort_order","Urutan","number"]]}
        onSave={async (form) => {
          if (form.id) await api.updateService(form.id, form); else await api.createService(form);
          const fresh = await api.getServices(); setServices(fresh); showToast("Tersimpan!"); closeModal();
        }} />;
    }
    if (type === "experience") {
      return <GenericModal title={data.id ? "Edit Entry" : "Tambah Entry"} data={data}
        fields={[["year_range","Rentang Tahun","text"], ["title","Judul / Posisi","text"], ["company","Perusahaan / Institusi","text"], ["description","Deskripsi","textarea"],
          ["type","Tipe","select:experience:education"], ["sort_order","Urutan","number"]]}
        onSave={async (form) => {
          if (form.id) await api.updateExperience(form.id, form); else await api.createExperience(form);
          const fresh = await api.getExperiencesAdmin(); setExperiences(fresh); showToast("Tersimpan!"); closeModal();
        }} />;
    }
    if (type === "portfolio") {
      return <PortfolioModal data={data} onSave={async (form) => {
        if (form.id) await api.updatePortfolio(form.id, form); else await api.createPortfolio(form);
        const fresh = await api.getPortfolioAdmin(); setPortfolio(fresh); showToast("Tersimpan!"); closeModal();
      }} />;
    }
    if (type === "blog") {
      return <BlogModal data={data} onSave={async (form) => {
        if (form.id) await api.updateBlog(form.id, form); else await api.createBlog(form);
        const fresh = await api.getBlogsAdmin(); setBlogs(fresh); showToast("Tersimpan!"); closeModal();
      }} />;
    }
  };

  return (
    <div style={{ fontFamily: "'Nature', serif", background: "#f5f5f5", minHeight: "100vh" }}>
      <style>{`button{font-family:'Gibed', serif}`}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: "#1a1a1a", color: "#fff", padding: "12px 20px", borderRadius: 6, zIndex: 9999, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          ✓ {toast}
        </div>
      )}

      {/* Sidebar */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, background: "#1a1a1a", color: "#fff", display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "28px 24px 20px" }}>
          <span style={{ fontFamily: "'Nature', serif", fontSize: 28, fontWeight: 700 }}>Welly</span>
          <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ width: "100%", textAlign: "left", padding: "10px 14px", marginBottom: 2, background: activeTab === tab.id ? "#333" : "transparent", color: activeTab === tab.id ? "#fff" : "#aaa", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
              {tab.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #333" }}>
          <Link to="/" target="_blank" style={{ color: "#888", textDecoration: "none", fontSize: 13, display: "block", marginBottom: 10 }}>🔗 Lihat Website</Link>
          <button onClick={() => { logout(); nav("/admin"); }} style={{ width: "100%", background: "none", border: "1px solid #444", color: "#888", padding: "8px", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, padding: "32px 40px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>{TABS.find(t => t.id === activeTab)?.label}</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Halo, {user?.username}!</p>
        </div>

        {activeTab === "profile" && <ProfileForm key={JSON.stringify(profile)} />}
        {activeTab === "skills" && renderSkills()}
        {activeTab === "services" && renderServices()}
        {activeTab === "experiences" && renderExperiences()}
        {activeTab === "portfolio" && renderPortfolio()}
        {activeTab === "blogs" && renderBlogs()}
      </div>

      {renderModal()}
    </div>
  );
}

// ── Generic simple field modal ────────────────────────────────────────────
function GenericModal({ title, data, fields, onSave }) {
  const [form, setForm] = useState(data);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const save = async () => { setSaving(true); try { await onSave(form); } catch (e) { alert(e.message); setSaving(false); } };

  return (
    <Modal title={title} onClose={() => {}}>
      {fields.map(([key, label, type]) => (
        <Field key={key} label={label}>
          {type === "textarea"
            ? <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form[key] || ""} onChange={e => set(key, e.target.value)} />
            : type?.startsWith("select:")
              ? <select style={inputStyle} value={form[key] || ""} onChange={e => set(key, e.target.value)}>
                  {type.split(":").slice(1).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              : <input type={type} style={inputStyle} value={form[key] || ""} onChange={e => set(key, e.target.value)} />
          }
        </Field>
      ))}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button style={btnStyle("secondary")} onClick={() => history.back()}>Batal</button>
        <button style={btnStyle("primary")} onClick={save} disabled={saving}>{saving ? "..." : "Simpan"}</button>
      </div>
    </Modal>
  );
}

// ── Portfolio modal ───────────────────────────────────────────────────────
function PortfolioModal({ data, onSave }) {
  const [form, setForm] = useState(data);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const save = async () => { setSaving(true); try { await onSave(form); } catch (e) { alert(e.message); setSaving(false); } };

  return (
    <Modal title={data.id ? "Edit Portfolio" : "Tambah Portfolio"} onClose={() => {}}>
      <Field label="Judul"><input style={inputStyle} value={form.title || ""} onChange={e => set("title", e.target.value)} /></Field>
      <Field label="Deskripsi"><textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.description || ""} onChange={e => set("description", e.target.value)} /></Field>
      <Field label="Kategori"><input style={inputStyle} value={form.category || ""} onChange={e => set("category", e.target.value)} placeholder="Networking, Education, dll" /></Field>
      <Field label="Link (opsional)"><input style={inputStyle} value={form.link || ""} onChange={e => set("link", e.target.value)} /></Field>
      <Field label="Gambar"><ImageUploader value={form.image_url} onChange={v => set("image_url", v)} /></Field>
      <Field label="Urutan"><input type="number" style={inputStyle} value={form.sort_order || 0} onChange={e => set("sort_order", parseInt(e.target.value))} /></Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button style={btnStyle("secondary")} onClick={() => history.back()}>Batal</button>
        <button style={btnStyle("primary")} onClick={save} disabled={saving}>{saving ? "..." : "Simpan"}</button>
      </div>
    </Modal>
  );
}


// ── Blog modal with markdown editor ──────────────────────────────────────
function BlogModal({ data, onSave }) {
  const [form, setForm] = useState({ published: true, ...data });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const save = async () => { setSaving(true); try { await onSave(form); } catch (e) { alert(e.message); setSaving(false); } };

  return (
    <Modal title={data.id ? "Edit Blog Post" : "Tulis Blog Post"} onClose={() => {}}>
      <Field label="Judul"><input style={inputStyle} value={form.title || ""} onChange={e => set("title", e.target.value)} /></Field>
      <Field label="Slug URL (otomatis dari judul jika kosong)"><input style={inputStyle} value={form.slug || ""} onChange={e => set("slug", e.target.value)} placeholder="contoh: cara-konfigurasi-mikrotik" /></Field>
      <Field label="Excerpt (preview singkat)"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.excerpt || ""} onChange={e => set("excerpt", e.target.value)} /></Field>
      <Field label="Cover Image"><ImageUploader value={form.cover_url} onChange={v => set("cover_url", v)} /></Field>
      <Field label={<span>Konten <span style={{ fontSize: 12, color: "#888" }}>(Markdown didukung)</span> <button onClick={() => setPreview(p => !p)} style={{ ...btnStyle("secondary"), fontSize: 11, padding: "3px 10px", marginLeft: 8 }}>{preview ? "Edit" : "Preview"}</button></span>}>
        {preview
          ? <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 4, minHeight: 200, fontSize: 14, lineHeight: 1.7, color: "#333" }}>
              {form.content?.split("\n").map((l, i) => <p key={i} style={{ marginBottom: 8 }}>{l || <br />}</p>)}
            </div>
          : <textarea style={{ ...inputStyle, minHeight: 200, resize: "vertical", fontFamily: "monospace", fontSize: 13 }} value={form.content || ""} onChange={e => set("content", e.target.value)} placeholder="# Judul&#10;&#10;Tulis konten di sini dengan Markdown..." />
        }
      </Field>
      <Field label="Status">
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={!!form.published} onChange={e => set("published", e.target.checked)} style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: 14 }}>Published (tampil di website)</span>
        </label>
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button style={btnStyle("secondary")} onClick={() => history.back()}>Batal</button>
        <button style={btnStyle("primary")} onClick={save} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
      </div>
    </Modal>
  );
}

/* Attach Modal to window scope for GenericModal use */
