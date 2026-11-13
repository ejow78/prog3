import express from 'express';
import { 
  crearPreinscripcion, 
  getPreinscripciones, 
  updateEstadoPreinscripcion, 
  deletePreinscripcion,
  restorePreinscripcion
} from '../controllers/preinscripcionController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta pública para enviar el formulario
router.post('/', crearPreinscripcion);

// Rutas protegidas para el personal académico
router.get('/', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), getPreinscripciones);
router.put('/:id/estado', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), updateEstadoPreinscripcion);
router.delete('/:id', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), deletePreinscripcion);
router.put('/:id/restore', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), restorePreinscripcion);

export default router;
