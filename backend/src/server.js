require("dotenv").config();
const nodemailer = require("nodemailer");
console.log("Email:", process.env.EMAIL_USER);
console.log("Password exists:", !!process.env.EMAIL_PASS);
console.log("Password length:", process.env.EMAIL_PASS?.length);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server is ready!");
  }
});
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(helmet());
app.use(
  cors({
    origin:
      process.env.CLIENT_URL || "https://doctor-tracker-imm7-gilt.vercel.app",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) =>
  res.json({ success: true, message: "API is running" }),
);

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/doctors", require("./routes/doctor.routes"));
app.use("/api/patients", require("./routes/patient.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

module.exports = app;
