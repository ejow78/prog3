import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('superadmin'), getAuditLogs);

export default router;
