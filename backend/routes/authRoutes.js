import express from 'express';
import { register, login, getUsers, createUser, updateUser, deleteUser, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);

// Rutas de administración de usuarios (solo superadmin)
router.route('/users')
  .get(protect, getUsers)
  .post(protect, createUser);

router.route('/users/:id')
  .put(protect, updateUser)
  .delete(protect, deleteUser);

export default router;
