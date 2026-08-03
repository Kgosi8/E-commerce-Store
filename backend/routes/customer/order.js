const express= require('express');
const router= express.Router();

const {
    createOrder,
    getOrder,
    listOrders,
    updateOrderStatus,
}= require('../../controllers/order');

// Public routes

router.post('/', createOrder);
router.get('/:orderId', getOrder);

// Admin routes
router.get('/', listOrders);
router.patch('/:orderId/status', updateOrderStatus);

module.exports= router;