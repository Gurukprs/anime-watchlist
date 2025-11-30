import React, { useEffect, useState, useMemo } from "react";
import "@styles/pages/HomePage.css";
import animeApi from "@hooks/useAnimeApi";
import AnimeCardGrid from "@components/anime/AnimeCardGrid.jsx";
import Pagination from "@components/anime/Pagination.jsx";

const PAGE_LIMIT = 50; // 10 rows x 5 cards

export default function HomePage() {
  // Load initial category/page from sessionStorage (if present)
  const [selectedCategoryId, setSelectedCategoryId] = useState(() => {
    try {
      const raw = sessionStorage.getItem("homeState");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.categoryId || null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [animePage, setAnimePage] = useState(() => {
    try {
      const raw = sessionStorage.getItem("homeState");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.page || 1;
      }
    } catch {
      // ignore
    }
    return 1;
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [animeData, setAnimeData] = useState({
    items: [],
    totalPages: 1,
    total: 0
  });
  const [animeLoading, setAnimeLoading] = useState(false);
  const [animeError, setAnimeError] = useState("");

  // Persist category + page whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "homeState",
        JSON.stringify({
          categoryId: selectedCategoryId,
          page: animePage
        })
      );
    } catch {
      // ignore
    }
  }, [selectedCategoryId, animePage]);

  // Fetch categories once
  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");
        const data = await animeApi.getListCategories();
        if (cancelled) return;

        setCategories(data || []);

        // If we didn't restore anything, choose a default
        if (!selectedCategoryId) {
          let defaultCat = data?.find((c) => c.name === "Watching");
          if (!defaultCat && data && data.length > 0) {
            defaultCat = data[0];
          }
          if (defaultCat) {
            setSelectedCategoryId(defaultCat._id);
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // After anime finishes loading, restore scrollY if we have one saved
  useEffect(() => {
    if (animeLoading) return;
    try {
      const raw = sessionStorage.getItem("homeScrollY");
      if (!raw) return;
      const y = Number(raw);
      if (!Number.isNaN(y)) {
        window.scrollTo(0, y);
      }
      sessionStorage.removeItem("homeScrollY");
    } catch {
      // ignore
    }
  }, [animeLoading]);

  const currentCategory = useMemo(
    () => categories.find((c) => c._id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  const handleCategoryClick = (id) => {
    setSelectedCategoryId(id);
    setAnimePage(1); // when user changes category, reset to page 1
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page) => {
    setAnimePage(page);
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
