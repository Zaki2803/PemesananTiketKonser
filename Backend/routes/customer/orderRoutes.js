import express from 'express';
import {
  getMyOrders,
  getMyOrderById,
  createOrder,
  cancelOrder
} from '../../controllers/customer/orderController.js';
import { verifyToken, verifyCustomer } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, verifyCustomer);

router.get('/', getMyOrders);
router.get('/:id', getMyOrderById);
router.post('/', createOrder);
router.patch('/:id/cancel', cancelOrder);

export default router;
