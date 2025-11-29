// Express server entry

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { seedDefaultListCategories } = require("./utils/seedDefaults");
const exportRoutes = require("./routes/exportRoutes");

// Load env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB and seed defaults (non-blocking for the server)
connectDB()
  .then(() => {
    seedDefaultListCategories().catch((err) =>
      console.error("Seed defaults error:", err)
    );
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const animeRoutes = require("./routes/animeRoutes");
const tagRoutes = require("./routes/tagRoutes");
const listCategoryRoutes = require("./routes/listCategoryRoutes");
const searchRoutes = require("./routes/searchRoutes");

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Anime Watchlist API running" });
});

app.use("/api/anime", animeRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/list-categories", listCategoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/export", exportRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
