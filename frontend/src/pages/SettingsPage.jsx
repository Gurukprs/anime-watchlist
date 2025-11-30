import React, { useEffect, useState, useRef } from "react";
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

  // Backup / restore
  const [backupMessage, setBackupMessage] = useState("");
  const [backupError, setBackupError] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const backupFileInputRef = useRef(null);

  // MAL / HiAnime import
  const [malImportCategoryId, setMalImportCategoryId] = useState("");
  const [malImportLoading, setMalImportLoading] = useState(false);
  const [malImportMessage, setMalImportMessage] = useState("");
  const [malImportError, setMalImportError] = useState("");
  const malFileInputRef = useRef(null);

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

  // --- Delete category ---

  const handleDeleteCategory = async (category) => {
    const { _id, name, isDefault } = category;
    if (isDefault) {
      alert("Default categories cannot be deleted.");
      return;
    }

    const ok = window.confirm(
      `Delete category "${name}"?\n\nNote: You must move or delete anime using this category first.`
    );
    if (!ok) return;

    try {
      await animeApi.deleteListCategory(_id);
      setCategories((prev) => prev.filter((c) => c._id !== _id));
    } catch (err) {
      alert(err.message || "Failed to delete category");
    }
  };

  // --- Delete tag ---

  const handleDeleteTag = async (tag) => {
    const { _id, name } = tag;
    const ok = window.confirm(
      `Delete tag "${name}"?\n\nThis will remove the tag from all anime that use it.`
    );
    if (!ok) return;

    try {
      await animeApi.deleteTag(_id);
      setTags((prev) => prev.filter((t) => t._id !== _id));
    } catch (err) {
      alert(err.message || "Failed to delete tag");
    }
  };

  // --- Export ---

  const handleExport = async () => {
    try {
      setBackupError("");
      setBackupMessage("Preparing export…");
      const data = await animeApi.exportAll();

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });

      const now = new Date();
      const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
      const filename = `anime-watchlist-backup-${now.getFullYear()}${pad(
        now.getMonth() + 1
      )}${pad(now.getDate())}-${pad(now.getHours())}${pad(
        now.getMinutes()
      )}${pad(now.getSeconds())}.json`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupMessage("Export completed. JSON file downloaded.");
      setTimeout(() => setBackupMessage(""), 3000);
    } catch (err) {
      setBackupError(err.message || "Failed to export data");
      setBackupMessage("");
    }
  };

  // --- Import (our backup JSON) ---

  const triggerBackupImport = () => {
    if (backupFileInputRef.current) {
      backupFileInputRef.current.value = "";
      backupFileInputRef.current.click();
    }
  };

  const handleBackupFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setImportLoading(true);
        setBackupError("");
        setBackupMessage("Importing (replace mode)…");

        const text = reader.result;
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Selected file is not valid JSON");
        }

        await animeApi.importAll(data, "replace");

        setBackupMessage("Import successful. Reloading data…");
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } catch (err) {
        setBackupError(err.message || "Failed to import data");
        setBackupMessage("");
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // --- Import from MAL / HiAnime ---

  const triggerMalImport = () => {
    if (!malImportCategoryId) {
      alert("Please select a target category.");
      return;
    }
    if (malFileInputRef.current) {
      malFileInputRef.current.value = "";
      malFileInputRef.current.click();
    }
  };

  const handleMalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setMalImportLoading(true);
        setMalImportError("");
        setMalImportMessage("Importing MAL file…");

        const text = reader.result;

        const result = await animeApi.importMalToCategory(
          malImportCategoryId,
          text
        );

        setMalImportMessage(
          `Imported ${result.created || 0} anime from MAL into selected category.`
        );
        setTimeout(() => setMalImportMessage(""), 4000);
      } catch (err) {
        setMalImportError(err.message || "Failed to import MAL file");
        setMalImportMessage("");
      } finally {
        setMalImportLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page page-settings">
      <div className="settings-header">
        <h2>Settings</h2>
        <p className="settings-subtitle">
          Manage your list categories, tags, backups, and imports.
        </p>
      </div>

      {loading && <div className="settings-info">Loading data…</div>}
      {error && <div className="settings-error">{error}</div>}

      <div className="settings-grid settings-grid-3">
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

                  {!cat.isDefault && (
                    <button
                      type="button"
                      className="settings-delete-btn"
                      onClick={() => handleDeleteCategory(cat)}
                      title="Delete category"
                    >
                      ✕
                    </button>
                  )}
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
                  <button
                    type="button"
                    className="settings-delete-btn"
                    onClick={() => handleDeleteTag(tag)}
                    title="Delete tag"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <div className="settings-empty">No tags yet.</div>
            )}
          </div>
        </section>

        {/* Backup / Restore */}
        <section className="settings-card">
          <h3>Backup &amp; Restore</h3>
          <p className="settings-card-subtitle">
            Export all categories, tags, and anime to a JSON file, or import a
            previous backup.
          </p>

          <div className="backup-actions">
            <button
              type="button"
              className="backup-btn"
              onClick={handleExport}
            >
              Export to JSON
            </button>

            <button
              type="button"
              className="backup-btn backup-btn-danger"
              onClick={triggerBackupImport}
              disabled={importLoading}
            >
              {importLoading ? "Importing..." : "Import from JSON"}
            </button>
          </div>

          <p className="backup-warning">
            Import will <strong>replace</strong> your current data
            (categories, tags, and anime) with the contents of the file.
            Make sure you export a backup first.
          </p>

          {backupMessage && (
            <div className="backup-message backup-message-ok">
              {backupMessage}
            </div>
          )}
          {backupError && (
            <div className="backup-message backup-message-error">
              {backupError}
            </div>
          )}

          <input
            ref={backupFileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={handleBackupFileChange}
          />
        </section>

        {/* Import from MAL / HiAnime */}
        <section className="settings-card">
          <h3>Import from MAL / HiAnime</h3>
          <p className="settings-card-subtitle">
            Import anime from a MyAnimeList XML export file (for example exported
            via HiAnime&apos;s MAL import/export). Only anime entries will be
            created, into a single selected category.
          </p>

          <div className="settings-form">
            <div className="form-row">
              <label>
                Target category
                <select
                  value={malImportCategoryId}
                  onChange={(e) => setMalImportCategoryId(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              className="backup-btn"
              onClick={triggerMalImport}
              disabled={!malImportCategoryId || malImportLoading}
            >
              {malImportLoading
                ? "Importing MAL file..."
                : "Choose MAL XML & Import"}
            </button>
          </div>

          <p className="settings-note">
            This does <strong>not</strong> change your existing data. It only
            adds new anime into the selected category. Duplicates (same title)
            are not automatically merged.
          </p>

          {malImportMessage && (
            <div className="backup-message backup-message-ok">
              {malImportMessage}
            </div>
          )}
          {malImportError && (
            <div className="backup-message backup-message-error">
              {malImportError}
            </div>
          )}

          <input
            ref={malFileInputRef}
            type="file"
            accept=".xml,text/xml"
            style={{ display: "none" }}
            onChange={handleMalFileChange}
          />
        </section>
      </div>
    </div>
  );
}
