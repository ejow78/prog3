import express from 'express';
import {
  crearInscripcion,
  getInscripciones,
  updateEstadoInscripcion,
  deleteInscripcion,
  restoreInscripcion,
  forceDeleteInscripcion,
  emptyTrashInscripciones
} from '../controllers/inscripcionExamenController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta pública para enviar el formulario de inscripción
router.post('/', crearInscripcion);

// Rutas protegidas para el personal académico
router.get('/', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), getInscripciones);
router.put('/:id/estado', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), updateEstadoInscripcion);
router.delete('/:id', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), deleteInscripcion);
router.put('/:id/restore', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), restoreInscripcion);

// Eliminación definitiva (Admin y Superadmin)
router.delete('/trash/empty', protect, authorizeRoles('superadmin', 'admin'), emptyTrashInscripciones);
router.delete('/:id/force', protect, authorizeRoles('superadmin', 'admin'), forceDeleteInscripcion);

export default router;
