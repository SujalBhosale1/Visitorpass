const Pass = require("../models/Pass");
const Visitor = require("../models/Visitor");
const Appointment = require("../models/Appointment");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../utils/sendEmail");

// GENERATE a visitor pass
// This does 4 things in order:
// 1. Check the appointment is approved
// 2. Create the pass record in the database
// 3. Generate a QR code image (base64 PNG)
// 4. Build a PDF badge and save it to disk
exports.generatePass = async (req, res) => {
  try {
    const { visitorId, appointmentId, validFrom, validTo } = req.body;

    // Validate that all required fields are present
    if (!visitorId || !appointmentId) {
      return res.status(400).json({ message: "Visitor ID and appointment ID are required" });
    }

    // Step 1: Fetch the appointment and check if it has been approved
    // We can only generate a pass for an approved appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appointment.status !== "approved") {
      return res.status(400).json({ message: "Cannot generate a pass - appointment is not approved yet" });
    }

    // Step 2: Create the pass document in MongoDB
    // The pass stores the visitor, the appointment, and validity dates
    const pass = await Pass.create({
      visitorId,
      appointmentId,
      validFrom: validFrom || new Date(),
      validTo: validTo || new Date(Date.now() + 24 * 60 * 60 * 1000) // default 1 day
    });

    // Step 3: Generate a QR code
    // QRCode.toDataURL() creates a base64-encoded PNG image
    // We encode the pass ID so when scanned, we know exactly which pass it is
    const qrCodeBase64 = await QRCode.toDataURL(pass._id.toString());

    // Save the QR code string back into the pass document
    pass.qrCode = qrCodeBase64;
    await pass.save();

    // Step 4: Create the PDF badge using PDFKit
    // PDFKit builds a PDF by streaming content page by page

    // Make sure the uploads folder exists before trying to write into it
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Get visitor info so we can print their name on the badge
    const visitor = await Visitor.findById(visitorId);

    const pdfPath = path.join(uploadsDir, `pass_${pass._id}.pdf`);
    const doc = new PDFDocument({ margin: 40 });

    // Pipe the PDF content to a file on disk
    doc.pipe(fs.createWriteStream(pdfPath));

    // --- PDF Content ---
    doc.fontSize(22).font("Helvetica-Bold").text("VISITOR PASS", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica").fillColor("gray").text("Visitor Pass Management System", { align: "center" });
    doc.moveDown();

    // Visitor details section
    doc.fontSize(13).fillColor("black").font("Helvetica-Bold").text("Visitor Details");
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke(); // horizontal rule
    doc.moveDown(0.3);

    doc.font("Helvetica").fontSize(12);
    doc.text(`Name:       ${visitor?.name || "N/A"}`);
    doc.text(`Email:      ${visitor?.email || "N/A"}`);
    doc.text(`Phone:      ${visitor?.phone || "N/A"}`);
    doc.moveDown(0.5);
    doc.text(`Valid From: ${new Date(pass.validFrom).toLocaleString()}`);
    doc.text(`Valid To:   ${new Date(pass.validTo).toLocaleString()}`);
    doc.text(`Pass ID:    ${pass._id}`);

    doc.moveDown();

    // Add the QR code image to the PDF
    // We strip the data URL prefix to get raw base64, then convert to Buffer
    const rawBase64 = qrCodeBase64.replace(/^data:image\/png;base64,/, "");
    const qrImageBuffer = Buffer.from(rawBase64, "base64");

    doc.fontSize(12).font("Helvetica-Bold").text("Scan at Entry / Exit:", { align: "center" });
    doc.moveDown(0.5);
    doc.image(qrImageBuffer, {
      fit: [160, 160],
      align: "center"
    });

    // Finalize the PDF (closes the document and flushes to disk)
    doc.end();

    // Send notification email to visitor if email exists
    if (visitor?.email) {
      const emailText = `
Hello ${visitor.name},

Your visitor pass has been generated!

Pass ID: ${pass._id}
Valid From: ${new Date(pass.validFrom).toLocaleString()}
Valid Until: ${new Date(pass.validTo).toLocaleString()}

Please show this pass (or your QR code) when you arrive at the reception.

- Visitor Pass System
      `.trim();

      await sendEmail(visitor.email, "Your Visitor Pass is Ready", emailText);
    }

    res.status(201).json({
      message: "Pass generated successfully",
      pass,
      pdfUrl: `/uploads/pass_${pass._id}.pdf`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all passes with visitor details
exports.getAllPasses = async (req, res) => {
  try {
    const passes = await Pass.find()
      .populate("visitorId")
      .sort({ createdAt: -1 });

    res.json(passes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET a single pass by its ID
exports.getPass = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id).populate("visitorId");

    if (!pass) {
      return res.status(404).json({ message: "Pass not found" });
    }

    res.json(pass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};