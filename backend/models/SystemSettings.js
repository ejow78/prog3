import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  activeYear: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  },
  preinscripcionesAbiertas: {
    type: Boolean,
    required: true,
    default: true
  },
  preinscripcionesInicio: {
    type: String,
    default: null
  },
  preinscripcionesFin: {
    type: String,
    default: null
  },
  examenesAbiertos: {
    type: Boolean,
    required: true,
    default: true
  },
  examenes1LlamadoInicio: {
    type: String,
    default: null
  },
  examenes1LlamadoFin: {
    type: String,
    default: null
  },
  examenes2LlamadoInicio: {
    type: String,
    default: null
  },
  examenes2LlamadoFin: {
    type: String,
    default: null
  },
  examenesEspLlamadoInicio: {
    type: String,
    default: null
  },
  examenesEspLlamadoFin: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('SystemSettings', systemSettingsSchema);
