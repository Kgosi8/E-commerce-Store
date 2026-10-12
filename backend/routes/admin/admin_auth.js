const express = require("express");
const router = express.Router();

const { verifyToken, requireAdmin } = require("../../middleware/auth");
const authorizeRoles = require("../../middleware/authorize");
const { createProduct, deleteProduct } = require("../../controllers/product");

router.post("/products", verifyToken, authorizeRoles("admin"), createProduct);

router.delete(
  "/products/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteProduct,
);

router.get("/dashboard", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.id}` });
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

module.exports = router;
