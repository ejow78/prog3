import express from 'express';
import {
  crearInscripcion,
  getInscripciones,
  updateEstadoInscripcion,
  deleteInscripcion
} from '../controllers/inscripcionExamenController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta pública para enviar el formulario de inscripción
router.post('/', crearInscripcion);

// Rutas protegidas para el administrador (dashboard)
router.get('/', protect, getInscripciones);
router.put('/:id/estado', protect, updateEstadoInscripcion);
router.delete('/:id', protect, deleteInscripcion);

export default router;
