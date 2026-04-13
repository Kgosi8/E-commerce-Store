const Product = require("../model/Product");

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, stock } = req.body;
    const product = await Product.create({ title, description, price, stock });
    res.status(201).json({ status: "success", data: product });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
