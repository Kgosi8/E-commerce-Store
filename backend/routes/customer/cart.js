const express = require("express");
const router = express.Router();
const Cart = require("../../model/Cart.js");
const Product = require("../../model/Product.js");
const verifyToken = require("../../middleware/auth.js");

// All cart routes are protected — verifyToken runs first on every route
router.use(verifyToken);

// POST /api/cart/add
router.post("/add", async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ?? null,
        quantity: 1,
      });
    }

    await cart.save();

    return res.status(200).json({
      status: "success",
      message: "Product added to cart",
      cart,
    });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// GET /api/cart
router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId }).populate(
      "items.productId",
      "name price images",
    );

    if (!cart) {
      return res.status(200).json({
        status: "success",
        cart: { items: [] },
      });
    }

    res.status(200).json({ status: "success", cart });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// PUT /api/cart/update
router.put("/update", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId,
    );
    if (!item) {
      return res
        .status(404)
        .json({ status: "error", message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ status: "success", message: "Cart updated", cart });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// DELETE /api/cart/remove/:productId
router.delete("/remove/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Cart not found" });
    }

    const itemExists = cart.items.find(
      (item) => item.productId.toString() === productId,
    );
    if (!itemExists) {
      return res
        .status(404)
        .json({ status: "error", message: "Item not found in cart" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Item removed from cart",
      cart,
    });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// DELETE /api/cart/clear
router.delete("/clear", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Cart cleared",
      cart,
    });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

module.exports = router;
