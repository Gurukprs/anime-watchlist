import React from "react";
import AnimeCard from "./AnimeCard.jsx";
import "@styles/components/AnimeCardGrid.css";

export default function AnimeCardGrid({ items, loading }) {
  if (loading) {
    return (
      <div className="anime-grid-loading">
        <div className="spinner" />
        <span>Loading anime...</span>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="anime-grid-empty">
        <p>No anime found in this category yet.</p>
        <p className="hint">Use "Add Anime" to insert your first entry.</p>
      </div>
    );
  }

  return (
    <div className="anime-grid">
      {items.map((anime) => (
        <AnimeCard key={anime._id} anime={anime} />
      ))}
    </div>
  );
}
