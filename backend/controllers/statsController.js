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
    const query = { createdAt: { $gte: startOfYear } };

    const totalPreinscripciones = await Preinscripcion.countDocuments(query);
    const preinscripcionesPendientes = await Preinscripcion.countDocuments({ ...query, estado: 'Pendiente' });
    const preinscripcionesAprobadas = await Preinscripcion.countDocuments({ ...query, estado: 'Aprobada' });
    const preinscripcionesRechazadas = await Preinscripcion.countDocuments({ ...query, estado: 'Rechazada' });
    
    const totalMensajesSinLeer = await Mensaje.countDocuments({ leido: false });
    const totalMensajes = await Mensaje.countDocuments();
    
    const totalCarreras = await Carrera.countDocuments();
    const carrerasTecnicaturas = await Carrera.countDocuments({ tipo: 'Tecnicatura' });
    const carrerasProfesorados = await Carrera.countDocuments({ tipo: 'Profesorado' });
    const carrerasCursos = await Carrera.countDocuments({ tipo: 'Curso' });

    const totalExamenes = await InscripcionExamen.countDocuments(query);
    const examenesPendientes = await InscripcionExamen.countDocuments({ ...query, estado: 'Pendiente' });
    const examenesAprobados = await InscripcionExamen.countDocuments({ ...query, estado: 'Aprobada' });
    const examenesRechazados = await InscripcionExamen.countDocuments({ ...query, estado: 'Rechazada' });

    // Obtener últimos registros para visualización directa
    const ultimasPreinscripciones = await Preinscripcion.find(query)
      .sort({ createdAt: -1 })
      .limit(3);

    const ultimosMensajes = await Mensaje.find()
      .sort({ createdAt: -1 })
      .limit(3);

    const ultimosExamenes = await InscripcionExamen.find(query)
      .sort({ createdAt: -1 })
      .limit(3);

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
