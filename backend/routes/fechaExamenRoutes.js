import express from 'express';
import { 
  getFechasExamenes, 
  crearFechaExamen, 
  updateFechaExamen, 
  deleteFechaExamen,
  restoreFechaExamen,
  forceDeleteFechaExamen,
  emptyTrashFechasExamenes
} from '../controllers/fechaExamenController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getFechasExamenes)
  .post(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), crearFechaExamen);

// Papelera y Hard Delete (Superadmin y Admin)
router.delete('/trash/empty', protect, authorizeRoles('superadmin', 'admin'), emptyTrashFechasExamenes);
router.delete('/:id/force', protect, authorizeRoles('superadmin', 'admin'), forceDeleteFechaExamen);

router.route('/:id')
  .put(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), updateFechaExamen)
  .delete(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), deleteFechaExamen);

router.put('/:id/restore', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), restoreFechaExamen);

export default router;
