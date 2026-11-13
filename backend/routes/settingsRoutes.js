import express from 'express';
import { getSettings, updateSettings, togglePeriodo } from '../controllers/settingsController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protect, authorizeRoles('superadmin', 'admin', 'preceptor'), updateSettings);

router.patch('/toggle/:field', protect, authorizeRoles('superadmin', 'admin', 'preceptor'), togglePeriodo);

export default router;
