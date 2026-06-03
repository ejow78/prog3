import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Carrera from '../models/Carrera.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ieslacocha';

// Helper to determine the exact academic years based on career duration string
const getYearsList = (duracion) => {
  if (!duracion) return ['1° Año', '2° Año', '3° Año'];
  const match = duracion.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num > 0) {
      const list = [];
      for (let i = 1; i <= num; i++) {
        list.push(`${i}° Año`);
      }
      return list;
    }
  }
  return ['1° Año', '2° Año', '3° Año'];
};

const populate = async () => {
  try {
    console.log('Conectando a la base de datos...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado con éxito a MongoDB.');

    const carreras = await Carrera.find({});
    console.log(`Encontradas ${carreras.length} carreras.`);

    for (const carrera of carreras) {
      console.log(`Procesando carrera: ${carrera.nombre} (ID: ${carrera.id})`);
      const years = getYearsList(carrera.duracion);
      
      const newMaterias = [];

      for (const y of years) {
        const uniqueSubsMap = new Map();
        // Extract subjects and teachers from schedules
        const scheduleObj = carrera.horariosSemanales?.find(h => h.año === y);
        if (scheduleObj && scheduleObj.franjas) {
          scheduleObj.franjas.forEach(f => {
            if (f.esRecreo) return;
            ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].forEach(dia => {
              const cell = f[dia];
              const mName = cell?.materia;
              const mProf = cell?.profesor;
              if (mName && mName.trim() !== '' && !mName.toLowerCase().includes('recreo')) {
                const upperName = mName.trim().toUpperCase();
                const currentProf = uniqueSubsMap.get(upperName);
                if (!currentProf && mProf && mProf.trim() !== '') {
                  uniqueSubsMap.set(upperName, mProf.trim());
                } else if (!uniqueSubsMap.has(upperName)) {
                  uniqueSubsMap.set(upperName, '');
                }
              }
            });
          });
        }

        const items = Array.from(uniqueSubsMap.entries()).map(([nombre, profesor]) => ({
          nombre,
          profesor
        })).sort((a, b) => a.nombre.localeCompare(b.nombre));

        newMaterias.push({
          año: y,
          nombres: items.map(item => item.nombre),
          materiasDetalle: items
        });
      }

      carrera.materias = newMaterias;
      await carrera.save();
      console.log(`  Guardadas ${newMaterias.reduce((acc, m) => acc + m.materiasDetalle.length, 0)} materias para ${carrera.nombre}.`);
    }

    console.log('Carga finalizada con éxito.');
  } catch (error) {
    console.error('Error al poblar materias:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de la base de datos.');
  }
};

populate();
