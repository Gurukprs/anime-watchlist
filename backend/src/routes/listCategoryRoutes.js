const express = require("express");
const {
  getListCategories,
  createListCategory,
  updateListCategory,
  deleteListCategory
} = require("../controllers/listCategoryController");

const router = express.Router();

router.get("/", getListCategories);
router.post("/", createListCategory);
router.put("/:id", updateListCategory);
router.delete("/:id", deleteListCategory);

module.exports = router;
