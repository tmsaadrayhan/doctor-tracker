const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const auth = require("../middleware/auth.middleware");

router.use(auth);

function valid(req, res) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ success: false, errors: result.array() });
    return false;
  }
  return true;
}

const patientValidation = [
  body("name").trim().notEmpty().isLength({ max: 100 }),
  body("age").isInt({ min: 0, max: 130 }),
  body("gender").isIn(["Male", "Female", "Other"]),
  body("condition").trim().notEmpty().isLength({ max: 150 }),
  body("phone").trim().notEmpty().isLength({ max: 30 }),
  body("doctor").isMongoId()
];

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const { search, condition, doctor, gender, from, to } = req.query;

    const filter = { createdBy: req.user.id };
    if (search?.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ name: regex }, { condition: regex }];
    }
    if (condition) filter.condition = condition;
    if (gender) filter.gender = gender;
    if (doctor && mongoose.isValidObjectId(doctor)) filter.doctor = doctor;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Patient.find(filter)
        .populate("doctor", "name specialization hospital")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(filter)
    ]);

    res.json({ success: true, items, total, page, limit, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (error) {
    next(error);
  }
});

router.get("/options", async (req, res, next) => {
  try {
    const [conditions, doctors] = await Promise.all([
      Patient.distinct("condition", { createdBy: req.user.id }),
      Doctor.find({ createdBy: req.user.id }).select("_id name specialization").sort({ name: 1 }).lean()
    ]);
    res.json({ success: true, conditions: conditions.sort(), doctors });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, createdBy: req.user.id })
      .populate("doctor", "name specialization hospital");
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    res.json({ success: true, patient });
  } catch (error) {
    next(error);
  }
});

router.post("/", patientValidation, async (req, res, next) => {
  try {
    if (!valid(req, res)) return;
    const doctor = await Doctor.findOne({ _id: req.body.doctor, createdBy: req.user.id });
    if (!doctor) return res.status(400).json({ success: false, message: "Invalid doctor" });

    const patient = await Patient.create({ ...req.body, createdBy: req.user.id });
    await patient.populate("doctor", "name specialization hospital");
    res.status(201).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", patientValidation, async (req, res, next) => {
  try {
    if (!valid(req, res)) return;
    const doctor = await Doctor.findOne({ _id: req.body.doctor, createdBy: req.user.id });
    if (!doctor) return res.status(400).json({ success: false, message: "Invalid doctor" });

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate("doctor", "name specialization hospital");

    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    res.json({ success: true, patient });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    res.json({ success: true, message: "Patient deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
