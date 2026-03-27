const CheckLog = require("../models/Checklog");
const Pass = require("../models/Pass");

exports.checkIn = async (req, res) => {
  try {
    const { passId } = req.body;

    if (!passId) {
      return res.status(400).json({ message: "Pass ID is required" });
    }

    const pass = await Pass.findById(passId);
    if (!pass) {
      return res.status(404).json({ message: "Pass not found" });
    }

    // reject if pass is expired
    if (new Date() > new Date(pass.validTo)) {
      return res.status(400).json({ message: "This pass has expired" });
    }

    // check if already checked in (open log = no checkout yet)
    const open = await CheckLog.findOne({ passId, checkOutTime: null });
    if (open) {
      return res.status(400).json({ message: "Already checked in" });
    }

    const log = await CheckLog.create({ passId, checkInTime: new Date() });
    res.json({ message: "Check-in successful", log });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { passId } = req.body;

    if (!passId) {
      return res.status(400).json({ message: "Pass ID is required" });
    }

    // find the open check-in for this pass
    const log = await CheckLog.findOne({ passId, checkOutTime: null });
    if (!log) {
      return res.status(400).json({ message: "No active check-in found" });
    }

    log.checkOutTime = new Date();
    await log.save();

    res.json({ message: "Check-out successful", log });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await CheckLog.find().populate("passId").sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};