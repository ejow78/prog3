import mongoose from 'mongoose';

const inscripcionExamenSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  dni: {
    type: String,
    required: true,
    trim: true
  },
  carrera: {
    type: String,
    required: true
  },
  turno: {
    type: String,
    required: true,
    trim: true
  },
  llamado: {
    type: String,
    required: true,
    trim: true
  },
  añoCursando: {
    type: String,
    required: true
  },
  materias: [{
    type: String,
    required: true
  }],
  estado: {
    type: String,
    enum: ['Pendiente', 'Aprobada', 'Rechazada'],
    default: 'Pendiente'
  }
}, {
  timestamps: true
});

const InscripcionExamen = mongoose.model('InscripcionExamen', inscripcionExamenSchema);

export default InscripcionExamen;
