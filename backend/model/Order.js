const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:       { type: String, required: true },
  price:      { type: Number, required: true },
  quantity:   { type: Number, required: true, min: 1 },
  image:      { type: String },
}, { _id: false });

const DeliveryAddressSchema = new mongoose.Schema({
  firstName:  { type: String, required: true },
  lastName:   { type: String, required: true },
  email:      { type: String, required: true },
  phone:      { type: String, required: true },
  address:    { type: String, required: true },
  city:       { type: String, required: true },
  province:   { type: String, required: true },
  postalCode: { type: String, required: true },
  note:       { type: String, default: '' },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  eftReference: {
    type: String,
    unique: true,
    sparse: true, // only set for EFT orders, null for COD
  },
  customer:       { type: DeliveryAddressSchema, required: true },
  items:          { type: [OrderItemSchema], required: true },
  paymentMethod:  { type: String, enum: ['eft', 'cod'], required: true },
  subtotal:       { type: Number, required: true },
  deliveryFee:    { type: Number, required: true, default: 80 },
  total:          { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['awaiting_payment', 'paid', 'failed'],
    default: 'awaiting_payment',
  },
}, { timestamps: true }); // adds createdAt + updatedAt automatically

module.exports = mongoose.model('Order', OrderSchema);