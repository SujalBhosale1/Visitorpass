const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/sendEmail");

exports.createAppointment = async (req, res) => {
  try {
    const { visitorId, hostId, date } = req.body;

    if (!visitorId || !hostId || !date) {
      return res.status(400).json({ message: "visitorId, hostId and date are required" });
    }

    if (new Date(date) < new Date()) {
      return res.status(400).json({ message: "Appointment date can't be in the past" });
    }

    const appointment = await Appointment.create({ visitorId, hostId, date });
    res.status(201).json(appointment);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("visitorId")
      .populate("hostId", "name email")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("visitorId")
      .populate("hostId", "name");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be approved" });
    }

    appointment.status = "approved";
    await appointment.save();

    // send email to visitor if they have one
    if (appointment.visitorId?.email) {
      const msg = `Hi ${appointment.visitorId.name},\n\nYour appointment on ${new Date(appointment.date).toLocaleDateString()} has been approved.\nHost: ${appointment.hostId?.name || "Staff"}\n\nPlease check in at reception.\n- Visitor Pass System`;
      await sendEmail(appointment.visitorId.email, "Appointment Approved", msg);
    }

    res.json({ message: "Approved", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

    res.json({ message: "Rejected", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};