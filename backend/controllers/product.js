const Product = require('../model/Product');
const fs      = require('fs');

// ── Create product ────────────────────────────────────────────────
async function createProduct(req, res) {
  try {
    const { name, description, price, category, stock } = req.body;

    const imageUrls = req.files.map(file =>
      `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    );

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images: imageUrls,
    });

    res.status(201).json({ status: 'success', data: product });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
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
  }catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

// ── Get product by ID ─────────────────────────────────────────────
async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({ status: 'success', data: product });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

// ── Delete product + images ───────────────────────────────────────
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        const filename = img.split('/uploads/')[1];
        fs.unlink(`uploads/${filename}`, err => {
          if (err) console.error('File deletion error:', err);
        });
      });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ status: 'success', message: 'Product deleted' });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

// ── Get products by tag ───────────────────────────────────────────
async function getProductsByTag(req, res) {
  try {
    const { tag }             = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip   = (Number(page) - 1) * Number(limit);
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
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });

  } catch (err) {
    console.error('[getProductsByTag]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── Get products by category ──────────────────────────────────────
async function getProductsByCategory(req, res) {
  try {
    const { category }        = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip   = (Number(page) - 1) * Number(limit);
    const filter = { category: { $regex: new RegExp(`^${category}$`, 'i') } };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      success:  true,
      category,
      total,
      page:     Number(page),
      pages:    Math.ceil(total / Number(limit)),
      products,
    });

  } catch (err) {
    console.error('[getProductsByCategory]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── Search products ───────────────────────────────────────────────
async function searchProducts(req, res) {
  try {
    const { q, tag, category, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (q)        filter.$text    = { $search: q };
    if (tag)      filter.tags     = { $in: [tag] };
    if (category) filter.category = { $regex: new RegExp(`^${category}$`, 'i') };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      products,
    });

  } catch (err) {
    console.error('[searchProducts]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
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