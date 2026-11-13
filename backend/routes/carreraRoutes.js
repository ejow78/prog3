import express from 'express';
import { getCarreras, updateCarrera, createCarrera, deleteCarrera, restoreCarrera } from '../controllers/carreraController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCarreras)
  .post(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), createCarrera);

router.route('/:id')
  .put(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), updateCarrera)
  .delete(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), deleteCarrera);

router.put('/:id/restore', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), restoreCarrera);

export default router;
