import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

import { logAudit } from '../utils/auditLogger.js';

// Generar un JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_ieslacocha_2026', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Por favor, complete todos los campos' });
    }

    const usernameExists = await Admin.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
    }

    const admin = await Admin.create({
      username,
      email,
      password,
      role: role || 'admin'
    });

    if (admin) {
      await logAudit({ admin }, 'REGISTRO', 'Seguridad', `Nuevo administrador registrado: ${admin.username} (${admin.role})`);
      res.status(201).json({
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400).json({ message: 'Datos de administrador inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.comparePassword(password))) {
      await logAudit({ admin }, 'LOGIN', 'Seguridad', `Inicio de sesión exitoso: ${admin.username} (${admin.role})`);
      res.json({
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes.' });
    }
    const users = await Admin.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes.' });
    }
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Por favor, complete todos los campos obligatorios.' });
    }

    const usernameExists = await Admin.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
    }

    const newUser = await Admin.create({
      username,
      email,
      password,
      role: role || 'admin'
    });

    await logAudit(req, 'CREAR_ADMINISTRADOR', 'Seguridad', `Se creó la cuenta del administrador: ${newUser.username} (${newUser.role})`);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes.' });
    }
    const { id } = req.params;
    const { username, email, role, password } = req.body;

    const user = await Admin.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Administrador no encontrado.' });
    }

    if (username && username !== user.username) {
      const usernameExists = await Admin.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
      }
      user.email = email;
    }

    if (role) {
      if (user._id.toString() === req.admin._id.toString() && role !== 'superadmin') {
        return res.status(400).json({ message: 'No puedes degradar tu propio rol de Superusuario.' });
      }
      user.role = role;
    }

    if (password) {
      user.password = password;
    }

    await user.save();

    await logAudit(req, 'MODIFICAR_ADMINISTRADOR', 'Seguridad', `Se actualizó la cuenta del administrador: ${user.username} (${user.role})`);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes.' });
    }
    const { id } = req.params;

    if (id === req.admin._id.toString()) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de Superusuario.' });
    }

    const user = await Admin.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Administrador no encontrado.' });
    }

    await user.deleteOne();

    await logAudit(req, 'ELIMINAR_ADMINISTRADOR', 'Seguridad', `Se eliminó la cuenta del administrador: ${user.username} (${user.role})`);

    res.json({ message: 'Administrador eliminado con éxito.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    await logAudit(req, 'LOGOUT', 'Seguridad', `Cierre de sesión exitoso: ${req.admin.username}`);
    res.json({ message: 'Cierre de sesión exitoso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


