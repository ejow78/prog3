import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res) => {
  try {
    // Only allow superadmin to view audit logs
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes.' });
    }

    const logs = await AuditLog.find({}).sort({ fecha: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener registros de auditoría', error: error.message });
  }
};
