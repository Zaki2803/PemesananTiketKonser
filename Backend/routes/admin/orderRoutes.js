import express from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus
} from '../../controllers/admin/orderController.js';
import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

export default router;
