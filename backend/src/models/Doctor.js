const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    specialization: { type: String, required: true, trim: true, maxlength: 100 },
    hospital: { type: String, required: true, trim: true, maxlength: 150 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: { type: String, required: true, lowercase: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

doctorSchema.index({ createdBy: 1, createdAt: -1 });
doctorSchema.index({ createdBy: 1, specialization: 1 });
doctorSchema.index({ createdBy: 1, hospital: 1 });
doctorSchema.index({ name: "text", specialization: "text", hospital: "text" });

module.exports = mongoose.model("Doctor", doctorSchema);
