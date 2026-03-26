const mongoose = require("mongoose");

const passSchema = new mongoose.Schema({
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Visitor",
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  qrCode: String,
  validFrom: Date,
  validTo: Date,
  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active"
  }
}, { timestamps: true });

module.exports = mongoose.model("Pass", passSchema);