import express from 'express';
import { adminLogin, adminGetMe } from '../../controllers/admin/adminAuthController.js';
import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/admin/auth/login
router.post('/login', adminLogin);

// GET /api/admin/auth/me  (perlu token admin)
router.get('/me', verifyToken, verifyAdmin, adminGetMe);

export default router;
