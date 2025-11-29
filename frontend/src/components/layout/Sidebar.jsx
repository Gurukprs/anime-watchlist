import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "@styles/layout/Sidebar.css";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/anime/new", label: "Add Anime", icon: "➕" },
  { to: "/search", label: "Search", icon: "🔍" },
  { to: "/settings", label: "Settings", icon: "⚙️" }
];

export default function Sidebar() {
  // Default collapsed
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-burger"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          ☰
        </button>
        {!collapsed && <span className="sidebar-title">Anime List</span>}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="sidebar-link"
          >
            <div className="sidebar-link-inner">
              <span className="sidebar-link-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="sidebar-link-text">{item.label}</span>
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
