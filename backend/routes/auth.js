const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/User.js');

const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, address, phoneNumber } = req.body;

    if (!name || !email || !password || !address || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      phoneNumber
    });

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully'
    });

  } catch (err) {
    console.error('Error in registration:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User does not exist'
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,   // set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 3600000
    });

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      user: existingUser
    });

  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// GET /api/user — protected
router.get('/user', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'No token found, authorization denied'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const initials = user.name
      .split(' ')
      .map(word => word[0].toUpperCase())
      .join('');

    return res.status(200).json({
      status: 'success',
      data: { ...user.toObject(), initials }
    });

  } catch (err) {
    console.error('Error in profile:', err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// POST /api/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    status: 'success',
    message: 'Logout successful'
  });
});

module.exports = router;