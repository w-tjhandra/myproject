import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.login(form);
      login(res.token, res.username);
      nav("/admin/dashboard");
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: "#fff", padding: 40, borderRadius: 8, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 36, fontWeight: 700 }}>Welly</span>
          <p style={{ fontSize: 14, color: "#888", marginTop: 4 }}>Admin Dashboard</p>
        </div>
        {error && <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Username</label>
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, outline: "none" }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, outline: "none" }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "12px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Loading..." : "Login"}
        </button>
      </div>
    </div>
  );
}
