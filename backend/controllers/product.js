const Product = require("../model/Product");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

// ── Create product ────────────────────────────────────────────────
async function createProduct(req, res) {
  try {
    const { name, description, price, category, stock, tags } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "At least one product image is required.",
      });
    }

    // Upload all images to Cloudinary in parallel
    const uploadPromises = req.files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
              resource_type: "image",
              transformation: [
                { width: 800, height: 800, crop: "limit" }, // resize for consistency
                { quality: "auto", fetch_format: "auto" }, // auto compress
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            },
          );
          stream.end(file.buffer);
        }),
    );

    const imageUrls = await Promise.all(uploadPromises);

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images: imageUrls,
      tags: tags ? JSON.parse(tags) : [],
    });

    res.status(201).json({ status: "success", data: product });
  } catch (err) {
    console.error("[createProduct]", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

// ── Get all products ──────────────────────────────────────────────
async function getAllProducts(req, res) {
  try {
    const products = await Product.find();
    res.json({
      success: true,
      total: products.length,
      page: 1,
      pages: 1,
      products,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

// ── Get product by ID ─────────────────────────────────────────────
async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }
    res.json({ status: "success", data: product });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

// ── Delete product + images ───────────────────────────────────────
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((url) => {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/products/filename.jpg
        const parts = url.split("/");
        const filename = parts[parts.length - 1].split(".")[0];
        const publicId = `products/${filename}`;

        return cloudinary.uploader
          .destroy(publicId)
          .catch((err) =>
            console.warn(
              `[deleteProduct] Could not delete image ${publicId}:`,
              err.message,
            ),
          );
      });

      await Promise.all(deletePromises);
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ status: "success", message: "Product deleted" });
  } catch (err) {
    console.error("[deleteProduct]", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

// ── Get products by tag ───────────────────────────────────────────
async function getProductsByTag(req, res) {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const filter = { tags: { $in: [tag] } };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      tag,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (err) {
    console.error("[getProductsByTag]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

// ── Get products by category ──────────────────────────────────────
async function getProductsByCategory(req, res) {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const filter = { category: { $regex: new RegExp(`^${category}$`, "i") } };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      category,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (err) {
    console.error("[getProductsByCategory]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

// ── Search products ───────────────────────────────────────────────
async function searchProducts(req, res) {
  try {
    const { q, tag, category, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (tag) filter.tags = { $in: [tag] };
    if (category)
      filter.category = { $regex: new RegExp(`^${category}$`, "i") };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(q ? { score: { $meta: "textScore" } } : { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (err) {
    console.error("[searchProducts]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

// ── Exports ───────────────────────────────────────────────────────
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  getProductsByTag,
  getProductsByCategory,
  searchProducts,
};
