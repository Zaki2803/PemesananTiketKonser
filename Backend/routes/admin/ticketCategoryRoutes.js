import express from 'express';
import {
  updateCategory,
  deleteCategory
} from '../../controllers/admin/ticketCategoryController.js';
import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
