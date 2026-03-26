const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    // visitor = someone who registers themselves
    // employee = staff who can invite and approve visitors
    // security = frontdesk, scans QR codes
    // admin = full system access
    enum: ["visitor", "employee", "security", "admin"],
    default: "employee"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);