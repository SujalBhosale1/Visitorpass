const express = require("express");
const router = express.Router();
const { generatePass, getAllPasses, getPass } = require("../controllers/passController");
const authMiddleware = require("../middleware/autmiddleware");

// Generate a new pass
router.post("/generate", authMiddleware, generatePass);

// Get all passes
router.get("/", authMiddleware, getAllPasses);

// Get a specific pass by ID
router.get("/:id", authMiddleware, getPass);

module.exports = router;