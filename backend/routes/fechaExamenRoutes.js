import express from 'express';
import { 
  getFechasExamenes, 
  crearFechaExamen, 
  updateFechaExamen, 
  deleteFechaExamen 
} from '../controllers/fechaExamenController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getFechasExamenes)
  .post(protect, crearFechaExamen);

router.route('/:id')
  .put(protect, updateFechaExamen)
  .delete(protect, deleteFechaExamen);

export default router;
