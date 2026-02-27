const BASE = import.meta.env.VITE_API_URL || "";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("admin_token");
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Public
  getProfile: () => apiFetch("/api/profile"),
  getExperiences: () => apiFetch("/api/experiences"),
  getPortfolio: () => apiFetch("/api/portfolio"),
  getBlogs: () => apiFetch("/api/blogs"),
  getBlog: (slug) => apiFetch(`/api/blogs/${slug}`),

  // Auth
  login: (data) => apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  setup: (data) => apiFetch("/api/auth/setup", { method: "POST", body: JSON.stringify(data) }),
  changePassword: (data) => apiFetch("/api/auth/change-password", { method: "POST", body: JSON.stringify(data) }),

  // Admin
  updateProfile: (data) => apiFetch("/api/admin/profile", { method: "PUT", body: JSON.stringify(data) }),

  getSkills: () => apiFetch("/api/admin/skills"),
  createSkill: (d) => apiFetch("/api/admin/skills", { method: "POST", body: JSON.stringify(d) }),
  updateSkill: (id, d) => apiFetch(`/api/admin/skills/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteSkill: (id) => apiFetch(`/api/admin/skills/${id}`, { method: "DELETE" }),

  getServices: () => apiFetch("/api/admin/services"),
  createService: (d) => apiFetch("/api/admin/services", { method: "POST", body: JSON.stringify(d) }),
  updateService: (id, d) => apiFetch(`/api/admin/services/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteService: (id) => apiFetch(`/api/admin/services/${id}`, { method: "DELETE" }),

  getExperiencesAdmin: () => apiFetch("/api/admin/experiences"),
  createExperience: (d) => apiFetch("/api/admin/experiences", { method: "POST", body: JSON.stringify(d) }),
  updateExperience: (id, d) => apiFetch(`/api/admin/experiences/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteExperience: (id) => apiFetch(`/api/admin/experiences/${id}`, { method: "DELETE" }),

  getPortfolioAdmin: () => apiFetch("/api/admin/portfolio"),
  createPortfolio: (d) => apiFetch("/api/admin/portfolio", { method: "POST", body: JSON.stringify(d) }),
  updatePortfolio: (id, d) => apiFetch(`/api/admin/portfolio/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deletePortfolio: (id) => apiFetch(`/api/admin/portfolio/${id}`, { method: "DELETE" }),

  getBlogsAdmin: () => apiFetch("/api/admin/blogs"),
  createBlog: (d) => apiFetch("/api/admin/blogs", { method: "POST", body: JSON.stringify(d) }),
  updateBlog: (id, d) => apiFetch(`/api/admin/blogs/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteBlog: (id) => apiFetch(`/api/admin/blogs/${id}`, { method: "DELETE" }),

  upload: async (file) => {
    const token = localStorage.getItem("admin_token");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/api/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
    return res.json();
  },
};
