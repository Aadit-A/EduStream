// API helper with token-authenticated endpoints and async handling
const API_BASE = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) || "http://localhost:3001";
const TOKEN_KEY = "accessToken";

function requestHeaders(includeJson = false) {
  const headers = includeJson ? { "Content-Type": "application/json" } : {};
  const token = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { headers: requestHeaders() });
    if (!res.ok) throw new Error("Request failed");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function apiPost(path, data) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: requestHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      if (errData && errData.message) return errData;
      throw new Error("Request failed");
    }
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function apiPatch(path, data) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: requestHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      if (errData && errData.message) return errData;
      throw new Error("Request failed");
    }
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function apiDelete(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: requestHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export { API_BASE, TOKEN_KEY };
