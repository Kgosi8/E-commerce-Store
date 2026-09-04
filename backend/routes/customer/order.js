const express= require('express');
const router= express.Router();

const { popUpload }= require('../../middleware/pop-upload');
const {requireAdmin}= require('../../middleware/auth');
const{ uploadPOP,deletePOP }= require('../../controllers/pop');

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

//Customer uploads POP- single file, file name 'pop
router.post('/:orderId/pop', popUpload.single('pop'), uploadPOP);

// Admin deletes POP
router.delete('/:orderId/pop', requireAdmin, deletePOP);

module.exports= router;