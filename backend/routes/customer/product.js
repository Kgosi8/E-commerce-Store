const express = require("express");
const router = express.Router();
const Product = require("../../model/Product.js");
const upload = require("../../middleware/upload.js");
const controller = require("../../controllers/product.js");

// GET /api/products
router.get("/", controller.getAllProducts);

// GET /api/products/:id
router.get("/:id", controller.getProductById);
router.post("/", upload.array("images", 5), controller.createProduct);
router.delete("/:id", controller.deleteProduct);


module.exports = router;
