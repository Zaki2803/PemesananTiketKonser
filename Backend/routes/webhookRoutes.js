import express from 'express';
import { handleWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Public endpoint — tidak perlu token, dipanggil oleh Midtrans server
router.post('/notification', handleWebhook);

export default router;
