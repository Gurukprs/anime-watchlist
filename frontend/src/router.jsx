import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "@pages/HomePage.jsx";
import SettingsPage from "@pages/SettingsPage.jsx";
import AnimeEntryPage from "@pages/AnimeEntryPage.jsx";
import SearchPage from "@pages/SearchPage.jsx";
import AnimeDetailPage from "@pages/AnimeDetailPage.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/anime/new" element={<AnimeEntryPage />} />
      <Route path="/anime/:id/edit" element={<AnimeEntryPage />} />
      <Route path="/anime/:id" element={<AnimeDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
  );
}
