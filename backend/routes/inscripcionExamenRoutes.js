import express from 'express';
import {
  crearInscripcion,
  getInscripciones,
  updateEstadoInscripcion,
  deleteInscripcion,
  restoreInscripcion
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

export default router;
