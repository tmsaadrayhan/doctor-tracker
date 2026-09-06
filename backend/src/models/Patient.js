const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    condition: { type: String, required: true, trim: true, maxlength: 150 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

patientSchema.index({ createdBy: 1, createdAt: -1 });
patientSchema.index({ createdBy: 1, condition: 1 });
patientSchema.index({ createdBy: 1, doctor: 1 });
patientSchema.index({ name: "text", condition: "text" });

module.exports = mongoose.model("Patient", patientSchema);
