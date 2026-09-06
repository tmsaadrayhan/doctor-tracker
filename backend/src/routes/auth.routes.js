const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const validate = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6, max: 100 }),
];

function errors(req) {
  const result = validationResult(req);
  return result.isEmpty() ? null : result.array();
}

function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationCode(user) {
  const code = crypto.randomInt(100000, 1000000).toString();

  user.emailVerificationCode = code;
  user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Email Verification Code",
    text: `Your verification code is ${code}. It will expire in 10 minutes.`,
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${code}</h1>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
}

router.post("/register", validate, async (req, res, next) => {
  try {
    const validation = errors(req);
    if (validation)
      return res.status(400).json({ success: false, errors: validation });

    const { name, email, password } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashed,
      isAdmin: false,
    });

    await sendVerificationCode(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: false,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res, next) => {
    try {
      const validation = errors(req);

      if (validation) {
        return res.status(400).json({
          success: false,
          errors: validation,
        });
      }

      const user = await User.findOne({
        email: req.body.email,
      }).select("+password");

      if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // User has not verified their email yet
      if (!user.isEmailVerified) {
        await sendVerificationCode(user);

        return res.json({
          success: true,
          message: "Verification code sent to your email.",
          requiresVerification: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin === true,
            isEmailVerified: false,
          },
        });
      }

      // User is already verified
      return res.json({
        success: true,
        message: "Login successful.",
        requiresVerification: false,
        token: signToken(user),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin === true,
          isEmailVerified: true,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/verify-email",
  [
    body("email").isEmail().normalizeEmail(),
    body("code").isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  async (req, res, next) => {
    try {
      const validation = errors(req);

      if (validation) {
        return res.status(400).json({
          success: false,
          errors: validation,
        });
      }

      const { email, code } = req.body;

      const user = await User.findOne({ email }).select(
        "+emailVerificationCode +emailVerificationExpires",
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!user.emailVerificationCode) {
        return res.status(400).json({
          success: false,
          message: "No verification code found. Please request a new code.",
        });
      }

      if (user.emailVerificationExpires < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Verification code has expired.",
        });
      }

      if (user.emailVerificationCode !== code) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification code.",
        });
      }

      user.isEmailVerified = true;
      user.emailVerificationCode = undefined;
      user.emailVerificationExpires = undefined;

      await user.save();

      const token = signToken(user);

      res.json({
        message: "Email verified successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin === true,
          isEmailVerified: true,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);
router.post(
  "/resend-verification",
  [body("email").isEmail().normalizeEmail()],
  async (req, res, next) => {
    try {
      const validation = errors(req);

      if (validation) {
        return res.status(400).json({
          success: false,
          errors: validation,
        });
      }

      const user = await User.findOne({
        email: req.body.email,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: "Email is already verified.",
        });
      }

      await sendVerificationCode(user);

      return res.json({
        success: true,
        message: "A new verification code has been sent to your email.",
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
