import { useRef, useState, useEffect } from "react";

// ── Fade-in on scroll ──────────────────────────────────────────────────────
export function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────
export function SectionHeader({ title }) {
  return (
    <Reveal>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 40, fontWeight: 700, color: "#1a1a1a" }}>{title}</h2>
        <div style={{ width: 40, height: 3, background: "#1a1a1a", margin: "12px auto 0" }} />
      </div>
    </Reveal>
  );
}

// ── Animated skill circle ──────────────────────────────────────────────────
export function CircleSkill({ name, pct, animate }) {
  const r = 80, stroke = 8, circ = 2 * Math.PI * r;
  const dash = animate ? (pct / 100) * circ : 0;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="190" height="190">
        <circle cx="95" cy="95" r={r} fill="none" stroke="#d0d0d0" strokeWidth={stroke} />
        <circle cx="95" cy="95" r={r} fill="none" stroke="#1a1a1a" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ - dash}
          strokeLinecap="round" transform="rotate(-90 95 95)"
          style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        <text x="95" y="100" textAnchor="middle" fontSize="18" fontFamily="'DM Sans', sans-serif" fill="#333">{pct}%</text>
      </svg>
      <p style={{ fontWeight: 700, fontSize: 18, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{name}</p>
    </div>
  );
}

// ── Typing animation ───────────────────────────────────────────────────────
export function TypingTitle({ titles }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause) { const t = setTimeout(() => { setDeleting(true); setPause(false); }, 2000); return () => clearTimeout(t); }
    const cur = titles[idx];
    if (!deleting) {
      if (text.length < cur.length) { const t = setTimeout(() => setText(cur.slice(0, text.length + 1)), 80); return () => clearTimeout(t); }
      else setPause(true);
    } else {
      if (text.length > 0) { const t = setTimeout(() => setText(text.slice(0, -1)), 45); return () => clearTimeout(t); }
      else { setDeleting(false); setIdx((i) => (i + 1) % titles.length); }
    }
  }, [text, deleting, pause, idx, titles]);

  return <span>{text}<span style={{ borderRight: "3px solid #222", marginLeft: 1, animation: "blink 0.7s step-end infinite" }} /></span>;
}

// ── Admin modal wrapper ────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#666" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Form input ─────────────────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#444" }}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4,
  fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
};

export const btnStyle = (variant = "primary") => ({
  padding: "10px 20px", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14, fontWeight: 600,
  background: variant === "primary" ? "#1a1a1a" : variant === "danger" ? "#e74c3c" : "#f0f0f0",
  color: variant === "primary" || variant === "danger" ? "#fff" : "#333",
});
