import express from 'express';
import { 
  crearMensaje, 
  getMensajes, 
  toggleLeido, 
  deleteMensaje,
  restoreMensaje,
  forceDeleteMensaje,
  emptyTrashMensajes
} from '../controllers/mensajeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta pública para enviar el formulario de contacto
router.post('/', crearMensaje);

// Rutas protegidas para el personal académico
router.get('/', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), getMensajes);
router.put('/:id/leido', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), toggleLeido);
router.delete('/:id', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), deleteMensaje);
router.put('/:id/restore', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), restoreMensaje);

// Papelera y Hard Delete (Admin y Superadmin)
router.delete('/trash/empty', protect, authorizeRoles('superadmin', 'admin'), emptyTrashMensajes);
router.delete('/:id/force', protect, authorizeRoles('superadmin', 'admin'), forceDeleteMensaje);

export default router;
