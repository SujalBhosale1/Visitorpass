const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// --- Environment Variable Validation ---
// Check for required env vars before starting the server
// This prevents confusing runtime errors later
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error("ERROR: Missing required environment variables:", missingVars.join(", "));
  console.error("Please check your .env file.");
  process.exit(1); // exit with error code so the user knows something is wrong
}

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Serve the uploads folder as static files (for photos and PDF passes)
app.use("/uploads", express.static("uploads"));

// --- Make sure the uploads folder exists on startup ---
// PDFKit and multer both write into this folder, so it needs to be there
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log("Created uploads/ folder");
}

// --- Routes ---
app.use("/api/auth", require("./routes/autroutes"));
app.use("/api/visitors", require("./routes/visitorRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/passes", require("./routes/passRoutes"));
app.use("/api/logs", require("./routes/checklogroutes"));

// Health check
app.get("/", (req, res) => {
  res.send("Visitor Pass API is running");
});

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});