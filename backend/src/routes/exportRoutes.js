const express = require("express");
const { exportAll, importAll } = require("../controllers/exportController");

const router = express.Router();

router.get("/", exportAll);
router.post("/", importAll);

module.exports = router;
