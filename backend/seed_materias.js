import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Carrera from './models/Carrera.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ieslacocha';

const materiasData = {
  1: { // Tecnicatura Superior en Desarrollo de Software (3 años)
    "1° Año": [
      { nombre: "PROGRAMACIÓN I", profesor: "Ing. Moreno Cristian" },
      { nombre: "ARQUITECTURA DE COMPUTADORAS", profesor: "Prof. Valdez Roberto" },
      { nombre: "SISTEMAS OPERATIVOS", profesor: "Lic. Juárez Marcelo" },
      { nombre: "MATEMÁTICA APLICADA", profesor: "Prof. Medina Silvina" },
      { nombre: "INGLÉS TÉCNICO I", profesor: "Prof. Gonzalez Roque" },
      { nombre: "COMUNICACIÓN Y COMPRENSIÓN DE TEXTOS", profesor: "Lic. Albarracín Carla" }
    ],
    "2° Año": [
      { nombre: "PROGRAMACIÓN II", profesor: "Ing. Rodriguez Ivana" },
      { nombre: "BASE DE DATOS I", profesor: "Herrera Mario" },
      { nombre: "ANÁLISIS Y DISEÑO DE SISTEMAS", profesor: "Ing. Gómez Fernando" },
      { nombre: "REDES Y TELEPROCESAMIENTO", profesor: "Ing. Moreno Cristian" },
      { nombre: "ESTADÍSTICA APLICADA", profesor: "Prof. Medina Silvina" },
      { nombre: "INGLÉS TÉCNICO II", profesor: "Prof. Gonzalez Roque" }
    ],
    "3° Año": [
      { nombre: "TALLER DE PROGRAMACION III", profesor: "Ing. Moreno Cristian" },
      { nombre: "PROGRAMACION III", profesor: "Herrera Mario" },
      { nombre: "INGLES TECNICO III", profesor: "Gonzalez Roque" },
      { nombre: "DESARROLLO EMPRESARIAL", profesor: "Pozyvilco Miriam" },
      { nombre: "GESTION DE PROYECTO Y SOFTWARE DE CALIDAD", profesor: "Herrera Mario" },
      { nombre: "EMPRENDIMIENTO TECNOLOGICO", profesor: "Pozyvilco Miriam" },
      { nombre: "LEGISLACION DE SOFTWARE", profesor: "Dra. Balcarce Vanesa" },
      { nombre: "TECNICAS AVANZADAS DE PROGRAMACION", profesor: "Ing. Rodriguez Ivana" },
      { nombre: "ETICA Y DEONTOLOGIA PROFESIONAL", profesor: "Dr. Sobrecasas Atilio" }
    ]
  },

  2: { // Tecnicatura Superior en Agropecuaria (3 años)
    "1° Año": [
      { nombre: "BOTÁNICA GENERAL Y SISTEMÁTICA", profesor: "Ing. Agr. Díaz Federico" },
      { nombre: "QUÍMICA AGRÍCOLA", profesor: "Dra. Soria Marcela" },
      { nombre: "CLIMATOLOGÍA Y EDAFOLOGÍA", profesor: "Ing. Albornoz Gustavo" },
      { nombre: "INTRODUCCIÓN A LA PRODUCCIÓN ANIMAL", profesor: "Med. Vet. Carrizo Juan" },
      { nombre: "MATEMÁTICA Y BIOESTADÍSTICA", profesor: "Prof. Luna Esteban" }
    ],
    "2° Año": [
      { nombre: "PRODUCCIÓN VEGETAL I (CEREALES Y OLEAGINOSAS)", profesor: "Ing. Agr. Díaz Federico" },
      { nombre: "FORRAJICULTURA Y PASTURAS", profesor: "Ing. Albornoz Gustavo" },
      { nombre: "PRODUCCIÓN BOVINA DE CARNE Y LECHE", profesor: "Med. Vet. Carrizo Juan" },
      { nombre: "MAQUINARIA Y HERRAMIENTAS AGRÍCOLAS", profesor: "Téc. Navarro Pablo" },
      { nombre: "PROTECCIÓN VEGETAL Y FITOPATOLOGÍA", profesor: "Dra. Soria Marcela" }
    ],
    "3° Año": [
      { nombre: "ADMINISTRACIÓN Y GESTIÓN AGROPECUARIA", profesor: "Lic. Pozyvilco Miriam" },
      { nombre: "PRODUCCIONES ANIMALES INTENSIVAS (AVÍCOLA Y PORCINA)", profesor: "Med. Vet. Carrizo Juan" },
      { nombre: "RIEGO, DRENAJE Y CONSERVACIÓN DE SUELOS", profesor: "Ing. Albornoz Gustavo" },
      { nombre: "COMERCIALIZACIÓN Y MERCADOS AGROPECUARIOS", profesor: "Lic. Pozyvilco Miriam" },
      { nombre: "PRACTICA PROFESIONALIZANTE AGROPECUARIA", profesor: "Ing. Agr. Díaz Federico" }
    ]
  },

  3: { // Tecnicatura Superior en Agroindustria (3 años)
    "1° Año": [
      { nombre: "MICROBIOLOGÍA GENERAL Y DE ALIMENTOS", profesor: "Bioq. Ferreyra Luciana" },
      { nombre: "QUÍMICA ORGÁNICA Y BIOLÓGICA", profesor: "Dra. Soria Marcela" },
      { nombre: "SEGURIDAD E HIGIENE AGROINDUSTRIAL", profesor: "Ing. Toledo Gonzalo" },
      { nombre: "FÍSICA APLICADA A PROCESOS", profesor: "Prof. Medina Silvina" },
      { nombre: "INTRODUCCIÓN A LA AGROINDUSTRIA", profesor: "Ing. Quiroga Daniel" }
    ],
    "2° Año": [
      { nombre: "TECNOLOGÍA DE PRODUCTOS CÁRNICOS Y LÁCTEOS", profesor: "Bioq. Ferreyra Luciana" },
      { nombre: "TECNOLOGÍA DE FRUTAS, HORTALIZAS Y GRANOS", profesor: "Ing. Quiroga Daniel" },
      { nombre: "OPERACIONES UNITARIAS EN ALIMENTOS", profesor: "Ing. Toledo Gonzalo" },
      { nombre: "ANÁLISIS SENSORIAL Y DE LABORATORIO", profesor: "Bioq. Ferreyra Luciana" },
      { nombre: "GESTIÓN DE CALIDAD Y SISTEMAS HACCP", profesor: "Ing. Quiroga Daniel" }
    ],
    "3° Año": [
      { nombre: "ENVASES, EMBALAJES Y CONSERVACIÓN", profesor: "Ing. Toledo Gonzalo" },
      { nombre: "TRATAMIENTO DE EFLUENTES Y RESIDUOS AGROINDUSTRIALES", profesor: "Ing. Albornoz Gustavo" },
      { nombre: "FORMULACIÓN Y EVALUACIÓN DE PROYECTOS", profesor: "Lic. Pozyvilco Miriam" },
      { nombre: "LEGISLACIÓN Y CÓDIGO ALIMENTARIO ARGENTINO", profesor: "Dra. Balcarce Vanesa" },
      { nombre: "PRÁCTICA PROFESIONALIZANTE EN AGROINDUSTRIA", profesor: "Ing. Quiroga Daniel" }
    ]
  },

  4: { // Profesorado de Educación Secundaria en Matemática (4 años)
    "1° Año": [
      { nombre: "ÁLGEBRA I", profesor: "Prof. Córdoba Ramón" },
      { nombre: "GEOMETRÍA MÉTRICA Y ANALÍTICA", profesor: "Prof. Medina Silvina" },
      { nombre: "PEDAGOGÍA", profesor: "Lic. Herrera Fabiana" },
      { nombre: "PRÁCTICA DOCENTE I", profesor: "Lic. Peralta Sonia" },
      { nombre: "HISTORIA Y EPISTEMOLOGÍA DE LA MATEMÁTICA", profesor: "Prof. Córdoba Ramón" }
    ],
    "2° Año": [
      { nombre: "CÁLCULO I (ANÁLISIS MATEMÁTICO)", profesor: "Prof. Luna Esteban" },
      { nombre: "ÁLGEBRA LINEAL", profesor: "Prof. Córdoba Ramón" },
      { nombre: "DIDÁCTICA GENERAL", profesor: "Lic. Herrera Fabiana" },
      { nombre: "PSICOLOGÍA EDUCACIONAL", profesor: "Lic. Albarracín Carla" },
      { nombre: "PRÁCTICA DOCENTE II", profesor: "Lic. Peralta Sonia" }
    ],
    "3° Año": [
      { nombre: "CÁLCULO II EN VARIAS VARIABLES", profesor: "Prof. Luna Esteban" },
      { nombre: "PROBABILIDAD Y ESTADÍSTICA MATEMÁTICA", profesor: "Prof. Medina Silvina" },
      { nombre: "DIDÁCTICA DE LA MATEMÁTICA I", profesor: "Prof. Córdoba Ramón" },
      { nombre: "TECNOLOGÍAS APLICADAS A LA MATEMÁTICA", profesor: "Ing. Moreno Cristian" },
      { nombre: "PRÁCTICA DOCENTE III (RESIDENCIA)", profesor: "Lic. Peralta Sonia" }
    ],
    "4° Año": [
      { nombre: "ESTRUCTURAS ALGEBRAICAS Y TOPOLOGÍA", profesor: "Prof. Córdoba Ramón" },
      { nombre: "ECUACIONES DIFERENCIALES Y MODELIZACIÓN", profesor: "Prof. Luna Esteban" },
      { nombre: "DIDÁCTICA DE LA MATEMÁTICA II", profesor: "Prof. Córdoba Ramón" },
      { nombre: "ÉTICA Y CIUDADANÍA DOCENTE", profesor: "Dr. Sobrecasas Atilio" },
      { nombre: "RESIDENCIA PEDAGÓGICA Y MEMORIA FINAL", profesor: "Lic. Peralta Sonia" }
    ]
  },

  5: { // Profesorado de Educación Secundaria en Historia (4 años)
    "1° Año": [
      { nombre: "HISTORIA DEL MUNDO ANTIGUO", profesor: "Prof. Morales Sebastián" },
      { nombre: "INTRODUCCIÓN A LA HISTORIOGRAFÍA", profesor: "Lic. Bustamante Jorge" },
      { nombre: "PEDAGOGÍA", profesor: "Lic. Herrera Fabiana" },
      { nombre: "TEORÍA Y ANÁLISIS SOCIAL", profesor: "Lic. Albarracín Carla" },
      { nombre: "PRÁCTICA DOCENTE I", profesor: "Lic. Peralta Sonia" }
    ],
    "2° Año": [
      { nombre: "HISTORIA MEDIEVAL Y MODERNA", profesor: "Prof. Morales Sebastián" },
      { nombre: "HISTORIA DE AMÉRICA I (PRECOLOMBINA Y COLONIAL)", profesor: "Lic. Bustamante Jorge" },
      { nombre: "DIDÁCTICA GENERAL", profesor: "Lic. Herrera Fabiana" },
      { nombre: "HISTORIA ARGENTINA I", profesor: "Lic. Bustamante Jorge" },
      { nombre: "PRÁCTICA DOCENTE II", profesor: "Lic. Peralta Sonia" }
    ],
    "3° Año": [
      { nombre: "HISTORIA CONTEMPORÁNEA (SIGLOS XIX Y XX)", profesor: "Prof. Morales Sebastián" },
      { nombre: "HISTORIA DE AMÉRICA II", profesor: "Lic. Bustamante Jorge" },
      { nombre: "HISTORIA ARGENTINA II", profesor: "Lic. Bustamante Jorge" },
      { nombre: "DIDÁCTICA DE LA HISTORIA", profesor: "Prof. Morales Sebastián" },
      { nombre: "PRÁCTICA DOCENTE III (PRÁCTICAS DE AULA)", profesor: "Lic. Peralta Sonia" }
    ],
    "4° Año": [
      { nombre: "HISTORIA RECIENTE DE ARGENTINA Y AMÉRICA LATINA", profesor: "Lic. Bustamante Jorge" },
      { nombre: "HISTORIA REGIONAL DEL NOA Y TUCUMÁN", profesor: "Prof. Morales Sebastián" },
      { nombre: "FILOSOFÍA DE LA HISTORIA", profesor: "Dr. Sobrecasas Atilio" },
      { nombre: "ÉTICA Y CIUDADANÍA DOCENTE", profesor: "Dr. Sobrecasas Atilio" },
      { nombre: "RESIDENCIA PEDAGÓGICA Y TRABAJO FINAL", profesor: "Lic. Peralta Sonia" }
    ]
  }
};

async function seedMaterias() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB local.');

    for (const [carrId, aniosObj] of Object.entries(materiasData)) {
      const carreraId = parseInt(carrId, 10);
      const carrera = await Carrera.findOne({ id: carreraId });

      if (!carrera) {
        console.log(`Carrera ID ${carreraId} no encontrada, omitiendo.`);
        continue;
      }

      const materiasArray = Object.entries(aniosObj).map(([año, items]) => ({
        año,
        nombres: items.map(i => i.nombre),
        materiasDetalle: items.map(i => ({
          nombre: i.nombre,
          profesor: i.profesor
        }))
      }));

      carrera.materias = materiasArray;
      await carrera.save();
      console.log(`✅ Materias cargadas con éxito para: ${carrera.nombre}`);
    }

    console.log('\n✨ Todas las materias y docentes fueron sembrados correctamente en la base de datos local.');
    process.exit(0);
  } catch (error) {
    console.error('Error al sembrar materias:', error);
    process.exit(1);
  }
}

seedMaterias();
