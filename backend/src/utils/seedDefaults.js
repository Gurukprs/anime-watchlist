const ListCategory = require("../models/ListCategory");

const DEFAULT_CATEGORIES = [
  { name: "Plan to watch", color: "#3b82f6" }, // blue
  { name: "Selected", color: "#22c55e" },      // green
  { name: "Watching", color: "#eab308" },      // yellow
  { name: "Completed", color: "#a855f7" },     // purple
  { name: "On hold", color: "#f97316" },       // orange
  { name: "Dropped", color: "#ef4444" }        // red
];

async function seedDefaultListCategories() {
  const existing = await ListCategory.countDocuments();
  if (existing > 0) {
    return; // already seeded or user has custom categories
  }

  const docs = DEFAULT_CATEGORIES.map((cat, index) => ({
    ...cat,
    order: index,
    isDefault: true
  }));

  await ListCategory.insertMany(docs);
  console.log("✅ Seeded default list categories");
}

module.exports = {
  seedDefaultListCategories
};
