const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("blognest_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.message ||
      data.errors?.[0]?.msg ||
      "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return data;
}

export const api = {
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  profile: () => request("/auth/profile"),
  blogs: () => request("/blogs"),
  blog: (id) => request(`/blogs/${id}`),
  createBlog: (body) => request("/blogs", { method: "POST", body: JSON.stringify(body) }),
  updateBlog: (id, body) => request(`/blogs/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteBlog: (id) => request(`/blogs/${id}`, { method: "DELETE" }),
  generateBlog: (body) => request("/ai/generate-blog", { method: "POST", body: JSON.stringify(body) }),
  summarize: (body) => request("/ai/summarize", { method: "POST", body: JSON.stringify(body) })
};