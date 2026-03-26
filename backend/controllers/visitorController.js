const Visitor = require("../models/Visitor");

// CREATE a new visitor record
exports.createVisitor = async (req, res) => {
  try {
    const { name, phone, email, idProof } = req.body;

    // Name is the only field we absolutely require
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Visitor name is required" });
    }

    // Phone validation - if provided, it should be a number
    if (phone && !/^\d{7,15}$/.test(phone.replace(/\s/g, ""))) {
      return res.status(400).json({ message: "Enter a valid phone number (digits only)" });
    }

    // Email validation - if provided, check format
    if (email && !email.includes("@")) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    // If a photo was uploaded via multer, req.file will have the path
    const visitor = await Visitor.create({
      name: name.trim(),
      phone,
      email,
      idProof,
      photo: req.file ? req.file.path : null
    });

    res.status(201).json(visitor);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all visitors, newest first
exports.getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET a single visitor by their MongoDB ID
exports.getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};