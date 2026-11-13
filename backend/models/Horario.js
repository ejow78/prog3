import mongoose from 'mongoose';

const horarioSchema = new mongoose.Schema({
  carreraId: {
    type: Number,
    required: true,
    index: true
  },
  carreraNombre: {
    type: String,
    required: true
  },
  año: {
    type: String, // '1° Año', '2° Año', etc.
    required: true,
    index: true
  },
  franjas: [
    {
      hora: { type: String, required: true },
      esRecreo: { type: Boolean, default: false },
      lunes: {
        materia: { type: String, default: '' },
        profesor: { type: String, default: '' }
      },
      martes: {
        materia: { type: String, default: '' },
        profesor: { type: String, default: '' }
      },
      miercoles: {
        materia: { type: String, default: '' },
        profesor: { type: String, default: '' }
      },
      jueves: {
        materia: { type: String, default: '' },
        profesor: { type: String, default: '' }
      },
      viernes: {
        materia: { type: String, default: '' },
        profesor: { type: String, default: '' }
      }
    }
  ],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Horario = mongoose.model('Horario', horarioSchema);
export default Horario;
