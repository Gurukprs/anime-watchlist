const express = require("express");
const { searchAnime } = require("../controllers/searchController");

const router = express.Router();

router.get("/", searchAnime);

module.exports = router;
