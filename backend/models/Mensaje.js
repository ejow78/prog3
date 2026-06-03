import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  telefono: {
    type: String,
    trim: true
  },
  asunto: {
    type: String,
    trim: true
  },
  mensaje: {
    type: String,
    required: true,
    trim: true
  },
  leido: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Esto crea automáticamente createdAt y updatedAt con la fecha y hora
});

const Mensaje = mongoose.model('Mensaje', mensajeSchema);

export default Mensaje;
