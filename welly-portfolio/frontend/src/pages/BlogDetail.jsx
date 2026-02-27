import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { api } from "../lib/api";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getBlog(slug).then(setBlog).catch(() => setError("Post not found"));
  }, [slug]);

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Nature', serif", background: "#e8e6e1" }}>
      <p style={{ fontSize: 20, color: "#888", marginBottom: 24 }}>Post tidak ditemukan.</p>
      <Link to="/" style={{ color: "#1a1a1a", fontWeight: 700 }}>← Kembali</Link>
    </div>
  );

  if (!blog) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nature', serif", background: "#e8e6e1", color: "#888" }}>Loading...</div>
  );

  return (
    <div style={{ fontFamily: "'Nature', serif", background: "#e8e6e1", minHeight: "100vh" }}>
      <style>{`
        .prose{max-width:720px;margin:0 auto;line-height:1.8;color:#333}
        .prose h1,.prose h2,.prose h3{font-family:'Nature', serif;color:#1a1a1a;margin:32px 0 16px}
        .prose h1{font-size:36px}.prose h2{font-size:28px}.prose h3{font-size:22px}
        .prose p{margin-bottom:20px;font-size:16px}
        .prose ul,.prose ol{padding-left:24px;margin-bottom:20px}
        .prose li{margin-bottom:8px;font-size:16px}
        .prose code{background:#ddd;padding:2px 6px;border-radius:3px;font-size:14px}
        .prose pre{background:#1a1a1a;color:#e0e0e0;padding:20px;border-radius:6px;overflow-x:auto;margin-bottom:20px}
        .prose pre code{background:none;padding:0;font-size:14px}
        .prose blockquote{border-left:4px solid #1a1a1a;padding-left:20px;color:#555;font-style:italic;margin:24px 0}
        .prose img{max-width:100%;border-radius:4px;margin:24px 0}
        .prose a{color:#1a1a1a;text-decoration:underline}
      `}</style>

      <nav style={{ background: "#e8e6e1", padding: "18px 60px", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontFamily: "'Nature', serif", fontSize: 28, fontWeight: 700 }}>Welly</span>
        <Link to="/" style={{ fontSize: 14, color: "#1a1a1a", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>← Kembali</Link>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 40px" }}>
        {blog.cover_url && (
          <img src={blog.cover_url} alt={blog.title} style={{ width: "100%", height: 400, objectFit: "cover", marginBottom: 48, filter: "grayscale(1)" }} />
        )}
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
            {new Date(blog.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 style={{ fontFamily: "'Nature', serif", fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.2, marginBottom: 48, color: "#1a1a1a" }}>{blog.title}</h1>
          <div className="prose">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>
        </div>
      </div>

      <footer style={{ background: "#1a1a1a", color: "#aaa", textAlign: "center", padding: 24, fontSize: 13 }}>
        © 2026 Welly Chandra. All rights reserved.
      </footer>
    </div>
  );
}
