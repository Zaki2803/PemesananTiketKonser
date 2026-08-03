import express from 'express';
import { submitPayment, getPaymentStatus } from '../../controllers/customer/paymentController.js';
import { verifyToken, verifyCustomer } from '../../middlewares/authMiddleware.js';
import upload from '../../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken, verifyCustomer);

router.post('/', upload.single('payment_proof'), submitPayment);
router.get('/:orderId', getPaymentStatus);

export default router;
