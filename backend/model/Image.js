const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    images: [String],
    category: String,
    stock: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', imageSchema);