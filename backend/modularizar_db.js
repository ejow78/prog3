import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Carrera from './models/Carrera.js';
import Materia from './models/Materia.js';
import Horario from './models/Horario.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ieslacocha';

async function migrarMateriasYHorarios() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB para modularización.');

    const carreras = await Carrera.find({});
    console.log(`Encontradas ${carreras.length} carreras.`);

    let materiasCount = 0;
    let horariosCount = 0;

    for (const carrera of carreras) {
      // 1. Modularizar Materias
      if (carrera.materias && carrera.materias.length > 0) {
        for (const planAño of carrera.materias) {
          const año = planAño.año;
          const detalles = planAño.materiasDetalle || [];

          if (detalles.length > 0) {
            for (let i = 0; i < detalles.length; i++) {
              const det = detalles[i];
              const nombre = (det.nombre || '').trim().toUpperCase();
              if (!nombre) continue;

              await Materia.findOneAndUpdate(
                { carreraId: carrera.id, año, nombre },
                {
                  carreraId: carrera.id,
                  carreraNombre: carrera.nombre,
                  año,
                  nombre,
                  profesor: (det.profesor || '').trim(),
                  orden: i,
                  isDeleted: false
                },
                { upsert: true, new: true }
              );
              materiasCount++;
            }
          } else if (planAño.nombres && planAño.nombres.length > 0) {
            for (let i = 0; i < planAño.nombres.length; i++) {
              const nombre = (planAño.nombres[i] || '').trim().toUpperCase();
              if (!nombre) continue;

              await Materia.findOneAndUpdate(
                { carreraId: carrera.id, año, nombre },
                {
                  carreraId: carrera.id,
                  carreraNombre: carrera.nombre,
                  año,
                  nombre,
                  profesor: '',
                  orden: i,
                  isDeleted: false
                },
                { upsert: true, new: true }
              );
              materiasCount++;
            }
          }
        }
      }

      // 2. Modularizar Horarios
      if (carrera.horariosSemanales && carrera.horariosSemanales.length > 0) {
        for (const hs of carrera.horariosSemanales) {
          if (!hs.año) continue;
          await Horario.findOneAndUpdate(
            { carreraId: carrera.id, año: hs.año },
            {
              carreraId: carrera.id,
              carreraNombre: carrera.nombre,
              año: hs.año,
              franjas: hs.franjas || [],
              isDeleted: false
            },
            { upsert: true, new: true }
          );
          horariosCount++;
        }
      }
    }

    console.log(`✅ Modularización completada.`);
    console.log(`   - Materias migradas/aseguradas: ${materiasCount}`);
    console.log(`   - Horarios migrados/asegurados: ${horariosCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
}

migrarMateriasYHorarios();
