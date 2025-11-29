import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "@styles/layout/Sidebar.css";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-burger"
          onClick={() => setCollapsed((c) => !c)}
        >
          ☰
        </button>
        {!collapsed && <span className="sidebar-title">Anime List</span>}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className="sidebar-link">
          Home
        </NavLink>
        <NavLink to="/anime/new" className="sidebar-link">
          Add Anime
        </NavLink>
        <NavLink to="/search" className="sidebar-link">
          Search
        </NavLink>
        <NavLink to="/settings" className="sidebar-link">
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}
