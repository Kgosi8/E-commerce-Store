const express = require('express');
const router = express.Router();


const verifyToken = require("../../middleware/auth");
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

module.exports= router;