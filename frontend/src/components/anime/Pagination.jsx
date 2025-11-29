import React from "react";
import "@styles/components/Pagination.css";

function getPageNumbers(current, total) {
  // Simple: show up to 7 pages around current
  const maxButtons = 7;
  if (total <= maxButtons) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, current + half);

  if (end - start + 1 < maxButtons) {
    if (start === 1) {
      end = Math.min(total, start + maxButtons - 1);
    } else if (end === total) {
      start = Math.max(1, end - maxButtons + 1);
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="pagination">
      <button
        className="pagination-nav"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ‹
      </button>

      {pages[0] > 1 && (
        <>
          <button
            className={`pagination-page ${
              page === 1 ? "pagination-page-active" : ""
            }`}
            onClick={() => onPageChange(1)}
          >
            <span className="pagination-circle">1</span>
          </button>
          {pages[0] > 2 && <span className="pagination-ellipsis">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`pagination-page ${
            p === page ? "pagination-page-active" : ""
          }`}
          onClick={() => onPageChange(p)}
        >
          <span className="pagination-circle">{p}</span>
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="pagination-ellipsis">…</span>
          )}
          <button
            className={`pagination-page ${
              page === totalPages ? "pagination-page-active" : ""
            }`}
            onClick={() => onPageChange(totalPages)}
          >
            <span className="pagination-circle">{totalPages}</span>
          </button>
        </>
      )}

      <button
        className="pagination-nav"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        ›
      </button>
    </div>
  );
}
