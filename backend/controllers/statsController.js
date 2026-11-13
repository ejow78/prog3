import Preinscripcion from '../models/Preinscripcion.js';
import Mensaje from '../models/Mensaje.js';
import Carrera from '../models/Carrera.js';
import InscripcionExamen from '../models/InscripcionExamen.js';
import SystemSettings from '../models/SystemSettings.js';

export const getStats = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne({});
    const year = settings ? settings.activeYear : new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    
    // Solo contar elementos activos (no eliminados lógicamente)
    const baseQuery = { 
      createdAt: { $gte: startOfYear },
      isDeleted: { $ne: true }
    };
    const carrerasQuery = { isDeleted: { $ne: true } };
    const mensajesQuery = { isDeleted: { $ne: true } };

    // Ejecución paralela de alta velocidad con Promise.all
    const [
      totalPreinscripciones,
      preinscripcionesPendientes,
      preinscripcionesAprobadas,
      preinscripcionesRechazadas,
      totalMensajesSinLeer,
      totalMensajes,
      totalCarreras,
      carrerasTecnicaturas,
      carrerasProfesorados,
      carrerasCursos,
      totalExamenes,
      examenesPendientes,
      examenesAprobados,
      examenesRechazados,
      ultimasPreinscripciones,
      ultimosMensajes,
      ultimosExamenes
    ] = await Promise.all([
      Preinscripcion.countDocuments(baseQuery),
      Preinscripcion.countDocuments({ ...baseQuery, estado: 'Pendiente' }),
      Preinscripcion.countDocuments({ ...baseQuery, estado: 'Aprobada' }),
      Preinscripcion.countDocuments({ ...baseQuery, estado: 'Rechazada' }),
      Mensaje.countDocuments({ ...mensajesQuery, leido: false }),
      Mensaje.countDocuments(mensajesQuery),
      Carrera.countDocuments(carrerasQuery),
      Carrera.countDocuments({ ...carrerasQuery, tipo: 'Tecnicatura' }),
      Carrera.countDocuments({ ...carrerasQuery, tipo: 'Profesorado' }),
      Carrera.countDocuments({ ...carrerasQuery, tipo: 'Curso' }),
      InscripcionExamen.countDocuments(baseQuery),
      InscripcionExamen.countDocuments({ ...baseQuery, estado: 'Pendiente' }),
      InscripcionExamen.countDocuments({ ...baseQuery, estado: 'Aprobada' }),
      InscripcionExamen.countDocuments({ ...baseQuery, estado: 'Rechazada' }),
      Preinscripcion.find(baseQuery).sort({ createdAt: -1 }).limit(3),
      Mensaje.find(mensajesQuery).sort({ createdAt: -1 }).limit(3),
      InscripcionExamen.find(baseQuery).sort({ createdAt: -1 }).limit(3)
    ]);

    res.json({
      preinscripciones: {
        total: totalPreinscripciones,
        pendientes: preinscripcionesPendientes,
        aprobadas: preinscripcionesAprobadas,
        rechazadas: preinscripcionesRechazadas,
        recientes: ultimasPreinscripciones
      },
      mensajes: {
        sinLeer: totalMensajesSinLeer,
        total: totalMensajes,
        recientes: ultimosMensajes
      },
      carreras: {
        total: totalCarreras,
        tecnicaturas: carrerasTecnicaturas,
        profesorados: carrerasProfesorados,
        cursos: carrerasCursos
      },
      examenes: {
        total: totalExamenes,
        pendientes: examenesPendientes,
        aprobados: examenesAprobados,
        rechazados: examenesRechazados,
        recientes: ultimosExamenes
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las estadísticas', error: error.message });
  }
};
