const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../model/User.js");
const { verifyToken,requireAdmin } = require("../../middleware/auth.js"); // adjust path if needed
const Order = require("../../model/Order.js");
const JWT_SECRET = process.env.JWT_SECRET;
const crypto = require('crypto');

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

// PUT /api/user/address - update address

router.put("/user/address", verifyToken, async (req, res) => {
  try {
    const { address, PhoneNumber } = req.body;

    if (!address && !PhoneNumber) {
      return res.status(400).json({
        status: "error",
        message: "Provide address or PhoneNumber to update",
      });
    }

    const update = {};
    if (address) {
      update.address = address;
    }
    if (PhoneNumber) {
      update.PhoneNumber = PhoneNumber;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    console.error("Error in updating user:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// GET /api/user/orders - get logged in user's orders

router.get("/user/orders", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    //Match orders by customer email
    const orders = await Order.find({ "customer.email": user.email })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      status: "success",
      data: orders,
    });
  } catch (err) {
    console.error("Error in fetching orders:", err);
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

// GET /api/admin/customers — sorted by order frequency
router.get("/customers", verifyToken, requireAdmin, async (req, res) => {
  try {
    const Order = require("../../model/Order");

    const customers = await Order.aggregate([
      {
        $group: {
          _id: "$customer.email",
          firstName: { $first: "$customer.firstName" },
          lastName: { $first: "$customer.lastName" },
          email: { $first: "$customer.email" },
          phone: { $first: "$customer.phone" },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
      { $sort: { totalOrders: -1 } },
    ]);

    return res.json({ success: true, customers });
  } catch (err) {
    console.error("[customers]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});



// POST /api/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required.' });
    }

    const user = await User.findOne({ email });

    // Always return success — don't reveal if email exists
    if (!user) {
      return res.json({
        status:  'success',
        message: 'If that email is registered you will receive a reset link shortly.',
      });
    }

    // Generate token
    const token   = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken   = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const transporter = require('../../config/mailer.js');
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      email,
      subject: `Reset your password — ${process.env.STORE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"/></head>
        <body style="font-family:'Helvetica Neue',Arial,sans-serif; background:#f0ede6; margin:0; padding:32px 16px;">
          <div style="max-width:520px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden;">
            <div style="background:#fdf8f1; padding:28px 32px; border-bottom:1px solid #ede7db;">
              <p style="font-size:11px; font-weight:600; color:#c9a96e; letter-spacing:.07em; text-transform:uppercase; margin:0 0 6px">Password reset</p>
              <h1 style="font-family:Georgia,serif; font-size:22px; font-weight:400; color:#1a1a1a; margin:0">Reset your password</h1>
            </div>
            <div style="padding:28px 32px;">
              <p style="font-size:14px; color:#555; line-height:1.6; margin:0 0 20px">
                We received a request to reset your password. Click the button below to choose a new one.
                This link expires in <strong>1 hour</strong>.
              </p>
              <a href="${resetUrl}"
                 style="display:inline-block; background:#1a1a1a; color:#fff; text-decoration:none;
                        padding:13px 28px; border-radius:8px; font-size:14px; font-weight:500;">
                Reset password
              </a>
              <p style="font-size:12px; color:#aaa; margin:20px 0 0; line-height:1.5">
                If you didn't request this, you can safely ignore this email.
                Your password will not change.
              </p>
            </div>
            <div style="padding:16px 32px; font-size:12px; color:#aaa; text-align:center; border-top:1px solid #f0ece5;">
              © ${new Date().getFullYear()} ${process.env.STORE_NAME}
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return res.json({
      status:  'success',
      message: 'If that email is registered you will receive a reset link shortly.',
    });

  } catch (err) {
    console.error('[forgot-password]', err);
    res.status(500).json({ status: 'error', message: 'Server error.' });
  }
});

// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status:  'error',
        message: 'Reset link is invalid or has expired.',
      });
    }

    const bcrypt = require('bcrypt');
    user.password             = await bcrypt.hash(password, 10);
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ status: 'success', message: 'Password updated successfully.' });

  } catch (err) {
    console.error('[reset-password]', err);
    res.status(500).json({ status: 'error', message: 'Server error.' });
  }
});

module.exports = router;
