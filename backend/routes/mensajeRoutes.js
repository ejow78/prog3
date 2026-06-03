import express from 'express';
import { 
  crearMensaje, 
  getMensajes, 
  toggleLeido, 
  deleteMensaje 
} from '../controllers/mensajeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta pública para enviar el formulario de contacto
router.post('/', crearMensaje);

// Rutas protegidas para el administrador (dashboard)
router.get('/', protect, getMensajes);
router.put('/:id/leido', protect, toggleLeido);
router.delete('/:id', protect, deleteMensaje);

export default router;
