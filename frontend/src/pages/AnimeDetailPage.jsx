import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "@styles/pages/AnimeDetailPage.css";
import animeApi from "@hooks/useAnimeApi";
import AnimeCard from "@components/anime/AnimeCard.jsx";

export default function AnimeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state;


  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(8);
  const [ratingEnabled, setRatingEnabled] = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        setRatingMessage("");
        setDeleteError("");

        const data = await animeApi.getAnimeById(id);
        if (cancelled) return;

        setAnime(data);
        if (data && typeof data.rating === "number") {
          setRating(data.rating);
          setRatingEnabled(true);
        } else {
          setRating(8);
          setRatingEnabled(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load anime details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleCopyId = async () => {
    if (!anime?._id) return;
    try {
      await navigator.clipboard.writeText(anime._id);
      setRatingMessage("Anime ID copied to clipboard.");
      setTimeout(() => setRatingMessage(""), 1500);
    } catch {
      setRatingMessage("Could not copy ID (clipboard blocked).");
      setTimeout(() => setRatingMessage(""), 1500);
    }
  };

  const handleOpenWatch = () => {
    if (!anime?.watchLink) return;
    window.open(anime.watchLink, "_blank", "noopener,noreferrer");
  };

  const handleSaveRating = async () => {
    if (!anime) return;

    setRatingMessage("");
    try {
      setSavingRating(true);
      const updated = await animeApi.updateAnime(anime._id, {
        rating: ratingEnabled ? Number(rating) : null
      });
      setAnime(updated);
      if (updated && typeof updated.rating === "number") {
        setRating(updated.rating);
        setRatingEnabled(true);
      } else {
        setRating(8);
        setRatingEnabled(false);
      }
      setRatingMessage("Rating saved.");
      setTimeout(() => setRatingMessage(""), 1500);
    } catch (err) {
      setRatingMessage(err.message || "Failed to save rating");
    } finally {
      setSavingRating(false);
    }
  };

  const handleEdit = () => {
    if (!anime) return;
    navigate(`/anime/${anime._id}/edit`);
  };

  const handleDelete = async () => {
    if (!anime) return;
    const ok = window.confirm(
      "Are you sure you want to permanently delete this anime from your watchlist?"
    );
    if (!ok) return;

    try {
      setDeleteLoading(true);
      setDeleteError("");
      await animeApi.deleteAnime(anime._id);
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(err.message || "Failed to delete anime");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page page-detail">
        <div className="detail-loading">
          <div className="spinner" />
          <span>Loading anime…</span>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="page page-detail">
        <div className="detail-error">
          {error || "Anime not found."}
        </div>
      </div>
    );
  }

  const hasTags = anime.tags && anime.tags.length > 0;

  return (
    <div className="page page-detail">
      <div className="detail-layout">
        {/* Left section */}
        <div className="detail-left">
          <div className="detail-poster-card">
            <div className="detail-poster-wrapper">
              {anime.imageUrl ? (
                <img
                  src={anime.imageUrl}
                  alt={anime.name}
                  className="detail-poster-image"
                />
              ) : (
                <div className="detail-poster-placeholder">
                  <span>No Image</span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-meta-card">
            <div className="detail-id-row">
              <span className="detail-label">Anime ID</span>
              <code className="detail-id-value">{anime._id}</code>
              <button
                type="button"
                className="detail-id-copy"
                onClick={handleCopyId}
              >
                Copy
              </button>
            </div>

            <div className="detail-meta-row">
              <span className="detail-label">Censorship</span>
              <span className="detail-chip detail-chip-soft">
                {anime.censorship || "Unrated"}
              </span>
            </div>

            <div className="detail-meta-row detail-meta-tags">
              <span className="detail-label">Tags</span>
              <div className="detail-tags">
                {hasTags ? (
                  anime.tags.map((tag) => (
                    <span
                      key={tag._id}
                      className="detail-tag-chip"
                      style={{
                        borderColor: tag.color || "#9aa0b5",
                        boxShadow: tag.color
                          ? `0 0 0 1px ${tag.color}`
                          : "none"
                      }}
                    >
                      <span
                        className="detail-tag-dot"
                        style={{ backgroundColor: tag.color || "#9aa0b5" }}
                      />
                      {tag.name}
                    </span>
                  ))
                ) : (
                  <span className="detail-tags-empty">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="detail-right">
          <div className="detail-header">
            <h2 className="detail-title">{anime.name}</h2>
            <div className="detail-pill-row">
              {anime.listCategory && (
                <span
                  className="detail-pill detail-pill-category"
                  style={{
                    borderColor: anime.listCategory.color || "#3b82f6",
                    boxShadow: anime.listCategory.color
                      ? `0 0 0 1px ${anime.listCategory.color}`
                      : "none"
                  }}
                >
                  <span
                    className="detail-pill-dot"
                    style={{
                      backgroundColor: anime.listCategory.color || "#3b82f6"
                    }}
                  />
                  {anime.listCategory.name}
                </span>
              )}
              <span className="detail-pill detail-pill-soft">
                {anime.dubSub || "Sub"}
              </span>
              {typeof anime.rating === "number" && (
                <span className="detail-pill detail-pill-soft">
                  Rating: {anime.rating} / 10
                </span>
              )}
            </div>
          </div>

          <div className="detail-toolbar">
            {anime.watchLink && (
              <button
                type="button"
                className="detail-watch-btn"
                onClick={handleOpenWatch}
              >
                Watch Now
              </button>
            )}
            <div className="detail-toolbar-spacer" />
            <button
              type="button"
              className="detail-edit-btn"
              onClick={handleEdit}
            >
              Edit
            </button>
            <button
              type="button"
              className="detail-delete-btn"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </button>
          </div>

          <div className="detail-section">
            <h3>Description</h3>
            <p className="detail-description">
              {anime.description && anime.description.trim().length > 0
                ? anime.description
                : "No description available."}
            </p>
          </div>

          <div className="detail-section">
            <h3>Your Rating</h3>
            <div className="detail-rating-row">
              <label className="detail-rating-toggle">
                <input
                  type="checkbox"
                  checked={ratingEnabled}
                  onChange={(e) => setRatingEnabled(e.target.checked)}
                />
                <span>Enable rating</span>
              </label>
              <div
                className={`detail-rating-slider ${
                  !ratingEnabled ? "detail-rating-disabled" : ""
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
                <span className="detail-rating-value">{rating}</span>
              </div>
              <button
                type="button"
                className="detail-rating-save"
                onClick={handleSaveRating}
                disabled={savingRating}
              >
                {savingRating ? "Saving..." : "Save Rating"}
              </button>
            </div>
            {ratingMessage && (
              <div className="detail-rating-message">{ratingMessage}</div>
            )}
          </div>

          <div className="detail-section">
            <h3>Prequel &amp; Sequel</h3>
            <div className="detail-linked-grid">
              {anime.prequel ? (
                <div className="detail-linked-block">
                  <div className="detail-linked-label">Prequel</div>
                  <AnimeCard
                    anime={anime.prequel}
                    className="detail-anime-card"
                  />
                </div>
              ) : (
                <div className="detail-linked-block detail-linked-empty">
                  <div className="detail-linked-label">Prequel</div>
                  <span className="detail-tags-empty">None linked</span>
                </div>
              )}

              {anime.sequel ? (
                <div className="detail-linked-block">
                  <div className="detail-linked-label">Sequel</div>
                  <AnimeCard
                    anime={anime.sequel}
                    className="detail-anime-card"
                  />
                </div>
              ) : (
                <div className="detail-linked-block detail-linked-empty">
                  <div className="detail-linked-label">Sequel</div>
                  <span className="detail-tags-empty">None linked</span>
                </div>
              )}
            </div>
          </div>

          {deleteError && (
            <div className="detail-delete-error">{deleteError}</div>
          )}
        </div>
      </div>
    </div>
  );
}
