const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const auth = require("../middleware/auth.middleware");

router.use(auth);

const doctorValidation = [
  body("name").trim().notEmpty().isLength({ max: 100 }),
  body("specialization").trim().notEmpty().isLength({ max: 100 }),
  body("hospital").trim().notEmpty().isLength({ max: 150 }),
  body("phone").trim().notEmpty().isLength({ max: 30 }),
  body("email").isEmail().normalizeEmail()
];

function validation(req, res) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ success: false, errors: result.array() });
    return false;
  }
  return true;
}

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const { search, specialization, hospital, from, to } = req.query;

    const filter = { createdBy: req.user.id };

    if (search?.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ name: regex }, { specialization: regex }, { hospital: regex }];
    }
    if (specialization) filter.specialization = specialization;
    if (hospital) filter.hospital = hospital;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Doctor.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Doctor.countDocuments(filter)
    ]);

    const ids = items.map((item) => item._id);
    const counts = ids.length
      ? await Patient.aggregate([
          { $match: { doctor: { $in: ids }, createdBy: new mongoose.Types.ObjectId(req.user.id) } },
          { $group: { _id: "$doctor", count: { $sum: 1 } } }
        ])
      : [];

    const map = new Map(counts.map((x) => [x._id.toString(), x.count]));
    const result = items.map((item) => ({
      ...item,
      patientCount: map.get(item._id.toString()) || 0
    }));

    res.json({
      success: true,
      items: result,
      total,
      page,
      limit,
      pages: Math.max(Math.ceil(total / limit), 1)
    });
  } catch (error) {
    next(error);
  }
});

router.get("/options", async (req, res, next) => {
  try {
    const [specializations, hospitals] = await Promise.all([
      Doctor.distinct("specialization", { createdBy: req.user.id }),
      Doctor.distinct("hospital", { createdBy: req.user.id })
    ]);
    res.json({ success: true, specializations: specializations.sort(), hospitals: hospitals.sort() });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid doctor id" });

    const doctor = await Doctor.findOne({ _id: req.params.id, createdBy: req.user.id }).lean();
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const patients = await Patient.find({ doctor: doctor._id, createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, doctor, patients });
  } catch (error) {
    next(error);
  }
});

router.post("/", doctorValidation, async (req, res, next) => {
  try {
    if (!validation(req, res)) return;
    const doctor = await Doctor.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", doctorValidation, async (req, res, next) => {
  try {
    if (!validation(req, res)) return;
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    await Patient.deleteMany({ doctor: doctor._id, createdBy: req.user.id });
    res.json({ success: true, message: "Doctor and associated patients deleted" });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/patients", async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const patient = await Patient.create({
      ...req.body,
      doctor: doctor._id,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
