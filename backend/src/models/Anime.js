const mongoose = require("mongoose");

const { Schema } = mongoose;

const animeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    listCategory: {
      type: Schema.Types.ObjectId,
      ref: "ListCategory",
      required: true
    },
    imageUrl: {
      type: String,
      default: ""
    },
    watchLink: {
      type: String,
      default: ""
    },
    censorship: {
      type: String,
      default: "Unrated" // you can use any text, plus custom via settings later
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag"
      }
    ],
    dubSub: {
      type: String,
      enum: ["Sub", "Dub", "Both"],
      default: "Sub"
    },
    rating: {
      type: Number,
      min: 1,
      max: 10
    },
    // For linking between anime
    prequel: {
      type: Schema.Types.ObjectId,
      ref: "Anime",
      default: null
    },
    sequel: {
      type: Schema.Types.ObjectId,
      ref: "Anime",
      default: null
    },
    // Optional field for ordering inside a list category
    sequenceIndex: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Anime", animeSchema);
