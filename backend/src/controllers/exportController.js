const ListCategory = require("../models/ListCategory");
const Tag = require("../models/Tag");
const Anime = require("../models/Anime");

// GET /api/export
// Export all list categories, tags, and anime
async function exportAll(req, res) {
  try {
    const [categories, tags, anime] = await Promise.all([
      ListCategory.find().lean(),
      Tag.find().lean(),
      Anime.find().lean()
    ]);

    res.json({
      exportedAt: new Date().toISOString(),
      version: 1,
      categories,
      tags,
      anime
    });
  } catch (err) {
    console.error("exportAll error:", err);
    res.status(500).json({ message: "Failed to export data" });
  }
}

// POST /api/export?mode=replace
// Import data (by default REPLACES existing collections)
async function importAll(req, res) {
  try {
    const { categories, tags, anime } = req.body || {};
    const mode = (req.query.mode || "replace").toLowerCase();

    if (!Array.isArray(categories) || !Array.isArray(tags) || !Array.isArray(anime)) {
      return res.status(400).json({
        message:
          "Invalid import payload. Expected { categories: [], tags: [], anime: [] }"
      });
    }

    if (mode !== "replace") {
      return res.status(400).json({
        message: "Only mode=replace is supported currently"
      });
    }

    // Replace mode: wipe existing data first
    await Promise.all([
      Anime.deleteMany({}),
      Tag.deleteMany({}),
      ListCategory.deleteMany({})
    ]);

    // Insert in correct order
    if (categories.length > 0) {
      await ListCategory.insertMany(categories);
    }
    if (tags.length > 0) {
      await Tag.insertMany(tags);
    }
    if (anime.length > 0) {
      await Anime.insertMany(anime);
    }

    res.json({
      message: "Import completed (replace mode)",
      counts: {
        categories: categories.length,
        tags: tags.length,
        anime: anime.length
      }
    });
  } catch (err) {
    console.error("importAll error:", err);
    res.status(500).json({ message: "Failed to import data" });
  }
}

module.exports = {
  exportAll,
  importAll
};
