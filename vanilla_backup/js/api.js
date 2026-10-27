const API_BASE = "http://localhost:3001";

async function apiGet(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error("Request failed");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function apiPost(path, data) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Request failed");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function apiPatch(path, data) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Request failed");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function apiDelete(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
}