const express = require("express");
const { importMal } = require("../controllers/malImportController");

const router = express.Router();

router.post("/", importMal);

module.exports = router;
