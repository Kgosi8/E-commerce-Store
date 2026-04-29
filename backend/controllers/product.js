const Product = require("../model/Product");
const fs = require('fs');

exports.createProduct = async (req, res) => {
  try{
    const {name,description,price,category,stock} = req.body;

    //Handle uploaded images

    const imageUrls= req.files.map(file =>
      `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    );

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images: imageUrls
    });

    res.status(201).json({
      status: "success",
      data: product
    });
  } catch(err){
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

// GET ALL PRODUCTS

exports.getAllProducts = async (req, res) => {
  try{
    const products = await Product.find();
    res.json(products);
  } catch(err){
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
  
};

//DELETE PRODUCT + IMAGES
exports.deleteProduct = async (req, res) => {
  try{
    const {id} = req.params;
    const product = await Product.findById(id);

    //Delete images from uploads folder
    if(product.images && product.images.length > 0){
      product.images.forEach(img => {
        const filename = img.split("/uploads/")[1];
        fs.unlink(`uploads/${filename}`, err => {
          if(err) console.log("File deletion error:", err);
        });
      });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try{
    const product = await Product.findById(req.params.id);

    if(!product){
      return res.status(404).json({ status: "error", message: "Product not found" });
    }
    res.json({
      status:"success",
      data: product
    });
  } catch(err){
    res.status(500).json({
      status: "error",
      message: err.message
    });
  } 
};
