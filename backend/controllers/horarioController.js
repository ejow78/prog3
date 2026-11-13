import Horario from '../models/Horario.js';
import Carrera from '../models/Carrera.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Obtener horarios (filtrado por carreraId o año)
// @route   GET /api/horarios
export const getHorarios = async (req, res) => {
  try {
    const { carreraId, año, includeDeleted } = req.query;
    const query = {};

    if (carreraId) query.carreraId = parseInt(carreraId, 10);
    if (año) query.año = año;
    if (includeDeleted !== 'true') query.isDeleted = { $ne: true };

    const horarios = await Horario.find(query).sort({ carreraId: 1, año: 1 });
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener horarios', error: error.message });
  }
};

// @desc    Guardar o actualizar cronograma semanal de un año de carrera
// @route   POST /api/horarios/guardar
export const saveHorarioAño = async (req, res) => {
  try {
    const { carreraId, año, franjas } = req.body;
    if (!carreraId || !año || !Array.isArray(franjas)) {
      return res.status(400).json({ message: 'carreraId, año y franjas son obligatorios.' });
    }

    const carrera = await Carrera.findOne({ id: carreraId });
    const carreraNombre = carrera ? carrera.nombre : `Carrera ${carreraId}`;

    const horarioDoc = await Horario.findOneAndUpdate(
      { carreraId, año },
      {
        carreraId,
        carreraNombre,
        año,
        franjas,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      },
      { upsert: true, new: true }
    );

    // Sincronizar en Carrera para compatibilidad histórica
    if (carrera) {
      const list = carrera.horariosSemanales || [];
      const idx = list.findIndex(h => h.año === año);
      if (idx >= 0) {
        list[idx] = { año, franjas };
      } else {
        list.push({ año, franjas });
      }
      carrera.horariosSemanales = list;
      await carrera.save();
    }

    await logAudit(req, 'MODIFICAR_HORARIOS', 'Horarios', `Se actualizó el horario de ${carreraNombre} (${año})`);
    res.json({ message: 'Horario guardado correctamente', horario: horarioDoc });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar horario', error: error.message });
  }
};

// @desc    Guardar todos los horarios de una carrera
// @route   PUT /api/horarios/carrera/:carreraId
export const saveHorariosCarrera = async (req, res) => {
  try {
    const carreraId = parseInt(req.params.carreraId, 10);
    const { horariosSemanales } = req.body;

    if (!Array.isArray(horariosSemanales)) {
      return res.status(400).json({ message: 'Se esperaba un arreglo de horariosSemanales' });
    }

    const carrera = await Carrera.findOne({ id: carreraId });
    const carreraNombre = carrera ? carrera.nombre : `Carrera ${carreraId}`;

    const resultados = [];
    for (const h of horariosSemanales) {
      if (!h.año) continue;
      const doc = await Horario.findOneAndUpdate(
        { carreraId, año: h.año },
        {
          carreraId,
          carreraNombre,
          año: h.año,
          franjas: h.franjas || [],
          isDeleted: false,
          deletedAt: null,
          deletedBy: null
        },
        { upsert: true, new: true }
      );
      resultados.push(doc);
    }

    // Sincronizar en carrera
    if (carrera) {
      carrera.horariosSemanales = horariosSemanales;
      await carrera.save();
    }

    await logAudit(req, 'MODIFICAR_HORARIOS', 'Horarios', `Se actualizaron los horarios de ${carreraNombre}`);
    res.json({ message: 'Horarios actualizados correctamente', horarios: resultados });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar horarios', error: error.message });
  }
};

// @desc    Borrado lógico de horario
// @route   DELETE /api/horarios/:id
export const deleteHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Horario.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.admin ? `${req.admin.username} (${req.admin.role})` : 'Sistema'
      },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }

    await logAudit(req, 'ELIMINAR_HORARIOS', 'Horarios', `Se envió a papelera el horario de ${doc.carreraNombre} (${doc.año})`);
    res.json({ message: 'Horario enviado a papelera', horario: doc });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar horario', error: error.message });
  }
};

// @desc    Restaurar horario de la papelera
// @route   PUT /api/horarios/:id/restore
export const restoreHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Horario.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }
    await logAudit(req, 'RESTAURAR_HORARIOS', 'Horarios', `Se restauró el horario de ${doc.carreraNombre} (${doc.año})`);
    res.json({ message: 'Horario restaurado con éxito', horario: doc });
  } catch (error) {
    res.status(500).json({ message: 'Error al restaurar horario', error: error.message });
  }
};

// @desc    Eliminar definitivamente un horario (Hard Delete)
// @route   DELETE /api/horarios/:id/force
export const forceDeleteHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Horario.findByIdAndDelete(id);
    if (!doc) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }
    await logAudit(req, 'ELIMINAR_HORARIOS_DEFINITIVO', 'Horarios', `Se eliminó definitivamente el horario de ${doc.carreraNombre} (${doc.año})`);
    res.json({ message: 'Horario eliminado de forma permanente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar definitivamente el horario', error: error.message });
  }
};

// @desc    Vaciar papelera de horarios
// @route   DELETE /api/horarios/trash/empty
export const emptyTrashHorarios = async (req, res) => {
  try {
    const result = await Horario.deleteMany({ isDeleted: true });
    await logAudit(req, 'VACIAR_PAPELERA_HORARIOS', 'Horarios', `Se vació la papelera de horarios (${result.deletedCount} eliminados)`);
    res.json({ message: `Se eliminaron ${result.deletedCount} horarios de la papelera permanentemente` });
  } catch (error) {
    res.status(500).json({ message: 'Error al vaciar la papelera', error: error.message });
  }
};
