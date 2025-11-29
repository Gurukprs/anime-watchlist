import React, { useEffect, useState, useMemo } from "react";
import "@styles/pages/HomePage.css";
import animeApi from "@hooks/useAnimeApi";
import AnimeCardGrid from "@components/anime/AnimeCardGrid.jsx";
import Pagination from "@components/anime/Pagination.jsx";

const PAGE_LIMIT = 50; // 10 rows x 5 cards

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [animePage, setAnimePage] = useState(1);
  const [animeData, setAnimeData] = useState({
    items: [],
    totalPages: 1,
    total: 0
  });
  const [animeLoading, setAnimeLoading] = useState(false);
  const [animeError, setAnimeError] = useState("");

  // Fetch list categories on mount
  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");
        const data = await animeApi.getListCategories();
        if (cancelled) return;

        setCategories(data || []);

        // Prefer "Watching" as default, else first category
        let defaultCat = data?.find((c) => c.name === "Watching");
        if (!defaultCat && data && data.length > 0) {
          defaultCat = data[0];
        }
        if (defaultCat) {
          setSelectedCategoryId(defaultCat._id);
        }
      } catch (err) {
        if (!cancelled) {
          setCategoriesError(err.message || "Failed to load categories");
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // When category changes, reset page to 1
  useEffect(() => {
    setAnimePage(1);
  }, [selectedCategoryId]);

  // Fetch anime whenever selected category or page changes
  useEffect(() => {
    if (!selectedCategoryId) return;
    let cancelled = false;

    async function loadAnime() {
      try {
        setAnimeLoading(true);
        setAnimeError("");

        const data = await animeApi.getAnimeList({
          listCategoryId: selectedCategoryId,
          page: animePage,
          limit: PAGE_LIMIT
        });

        if (cancelled) return;

        setAnimeData({
          items: data.items || [],
          totalPages: data.totalPages || 1,
          total: data.total || 0
        });
      } catch (err) {
        if (!cancelled) {
          setAnimeError(err.message || "Failed to load anime list");
        }
      } finally {
        if (!cancelled) setAnimeLoading(false);
      }
    }

    loadAnime();

    return () => {
      cancelled = true;
    };
  }, [selectedCategoryId, animePage]);

  const currentCategory = useMemo(
    () => categories.find((c) => c._id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  const handleCategoryClick = (id) => {
    setSelectedCategoryId(id);
  };

  const handlePageChange = (page) => {
    setAnimePage(page);
    // scroll to top of content when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page page-home">
      <div className="home-header">
        <div className="home-title-block">
          <h2>Home</h2>
          {currentCategory && (
            <p className="home-subtitle">
              Viewing category: <span>{currentCategory.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Top nav bar for categories (only on this page) */}
      <div className="home-category-bar-wrapper">
        <div className="home-category-bar">
          {categoriesLoading && <span>Loading categories…</span>}
          {categoriesError && (
            <span className="home-error">{categoriesError}</span>
          )}
          {!categoriesLoading &&
            !categoriesError &&
            categories &&
            categories.length > 0 &&
            categories.map((cat) => {
              const active = cat._id === selectedCategoryId;
              return (
                <button
                  key={cat._id}
                  type="button"
                  className={`home-category-pill ${
                    active ? "home-category-pill-active" : ""
                  }`}
                  style={
                    active && cat.color
                      ? {
                          borderColor: cat.color,
                          boxShadow: `0 0 0 1px ${cat.color}`
                        }
                      : {}
                  }
                  onClick={() => handleCategoryClick(cat._id)}
                >
                  <span
                    className="home-category-dot"
                    style={{ backgroundColor: cat.color || "#3b82f6" }}
                  />
                  <span className="home-category-name">{cat.name}</span>
                </button>
              );
            })}

          {!categoriesLoading &&
            !categoriesError &&
            categories &&
            categories.length === 0 && (
              <span className="home-empty">
                No list categories found. Create them in Settings.
              </span>
            )}
        </div>
      </div>

      {/* Anime grid */}
      {animeError && <div className="home-error-block">{animeError}</div>}

      <AnimeCardGrid items={animeData.items} loading={animeLoading} />

      {/* Pagination */}
      <div className="home-pagination-wrapper">
        <Pagination
          page={animePage}
          totalPages={animeData.totalPages}
          onPageChange={handlePageChange}
        />
        {animeData.total > 0 && (
          <div className="home-pagination-meta">
            Total: {animeData.total} anime
          </div>
        )}
      </div>
    </div>
  );
}
