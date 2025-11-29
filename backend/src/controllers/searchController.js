const Anime = require("../models/Anime");

// GET /api/search?q=&tags=&tagMode=and|or&listCategoryId=&page=&limit=
async function searchAnime(req, res) {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "50", 10);
    const skip = (page - 1) * limit;

    const { q, listCategoryId, tags, tagMode } = req.query;

    const filter = {};

    if (listCategoryId) {
      filter.listCategory = listCategoryId;
    }

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ name: regex }, { description: regex }];
    }

    if (tags) {
      const tagIds = tags.split(",").filter(Boolean);
      if (tagIds.length > 0) {
        if (tagMode === "and") {
          filter.tags = { $all: tagIds };
        } else {
          filter.tags = { $in: tagIds };
        }
      }
    }

    const [items, total] = await Promise.all([
      Anime.find(filter)
        .populate("listCategory")
        .populate("tags")
        .populate("prequel")
        .populate("sequel")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Anime.countDocuments(filter)
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error("searchAnime error:", err);
    res.status(500).json({ message: "Failed to search anime" });
  }
}

module.exports = {
  searchAnime
};
