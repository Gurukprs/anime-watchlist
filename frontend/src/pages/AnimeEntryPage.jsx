import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "@styles/pages/AnimeEntryPage.css";
import animeApi from "@hooks/useAnimeApi";

const CENSORSHIP_OPTIONS = [
  "Unrated",
  "All Ages",
  "13+",
  "16+",
  "18+",
  "Censored",
  "Uncensored"
];

export default function AnimeEntryPage() {
  const navigate = useNavigate();
  const { id: animeIdParam } = useParams();
  const [searchParams] = useSearchParams();

  const isEditMode = Boolean(animeIdParam);

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [listCategoryId, setListCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [watchLink, setWatchLink] = useState("");
  const [censorship, setCensorship] = useState("Unrated");
  const [dubSub, setDubSub] = useState("Sub");
  const [rating, setRating] = useState(8); // default slider value
  const [ratingEnabled, setRatingEnabled] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [prequelId, setPrequelId] = useState("");
  const [sequelId, setSequelId] = useState("");
  const [sequenceIndex, setSequenceIndex] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Load categories, tags, and (if edit mode) existing anime
  useEffect(() => {
    let cancelled = false;

    async function loadMetaAndMaybeAnime() {
      try {
        setLoadingMeta(true);
        setMetaError("");
        setSaveError("");
        setSaveSuccess("");

        const [catData, tagData, animeData] = await Promise.all([
          animeApi.getListCategories(),
          animeApi.getTags(),
          isEditMode ? animeApi.getAnimeById(animeIdParam) : Promise.resolve(null)
        ]);

        if (cancelled) return;

        setCategories(catData || []);
        setTags(tagData || []);

        if (isEditMode && animeData) {
          // Fill form with existing values
          setName(animeData.name || "");
          setDescription(animeData.description || "");
          setListCategoryId(
            animeData.listCategory ? animeData.listCategory._id : ""
          );
          setImageUrl(animeData.imageUrl || "");
          setWatchLink(animeData.watchLink || "");
          setCensorship(animeData.censorship || "Unrated");
          setDubSub(animeData.dubSub || "Sub");

          if (typeof animeData.rating === "number") {
            setRating(animeData.rating);
            setRatingEnabled(true);
          } else {
            setRating(8);
            setRatingEnabled(false);
          }

          const tagIds = (animeData.tags || []).map((t) => t._id);
          setSelectedTagIds(tagIds);

          setPrequelId(animeData.prequel ? animeData.prequel._id : "");
          setSequelId(animeData.sequel ? animeData.sequel._id : "");
          setSequenceIndex(
            typeof animeData.sequenceIndex === "number"
              ? String(animeData.sequenceIndex)
              : ""
          );
        } else if (!isEditMode) {
          // Create mode: default category logic
          const categoryFromQuery = searchParams.get("categoryId");
          const fromQueryObj = catData?.find(
            (c) => c._id === categoryFromQuery
          );
          if (fromQueryObj) {
            setListCategoryId(fromQueryObj._id);
          } else {
            let watching = catData?.find((c) => c.name === "Watching");
            if (!watching && catData && catData.length > 0) {
              watching = catData[0];
            }
            if (watching) setListCategoryId(watching._id);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setMetaError(err.message || "Failed to load categories/tags");
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    }

    loadMetaAndMaybeAnime();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, animeIdParam, searchParams]);

  const toggleTag = (id) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !listCategoryId) return;

    setSaveError("");
    setSaveSuccess("");

    try {
      setSaving(true);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        listCategoryId,
        imageUrl: imageUrl.trim(),
        watchLink: watchLink.trim(),
        censorship,
        tagIds: selectedTagIds,
        dubSub,
        rating: ratingEnabled ? Number(rating) : null,
        prequelId: prequelId.trim() || null,
        sequelId: sequelId.trim() || null,
        sequenceIndex:
          sequenceIndex.trim() === "" ? 0 : Number(sequenceIndex.trim())
      };

      let result;
      if (isEditMode) {
        result = await animeApi.updateAnime(animeIdParam, payload);
        setSaveSuccess("Anime updated successfully!");
      } else {
        result = await animeApi.createAnime(payload);
        setSaveSuccess("Anime saved successfully!");
      }

      if (result && result._id) {
        navigate(`/anime/${result._id}`);
      }
    } catch (err) {
      setSaveError(err.message || "Failed to save anime");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page page-entry">
      <div className="entry-header">
        <h2>{isEditMode ? "Edit Anime" : "Add Anime"}</h2>
        <p className="entry-subtitle">
          {isEditMode
            ? "Update the details of this anime entry."
            : "Fill in the details to add an anime to your watchlist."}
        </p>
      </div>

      {loadingMeta && (
        <div className="entry-info">Loading categories & tags…</div>
      )}
      {metaError && <div className="entry-error">{metaError}</div>}

      <form className="entry-form" onSubmit={handleSubmit}>
        <div className="entry-grid">
          {/* Left column */}
          <div className="entry-column">
            <div className="entry-field">
              <label>
                Anime Name <span className="required">*</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Fullmetal Alchemist: Brotherhood"
                />
              </label>
            </div>

            <div className="entry-field">
              <label>
                List Category <span className="required">*</span>
                <select
                  value={listCategoryId}
                  onChange={(e) => setListCategoryId(e.target.value)}
                  required
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

            <div className="entry-field">
              <label>
                Image URL
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Poster image URL"
                />
              </label>
            </div>

            <div className="entry-field">
              <label>
                Watch Link
                <input
                  type="url"
                  value={watchLink}
                  onChange={(e) => setWatchLink(e.target.value)}
                  placeholder="Streaming link"
                />
              </label>
            </div>

            <div className="entry-field">
              <label>
                Censorship
                <select
                  value={censorship}
                  onChange={(e) => setCensorship(e.target.value)}
                >
                  {CENSORSHIP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="entry-field">
              <span className="entry-label">Dub / Sub</span>
              <div className="entry-radio-group">
                {["Sub", "Dub", "Both"].map((option) => (
                  <label
                    key={option}
                    className={`radio-pill ${
                      dubSub === option ? "radio-pill-active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="dubSub"
                      value={option}
                      checked={dubSub === option}
                      onChange={(e) => setDubSub(e.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="entry-column">
            <div className="entry-field">
              <label>
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Short synopsis or your notes…"
                />
              </label>
            </div>

            <div className="entry-field">
              <span className="entry-label">Tags</span>
              <div className="entry-tags-wrap">
                {tags && tags.length > 0 ? (
                  tags.map((tag) => {
                    const active = selectedTagIds.includes(tag._id);
                    return (
                      <label
                        key={tag._id}
                        className={`tag-checkbox ${
                          active ? "tag-checkbox-active" : ""
                        }`}
                        style={
                          active && tag.color
                            ? {
                                borderColor: tag.color,
                                boxShadow: `0 0 0 1px ${tag.color}`
                              }
                            : {}
                        }
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleTag(tag._id)}
                        />
                        <span
                          className="tag-dot"
                          style={{ backgroundColor: tag.color || "#9aa0b5" }}
                        />
                        <span>{tag.name}</span>
                      </label>
                    );
                  })
                ) : (
                  <span className="entry-tags-empty">
                    No tags yet. Add some in Settings.
                  </span>
                )}
              </div>
            </div>

            <div className="entry-field">
              <div className="entry-rating-header">
                <span className="entry-label">Rating (1–10)</span>
                <label className="rating-toggle">
                  <input
                    type="checkbox"
                    checked={ratingEnabled}
                    onChange={(e) => setRatingEnabled(e.target.checked)}
                  />
                  <span>Enable</span>
                </label>
              </div>
              <div
                className={`rating-row ${
                  !ratingEnabled ? "rating-disabled" : ""
                }`}
              >
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  disabled={!ratingEnabled}
                />
                <span className="rating-value">{rating}</span>
              </div>
            </div>

            <div className="entry-field">
              <span className="entry-label">
                Prequel / Sequel Anime ID (optional)
              </span>
              <div className="entry-id-row">
                <label>
                  Prequel ID
                  <input
                    type="text"
                    value={prequelId}
                    onChange={(e) => setPrequelId(e.target.value)}
                    placeholder="Paste Anime ID here"
                  />
                </label>
                <label>
                  Sequel ID
                  <input
                    type="text"
                    value={sequelId}
                    onChange={(e) => setSequelId(e.target.value)}
                    placeholder="Paste Anime ID here"
                  />
                </label>
              </div>
              <p className="entry-hint">
                Tip: Use the Anime ID from the detail page to link prequels and
                sequels.
              </p>
            </div>

            <div className="entry-field">
              <label>
                Sequence Index (optional)
                <input
                  type="number"
                  value={sequenceIndex}
                  onChange={(e) => setSequenceIndex(e.target.value)}
                  placeholder="0 = default order"
                />
              </label>
            </div>
          </div>
        </div>

        {saveError && <div className="entry-error">{saveError}</div>}
        {saveSuccess && <div className="entry-success">{saveSuccess}</div>}

        <div className="entry-actions">
          <button
            type="submit"
            disabled={saving || !name.trim() || !listCategoryId}
          >
            {saving
              ? isEditMode
                ? "Updating..."
                : "Saving..."
              : isEditMode
              ? "Update Anime"
              : "Save Anime"}
          </button>
        </div>
      </form>
    </div>
  );
}
