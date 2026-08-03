import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus
} from '../../controllers/admin/eventController.js';
import {
  getCategoriesByEvent,
  createCategory
} from '../../controllers/admin/ticketCategoryController.js';
import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';
import upload from '../../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', upload.single('poster'), createEvent);
router.put('/:id', upload.single('poster'), updateEvent);
router.delete('/:id', deleteEvent);
router.patch('/:id/status', updateEventStatus);

// Ticket categories nested di event
router.get('/:eventId/categories', getCategoriesByEvent);
router.post('/:eventId/categories', createCategory);

export default router;
