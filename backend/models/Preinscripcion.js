import mongoose from 'mongoose';

const preinscripcionSchema = new mongoose.Schema({
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
  genero: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  localidad: {
    type: String,
    required: true
  },
  carrera: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'Aprobada', 'Rechazada'],
    default: 'Pendiente'
  }
}, {
  timestamps: true // Esto crea automáticamente createdAt y updatedAt con la fecha y hora
});

// Índice compuesto para que un mismo DNI no pueda inscribirse dos veces a la misma carrera
preinscripcionSchema.index({ dni: 1, carrera: 1 }, { unique: true });

const Preinscripcion = mongoose.model('Preinscripcion', preinscripcionSchema);

export default Preinscripcion;
