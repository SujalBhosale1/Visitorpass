const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("[Email] Skipped (not configured):", subject);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: `"Visitor Pass System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log(`[Email] Sent to ${to}`);
  } catch (err) {
    // don't crash the main request if email fails
    console.error("[Email] Failed:", err.message);
  }
};

module.exports = sendEmail;
