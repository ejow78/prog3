import FechaExamen from '../models/FechaExamen.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Obtener todas las fechas de exámenes
// @route   GET /api/fechas-examenes
// @access  Público / Admin
export const getFechasExamenes = async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const query = includeDeleted ? {} : { isDeleted: { $ne: true } };
    const fechas = await FechaExamen.find(query).sort({ fecha: 1, hora: 1 });
    res.json(fechas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las fechas de exámenes', error: error.message });
  }
};

// @desc    Crear una nueva fecha de examen
// @route   POST /api/fechas-examenes
// @access  Privado (Admin, Preceptor, Superadmin)
export const crearFechaExamen = async (req, res) => {
  try {
    const { turno, llamado, llamadoFechas, carrera, materia, fecha, hora, tribunal } = req.body;

    if (!turno || !llamado || !llamadoFechas || !carrera || !materia || !fecha || !hora || !tribunal || (Array.isArray(materia) && materia.length === 0)) {
      return res.status(400).json({ message: 'Por favor complete todos los campos obligatorios y seleccione al menos una materia' });
    }

    const nuevaFecha = await FechaExamen.create({
      turno,
      llamado,
      llamadoFechas,
      carrera,
      materia,
      fecha,
      hora,
      tribunal
    });

    await logAudit(req, 'CREAR_FECHA_EXAMEN', 'Fechas Exámenes', `Se creó mesa de examen: ${nuevaFecha.materia.join(', ')} (${nuevaFecha.carrera}) - Fecha: ${nuevaFecha.fecha}`);

    res.status(201).json(nuevaFecha);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la fecha de examen', error: error.message });
  }
};

// @desc    Actualizar una fecha de examen existente
// @route   PUT /api/fechas-examenes/:id
// @access  Privado (Admin, Preceptor, Superadmin)
export const updateFechaExamen = async (req, res) => {
  try {
    const { id } = req.params;
    const { turno, llamado, llamadoFechas, carrera, materia, fecha, hora, tribunal } = req.body;

    const fechaExistente = await FechaExamen.findById(id);
    if (!fechaExistente) {
      return res.status(404).json({ message: 'No se encontró la fecha de examen especificada' });
    }

    fechaExistente.turno = turno || fechaExistente.turno;
    fechaExistente.llamado = llamado || fechaExistente.llamado;
    fechaExistente.llamadoFechas = llamadoFechas || fechaExistente.llamadoFechas;
    fechaExistente.carrera = carrera || fechaExistente.carrera;
    fechaExistente.materia = materia || fechaExistente.materia;
    fechaExistente.fecha = fecha || fechaExistente.fecha;
    fechaExistente.hora = hora || fechaExistente.hora;
    fechaExistente.tribunal = tribunal || fechaExistente.tribunal;

    const fechaActualizada = await fechaExistente.save();

    await logAudit(req, 'MODIFICAR_FECHA_EXAMEN', 'Fechas Exámenes', `Se actualizó mesa de examen: ${fechaActualizada.materia.join(', ')} (${fechaActualizada.carrera}) - Fecha: ${fechaActualizada.fecha}`);

    res.json(fechaActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la fecha de examen', error: error.message });
  }
};

// @desc    Borrado lógico de una fecha de examen (Soft Delete)
// @route   DELETE /api/fechas-examenes/:id
// @access  Privado (Admin, Preceptor, Superadmin)
export const deleteFechaExamen = async (req, res) => {
  try {
    const { id } = req.params;

    const fechaExistente = await FechaExamen.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.admin ? `${req.admin.username} (${req.admin.role})` : 'Sistema'
      },
      { new: true }
    );

    if (!fechaExistente) {
      return res.status(404).json({ message: 'No se encontró la fecha de examen especificada' });
    }

    await logAudit(req, 'ELIMINAR_FECHA_EXAMEN', 'Fechas Exámenes', `Se envió a papelera mesa de examen: ${fechaExistente.materia.join(', ')} (${fechaExistente.carrera})`);

    res.json({ message: 'Fecha de examen enviada a la papelera de reciclaje', fecha: fechaExistente });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la fecha de examen', error: error.message });
  }
};

// @desc    Restaurar una fecha de examen desde la papelera
// @route   PUT /api/fechas-examenes/:id/restore
export const restoreFechaExamen = async (req, res) => {
  try {
    const { id } = req.params;
    const fecha = await FechaExamen.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    );
    if (!fecha) {
      return res.status(404).json({ message: 'Fecha de examen no encontrada' });
    }
    await logAudit(req, 'RESTAURAR_FECHA_EXAMEN', 'Fechas Exámenes', `Se restauró mesa de examen: ${fecha.materia.join(', ')} (${fecha.carrera})`);
    res.json({ message: 'Fecha de examen restaurada con éxito', fecha });
  } catch (error) {
    res.status(500).json({ message: 'Error al restaurar fecha de examen', error: error.message });
  }
};

// @desc    Eliminar definitivamente una fecha de examen (Hard Delete)
// @route   DELETE /api/fechas-examenes/:id/force
export const forceDeleteFechaExamen = async (req, res) => {
  try {
    const { id } = req.params;
    const fecha = await FechaExamen.findByIdAndDelete(id);
    if (!fecha) {
      return res.status(404).json({ message: 'Fecha de examen no encontrada' });
    }
    await logAudit(req, 'ELIMINAR_FECHA_EXAMEN_DEFINITIVA', 'Fechas Exámenes', `Se eliminó definitivamente la mesa de examen: ${fecha.materia.join(', ')} (${fecha.carrera})`);
    res.json({ message: 'Fecha de examen eliminada de forma permanente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar definitivamente la fecha de examen', error: error.message });
  }
};

// @desc    Vaciar papelera de fechas de exámenes
// @route   DELETE /api/fechas-examenes/trash/empty
export const emptyTrashFechasExamenes = async (req, res) => {
  try {
    const result = await FechaExamen.deleteMany({ isDeleted: true });
    await logAudit(req, 'VACIAR_PAPELERA_FECHAS_EXAMEN', 'Fechas Exámenes', `Se vació la papelera de fechas de exámenes (${result.deletedCount} eliminadas)`);
    res.json({ message: `Se eliminaron ${result.deletedCount} fechas de exámenes de la papelera permanentemente` });
  } catch (error) {
    res.status(500).json({ message: 'Error al vaciar la papelera', error: error.message });
  }
};
