import express from 'express';
import { getProfile, updateProfile, updatePassword } from '../../controllers/customer/profileController.js';
import { verifyToken, verifyCustomer } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, verifyCustomer);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', updatePassword);

export default router;
