const router = require("express").Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth.middleware");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

router.get("/", auth, async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [totalDoctors, totalPatients, patientsPerDoctor, conditionBreakdown, monthly] = await Promise.all([
      Doctor.countDocuments({ createdBy: userId }),
      Patient.countDocuments({ createdBy: userId }),
      Patient.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: "$doctor", patients: { $sum: 1 } } },
        { $lookup: { from: "doctors", localField: "_id", foreignField: "_id", as: "doctor" } },
        { $unwind: "$doctor" },
        { $project: { _id: 0, doctorId: "$doctor._id", doctor: "$doctor.name", patients: 1 } },
        { $sort: { patients: -1 } }
      ]),
      Patient.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: "$condition", count: { $sum: 1 } } },
        { $project: { _id: 0, condition: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Patient.aggregate([
        { $match: { createdBy: userId } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            patients: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({
      success: true,
      totalDoctors,
      totalPatients,
      patientsPerDoctor,
      conditionBreakdown,
      monthly
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
