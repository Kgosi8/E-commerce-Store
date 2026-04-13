const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../model/User.js");
const verifyToken = require("../../middleware/auth.js"); // adjust path if needed

const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, address, phoneNumber } = req.body;

    if (!name || !email || !password || !address || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      phoneNumber,
      role: "customer", // ✅ explicitly set role
    });

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Error in registration:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User does not exist",
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // ✅ FIXED: correct user reference + include role
    const token = jwt.sign(
      {
        userId: existingUser._id,
        role: existingUser.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // ✅ match token expiry (1 day)
    });

    // ✅ SAFE user response (no password)
    const userResponse = {
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
    };

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      user: userResponse,
      token: token,
    });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// GET /api/user — protected
router.get("/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const initials = user.name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("");

    return res.status(200).json({
      status: "success",
      data: { ...user.toObject(), initials },
    });
  } catch (err) {
    console.error("Error in profile:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// POST /api/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
});

module.exports = router;
