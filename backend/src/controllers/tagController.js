const Tag = require("../models/Tag");

// GET /api/tags
async function getTags(req, res) {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (err) {
    console.error("getTags error:", err);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
}

// POST /api/tags
async function createTag(req, res) {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const existing = await Tag.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Tag with this name already exists" });
    }

    const tag = await Tag.create({
      name,
      color: color || "#9aa0b5"
    });

    res.status(201).json(tag);
  } catch (err) {
    console.error("createTag error:", err);
    res.status(500).json({ message: "Failed to create tag" });
  }
}

// PUT /api/tags/:id
async function updateTag(req, res) {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    if (name !== undefined) tag.name = name;
    if (color !== undefined) tag.color = color;

    await tag.save();
    res.json(tag);
  } catch (err) {
    console.error("updateTag error:", err);
    res.status(500).json({ message: "Failed to update tag" });
  }
}

// DELETE /api/tags/:id
async function deleteTag(req, res) {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    await Tag.findByIdAndDelete(id);
    res.json({ message: "Tag deleted" });
  } catch (err) {
    console.error("deleteTag error:", err);
    res.status(500).json({ message: "Failed to delete tag" });
  }
}

module.exports = {
  getTags,
  createTag,
  updateTag,
  deleteTag
};
