// Express server entry

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Anime Watchlist API running" });
});

// TODO: plug in real routes
// const animeRoutes = require("./routes/animeRoutes");
// const tagRoutes = require("./routes/tagRoutes");
// const listCategoryRoutes = require("./routes/listCategoryRoutes");
// const searchRoutes = require("./routes/searchRoutes");

// app.use("/api/anime", animeRoutes);
// app.use("/api/tags", tagRoutes);
// app.use("/api/list-categories", listCategoryRoutes);
// app.use("/api/search", searchRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
