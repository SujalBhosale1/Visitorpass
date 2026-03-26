// seed.js - Run this to populate the database with sample data for testing
// Usage: node seed.js
// This will create sample users, a visitor, an appointment, and a pass

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/Users");
const Visitor = require("./models/Visitor");
const Appointment = require("./models/Appointment");
const Pass = require("./models/Pass");
const QRCode = require("qrcode");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data so we start fresh each time
    await User.deleteMany({});
    await Visitor.deleteMany({});
    await Appointment.deleteMany({});
    await Pass.deleteMany({});
    console.log("Cleared old data");

    // Create sample users
    // We hash passwords the same way the register function does
    const hashedPass = await bcrypt.hash("password123", 10);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPass,
      role: "admin"
    });

    const employee = await User.create({
      name: "Ravi Sharma",
      email: "ravi@example.com",
      password: hashedPass,
      role: "employee"
    });

    const security = await User.create({
      name: "Guard Singh",
      email: "guard@example.com",
      password: hashedPass,
      role: "security"
    });

    console.log("Created users: admin, employee, security");

    // Create a sample visitor
    const visitor = await Visitor.create({
      name: "Anjali Patel",
      phone: "9876543210",
      email: "anjali@example.com",
      idProof: "Aadhaar"
    });

    console.log("Created visitor:", visitor.name);

    // Create an approved appointment
    const appointment = await Appointment.create({
      visitorId: visitor._id,
      hostId: employee._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      status: "approved"
    });

    console.log("Created appointment (approved):", appointment._id);

    // Create a pass for this appointment
    const pass = await Pass.create({
      visitorId: visitor._id,
      appointmentId: appointment._id,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days
      qrCode: await QRCode.toDataURL(appointment._id.toString())
    });

    console.log("Created pass:", pass._id);

    console.log("\n--- Seed Complete ---");
    console.log("Login credentials (all use password: password123):");
    console.log("  Admin:    admin@example.com");
    console.log("  Employee: ravi@example.com");
    console.log("  Security: guard@example.com");

    process.exit(0);

  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seedData();
