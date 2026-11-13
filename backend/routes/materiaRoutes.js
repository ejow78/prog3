import express from 'express';
import { 
  getMaterias, 
  createMateria, 
  updateMateria, 
  bulkSaveMaterias, 
  deleteMateria, 
  restoreMateria 
} from '../controllers/materiaController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getMaterias)
  .post(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), createMateria);

router.post('/bulk', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), bulkSaveMaterias);

router.route('/:id')
  .put(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), updateMateria)
  .delete(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), deleteMateria);

router.put('/:id/restore', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), restoreMateria);

export default router;
