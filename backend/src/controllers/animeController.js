const Anime = require("../models/Anime");

// Helper to build filter from query params
function buildAnimeFilter(query) {
  const { listCategoryId, search, tags, tagMode } = query;
  const filter = {};

  if (listCategoryId) {
    filter.listCategory = listCategoryId;
  }

  if (search) {
    const regex = new RegExp(search, "i");
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

  return filter;
}

// GET /api/anime
async function getAnimes(req, res) {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "50", 10); // 50 per page matches 5x10 grid
    const skip = (page - 1) * limit;

    const filter = buildAnimeFilter(req.query);

    const [items, total] = await Promise.all([
      Anime.find(filter)
        .populate("listCategory")
        .populate("tags")
        .populate("prequel")
        .populate("sequel")
        .sort({ sequenceIndex: 1, createdAt: -1 })
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
    console.error("getAnimes error:", err);
    res.status(500).json({ message: "Failed to fetch anime list" });
  }
}

// GET /api/anime/:id
async function getAnimeById(req, res) {
  try {
    const { id } = req.params;
    const anime = await Anime.findById(id)
      .populate("listCategory")
      .populate("tags")
      .populate("prequel")
      .populate("sequel");

    if (!anime) {
      return res.status(404).json({ message: "Anime not found" });
    }

    res.json(anime);
  } catch (err) {
    console.error("getAnimeById error:", err);
    res.status(500).json({ message: "Failed to fetch anime" });
  }
}

// POST /api/anime
async function createAnime(req, res) {
  try {
    const {
      name,
      description,
      listCategoryId,
      imageUrl,
      watchLink,
      censorship,
      tagIds,
      dubSub,
      rating,
      prequelId,
      sequelId,
      sequenceIndex
    } = req.body;

    if (!name || !listCategoryId) {
      return res
        .status(400)
        .json({ message: "Name and listCategoryId are required" });
    }

    const anime = await Anime.create({
      name,
      description: description || "",
      listCategory: listCategoryId,
      imageUrl: imageUrl || "",
      watchLink: watchLink || "",
      censorship: censorship || "Unrated",
      tags: Array.isArray(tagIds) ? tagIds : [],
      dubSub: dubSub || "Sub",
      rating: rating || undefined,
      prequel: prequelId || null,
      sequel: sequelId || null,
      sequenceIndex: sequenceIndex || 0
    });

    const populated = await Anime.findById(anime._id)
      .populate("listCategory")
      .populate("tags")
      .populate("prequel")
      .populate("sequel");

    res.status(201).json(populated);
  } catch (err) {
    console.error("createAnime error:", err);
    res.status(500).json({ message: "Failed to create anime" });
  }
}

// PUT /api/anime/:id
async function updateAnime(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      listCategoryId,
      imageUrl,
      watchLink,
      censorship,
      tagIds,
      dubSub,
      rating,
      prequelId,
      sequelId,
      sequenceIndex
    } = req.body;

    const anime = await Anime.findById(id);
    if (!anime) {
      return res.status(404).json({ message: "Anime not found" });
    }

    if (name !== undefined) anime.name = name;
    if (description !== undefined) anime.description = description;
    if (listCategoryId !== undefined) anime.listCategory = listCategoryId;
    if (imageUrl !== undefined) anime.imageUrl = imageUrl;
    if (watchLink !== undefined) anime.watchLink = watchLink;
    if (censorship !== undefined) anime.censorship = censorship;
    if (Array.isArray(tagIds)) anime.tags = tagIds;
    if (dubSub !== undefined) anime.dubSub = dubSub;
    if (rating !== undefined) anime.rating = rating;
    if (prequelId !== undefined) anime.prequel = prequelId || null;
    if (sequelId !== undefined) anime.sequel = sequelId || null;
    if (sequenceIndex !== undefined) anime.sequenceIndex = sequenceIndex;

    await anime.save();

    const populated = await Anime.findById(anime._id)
      .populate("listCategory")
      .populate("tags")
      .populate("prequel")
      .populate("sequel");

    res.json(populated);
  } catch (err) {
    console.error("updateAnime error:", err);
    res.status(500).json({ message: "Failed to update anime" });
  }
}

// DELETE /api/anime/:id
async function deleteAnime(req, res) {
  try {
    const { id } = req.params;

    const anime = await Anime.findById(id);
    if (!anime) {
      return res.status(404).json({ message: "Anime not found" });
    }

    await Anime.findByIdAndDelete(id);
    res.json({ message: "Anime deleted" });
  } catch (err) {
    console.error("deleteAnime error:", err);
    res.status(500).json({ message: "Failed to delete anime" });
  }
}

module.exports = {
  getAnimes,
  getAnimeById,
  createAnime,
  updateAnime,
  deleteAnime
};
