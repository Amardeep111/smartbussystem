const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4500/api";

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE_URL}${path}`, { headers, ...options });
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const apiPost = (path, body) =>
  apiRequest(path, { method: "POST", body: JSON.stringify(body) });

export const apiPut = (path, body) =>
  apiRequest(path, { method: "PUT", body: JSON.stringify(body) });

export const apiDelete = (path) =>
  apiRequest(path, { method: "DELETE" });