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

// @desc    Actualizar configuración del sistema (Superadmin)
// @route   PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes.' });
    }

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
    settings.preinscripcionesInicio = preinscripcionesInicio || null;
    settings.preinscripcionesFin = preinscripcionesFin || null;
    settings.examenes1LlamadoInicio = examenes1LlamadoInicio || null;
    settings.examenes1LlamadoFin = examenes1LlamadoFin || null;
    settings.examenes2LlamadoInicio = examenes2LlamadoInicio || null;
    settings.examenes2LlamadoFin = examenes2LlamadoFin || null;
    settings.examenesEspLlamadoInicio = examenesEspLlamadoInicio || null;
    settings.examenesEspLlamadoFin = examenesEspLlamadoFin || null;

    const savedSettings = await settings.save();

    // Log audit detail
    const details = [];
    if (activeYear !== undefined) details.push(`año lectivo: ${activeYear}`);
    if (preinscripcionesAbiertas !== undefined) details.push(`preinscripciones: ${preinscripcionesAbiertas ? 'Abiertas' : 'Cerradas'}`);
    if (examenesAbiertos !== undefined) details.push(`exámenes: ${examenesAbiertos ? 'Abiertas' : 'Cerradas'}`);
    if (preinscripcionesInicio !== undefined || preinscripcionesFin !== undefined) {
      details.push(`fechas preinscripción: ${preinscripcionesInicio ? formatDateStr(preinscripcionesInicio) : 'sin fecha'} a ${preinscripcionesFin ? formatDateStr(preinscripcionesFin) : 'sin fecha'}`);
    }
    if (examenes1LlamadoInicio !== undefined || examenes1LlamadoFin !== undefined) {
      details.push(`inscripciones 1° llamado: ${examenes1LlamadoInicio ? formatDateStr(examenes1LlamadoInicio) : 'sin fecha'} a ${examenes1LlamadoFin ? formatDateStr(examenes1LlamadoFin) : 'sin fecha'}`);
    }
    if (examenes2LlamadoInicio !== undefined || examenes2LlamadoFin !== undefined) {
      details.push(`inscripciones 2° llamado: ${examenes2LlamadoInicio ? formatDateStr(examenes2LlamadoInicio) : 'sin fecha'} a ${examenes2LlamadoFin ? formatDateStr(examenes2LlamadoFin) : 'sin fecha'}`);
    }
    if (examenesEspLlamadoInicio !== undefined || examenesEspLlamadoFin !== undefined) {
      details.push(`inscripciones esp. llamado: ${examenesEspLlamadoInicio ? formatDateStr(examenesEspLlamadoInicio) : 'sin fecha'} a ${examenesEspLlamadoFin ? formatDateStr(examenesEspLlamadoFin) : 'sin fecha'}`);
    }

    await logAudit(req, 'MODIFICAR_CONFIGURACION', 'Seguridad', `Se actualizó la configuración del sistema: ${details.join(', ')}`);

    res.json(savedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la configuración', error: error.message });
  }
};
