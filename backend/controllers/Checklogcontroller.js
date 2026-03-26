const CheckLog = require("../models/Checklog");
const Pass = require("../models/Pass");

// CHECK-IN a visitor using their pass
// The flow is: validate passId → find the pass → check validity → log the check-in
exports.checkIn = async (req, res) => {
  try {
    const { passId } = req.body;

    // Make sure a pass ID was actually sent
    if (!passId) {
      return res.status(400).json({ message: "Pass ID is required" });
    }

    // Step 1: Find the pass in the database
    const pass = await Pass.findById(passId);
    if (!pass) {
      return res.status(404).json({ message: "No pass found with this ID" });
    }

    // Step 2: Check if the pass is still within its valid date range
    const now = new Date();
    if (now > new Date(pass.validTo)) {
      return res.status(400).json({ message: "This pass has expired and cannot be used" });
    }

    // Step 3: Check if the visitor has already checked in (and hasn't checked out yet)
    // We look for a log entry for this pass where checkOutTime is still null
    const alreadyCheckedIn = await CheckLog.findOne({
      passId,
      checkOutTime: null
    });

    if (alreadyCheckedIn) {
      return res.status(400).json({ message: "This visitor is already checked in" });
    }

    // Step 4: Create the check-in log entry
    const log = await CheckLog.create({
      passId,
      checkInTime: now
    });

    res.json({ message: "Check-in recorded successfully", log });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CHECK-OUT a visitor
// We find the open check-in log (one without a checkout time) and close it
exports.checkOut = async (req, res) => {
  try {
    const { passId } = req.body;

    if (!passId) {
      return res.status(400).json({ message: "Pass ID is required" });
    }

    // Find the open log entry - checkOutTime being null means they are still inside
    const openLog = await CheckLog.findOne({
      passId,
      checkOutTime: null
    });

    if (!openLog) {
      return res.status(400).json({ message: "No active check-in found for this pass" });
    }

    // Set checkout time to now and save it
    openLog.checkOutTime = new Date();
    await openLog.save();

    res.json({ message: "Check-out recorded successfully", log: openLog });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all check-in/out logs, newest first
exports.getLogs = async (req, res) => {
  try {
    const logs = await CheckLog.find()
      .populate("passId")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};