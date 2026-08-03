import express from 'express';
import { getDashboard } from '../../controllers/admin/dashboardController.js';
import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get('/', getDashboard);

export default router;
