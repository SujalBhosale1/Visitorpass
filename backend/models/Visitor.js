const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: String,
  email: String,
  photo: String,     
  idProof: String   
}, { timestamps: true });

module.exports = mongoose.model("Visitor", visitorSchema);