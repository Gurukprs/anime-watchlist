const ListCategory = require("../models/ListCategory");
const Anime = require("../models/Anime");

// GET /api/list-categories
async function getListCategories(req, res) {
  try {
    const categories = await ListCategory.find().sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    console.error("getListCategories error:", err);
    res.status(500).json({ message: "Failed to fetch list categories" });
  }
}

// POST /api/list-categories
async function createListCategory(req, res) {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const existing = await ListCategory.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "List category with this name already exists" });
    }

    const maxOrderDoc = await ListCategory.findOne().sort({ order: -1 });
    const nextOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 0;

    const category = await ListCategory.create({
      name,
      color: color || "#3b82f6",
      order: nextOrder,
      isDefault: false
    });

    res.status(201).json(category);
  } catch (err) {
    console.error("createListCategory error:", err);
    res.status(500).json({ message: "Failed to create list category" });
  }
}

// PUT /api/list-categories/:id
async function updateListCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, color, order } = req.body;

    const category = await ListCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "List category not found" });
    }

    if (name !== undefined) category.name = name;
    if (color !== undefined) category.color = color;
    if (order !== undefined) category.order = order;

    await category.save();
    res.json(category);
  } catch (err) {
    console.error("updateListCategory error:", err);
    res.status(500).json({ message: "Failed to update list category" });
  }
}

// DELETE /api/list-categories/:id
async function deleteListCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await ListCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "List category not found" });
    }

    if (category.isDefault) {
      return res
        .status(400)
        .json({ message: "Cannot delete default list categories" });
    }

    const animeUsing = await Anime.countDocuments({ listCategory: id });
    if (animeUsing > 0) {
      return res.status(400).json({
        message: "Cannot delete category that is used by anime. Move them first."
      });
    }

    await ListCategory.findByIdAndDelete(id);
    res.json({ message: "List category deleted" });
  } catch (err) {
    console.error("deleteListCategory error:", err);
    res.status(500).json({ message: "Failed to delete list category" });
  }
}

module.exports = {
  getListCategories,
  createListCategory,
  updateListCategory,
  deleteListCategory
};
