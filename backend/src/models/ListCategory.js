const mongoose = require("mongoose");

const listCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    color: {
      type: String,
      default: "#3b82f6" // blue-ish; you can change per category
    },
    order: {
      type: Number,
      default: 0 // used to sort categories in UI
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ListCategory", listCategorySchema);
