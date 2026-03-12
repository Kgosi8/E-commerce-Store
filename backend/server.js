const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const User = require("./model/User");
const jwt = require("jsonwebtoken");
const app = express();
const connectDB = require("./connection/db_connect");
const cookieParser = require("cookie-parser");
const Product = require("./model/Product");

dotenv.config();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:4200", // Angular app URL
    credentials: true, //allows cookies to be sent in cross-origin requests
  }),
);
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET;

// Connect to MongoDB
connectDB();

//Register api

app.post("/api/register", async (req, res) => {
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

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      phoneNumber,
    });

    return res
      .status(201)
      .json({ status: "success", message: "User registered successfully" });
  } catch (err) {
    console.error("Error in registration:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//Login api

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ status: "error", message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3600000,
    });

    return res
      .status(200)
      .json({
        status: "success",
        message: "Login successful",
        user: existingUser,
        token,
      });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

//get user profile

app.get("/api/user", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({
        status: "error",
        message: "No token found, authorization denied",
      });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    //compute initials
    const initials = user.name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("");

    return res
      .status(200)
      .json({ status: "success", data: { ...user.toObject(), initials } });
  } catch (err) {
    console.error("Error in profile:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

//Logout api
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  return res
    .status(200)
    .json({ status: "success", message: "Logout successful" });
});

// Import product routes

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ status: "success", data: products });
  } catch (err) {
    console.error("Error in products:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;
    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      imageUrl,
    });
    return res.status(201).json({ status: "success", data: newProduct });
  } catch (err) {
    console.error("Error in creating product:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Add to cart API

app.post('api/cart/add', async (req, res) => {
  const token = req.cookies.token;
  if(!token) return res.status(401).json({ status: 'error', message: 'No token found, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if(!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    const { productId} = req.body;

    //initialize cart if not exists
    if(!user.cart) user.cart = [];

    //check if product already in cart
    const existingItem = user.cart.find(item => item.productId.toString() === productId);

    if(existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ productId, quantity: 1 });
    }

    await user.save();

    return res.status(200).json({ status: 'success', message: 'Product added to cart' ,cart: user.cart});
  } catch (err) {
    console.error("Error in adding to cart:", err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Get cart API

app.get('/api/cart', async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .populate('cart.productId');

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      cart: user.cart
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Remove from cart API

app.delete('/api/cart/remove/:productId', async (req, res) => {

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  try {

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);

    const productId = req.params.productId;

    user.cart = user.cart.filter(
      item => item.productId.toString() !== productId
    );

    await user.save();

    res.json({
      status: 'success',
      cart: user.cart
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Update cart API

app.put('/api/cart/update', async (req, res) => {

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  try {

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);

    const { productId, quantity } = req.body;

    const item = user.cart.find(
      item => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;

    await user.save();

    res.json({
      status: 'success',
      cart: user.cart
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

//listen to server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
