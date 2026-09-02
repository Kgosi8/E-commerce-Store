const Order = require("../model/Order");
const { generateId } = require("../utils/generateId");
const { validateOrder } = require("../utils/validateOrder");
const { sendOrderConfirmation } = require("../services/email");

const DELIVERY_FEE = 80; // fixed delivery fee

// ------- POST  /api/orders -----------------------

async function createOrder(req, res) {
  try {
    const { customer, items, paymentMethod } = req.body;

    // Validate order data
    const errors = validateOrder(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    // Calculate subtotal and total
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const total = subtotal + DELIVERY_FEE;

    // Generate unique orderId
    const orderId = generateId("ORD");
    const eftReference =
      paymentMethod === "eft" ? generateId("EFT") : undefined;

    // Build and save the order

    const order = await Order.create({
      orderId,
      eftReference,
      customer,
      items,
      paymentMethod,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total,
      status: "pending",
      paymentStatus: "awaiting_payment",
    });

    //email confirmation
    sendOrderConfirmation(order);

    return res.status(201).json({
      success: true,
      order: {
        _id: order._id,
        orderId: order.orderId,
        eftReference: order.eftReference,
        customer: order.customer,
        items: order.items,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    //Handle duplicate orderId or eftReference error

    if (err.code === 11000) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Duplicate orderId or eftReference. Please try again.",
        });
    }

    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: err.message,
        errors: err.errors,
      });
    }

    console.error("[createOrder]", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

// ------- GET  /api/orders/:orderId -----------------------

async function getOrder(req, res) {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }
    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("[getOrder]", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

// ------- GET  /api/orders -----------------------
// (Admin only) Get all orders with optional filtering by status and pagination

async function getAllOrders(req, res) {
  try {
    const { status, paymentMethod, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Math.ceil(total / limit),
      orders,
    });
  } catch (err) {
    console.error("[listOrders]", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

// ── GET /api/orders ───────────────────────────────────────────────
// (Admin use — list all orders, newest first)
async function listOrders(req, res) {
  try {
    const { status, paymentMethod, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    return res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (err) {
    console.error("[listOrders]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

// ── PATCH /api/orders/:orderId/status ─────────────────────────────
// (Admin use — update order status)

async function updateOrderStatus(req, res) {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const validPayment = ["awaiting_payment", "paid", "failed"];

    if (status && !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value." });
    }
    if (paymentStatus && !validPayment.includes(paymentStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid paymentStatus value." });
    }

    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { $set: update },
      { new: true },
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error("[updateOrderStatus]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

module.exports = {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  getAllOrders,
};
