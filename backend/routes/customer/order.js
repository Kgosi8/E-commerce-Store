const express    = require('express');
const router     = express.Router();

const { popUpload }                     = require('../../middleware/pop-upload');
const { verifyToken, requireAdmin }     = require('../../middleware/auth');
const { uploadPOP, deletePOP }          = require('../../controllers/pop');
const {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
} = require('../../controllers/order');

// ── Specific static routes first ─────────────────────────────────

// Admin: list all orders
router.get('/', verifyToken, requireAdmin, listOrders);

// Place new order (public)
router.post('/', createOrder);

// ── Routes with :orderId second ──────────────────────────────────

// Customer: upload POP — must be before /:orderId
router.post('/:orderId/pop',    popUpload.single('pop'), uploadPOP);

// Admin: delete POP
router.delete('/:orderId/pop',  verifyToken, requireAdmin, deletePOP);

// Admin: update status
router.patch('/:orderId/status', verifyToken, requireAdmin, updateOrderStatus);

// Public: get single order — keep this LAST among /:orderId routes
router.get('/:orderId', getOrder);

module.exports = router;