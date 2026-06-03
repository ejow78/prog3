import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  },
  username: {
    type: String,
    required: true,
    default: 'Sistema'
  },
  accion: {
    type: String,
    required: true
  },
  modulo: {
    type: String,
    required: true
  },
  detalle: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: 'fecha', updatedAt: false }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
