import express from 'express';
import { createPayment, getPaymentStatus } from '../../controllers/customer/paymentController.js';
import { verifyToken, verifyCustomer } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, verifyCustomer);

router.post('/create', createPayment);
router.get('/:orderId', getPaymentStatus);

export default router;
