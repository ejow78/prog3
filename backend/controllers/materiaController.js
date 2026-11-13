import Materia from '../models/Materia.js';
import Carrera from '../models/Carrera.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Obtener materias (con filtros opcionales por carreraId, año, o búsqueda)
// @route   GET /api/materias
export const getMaterias = async (req, res) => {
  try {
    const { carreraId, año, busqueda, includeDeleted } = req.query;
    const query = {};

    if (carreraId) query.carreraId = parseInt(carreraId, 10);
    if (año) query.año = año;
    if (includeDeleted !== 'true') query.isDeleted = { $ne: true };

    if (busqueda) {
      query.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { profesor: { $regex: busqueda, $options: 'i' } }
      ];
    }

    const materias = await Materia.find(query).sort({ carreraId: 1, año: 1, orden: 1, nombre: 1 });
    res.json(materias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener materias', error: error.message });
  }
};

// @desc    Crear una nueva materia
// @route   POST /api/materias
export const createMateria = async (req, res) => {
  try {
    const { carreraId, carreraNombre, año, nombre, profesor, orden } = req.body;

    if (!carreraId || !año || !nombre) {
      return res.status(400).json({ message: 'carreraId, año y nombre son obligatorios.' });
    }

    // Buscar el nombre de la carrera si no vino
    let finalCarreraNombre = carreraNombre;
    if (!finalCarreraNombre) {
      const c = await Carrera.findOne({ id: carreraId });
      finalCarreraNombre = c ? c.nombre : `Carrera ${carreraId}`;
    }

    const nueva = new Materia({
      carreraId,
      carreraNombre: finalCarreraNombre,
      año,
      nombre: nombre.trim().toUpperCase(),
      profesor: (profesor || '').trim(),
      orden: orden || 0
    });

    const guardada = await nueva.save();
    await logAudit(req, 'CREAR_MATERIA', 'Materias', `Se creó la materia: ${guardada.nombre} para ${guardada.carreraNombre} (${guardada.año})`);

    res.status(201).json(guardada);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear materia', error: error.message });
  }
};

// @desc    Actualizar materia existente
// @route   PUT /api/materias/:id
export const updateMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.nombre) updates.nombre = updates.nombre.trim().toUpperCase();
    if (updates.profesor !== undefined) updates.profesor = updates.profesor.trim();

    const actualizada = await Materia.findByIdAndUpdate(id, updates, { new: true });
    if (!actualizada) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    await logAudit(req, 'MODIFICAR_MATERIA', 'Materias', `Se actualizó la materia: ${actualizada.nombre}`);
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar materia', error: error.message });
  }
};

// @desc    Guardar asignaciones masivas de un año de carrera
// @route   POST /api/materias/bulk
export const bulkSaveMaterias = async (req, res) => {
  try {
    const { carreraId, año, materias } = req.body;
    if (!carreraId || !año || !Array.isArray(materias)) {
      return res.status(400).json({ message: 'Datos incompletos para guardado masivo.' });
    }

    const carrera = await Carrera.findOne({ id: carreraId });
    const carreraNombre = carrera ? carrera.nombre : `Carrera ${carreraId}`;

    // Marcar como borradas las que ya no están en la lista para este año y carrera
    const nombresActuales = materias.map(m => (m.nombre || '').trim().toUpperCase());
    await Materia.updateMany(
      { carreraId, año, nombre: { $nin: nombresActuales }, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.admin ? `${req.admin.username} (${req.admin.role})` : 'Sistema' }
    );

    // Actualizar o crear las de la lista
    const resultados = [];
    for (let i = 0; i < materias.length; i++) {
      const item = materias[i];
      const nombre = (item.nombre || '').trim().toUpperCase();
      if (!nombre) continue;

      const doc = await Materia.findOneAndUpdate(
        { carreraId, año, nombre },
        {
          carreraId,
          carreraNombre,
          año,
          nombre,
          profesor: (item.profesor || '').trim(),
          orden: i,
          isDeleted: false,
          deletedAt: null,
          deletedBy: null
        },
        { upsert: true, new: true }
      );
      resultados.push(doc);
    }

    // Mantener sincronizado el documento embebido de carrera para compatibilidad
    if (carrera) {
      const planExistente = carrera.materias || [];
      const idx = planExistente.findIndex(p => p.año === año);
      const nuevoObj = {
        año,
        nombres: resultados.map(r => r.nombre),
        materiasDetalle: resultados.map(r => ({ nombre: r.nombre, profesor: r.profesor }))
      };
      if (idx >= 0) {
        planExistente[idx] = nuevoObj;
      } else {
        planExistente.push(nuevoObj);
      }
      carrera.materias = planExistente;
      await carrera.save();
    }

    await logAudit(req, 'GUARDAR_PLAN_MATERIAS', 'Materias', `Se actualizó el plan de materias de ${carreraNombre} (${año})`);
    res.json({ message: 'Materias guardadas correctamente', count: resultados.length, materias: resultados });
  } catch (error) {
    res.status(500).json({ message: 'Error en guardado masivo de materias', error: error.message });
  }
};

// @desc    Borrado lógico de materia
// @route   DELETE /api/materias/:id
export const deleteMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const mat = await Materia.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.admin ? `${req.admin.username} (${req.admin.role})` : 'Sistema'
      },
      { new: true }
    );
    if (!mat) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    await logAudit(req, 'ELIMINAR_MATERIA', 'Materias', `Se envió a papelera la materia: ${mat.nombre} (${mat.carreraNombre})`);
    res.json({ message: 'Materia enviada a papelera de reciclaje', materia: mat });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar materia', error: error.message });
  }
};

// @desc    Restaurar materia
// @route   PUT /api/materias/:id/restore
export const restoreMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const mat = await Materia.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    );
    if (!mat) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    await logAudit(req, 'RESTAURAR_MATERIA', 'Materias', `Se restauró la materia: ${mat.nombre}`);
    res.json({ message: 'Materia restaurada correctamente', materia: mat });
  } catch (error) {
    res.status(500).json({ message: 'Error al restaurar materia', error: error.message });
  }
};

// @desc    Eliminar definitivamente una materia
// @route   DELETE /api/materias/:id/force
export const forceDeleteMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const mat = await Materia.findByIdAndDelete(id);
    if (!mat) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }
    await logAudit(req, 'ELIMINAR_MATERIA_DEFINITIVA', 'Materias', `Se eliminó definitivamente la materia: ${mat.nombre} (${mat.carreraNombre})`);
    res.json({ message: 'Materia eliminada de forma permanente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar definitivamente la materia', error: error.message });
  }
};

// @desc    Vaciar papelera de materias
// @route   DELETE /api/materias/trash/empty
export const emptyTrashMaterias = async (req, res) => {
  try {
    const result = await Materia.deleteMany({ isDeleted: true });
    await logAudit(req, 'VACIAR_PAPELERA_MATERIAS', 'Materias', `Se vació la papelera de materias (${result.deletedCount} eliminadas)`);
    res.json({ message: `Se eliminaron ${result.deletedCount} materias de la papelera permanentemente` });
  } catch (error) {
    res.status(500).json({ message: 'Error al vaciar la papelera', error: error.message });
  }
};
