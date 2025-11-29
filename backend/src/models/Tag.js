const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    color: {
      type: String,
      default: "#9aa0b5" // muted gray by default
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", tagSchema);
