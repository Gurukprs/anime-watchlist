import React from "react";
import PageLayout from "@components/layout/PageLayout.jsx";
import AppRouter from "./router.jsx";

export default function App() {
  return (
    <PageLayout>
      <AppRouter />
    </PageLayout>
  );
}
