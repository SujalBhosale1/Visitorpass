const nodemailer = require("nodemailer");

// sendEmail is a simple helper that sends an email using nodemailer
// We call it from appointment and pass controllers whenever a notification is needed
// Parameters:
//   to      - recipient email address
//   subject - email subject line
//   text    - plain text body of the email
const sendEmail = async (to, subject, text) => {
  try {
    // Create a transporter using the SMTP settings from .env
    // If EMAIL_USER/PASS are not set we skip sending (so app still works without email config)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("[Email] Skipped (EMAIL_USER not configured):", subject);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  // use an App Password, not your regular Gmail password
      }
    });

    await transporter.sendMail({
      from: `"Visitor Pass System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log(`[Email] Sent to ${to}: ${subject}`);

  } catch (err) {
    // Email failure should not crash the main request
    // We just log it and move on
    console.error("[Email] Failed to send:", err.message);
  }
};

module.exports = sendEmail;
