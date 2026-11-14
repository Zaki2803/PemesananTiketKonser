import express from 'express';
import { verifyTicket } from '../controllers/ticketController.js';

const router = express.Router();

// Public — siapapun bisa scan dan lihat info tiket
router.get('/verify/:orderId', verifyTicket);

export default router;
