const express = require("express");
const {
  getTags,
  createTag,
  updateTag,
  deleteTag
} = require("../controllers/tagController");

const router = express.Router();

router.get("/", getTags);
router.post("/", createTag);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);

module.exports = router;
