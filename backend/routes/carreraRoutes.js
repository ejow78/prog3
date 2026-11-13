import express from 'express';
import { 
  getCarreras, 
  updateCarrera, 
  createCarrera, 
  deleteCarrera, 
  restoreCarrera,
  forceDeleteCarrera,
  emptyTrashCarreras
} from '../controllers/carreraController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCarreras)
  .post(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), createCarrera);

// Papelera y Hard Delete (Superadmin y Admin)
router.delete('/trash/empty', protect, authorizeRoles('superadmin', 'admin'), emptyTrashCarreras);
router.delete('/:id/force', protect, authorizeRoles('superadmin', 'admin'), forceDeleteCarrera);

router.route('/:id')
  .put(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), updateCarrera)
  .delete(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), deleteCarrera);

router.put('/:id/restore', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), restoreCarrera);

export default router;
