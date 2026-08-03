import express from 'express';
import {
  getAllArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist
} from '../../controllers/admin/artistController.js';
import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';
import upload from '../../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get('/', getAllArtists);
router.get('/:id', getArtistById);
router.post('/', upload.single('photo'), createArtist);
router.put('/:id', upload.single('photo'), updateArtist);
router.delete('/:id', deleteArtist);

export default router;
