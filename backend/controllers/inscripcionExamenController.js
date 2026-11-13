import InscripcionExamen from '../models/InscripcionExamen.js';
import { logAudit } from '../utils/auditLogger.js';
import SystemSettings from '../models/SystemSettings.js';
import FechaExamen from '../models/FechaExamen.js';

// Crear una nueva inscripción a exámenes
export const crearInscripcion = async (req, res) => {
  try {
    const { nombre, apellido, dni, carrera, turno, llamado, añoCursando, materias } = req.body;

    if (!nombre || !apellido || !dni || !carrera || !turno || !llamado || !añoCursando || !materias || materias.length === 0) {
      return res.status(400).json({ message: 'Todos los campos son requeridos, incluyendo al menos una materia.' });
    }

    const settings = await SystemSettings.findOne({});
    if (settings && !settings.examenesAbiertos) {
      return res.status(400).json({
        message: 'Las inscripciones a exámenes finales se encuentran cerradas temporalmente.'
      });
    }

    // Verify registration date window for this called sitting globally using settings
    if (settings) {
      let inicio = null;
      let fin = null;
      if (llamado === 'Primer Llamado') {
        inicio = settings.examenes1LlamadoInicio;
        fin = settings.examenes1LlamadoFin;
      } else if (llamado === 'Segundo Llamado') {
        inicio = settings.examenes2LlamadoInicio;
        fin = settings.examenes2LlamadoFin;
      } else if (llamado === 'Llamado Especial') {
        inicio = settings.examenesEspLlamadoInicio;
        fin = settings.examenesEspLlamadoFin;
      }

      if (inicio && fin) {
        const d = new Date();
        const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        const formatStringDate = (dateStr) => {
          if (!dateStr) return '';
          const parts = dateStr.split('-');
          return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
        };

        if (localToday < inicio) {
          return res.status(400).json({
            message: `El periodo de inscripción para el ${llamado} aún no se ha habilitado. Se abrirá el ${formatStringDate(inicio)}.`
          });
        }
        if (localToday > fin) {
          return res.status(400).json({
            message: `El periodo de inscripción para el ${llamado} finalizó el ${formatStringDate(fin)}.`
          });
        }
      }
    }

    // Verificar si ya existe exactamente una inscripción pendiente de este alumno para esta carrera, turno, llamado y año en el ciclo corriente
    const year = settings ? settings.activeYear : new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const existePendiente = await InscripcionExamen.findOne({
      dni,
      carrera,
      turno,
      llamado,
      añoCursando,
      estado: 'Pendiente',
      createdAt: { $gte: startOfYear }
    });

    if (existePendiente) {
      // Verificar si hay intersección de materias
      const materiasComunes = materias.filter(m => existePendiente.materias.includes(m));
      if (materiasComunes.length > 0) {
        return res.status(400).json({
          message: `Ya posees una inscripción pendiente en este llamado para rendir: ${materiasComunes.join(', ')}.`
        });
      }
    }

    const nuevaInscripcion = new InscripcionExamen({
      nombre,
      apellido,
      dni,
      carrera,
      turno,
      llamado,
      añoCursando,
      materias,
      estado: 'Pendiente'
    });

    await nuevaInscripcion.save();

    res.status(201).json({
      message: 'Inscripción a exámenes enviada con éxito.',
      inscripcion: nuevaInscripcion
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar la inscripción a examen.', error: error.message });
  }
};

// Obtener todas las inscripciones (Para el admin dashboard)
export const getInscripciones = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne({});
    const year = settings ? settings.activeYear : new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const includeDeleted = req.query.includeDeleted === 'true';
    const query = { 
      createdAt: { $gte: startOfYear },
      ...(includeDeleted ? {} : { isDeleted: { $ne: true } })
    };
    const inscripciones = await InscripcionExamen.find(query).sort({ createdAt: -1 });
    res.json(inscripciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las inscripciones a exámenes.', error: error.message });
  }
};

// Actualizar el estado de una inscripción
export const updateEstadoInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['Pendiente', 'Aprobada', 'Rechazada'].includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const inscripcionActualizada = await InscripcionExamen.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    );

    if (!inscripcionActualizada) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }

    await logAudit(req, estado === 'Aprobada' ? 'APROBAR_EXAMEN' : 'RECHAZAR_EXAMEN', 'Exámenes', `Se cambió el estado a ${estado} de la inscripción a exámenes de ${inscripcionActualizada.nombre} ${inscripcionActualizada.apellido} (${inscripcionActualizada.carrera} - materias: ${inscripcionActualizada.materias.join(', ')})`);

    res.json({
      message: `Estado actualizado a ${estado}`,
      inscripcion: inscripcionActualizada
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
  }
};

// Borrado lógico (Soft delete) de una inscripción
export const deleteInscripcion = async (req, res) => {
  try {
    const inscripcion = await InscripcionExamen.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.admin ? `${req.admin.username} (${req.admin.role})` : 'Sistema'
      },
      { new: true }
    );
    if (!inscripcion) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    await logAudit(req, 'ELIMINAR_EXAMEN', 'Exámenes', `Se envió a papelera la inscripción a exámenes de ${inscripcion.nombre} ${inscripcion.apellido} (${inscripcion.carrera} - materias: ${inscripcion.materias.join(', ')})`);
    res.json({ message: 'Inscripción a examen enviada a papelera de reciclaje', inscripcion });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la inscripción', error: error.message });
  }
};

// Restaurar inscripción desde la papelera
export const restoreInscripcion = async (req, res) => {
  try {
    const inscripcion = await InscripcionExamen.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      },
      { new: true }
    );
    if (!inscripcion) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    await logAudit(req, 'RESTAURAR_EXAMEN', 'Exámenes', `Se restauró la inscripción a exámenes de ${inscripcion.nombre} ${inscripcion.apellido} (${inscripcion.carrera})`);
    res.json({ message: 'Inscripción a examen restaurada correctamente', inscripcion });
  } catch (error) {
    res.status(500).json({ message: 'Error al restaurar la inscripción', error: error.message });
  }
};

// Eliminación definitiva (Hard Delete) de una inscripción a examen
export const forceDeleteInscripcion = async (req, res) => {
  try {
    const inscripcion = await InscripcionExamen.findByIdAndDelete(req.params.id);
    if (!inscripcion) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    await logAudit(req, 'ELIMINAR_EXAMEN_DEFINITIVO', 'Exámenes', `Se eliminó definitivamente la inscripción a examen de ${inscripcion.nombre} ${inscripcion.apellido} (${inscripcion.carrera})`);
    res.json({ message: 'Inscripción eliminada de forma permanente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar definitivamente la inscripción', error: error.message });
  }
};

// Vaciar papelera de inscripciones a exámenes
export const emptyTrashInscripciones = async (req, res) => {
  try {
    const result = await InscripcionExamen.deleteMany({ isDeleted: true });
    await logAudit(req, 'VACIAR_PAPELERA_EXAMENES', 'Exámenes', `Se vació la papelera de inscripciones a examen (${result.deletedCount} registros eliminados)`);
    res.json({ message: `Se eliminaron ${result.deletedCount} registros de la papelera permanentemente` });
  } catch (error) {
    res.status(500).json({ message: 'Error al vaciar la papelera', error: error.message });
  }
};
