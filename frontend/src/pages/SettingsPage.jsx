import React, { useEffect, useState } from "react";
import "@styles/pages/SettingsPage.css";
import animeApi from "@hooks/useAnimeApi";

export default function SettingsPage() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New category form
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#3b82f6");
  const [catSaving, setCatSaving] = useState(false);

  // New tag form
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#9aa0b5");
  const [tagSaving, setTagSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [catData, tagData] = await Promise.all([
          animeApi.getListCategories(),
          animeApi.getTags()
        ]);

        if (cancelled) return;
        setCategories(catData || []);
        setTags(tagData || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load settings data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setCatSaving(true);
      const created = await animeApi.createListCategory({
        name: newCatName.trim(),
        color: newCatColor
      });
      setCategories((prev) => [...prev, created]);
      setNewCatName("");
    } catch (err) {
      alert(err.message || "Failed to create category");
    } finally {
      setCatSaving(false);
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      setTagSaving(true);
      const created = await animeApi.createTag({
        name: newTagName.trim(),
        color: newTagColor
      });
      setTags((prev) => [...prev, created]);
      setNewTagName("");
    } catch (err) {
      alert(err.message || "Failed to create tag");
    } finally {
      setTagSaving(false);
    }
  };

  return (
    <div className="page page-settings">
      <div className="settings-header">
        <h2>Settings</h2>
        <p className="settings-subtitle">
          Manage your list categories (stages) and tags here.
        </p>
      </div>

      {loading && <div className="settings-info">Loading data…</div>}
      {error && <div className="settings-error">{error}</div>}

      <div className="settings-grid">
        {/* List Categories */}
        <section className="settings-card">
          <h3>List Categories</h3>
          <p className="settings-card-subtitle">
            These are your stages like <em>Watching</em>, <em>Completed</em>, etc.
          </p>

          <form className="settings-form" onSubmit={handleCreateCategory}>
            <div className="form-row">
              <label>
                Name
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Rewatching"
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Color
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                />
              </label>
            </div>
            <button type="submit" disabled={catSaving || !newCatName.trim()}>
              {catSaving ? "Adding..." : "Add Category"}
            </button>
          </form>

          <div className="settings-list">
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <div className="settings-list-item" key={cat._id}>
                  <div className="settings-list-main">
                    <span
                      className="settings-color-dot"
                      style={{ backgroundColor: cat.color || "#3b82f6" }}
                    />
                    <span className="settings-list-name">{cat.name}</span>
                    {cat.isDefault && (
                      <span className="settings-badge">default</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="settings-empty">No categories yet.</div>
            )}
          </div>
        </section>

        {/* Tags */}
        <section className="settings-card">
          <h3>Tags</h3>
          <p className="settings-card-subtitle">
            Use tags like <em>Shounen</em>, <em>Romance</em>, <em>Isekai</em> etc.
          </p>

          <form className="settings-form" onSubmit={handleCreateTag}>
            <div className="form-row">
              <label>
                Name
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g. Shounen"
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Color
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                />
              </label>
            </div>
            <button type="submit" disabled={tagSaving || !newTagName.trim()}>
              {tagSaving ? "Adding..." : "Add Tag"}
            </button>
          </form>

          <div className="settings-list">
            {tags && tags.length > 0 ? (
              tags.map((tag) => (
                <div className="settings-list-item" key={tag._id}>
                  <div className="settings-list-main">
                    <span
                      className="settings-color-dot"
                      style={{ backgroundColor: tag.color || "#9aa0b5" }}
                    />
                    <span className="settings-list-name">{tag.name}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="settings-empty">No tags yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
