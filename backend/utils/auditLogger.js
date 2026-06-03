import AuditLog from '../models/AuditLog.js';

export const logAudit = async (req, accion, modulo, detalle) => {
  try {
    const adminId = req?.admin?._id || null;
    const username = req?.admin?.username || 'Sistema';
    
    await AuditLog.create({
      adminId,
      username,
      accion,
      modulo,
      detalle
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error.message);
  }
};
