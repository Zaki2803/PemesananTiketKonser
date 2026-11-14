import express from 'express';
import { getAllPayments, getPaymentById } from '../../controllers/admin/paymentController.js';
import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, verifyAdmin);

// Admin hanya bisa lihat data pembayaran
// Verifikasi sudah otomatis lewat webhook Midtrans
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);

export default router;
