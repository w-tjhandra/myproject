import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Reveal, SectionHeader, CircleSkill, TypingTitle } from "../components/UI";

const TEXTURE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`,
};

export default function Home() {
  const [data, setData] = useState(null);
  const [exp, setExp] = useState({ experiences: [], education: [] });
  const [portfolio, setPortfolio] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [skillVis, setSkillVis] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const skillRef = useRef();

  useEffect(() => {
    api.getProfile().then(setData).catch(console.error);
    api.getExperiences().then(setExp).catch(console.error);
    api.getPortfolio().then(setPortfolio).catch(console.error);
    api.getBlogs().then(setBlogs).catch(console.error);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSkillVis(true); }, { threshold: 0.2 });
    if (skillRef.current) obs.observe(skillRef.current);
    return () => obs.disconnect();
  }, [data]);

  if (!data) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nature', serif", background: "#e8e6e1", fontSize: 16, color: "#888" }}>Loading...</div>;

  const { profile, skills, services } = data;
  const titles = profile.tagline?.split("/").map(t => t.trim()).filter(Boolean) || ["Network Engineer", "ICT Trainer"];
  const NAV = ["Home", "About Me", "What I Do", "Portfolio", "My Resume", "Blog", "Contact Me"];
  const NAV_IDS = ["home", "about", "services", "portfolio", "resume", "blog", "contact"];

  const scrollTo = (id) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "'Nature', serif", background: "#e8e6e1", color: "#1a1a1a" }}>
      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:none}}
        html{scroll-behavior:smooth;}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#e8e6e1}::-webkit-scrollbar-thumb{background:#aaa;border-radius:3px}
        * { box-sizing: border-box; }
        body { width: 100vw; overflow-x: hidden; }
        .nav-a{cursor:pointer;transition:color 0.2s;position:relative;padding-bottom:4px;font-size:14px;}
        .nav-a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1px;background:#1a1a1a;transition:width 0.2s}
        .nav-a:hover::after,.nav-a.active::after{width:100%}
        .nav-a.active{font-weight:700}
        .btn-black{background:#1a1a1a;color:#fff;border:none;padding:14px 32px;font-size:14px;font-weight:700;letter-spacing:1px;cursor:pointer;font-family:'Nature', serif;transition:all 0.2s}
        .btn-black:hover{background:#333;transform:translateY(-2px)}
        .svc-card{border-left:1px solid #c5c3be;padding:32px 28px;transition:all 0.3s}
        .svc-card:hover{background:rgba(255,255,255,0.5);transform:translateY(-4px)}
        .port-item{overflow:hidden;cursor:pointer;position:relative}
        .port-img{transition:transform 0.4s ease}
        .port-item:hover .port-img{transform:scale(1.06)}
        .port-overlay{position:absolute;inset:0;background:rgba(0,0,0,0);display:flex;align-items:flex-end;padding:16px;transition:background 0.3s}
        .port-item:hover .port-overlay{background:rgba(0,0,0,0.5)}
        .port-label{color:#fff;font-weight:700;opacity:0;transform:translateY(10px);transition:all 0.3s}
        .port-item:hover .port-label{opacity:1;transform:none}
        .blog-img{transition:transform 0.4s ease}
        .blog-card:hover .blog-img{transform:scale(1.05)}
        .input-f{width:100%;padding:14px 16px;background:transparent;border:1px solid #b5b3ae;font-family:'Nature', serif;font-size:14px;color:#1a1a1a;outline:none;transition:border-color 0.2s}
        .input-f:focus{border-color:#1a1a1a}
        .input-f::placeholder{color:#aaa}
        .social-side{position:fixed;left:24px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;z-index:50}
        .social-icon{width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;transition:transform 0.2s;text-decoration:none;color:#1a1a1a}
        .social-icon:hover{transform:scale(1.2)}
        .follow-v{writing-mode:vertical-rl;font-size:11px;letter-spacing:2px;color:#888;margin-top:10px}
        section{padding:100px 0;width:100%;overflow-x:hidden}
        .inner{width:100%;max-width:1100px;margin:0 auto;padding:0 40px}
        
        .hero-grid{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:40px}
        .skill-grid{display:grid;grid-template-columns:repeat(4, 1fr);gap:20px;justify-items:center}
        .port-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:20px}
        .blog-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:24px}
        .resume-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
        .contact-form-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
        .contact-info{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;text-align:center}
        
        @media(max-width:1024px){
          .inner{padding:0 32px}
          .social-side{left:12px}
          .skill-grid{grid-template-columns:repeat(2, 1fr)}
          .port-grid{grid-template-columns:repeat(2, 1fr)}
          .blog-grid{grid-template-columns:repeat(2, 1fr)}
        }
        
        @media(max-width:768px){
          .inner{padding:0 20px}
          section{padding:40px 0}
          .social-side{display:none}
          .nav-a{font-size:11px;padding:4px 6px}
          .hero-grid{grid-template-columns:1fr;gap:20px}
          .skill-grid{grid-template-columns:repeat(2, 1fr);gap:12px}
          .port-grid{grid-template-columns:1fr}
          .blog-grid{grid-template-columns:1fr}
          .resume-grid{grid-template-columns:1fr;gap:24px}
          .contact-form-grid{grid-template-columns:1fr}
          .contact-info{grid-template-columns:1fr;gap:12px}
          .btn-black{padding:10px 24px;font-size:13px}
          .svc-card{padding:20px 16px}
        }
        
        @media(max-width:640px){
          .inner{padding:0 14px}
          section{padding:30px 0}
          nav{padding:12px 14px !important}
          .nav-a{font-size:10px;gap:8px !important;padding:2px 4px}
          .hero-grid{gap:16px;padding-top:40px !important;padding-bottom:30px !important}
          .skill-grid{grid-template-columns:1fr;gap:10px}
          .btn-black{padding:8px 20px;font-size:12px}
          .svc-card{padding:16px 12px;border-left-width:2px}
          .input-f{padding:10px 12px;font-size:13px}
          h1{font-size:24px !important}
          h2{font-size:20px !important}
          h3{font-size:16px !important}
        }
      `}</style>

      {/* Social sidebar */}
      <div className="social-side">
        <a className="social-icon" href="https://instagram.com/chandrawelly_" target="_blank" rel="noopener noreferrer">📷</a>
        <a className="social-icon" href="https://facebook.com/tjhandra" target="_blank" rel="noopener noreferrer">f</a>
        <a className="social-icon" href="https://linkedin.com/in/welly-chandra-mauliate-sitorus-919243316" target="_blank" rel="noopener noreferrer">in</a>
        <span className="follow-v">Follow Me</span>
      </div>

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#e8e6e1", padding: "clamp(8px, 3vw, 18px) clamp(12px, 4vw, 60px)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", gap: "clamp(8px, 3vw, 28px)", flexWrap: "wrap", justifyContent: "center" }}>
          {NAV.map((item, i) => (
            <span key={item} className={`nav-a ${activeNav === NAV_IDS[i] ? "active" : ""}`} onClick={() => scrollTo(NAV_IDS[i])}>{item}</span>
          ))}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" style={{ padding: 0, minHeight: "100vh", display: "flex", alignItems: "center", ...TEXTURE, backgroundSize: "300px", position: "relative" }}>
        <div className="inner hero-grid" style={{ paddingTop: "clamp(60px, 10vw, 100px)", paddingBottom: "clamp(30px, 5vw, 60px)", width: "100%" }}>
          <div style={{ animation: "fadeDown 0.8s ease both" }}>
            <p style={{ fontSize: "clamp(9px, 2.5vw, 12px)", letterSpacing: 4, color: "#888", textTransform: "uppercase", marginBottom: "clamp(12px, 3vw, 20px)" }}>WELCOME TO MY WEBSITE</p>
            <h1 style={{ fontFamily: "'Nature', serif", fontSize: "clamp(24px, 5vw, 60px)", lineHeight: 1.1, fontWeight: 700, marginBottom: "clamp(10px, 2vw, 16px)" }}>
              Hi, I'm {profile.name}<br />
              <span style={{ fontSize: "clamp(18px, 4vw, 48px)" }}>a <TypingTitle titles={titles} /></span>
            </h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", margin: "clamp(16px, 4vw, 32px) 0 clamp(16px, 4vw, 36px)", borderLeft: "1px solid #bbb" }}>
              {[["Surabaya", "East Java"], ["MikroTik", "MikroTik Certified Trainer"], ["100+", "Classes Taught"]].map(([a, b], i) => (
                <div key={i} style={{ borderLeft: i > 0 ? "1px solid #bbb" : "none", padding: "clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 16px)" }}>
                  <div style={{ fontWeight: 700, fontSize: "clamp(11px, 2vw, 14px)" }}>{a}</div>
                  <div style={{ fontSize: "clamp(9px, 1.8vw, 12px)", color: "#666", marginTop: 2 }}>{b}</div>
                </div>
              ))}
            </div>
            <button className="btn-black" onClick={() => scrollTo("resume")}>My Resume</button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
            {profile.photo_url
              ? <img src={profile.photo_url} alt={profile.name} style={{ width: "100%", height: "auto", maxWidth: "clamp(200px, 80vw, 400px)", aspectRatio: "3/4", objectFit: "cover", filter: "grayscale(1)", borderRadius: "4px" }} />
              : <div style={{ width: "clamp(150px, 60vw, 400px)", aspectRatio: "3/4", background: "#c8c6c1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(40px, 10vw, 80px)", color: "#999", borderRadius: "4px" }}>👤</div>
            }
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", width: 28, height: 48, border: "2px solid #888", borderRadius: 14, display: "flex", justifyContent: "center", paddingTop: 8 }}>
          <div style={{ width: 4, height: 10, background: "#888", borderRadius: 2, animation: "blink 1.5s ease infinite" }} />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ background: "#e8e6e1", ...TEXTURE, backgroundSize: "300px" }}>
        <div className="inner">
          <SectionHeader title="About Me" />
          <Reveal><p style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 64px", fontSize: 15, lineHeight: 1.9, color: "#444" }}>{profile.bio}</p></Reveal>
          <div ref={skillRef} className="skill-grid" style={{}}>
            {skills.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.1}><CircleSkill name={s.name} pct={s.percentage} animate={skillVis} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      {profile.quote && (
        <section style={{ background: "#dedad5", ...TEXTURE, backgroundSize: "300px" }}>
          <div className="inner">
            <Reveal>
              <div style={{ maxWidth: 820 }}>
                <div style={{ fontFamily: "'Nature', serif", fontSize: 80, lineHeight: 0.8, color: "#1a1a1a", marginBottom: 24 }}>{"\""}</div>
                <p style={{ fontFamily: "'Nature', serif", fontSize: "clamp(18px, 2.2vw, 26px)", lineHeight: 1.7, color: "#1a1a1a", marginBottom: 24 }}>{profile.quote}</p>
                <div style={{ borderLeft: "3px solid #555", paddingLeft: 12 }}><span style={{ fontSize: 13, color: "#555" }}>{profile.quote_author}</span></div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── SERVICES ── */}
      <section id="services" style={{ background: "#e8e6e1" }}>
        <div className="inner">
          <SectionHeader title="What I Do" />
          <div className="port-grid" style={{}}>
            {services.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.1}>
                <div className="svc-card">
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                  <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8 }}>{s.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ── */}
      <section id="portfolio" style={{ background: "#e8e6e1" }}>
        <div className="inner">
          <SectionHeader title="Portfolio" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {portfolio.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.07}>
                <div className="port-item">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.title} className="port-img" style={{ width: "100%", height: 320, objectFit: "cover", display: "block", filter: "grayscale(1)" }} />
                    : <div className="port-img" style={{ height: 320, background: `hsl(${200 + i * 20}, 8%, ${52 + (i % 3) * 6}%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, letterSpacing: 1 }}>{item.title}</div>
                  }
                  <div className="port-overlay"><span className="port-label">{item.title}</span></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESUME ── */}
      <section id="resume" style={{ background: "#e8e6e1" }}>
        <div className="inner">
          <SectionHeader title="My Resume" />
          <div className="resume-grid" style={{}}>
            {[["Experiences", exp.experiences], ["Education", exp.education]].map(([title, items]) => (
              <div key={title}>
                <Reveal><h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 32 }}>{title}</h3></Reveal>
                {items.map((e, i) => (
                  <Reveal key={e.id} delay={i * 0.1}>
                    <div style={{ display: "flex", gap: 16, marginBottom: 36 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 36, height: 36, background: "#1a1a1a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        {i < items.length - 1 && <div style={{ width: 1, flex: 1, background: "#ccc", marginTop: 4 }} />}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{e.year_range}</p>
                        <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{e.title}</h4>
                        <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>{e.company}</p>
                        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{e.description}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      <section id="blog" style={{ background: "#e8e6e1" }}>
        <div className="inner">
          <SectionHeader title="Recent Blog" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {blogs.map((b, i) => (
              <Reveal key={b.id} delay={i * 0.1}>
                <Link to={`/blog/${b.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }} className="blog-card">
                  <div style={{ overflow: "hidden", marginBottom: 16 }}>
                    {b.cover_url
                      ? <img src={b.cover_url} alt={b.title} className="blog-img" style={{ width: "100%", height: 220, objectFit: "cover", display: "block", filter: "grayscale(1)" }} />
                      : <div className="blog-img" style={{ height: 220, background: `hsl(${210 + i * 25}, 6%, ${52 + i * 5}%)` }} />
                    }
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, lineHeight: 1.4 }}>{b.title}</h4>
                  <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>{b.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: "#dedad5", ...TEXTURE, backgroundSize: "300px" }}>
        <div className="inner">
          <SectionHeader title="Contact Me" />
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Reveal>
              <div className="contact-form-grid" style={{ marginBottom: 12 }}>
                <input className="input-f" placeholder="Your Name" />
                <input className="input-f" placeholder="Your Email" />
                <input className="input-f" placeholder="Your Phone" />
              </div>
              <textarea className="input-f" placeholder="Your Message" rows={6} style={{ resize: "vertical", marginBottom: 20 }} />
              <div style={{ textAlign: "center" }}><button className="btn-black">Send Message</button></div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="contact-info" style={{ marginTop: 60 }}>
                {[["Email Me", profile.email], ["Location", profile.location]].map(([l, v]) => (
                  <div key={l}><p style={{ fontWeight: 700, marginBottom: 6 }}>{l}</p><p style={{ fontSize: 14, color: "#555" }}>{v}</p></div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <footer style={{ background: "#1a1a1a", color: "#aaa", textAlign: "center", padding: 24, fontSize: 13 }}>
        © 2026 {profile.name}. All rights reserved.
        <span style={{ margin: "0 12px" }}>·</span>
        <Link to="/admin" style={{ color: "#666", textDecoration: "none", fontSize: 12 }}>Admin</Link>
      </footer>
    </div>
  );
}
