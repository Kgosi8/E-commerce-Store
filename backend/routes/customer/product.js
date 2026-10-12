const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload.js");
const controller = require("../../controllers/product.js");
const { verifyToken, requireAdmin } = require("../../middleware/auth.js");

// GET /api/products
router.get("/", controller.getAllProducts);
router.get('/search', controller.searchProducts);
router.get('/tag/:tag', controller.getProductsByTag);
router.get('/category/:category', controller.getProductsByCategory);

// GET /api/products/:id
router.get("/:id", controller.getProductById);
router.post("/",verifyToken,requireAdmin, upload.array("images", 6), controller.createProduct);
router.delete("/:id", controller.deleteProduct);




module.exports = router;
