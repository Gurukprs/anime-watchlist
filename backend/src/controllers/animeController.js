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

// Helper: keep prequel / sequel mutual links in sync
async function syncLinkedAnimeRelations(anime, oldPrequelId = null, oldSequelId = null) {
  if (!anime || !anime._id) return;

  const id = anime._id.toString();
  const newPrequelId = anime.prequel ? anime.prequel.toString() : null;
  const newSequelId = anime.sequel ? anime.sequel.toString() : null;

  // --- PREQUEL handling ---

  // If old prequel changed or was removed, clear its sequel if it pointed to this anime
  if (oldPrequelId && oldPrequelId !== newPrequelId) {
    await Anime.updateOne(
      { _id: oldPrequelId, sequel: id },
      { $set: { sequel: null } }
    );
  }

  // If there is a new prequel, make sure that anime's sequel points to this one
  if (newPrequelId && newPrequelId !== id) {
    await Anime.updateOne(
      { _id: newPrequelId },
      { $set: { sequel: id } }
    );
  }

  // --- SEQUEL handling ---

  // If old sequel changed or was removed, clear its prequel if it pointed to this anime
  if (oldSequelId && oldSequelId !== newSequelId) {
    await Anime.updateOne(
      { _id: oldSequelId, prequel: id },
      { $set: { prequel: null } }
    );
  }

  // If there is a new sequel, make sure that anime's prequel points to this one
  if (newSequelId && newSequelId !== id) {
    await Anime.updateOne(
      { _id: newSequelId },
      { $set: { prequel: id } }
    );
  }
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

    // New anime has no old prequel/sequel, so pass nulls
    await syncLinkedAnimeRelations(anime, null, null);

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

    // Remember old links for cleanup
    const oldPrequelId = anime.prequel ? anime.prequel.toString() : null;
    const oldSequelId = anime.sequel ? anime.sequel.toString() : null;

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

    // Sync prequel / sequel from old to new
    await syncLinkedAnimeRelations(anime, oldPrequelId, oldSequelId);

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

    const animeId = anime._id.toString();
    const prequelId = anime.prequel ? anime.prequel.toString() : null;
    const sequelId = anime.sequel ? anime.sequel.toString() : null;

    // Delete this anime
    await Anime.findByIdAndDelete(id);

    // Clean up linked relations if they pointed to this anime
    if (prequelId) {
      await Anime.updateOne(
        { _id: prequelId, sequel: animeId },
        { $set: { sequel: null } }
      );
    }

    if (sequelId) {
      await Anime.updateOne(
        { _id: sequelId, prequel: animeId },
        { $set: { prequel: null } }
      );
    }

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
