import mongoose from 'mongoose';

const materiaSchema = new mongoose.Schema({
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
  nombre: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  profesor: {
    type: String,
    default: '',
    trim: true
  },
  orden: {
    type: Number,
    default: 0
  },
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

const Materia = mongoose.model('Materia', materiaSchema);
export default Materia;
