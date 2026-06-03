import express from 'express';
import { getCarreras, updateCarrera, createCarrera, deleteCarrera } from '../controllers/carreraController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCarreras)
  .post(protect, createCarrera);

router.route('/:id')
  .put(protect, updateCarrera)
  .delete(protect, deleteCarrera);

export default router;
