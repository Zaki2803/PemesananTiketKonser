import express from 'express';
import {
  getAllPayments,
  getPaymentById,
  verifyPayment
} from '../../controllers/admin/paymentController.js';
import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.patch('/:id/verify', verifyPayment);

export default router;
