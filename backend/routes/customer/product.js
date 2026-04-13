const express = require("express");
const router = express.Router();
const Product = require("../../model/Product.js");

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ status: "success", data: products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ status: "success", data: product });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
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
    console.error("Error creating product:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

module.exports = router;
