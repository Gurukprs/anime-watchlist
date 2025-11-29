import React from "react";
import Sidebar from "./Sidebar.jsx";
import TopNav from "./TopNav.jsx";
import "@styles/layout/PageLayout.css";

export default function PageLayout({ children }) {
  return (
    <div className="layout-root">
      <Sidebar />
      <div className="layout-main">
        <TopNav />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}
