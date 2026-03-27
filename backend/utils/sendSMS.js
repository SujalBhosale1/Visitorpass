// SMS notifications using Twilio
// Requires TWILIO_SID, TWILIO_AUTH, TWILIO_FROM in .env
// If those vars aren't set this just logs and skips - so the app still works

const sendSMS = async (to, message) => {
  if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH || !process.env.TWILIO_FROM) {
    console.log("[SMS] Skipped (Twilio not configured):", message);
    return;
  }

  try {
    const twilio = require("twilio");
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_FROM,
      to
    });
    console.log(`[SMS] Sent to ${to}`);
  } catch (err) {
    console.error("[SMS] Failed:", err.message);
  }
};

module.exports = sendSMS;
