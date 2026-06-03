import mongoose from 'mongoose';

const fechaExamenSchema = new mongoose.Schema({
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
  llamadoFechas: {
    type: String,
    required: true,
    trim: true
  },
  carrera: {
    type: String,
    required: true,
    trim: true
  },
  materia: {
    type: [String],
    required: true
  },
  fecha: {
    type: String,
    required: true,
    trim: true
  },
  hora: {
    type: String,
    required: true,
    trim: true
  },
  tribunal: {
    type: String,
    required: true,
    trim: true
  },
}, {
  timestamps: true
});

const FechaExamen = mongoose.model('FechaExamen', fechaExamenSchema);

export default FechaExamen;
