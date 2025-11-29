import React, { useEffect, useState } from "react";
import "@styles/pages/SearchPage.css";
import animeApi from "@hooks/useAnimeApi";
import TagFilter from "@components/anime/TagFilter.jsx";
import AnimeCardGrid from "@components/anime/AnimeCardGrid.jsx";
import Pagination from "@components/anime/Pagination.jsx";

const PAGE_LIMIT = 50; // 10 rows x 5 cards, consistent with Home

export default function SearchPage() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");

  // Filters
  const [q, setQ] = useState("");
  const [listCategoryId, setListCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [tagMode, setTagMode] = useState("or"); // "or" | "and"
  const [searchMode, setSearchMode] = useState("tags-name"); // "tags-name" | "tags-only"

  // Results
  const [page, setPage] = useState(1);
  const [results, setResults] = useState({
    items: [],
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load categories & tags on mount
  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      try {
        setMetaLoading(true);
        setMetaError("");

        const [catData, tagData] = await Promise.all([
          animeApi.getListCategories(),
          animeApi.getTags()
        ]);

        if (cancelled) return;
        setCategories(catData || []);
        setTags(tagData || []);
      } catch (err) {
        if (!cancelled) {
          setMetaError(err.message || "Failed to load filters");
        }
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    }

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build params object for search API
  const buildParams = (pageOverride) => {
    const params = {
      page: pageOverride,
      limit: PAGE_LIMIT,
      tagMode,
      listCategoryId: listCategoryId || undefined,
      tags:
        selectedTagIds && selectedTagIds.length > 0
          ? selectedTagIds.join(",")
          : undefined
    };

    if (searchMode === "tags-name") {
      const trimmed = q.trim();
      if (trimmed.length > 0) {
        params.q = trimmed;
      }
    }
    // if "tags-only", we intentionally do NOT send q

    return params;
  };

  const runSearch = async (pageOverride = 1) => {
    try {
      setLoading(true);
      setError("");
      const params = buildParams(pageOverride);
      const data = await animeApi.searchAnime(params);

      setResults({
        items: data.items || [],
        total: data.total || 0,
        totalPages: data.totalPages || 1
      });
      setPage(pageOverride);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Initial search: show everything
  useEffect(() => {
    // Only run once metadata is done loading (so we don't show errors too early)
    if (!metaLoading) {
      runSearch(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(1);
  };

  const handlePageChange = (newPage) => {
    runSearch(newPage);
  };

  const handleCategoryChange = (e) => {
    setListCategoryId(e.target.value);
  };

  const handleTagModeChange = (mode) => {
    setTagMode(mode);
  };

  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
  };

  return (
    <div className="page page-search">
      <div className="search-header">
        <h2>Search</h2>
        <p className="search-subtitle">
          Search across all list categories and filter by tags.
        </p>
      </div>

      {metaLoading && <div className="search-info">Loading filters…</div>}
      {metaError && <div className="search-error">{metaError}</div>}

      {/* Search form */}
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-row-main">
          <div className="search-text-block">
            <label className="search-label">
              Search text
              <input
                type="text"
                className="search-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Anime name or description…"
                disabled={searchMode === "tags-only"}
              />
            </label>
          </div>

          <div className="search-mode-toggle">
            <span className="search-mode-label">Search mode</span>
            <div className="search-mode-pill-group">
              <button
                type="button"
                className={`search-mode-pill ${
                  searchMode === "tags-name" ? "search-mode-pill-active" : ""
                }`}
                onClick={() => handleSearchModeChange("tags-name")}
              >
                Tags + Name
              </button>
              <button
                type="button"
                className={`search-mode-pill ${
                  searchMode === "tags-only" ? "search-mode-pill-active" : ""
                }`}
                onClick={() => handleSearchModeChange("tags-only")}
              >
                Tags Only
              </button>
            </div>
          </div>

          <div className="search-category-block">
            <label className="search-label">
              List category
              <select
                className="search-select"
                value={listCategoryId}
                onChange={handleCategoryChange}
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="search-submit-block">
            <button
              type="submit"
              className="search-submit-btn"
              disabled={loading}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>

        {/* Tag filter row */}
        <div className="search-row-tags">
          <TagFilter
            tags={tags}
            selectedTagIds={selectedTagIds}
            onChangeSelected={setSelectedTagIds}
            tagMode={tagMode}
            onChangeTagMode={handleTagModeChange}
          />
        </div>
      </form>

      {/* Results */}
      {error && <div className="search-error search-error-below">{error}</div>}

      <AnimeCardGrid items={results.items} loading={loading} />

      <div className="search-pagination-row">
        <Pagination
          page={page}
          totalPages={results.totalPages}
          onPageChange={handlePageChange}
        />
        {results.total > 0 && (
          <div className="search-result-meta">
            {results.total} anime found
            {listCategoryId && " in selected category"}
          </div>
        )}
      </div>
    </div>
  );
}
