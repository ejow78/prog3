import SystemSettings from '../models/SystemSettings.js';
import { logAudit } from '../utils/auditLogger.js';

// Helper to format YYYY-MM-DD to DD/MM/YYYY
const formatDateStr = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// @desc    Obtener configuración del sistema (Público/Admin)
// @route   GET /api/settings
export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({});
    
    // Self-healing: if no settings exist, create defaults
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    
    const settingsObj = settings.toObject();
    
    // Compute Preinscripciones status
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const localToday = `${year}-${month}-${day}`; // YYYY-MM-DD local date
    
    let isPreinscripcionesOpen = settings.preinscripcionesAbiertas;
    let preinscripcionesMensaje = '';
    
    if (isPreinscripcionesOpen && settings.preinscripcionesInicio && settings.preinscripcionesFin) {
      if (localToday < settings.preinscripcionesInicio) {
        isPreinscripcionesOpen = false;
        preinscripcionesMensaje = `El periodo de preinscripciones se habilitará desde el ${formatDateStr(settings.preinscripcionesInicio)} hasta el ${formatDateStr(settings.preinscripcionesFin)}.`;
      } else if (localToday > settings.preinscripcionesFin) {
        isPreinscripcionesOpen = false;
        preinscripcionesMensaje = `El periodo de preinscripciones finalizó el ${formatDateStr(settings.preinscripcionesFin)}.`;
      }
    } else if (!isPreinscripcionesOpen) {
      preinscripcionesMensaje = 'El periodo de preinscripciones para las carreras del IES La Cocha se encuentra temporalmente cerrado.';
    }
    
    // For exams, the global switch is still evaluated for general closures.
    // Individual sittings check their own dates in the frontend/backend controller.
    let isExamenesOpen = settings.examenesAbiertos;
    let examenesMensaje = '';
    if (!isExamenesOpen) {
      examenesMensaje = 'El periodo de inscripciones para las mesas de exámenes finales se encuentra actualmente cerrado.';
    }
    
    settingsObj.isPreinscripcionesOpen = isPreinscripcionesOpen;
    settingsObj.preinscripcionesMensaje = preinscripcionesMensaje;
    settingsObj.isExamenesOpen = isExamenesOpen;
    settingsObj.examenesMensaje = examenesMensaje;
    
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la configuración', error: error.message });
  }
};

// @desc    Actualizar configuración del sistema (Superadmin, Admin, Preceptor)
// @route   PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({});
    if (!settings) {
      settings = new SystemSettings({});
    }

    const { 
      activeYear, 
      preinscripcionesAbiertas, 
      examenesAbiertos,
      preinscripcionesInicio,
      preinscripcionesFin,
      examenes1LlamadoInicio,
      examenes1LlamadoFin,
      examenes2LlamadoInicio,
      examenes2LlamadoFin,
      examenesEspLlamadoInicio,
      examenesEspLlamadoFin
    } = req.body;

    if (activeYear !== undefined) settings.activeYear = activeYear;
    if (preinscripcionesAbiertas !== undefined) settings.preinscripcionesAbiertas = preinscripcionesAbiertas;
    if (examenesAbiertos !== undefined) settings.examenesAbiertos = examenesAbiertos;
    
    // Manage optional dates
    if (preinscripcionesInicio !== undefined) settings.preinscripcionesInicio = preinscripcionesInicio || null;
    if (preinscripcionesFin !== undefined) settings.preinscripcionesFin = preinscripcionesFin || null;
    if (examenes1LlamadoInicio !== undefined) settings.examenes1LlamadoInicio = examenes1LlamadoInicio || null;
    if (examenes1LlamadoFin !== undefined) settings.examenes1LlamadoFin = examenes1LlamadoFin || null;
    if (examenes2LlamadoInicio !== undefined) settings.examenes2LlamadoInicio = examenes2LlamadoInicio || null;
    if (examenes2LlamadoFin !== undefined) settings.examenes2LlamadoFin = examenes2LlamadoFin || null;
    if (examenesEspLlamadoInicio !== undefined) settings.examenesEspLlamadoInicio = examenesEspLlamadoInicio || null;
    if (examenesEspLlamadoFin !== undefined) settings.examenesEspLlamadoFin = examenesEspLlamadoFin || null;

    const savedSettings = await settings.save();

    // Log audit detail
    const details = [];
    if (activeYear !== undefined) details.push(`año lectivo: ${activeYear}`);
    if (preinscripcionesAbiertas !== undefined) details.push(`preinscripciones: ${preinscripcionesAbiertas ? 'Abiertas' : 'Cerradas'}`);
    if (examenesAbiertos !== undefined) details.push(`exámenes: ${examenesAbiertos ? 'Abiertas' : 'Cerradas'}`);

    await logAudit(req, 'MODIFICAR_CONFIGURACION', 'Configuraciones', `Se actualizó la configuración del sistema (${req.admin.role}): ${details.join(', ')}`);

    res.json(savedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la configuración', error: error.message });
  }
};

// @desc    Conmutar apertura de inscripciones de forma directa (Preceptor, Admin, Superadmin)
// @route   PATCH /api/settings/toggle/:field
export const togglePeriodo = async (req, res) => {
  try {
    const { field } = req.params;
    if (!['preinscripcionesAbiertas', 'examenesAbiertos'].includes(field)) {
      return res.status(400).json({ message: 'Campo de configuración no válido' });
    }

    let settings = await SystemSettings.findOne({});
    if (!settings) {
      settings = new SystemSettings({});
    }

    settings[field] = !settings[field];
    const saved = await settings.save();

    const label = field === 'preinscripcionesAbiertas' ? 'Preinscripciones' : 'Exámenes Finales';
    const statusText = saved[field] ? 'ABIERTO' : 'CERRADO';

    await logAudit(req, 'MODIFICAR_CONFIGURACION', 'Configuraciones', `${req.admin.username} (${req.admin.role}) cambió el estado de ${label} a ${statusText}`);

    res.json({
      message: `${label} ahora se encuentra ${statusText.toLowerCase()}`,
      settings: saved
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado del periodo', error: error.message });
  }
};
