import express from 'express';
import { 
  getFechasExamenes, 
  crearFechaExamen, 
  updateFechaExamen, 
  deleteFechaExamen 
} from '../controllers/fechaExamenController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getFechasExamenes)
  .post(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), crearFechaExamen);

router.route('/:id')
  .put(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), updateFechaExamen)
  .delete(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), deleteFechaExamen);

export default router;
