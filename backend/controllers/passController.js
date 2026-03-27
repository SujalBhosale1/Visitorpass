const Pass = require("../models/Pass");
const Visitor = require("../models/Visitor");
const Appointment = require("../models/Appointment");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");

exports.generatePass = async (req, res) => {
  try {
    const { visitorId, appointmentId, validFrom, validTo } = req.body;

    if (!visitorId || !appointmentId) {
      return res.status(400).json({ message: "visitorId and appointmentId are required" });
    }

    // make sure appointment is approved before generating a pass
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appointment.status !== "approved") {
      return res.status(400).json({ message: "Appointment must be approved first" });
    }

    const pass = await Pass.create({
      visitorId,
      appointmentId,
      validFrom: validFrom || new Date(),
      validTo: validTo || new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // generate QR code as base64 image using the pass ID
    const qrData = await QRCode.toDataURL(pass._id.toString());
    pass.qrCode = qrData;
    await pass.save();

    const visitor = await Visitor.findById(visitorId);

    // make sure uploads folder exists
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // build PDF badge with visitor info and QR code
    const pdfPath = path.join(uploadsDir, `pass_${pass._id}.pdf`);
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(20).font("Helvetica-Bold").text("VISITOR PASS", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).font("Helvetica");
    doc.text(`Name:  ${visitor?.name || "N/A"}`);
    doc.text(`Email: ${visitor?.email || "N/A"}`);
    doc.text(`Phone: ${visitor?.phone || "N/A"}`);
    doc.moveDown(0.5);
    doc.text(`Valid From: ${new Date(pass.validFrom).toLocaleString()}`);
    doc.text(`Valid To:   ${new Date(pass.validTo).toLocaleString()}`);
    doc.text(`Pass ID:    ${pass._id}`);
    doc.moveDown();

    // convert base64 QR to a Buffer so pdfkit can render it as an image
    const qrBuffer = Buffer.from(qrData.replace(/^data:image\/png;base64,/, ""), "base64");
    doc.font("Helvetica-Bold").text("Scan at Entry/Exit:", { align: "center" });
    doc.moveDown(0.3);
    doc.image(qrBuffer, { fit: [160, 160], align: "center" });

    doc.end();

    // notify visitor by email and SMS
    if (visitor?.email) {
      const msg = `Hi ${visitor.name},\n\nYour visitor pass is ready.\nPass ID: ${pass._id}\nValid until: ${new Date(pass.validTo).toLocaleString()}\n\nShow this at reception.\n- Visitor Pass System`;
      await sendEmail(visitor.email, "Your Visitor Pass", msg);
    }

    if (visitor?.phone) {
      await sendSMS(visitor.phone, `Your visitor pass is ready. Pass ID: ${pass._id}. Valid until: ${new Date(pass.validTo).toLocaleString()}.`);
    }

    res.status(201).json({
      message: "Pass generated",
      pass,
      pdfUrl: `/uploads/pass_${pass._id}.pdf`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPasses = async (req, res) => {
  try {
    const passes = await Pass.find().populate("visitorId").sort({ createdAt: -1 });
    res.json(passes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPass = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id).populate("visitorId");
    if (!pass) return res.status(404).json({ message: "Pass not found" });
    res.json(pass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};