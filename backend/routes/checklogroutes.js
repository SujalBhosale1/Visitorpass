const express = require("express");
const router = express.Router();
const { checkIn, checkOut, getLogs } = require("../controllers/Checklogcontroller");
const authMiddleware = require("../middleware/autmiddleware");

// Check-in via QR scan
router.post("/check-in", authMiddleware, checkIn);

// Check-out via QR scan
router.post("/check-out", authMiddleware, checkOut);

// Get all check logs
router.get("/", authMiddleware, getLogs);

module.exports = router;