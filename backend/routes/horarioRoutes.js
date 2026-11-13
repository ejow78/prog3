import express from 'express';
import {
  getHorarios,
  saveHorarioAño,
  saveHorariosCarrera,
  deleteHorario,
  restoreHorario,
  forceDeleteHorario,
  emptyTrashHorarios
} from '../controllers/horarioController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getHorarios);
router.post('/guardar', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), saveHorarioAño);
router.post('/carrera/:carreraId', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), saveHorariosCarrera);

// Papelera y Hard Delete (Superadmin y Admin)
router.delete('/trash/empty', protect, authorizeRoles('superadmin', 'admin'), emptyTrashHorarios);
router.delete('/:id/force', protect, authorizeRoles('superadmin', 'admin'), forceDeleteHorario);

router.delete('/:id', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), deleteHorario);
router.put('/:id/restore', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), restoreHorario);

export default router;
