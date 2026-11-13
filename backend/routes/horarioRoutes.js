import express from 'express';
import { 
  getHorarios, 
  saveHorarioAño, 
  saveHorariosCarrera, 
  deleteHorario 
} from '../controllers/horarioController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getHorarios);

router.post('/guardar', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), saveHorarioAño);
router.put('/carrera/:carreraId', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), saveHorariosCarrera);
router.delete('/:id', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), deleteHorario);

export default router;
