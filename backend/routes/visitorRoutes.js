const express = require("express");
const router = express.Router();

const {
  createVisitor,
  getVisitors,
  getVisitorById
} = require("../controllers/visitorController");

const authMiddleware = require("../middleware/autmiddleware");
const upload = require("../middleware/uploadMiddleware");

// Create visitor (with image)
router.post("/", authMiddleware, upload.single("photo"), createVisitor);

// Get all visitors
router.get("/", authMiddleware, getVisitors);

// Get visitor by ID
router.get("/:id", authMiddleware, getVisitorById);

module.exports = router;