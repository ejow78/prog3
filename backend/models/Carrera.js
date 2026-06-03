import mongoose from 'mongoose';

const carreraSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true },
  duracion: { type: String, required: true },
  tipo: { type: String, required: true },
  horario: { type: String, required: true },
  descripcion: { type: String, required: true },
  perfil: { type: String, required: true },
  habilidades: [{ type: String }],
  horariosSemanales: [
    {
      año: { type: String, required: true },
      franjas: [
        {
          hora: String,
          esRecreo: { type: Boolean, default: false },
          lunes: { materia: String, profesor: String },
          martes: { materia: String, profesor: String },
          miercoles: { materia: String, profesor: String },
          jueves: { materia: String, profesor: String },
          viernes: { materia: String, profesor: String }
        }
      ]
    }
  ],
  materias: [
    {
      año: { type: String, required: true },
      nombres: [{ type: String }],
      materiasDetalle: [
        {
          nombre: { type: String, required: true },
          profesor: { type: String, default: '' }
        }
      ]
    }
  ]
}, {
  timestamps: true
});

const Carrera = mongoose.model('Carrera', carreraSchema);
export default Carrera;
