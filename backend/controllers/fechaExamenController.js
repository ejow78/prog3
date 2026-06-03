import FechaExamen from '../models/FechaExamen.js';
import { logAudit } from '../utils/auditLogger.js';

// @desc    Obtener todas las fechas de exámenes
// @route   GET /api/fechas-examenes
// @access  Público
export const getFechasExamenes = async (req, res) => {
  try {
    const fechas = await FechaExamen.find().sort({ fecha: 1, hora: 1 });
    res.json(fechas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las fechas de exámenes', error: error.message });
  }
};

// @desc    Crear una nueva fecha de examen
// @route   POST /api/fechas-examenes
// @access  Privado (Admin)
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
// @access  Privado (Admin)
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

// @desc    Eliminar una fecha de examen
// @route   DELETE /api/fechas-examenes/:id
// @access  Privado (Admin)
export const deleteFechaExamen = async (req, res) => {
  try {
    const { id } = req.params;

    const fechaExistente = await FechaExamen.findById(id);
    if (!fechaExistente) {
      return res.status(404).json({ message: 'No se encontró la fecha de examen especificada' });
    }

    await fechaExistente.deleteOne();

    await logAudit(req, 'ELIMINAR_FECHA_EXAMEN', 'Fechas Exámenes', `Se eliminó mesa de examen: ${fechaExistente.materia.join(', ')} (${fechaExistente.carrera}) - Fecha: ${fechaExistente.fecha}`);

    res.json({ message: 'Fecha de examen eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la fecha de examen', error: error.message });
  }
};
