import React from "react";
import { useNavigate } from "react-router-dom";
import "@styles/components/AnimeCard.css";

export default function AnimeCard({ anime, className = "" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Save current scroll position so Home can restore it later
    try {
      sessionStorage.setItem("homeScrollY", String(window.scrollY || 0));
    } catch {
      // ignore if sessionStorage not available
    }

    navigate(`/anime/${anime._id}`);
  };

  const imageUrl =
    anime.imageUrl && anime.imageUrl.trim().length > 0
      ? anime.imageUrl
      : null;

  return (
    <div className={`anime-card ${className}`} onClick={handleClick}>
      <div className="anime-card-image-wrapper">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={anime.name}
            className="anime-card-image"
            loading="lazy"
          />
        ) : (
          <div className="anime-card-image-placeholder">
            <span className="anime-card-placeholder-text">No Image</span>
          </div>
        )}
      </div>
      <div className="anime-card-name" title={anime.name}>
        {anime.name}
      </div>
    </div>
  );
}
