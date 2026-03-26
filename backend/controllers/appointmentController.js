const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/Users");
const Visitor = require("../models/Visitor");

// CREATE a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { visitorId, hostId, date } = req.body;

    // Make sure all three fields exist before saving
    if (!visitorId || !hostId || !date) {
      return res.status(400).json({ message: "Visitor ID, host ID and date are all required" });
    }

    // Check that the date is not in the past
    const appointmentDate = new Date(date);
    if (appointmentDate < new Date()) {
      return res.status(400).json({ message: "Appointment date cannot be in the past" });
    }

    const appointment = await Appointment.create({
      visitorId,
      hostId,
      date: appointmentDate
    });

    res.status(201).json(appointment);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all appointments with visitor and host details
exports.getAppointments = async (req, res) => {
  try {
    // populate() replaces the stored IDs with the actual documents
    // So instead of just seeing an ID, we get the visitor's name, email etc.
    const appointments = await Appointment.find()
      .populate("visitorId")
      .populate("hostId", "name email")
      .sort({ createdAt: -1 });

    res.json(appointments);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// APPROVE appointment and notify the visitor by email
exports.approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("visitorId")
      .populate("hostId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be approved" });
    }

    // Update status to approved
    appointment.status = "approved";
    await appointment.save();

    // Send confirmation email to visitor if they have an email address
    if (appointment.visitorId?.email) {
      const emailBody = `
Hello ${appointment.visitorId.name},

Your appointment has been approved!

Date: ${new Date(appointment.date).toLocaleDateString()}
Host: ${appointment.hostId?.name || "Staff"}

Please check in at the reception when you arrive. A pass will be issued to you.

- Visitor Pass System
      `.trim();

      await sendEmail(
        appointment.visitorId.email,
        "Your Visit Has Been Approved",
        emailBody
      );
    }

    res.json({ message: "Appointment approved", appointment });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REJECT appointment
exports.rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be rejected" });
    }

    appointment.status = "rejected";
    await appointment.save();

    res.json({ message: "Appointment rejected", appointment });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};