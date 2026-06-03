import Carrera from '../models/Carrera.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Obtener todas las carreras
// @route   GET /api/carreras
export const getCarreras = async (req, res) => {
  try {
    const carreras = await Carrera.find({});
    res.json(carreras);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar una carrera (horario, etc)
// @route   PUT /api/carreras/:id
export const updateCarrera = async (req, res) => {
  try {
    const { id } = req.params;
    
    const carrera = await Carrera.findOneAndUpdate(
      { id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!carrera) {
      return res.status(404).json({ message: 'Carrera no encontrada' });
    }

    const isUpdatingHorarios = req.body.horariosSemanales !== undefined;
    const isUpdatingMaterias = req.body.materias !== undefined || req.body.materiasDetalle !== undefined;
    
    let moduloName = 'Carreras';
    let accionName = 'MODIFICAR_CARRERA';
    let detalleText = `Se actualizó la carrera: ${carrera.nombre} (ID: ${carrera.id})`;

    if (isUpdatingHorarios) {
      moduloName = 'Horarios';
      accionName = 'MODIFICAR_HORARIOS';
      detalleText = `Se actualizaron los horarios semanales de la carrera: ${carrera.nombre} (ID: ${carrera.id})`;
    } else if (isUpdatingMaterias) {
      moduloName = 'Materias';
      accionName = 'MODIFICAR_MATERIAS';
      detalleText = `Se actualizó el plan de materias y docentes de la carrera: ${carrera.nombre} (ID: ${carrera.id})`;
    }

    await logAudit(req, accionName, moduloName, detalleText);

    res.json(carrera);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear nueva carrera
// @route   POST /api/carreras
export const createCarrera = async (req, res) => {
  try {
    // Generate new ID by finding the max current ID
    const maxCarrera = await Carrera.findOne().sort('-id');
    const newId = maxCarrera ? maxCarrera.id + 1 : 1;

    const nuevaCarrera = new Carrera({
      ...req.body,
      id: newId
    });

    const carreraGuardada = await nuevaCarrera.save();

    await logAudit(req, 'CREAR_CARRERA', 'Carreras', `Se creó la carrera: ${carreraGuardada.nombre} (ID: ${carreraGuardada.id})`);

    res.status(201).json(carreraGuardada);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Eliminar una carrera
// @route   DELETE /api/carreras/:id
export const deleteCarrera = async (req, res) => {
  try {
    const { id } = req.params;
    const carrera = await Carrera.findOneAndDelete({ id });

    if (!carrera) {
      return res.status(404).json({ message: 'Carrera no encontrada' });
    }

    await logAudit(req, 'ELIMINAR_CARRERA', 'Carreras', `Se eliminó la carrera: ${carrera.nombre} (ID: ${carrera.id})`);

    res.json({ message: 'Carrera eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
