import Preinscripcion from '../models/Preinscripcion.js';
import { logAudit } from '../utils/auditLogger.js';
import SystemSettings from '../models/SystemSettings.js';

// Crear una nueva preinscripción
export const crearPreinscripcion = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne({});
    if (settings) {
      const d = new Date();
      const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const formatStringDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
      };

      if (!settings.preinscripcionesAbiertas) {
        return res.status(400).json({ 
          message: 'Las preinscripciones se encuentran cerradas temporalmente por el ciclo lectivo actual.' 
        });
      }
      
      if (settings.preinscripcionesInicio && settings.preinscripcionesFin) {
        if (localToday < settings.preinscripcionesInicio) {
          return res.status(400).json({
            message: `El periodo de preinscripciones se habilitará a partir del ${formatStringDate(settings.preinscripcionesInicio)}.`
          });
        }
        if (localToday > settings.preinscripcionesFin) {
          return res.status(400).json({
            message: `El periodo de preinscripciones finalizó el ${formatStringDate(settings.preinscripcionesFin)}.`
          });
        }
      }
    }

    const { dni, carrera } = req.body;

    // Verificar si ya existe una inscripción para este DNI en esta carrera
    const existeInscripcion = await Preinscripcion.findOne({ dni, carrera });
    if (existeInscripcion) {
      return res.status(400).json({ 
        message: `El DNI ${dni} ya se encuentra registrado para la carrera de ${carrera}.` 
      });
    }

    const nuevaPreinscripcion = new Preinscripcion(req.body);
    await nuevaPreinscripcion.save();
    
    res.status(201).json({ 
      message: 'Preinscripción enviada con éxito',
      preinscripcion: nuevaPreinscripcion
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ya existe una inscripción registrada con este DNI para esta carrera.' });
    }
    res.status(500).json({ message: 'Error al enviar la preinscripción', error: error.message });
  }
};

// Obtener todas las preinscripciones (Para el admin dashboard)
export const getPreinscripciones = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne({});
    const year = settings ? settings.activeYear : new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const query = { createdAt: { $gte: startOfYear } };
    const preinscripciones = await Preinscripcion.find(query).sort({ createdAt: -1 }); // Las más recientes primero
    res.json(preinscripciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las preinscripciones', error: error.message });
  }
};

// Actualizar el estado de una preinscripción
export const updateEstadoPreinscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['Pendiente', 'Aprobada', 'Rechazada'].includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const preinscripcionActualizada = await Preinscripcion.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    );

    if (!preinscripcionActualizada) {
      return res.status(404).json({ message: 'Preinscripción no encontrada' });
    }

    await logAudit(req, estado === 'Aprobada' ? 'APROBAR_PREINSCRIPCION' : 'RECHAZAR_PREINSCRIPCION', 'Preinscripciones', `Se cambió el estado a ${estado} de la preinscripción de ${preinscripcionActualizada.nombre} ${preinscripcionActualizada.apellido} (${preinscripcionActualizada.carrera})`);

    res.json({
      message: `Estado actualizado a ${estado}`,
      preinscripcion: preinscripcionActualizada
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
  }
};

// Borrar una preinscripción
export const deletePreinscripcion = async (req, res) => {
  try {
    const preinscripcion = await Preinscripcion.findByIdAndDelete(req.params.id);
    if (!preinscripcion) {
      return res.status(404).json({ message: 'Preinscripción no encontrada' });
    }
    await logAudit(req, 'ELIMINAR_PREINSCRIPCION', 'Preinscripciones', `Se eliminó la preinscripción de ${preinscripcion.nombre} ${preinscripcion.apellido} (${preinscripcion.carrera})`);
    res.json({ message: 'Preinscripción eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la preinscripción', error: error.message });
  }
};
