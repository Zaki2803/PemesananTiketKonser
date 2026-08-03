import express from 'express';
import {
  customerRegister,
  customerLogin,
  customerGetMe
} from '../../controllers/customer/customerAuthController.js';
import { verifyToken, verifyCustomer } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/customer/auth/register
router.post('/register', customerRegister);

// POST /api/customer/auth/login
router.post('/login', customerLogin);

// GET /api/customer/auth/me  (perlu token customer)
router.get('/me', verifyToken, verifyCustomer, customerGetMe);

export default router;
