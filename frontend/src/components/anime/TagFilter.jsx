import React from "react";
import "@styles/components/TagFilter.css";

export default function TagFilter({
  tags,
  selectedTagIds,
  onChangeSelected,
  tagMode,
  onChangeTagMode
}) {
  const toggleTag = (id) => {
    if (!selectedTagIds || selectedTagIds.length === 0) {
      onChangeSelected([id]);
      return;
    }
    if (selectedTagIds.includes(id)) {
      onChangeSelected(selectedTagIds.filter((t) => t !== id));
    } else {
      onChangeSelected([...selectedTagIds, id]);
    }
  };

  return (
    <div className="tag-filter">
      <div className="tag-filter-header">
        <span className="tag-filter-title">Tags</span>
        <div className="tag-filter-mode-toggle">
          <button
            type="button"
            className={`tag-mode-btn ${
              tagMode === "or" ? "tag-mode-btn-active" : ""
            }`}
            onClick={() => onChangeTagMode("or")}
          >
            Any
          </button>
          <button
            type="button"
            className={`tag-mode-btn ${
              tagMode === "and" ? "tag-mode-btn-active" : ""
            }`}
            onClick={() => onChangeTagMode("and")}
          >
            All
          </button>
        </div>
      </div>
      <div className="tag-filter-list">
        {tags && tags.length > 0 ? (
          tags.map((tag) => {
            const active = selectedTagIds?.includes(tag._id);
            return (
              <button
                key={tag._id}
                type="button"
                className={`tag-chip ${active ? "tag-chip-active" : ""}`}
                style={
                  active && tag.color
                    ? { borderColor: tag.color, boxShadow: `0 0 0 1px ${tag.color}` }
                    : {}
                }
                onClick={() => toggleTag(tag._id)}
              >
                <span className="tag-dot" style={{ backgroundColor: tag.color }} />
                <span>{tag.name}</span>
              </button>
            );
          })
        ) : (
          <span className="tag-filter-empty">No tags defined yet.</span>
        )}
      </div>
    </div>
  );
}
