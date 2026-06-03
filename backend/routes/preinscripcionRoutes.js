import express from 'express';
import { 
  crearPreinscripcion, 
  getPreinscripciones, 
  updateEstadoPreinscripcion, 
  deletePreinscripcion 
} from '../controllers/preinscripcionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta pública para enviar el formulario
router.post('/', crearPreinscripcion);

// Rutas protegidas para el administrador (dashboard)
router.get('/', protect, getPreinscripciones);
router.put('/:id/estado', protect, updateEstadoPreinscripcion);
router.delete('/:id', protect, deletePreinscripcion);

export default router;
