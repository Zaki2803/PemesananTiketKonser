import express from 'express';
import { getEventSeats, generateSeats, updateSeatStatus } from '../controllers/seatController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/events/:eventId/seats', getEventSeats);
router.use(verifyToken, verifyAdmin);
router.post('/admin/events/:eventId/seats/generate', generateSeats);
router.patch('/admin/seats/:id/status', updateSeatStatus);
export default router;
