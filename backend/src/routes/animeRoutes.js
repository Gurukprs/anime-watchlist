const express = require("express");
const {
  getAnimes,
  getAnimeById,
  createAnime,
  updateAnime,
  deleteAnime
} = require("../controllers/animeController");

const router = express.Router();

router.get("/", getAnimes);
router.get("/:id", getAnimeById);
router.post("/", createAnime);
router.put("/:id", updateAnime);
router.delete("/:id", deleteAnime);

module.exports = router;
