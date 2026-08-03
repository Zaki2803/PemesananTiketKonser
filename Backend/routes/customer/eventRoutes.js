import express from 'express';
import { getAllEvents, getEventById } from '../../controllers/customer/eventController.js';

const router = express.Router();

// Public — tidak perlu token
router.get('/', getAllEvents);
router.get('/:id', getEventById);

export default router;
