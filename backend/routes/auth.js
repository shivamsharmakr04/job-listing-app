// backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ✅ 1) Check if email already exists (prevents E11000 crash)
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "Signup failed",
        error: "Email already registered. Please login instead.",
      });
    }

    // ✅ 2) Create new user
    const user = await User.create({ name, email, password, role });

    return res.json({
      message: "Signup success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);

    // Extra safety: if somehow E11000 appears again
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Signup failed",
        error: "Email already registered. Please login instead.",
      });
    }

    return res.status(500).json({
      message: "Signup failed",
      error: "Server error",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.json({ message: "Login failed" });
    }

    // issue JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.json({ message: "Login failed" });
  }
});

export default router;
