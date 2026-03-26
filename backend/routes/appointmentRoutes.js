const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAppointments,
  approveAppointment,
  rejectAppointment
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/autmiddleware");
const roleMiddleware = require("../middleware/rolemiddleware");
  
// Create appointment (any logged-in user)
router.post("/", authMiddleware, createAppointment);

// Get all appointments
router.get("/", authMiddleware, getAppointments);

// Approve (only employee/host)
router.put("/approve/:id", authMiddleware, roleMiddleware("employee"), approveAppointment);

// Reject
router.put("/reject/:id", authMiddleware, roleMiddleware("employee"), rejectAppointment);

module.exports = router;