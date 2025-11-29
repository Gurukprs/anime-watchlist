// Simple API helper for talking to the Node/Express backend

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = `Request failed with status ${res.status}`;
    try {
      const json = JSON.parse(text);
      if (json && json.message) message = json.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  // try to parse JSON; return null if no body
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// We export a ready-to-use API object
const animeApi = {
  // List categories (stages)
  async getListCategories() {
    return request("/list-categories");
  },

  // Tags
  async getTags() {
    return request("/tags");
  },

  async createTag(payload) {
    return request("/tags", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  // Anime CRUD + listing
  async getAnimeList(params = {}) {
    const qs = buildQuery(params);
    return request(`/anime${qs}`);
  },

  async getAnimeById(id) {
    return request(`/anime/${id}`);
  },

  async createAnime(payload) {
    return request("/anime", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async updateAnime(id, payload) {
    return request(`/anime/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  async deleteAnime(id) {
    return request(`/anime/${id}`, {
      method: "DELETE"
    });
  },

  // Search endpoint
  async searchAnime(params = {}) {
    const qs = buildQuery(params);
    return request(`/search${qs}`);
  }
};

export default animeApi;
