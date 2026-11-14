import express from 'express';
import {
  customerRegister,
  customerLogin,
  customerGetMe
} from '../../controllers/customer/customerAuthController.js';
import {
  forgotPassword,
  verifyOTP,
  resetPassword
} from '../../controllers/customer/forgotPasswordController.js';
import { verifyToken, verifyCustomer } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/customer/auth/register
router.post('/register', customerRegister);

// POST /api/customer/auth/login
router.post('/login', customerLogin);

// GET /api/customer/auth/me  (perlu token customer)
router.get('/me', verifyToken, verifyCustomer, customerGetMe);

// Forgot Password
router.post('/forgot-password', forgotPassword); // Step 1: kirim OTP ke email
router.post('/verify-otp', verifyOTP);           // Step 2: verifikasi OTP
router.post('/reset-password', resetPassword);   // Step 3: set password baru

export default router;
