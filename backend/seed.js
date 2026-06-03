import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Carrera from './models/Carrera.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ieslacocha';

// Esta es la grilla exacta de la foto para 3° Año de Software
const horarioSoftware3A = [
  {
    hora: "18:20 a 19:00",
    lunes: { materia: "TALLER DE PROGRAMACIÓN III", profesor: "Prof. Moreno Cristian" },
    martes: { materia: "DESARROLLO EMPRESARIAL", profesor: "Prof. Pozyvilco Miriam" },
    miercoles: { materia: "PROGRAMACIÓN III", profesor: "Prof. Herrera Mario" },
    jueves: { materia: "LEGISLACION DE SOFTWARE", profesor: "Prof. Balcarce Vanesa" },
    viernes: { materia: "ETICA Y DEONTOLOGIA PROFESIONAL", profesor: "Prof. Sobrecasas Atilio" }
  },
  {
    hora: "19:00 a 19:40",
    lunes: { materia: "TALLER DE PROGRAMACIÓN III", profesor: "Prof. Moreno Cristian" },
    martes: { materia: "TALLER DE PROGRAMACIÓN III", profesor: "Prof. Moreno Cristian" },
    miercoles: { materia: "PROGRAMACIÓN III", profesor: "Prof. Herrera Mario" },
    jueves: { materia: "LEGISLACION DE SOFTWARE", profesor: "Prof. Balcarce Vanesa" },
    viernes: { materia: "ETICA Y DEONTOLOGIA PROFESIONAL", profesor: "Prof. Sobrecasas Atilio" }
  },
  {
    hora: "19:40 a 20:20",
    lunes: { materia: "PROGRAMACIÓN III", profesor: "Prof. Herrera Mario" },
    martes: { materia: "TALLER DE PROGRAMACIÓN III", profesor: "Prof. Moreno Cristian" },
    miercoles: { materia: "GEST. DE PROYC. Y SOFTWARE DE CALIDAD", profesor: "Prof. Herrera Mario" },
    jueves: { materia: "TECNICAS AVANZADAS DE PROGRAMACION", profesor: "Prof. Rodriguez Ivana" },
    viernes: { materia: "PROGRAMACIÓN III", profesor: "Prof. Herrera Mario" }
  },
  {
    hora: "20:20 a 20:30",
    esRecreo: true
  },
  {
    hora: "20:30 a 21:10",
    lunes: { materia: "PROGRAMACIÓN III", profesor: "Prof. Herrera Mario" },
    martes: { materia: "TALLER DE PROGRAMACIÓN III", profesor: "Prof. Moreno Cristian" },
    miercoles: { materia: "GEST. DE PROYC. Y SOFTWARE DE CALIDAD", profesor: "Prof. Herrera Mario" },
    jueves: { materia: "TECNICAS AVANZADAS DE PROGRAMACION", profesor: "Prof. Rodriguez Ivana" },
    viernes: { materia: "GEST. DE PROYC. Y SOFTWARE DE CALIDAD", profesor: "Prof. Herrera Mario" }
  },
  {
    hora: "21:10 a 21:50",
    lunes: { materia: "INGLES TECNICO III", profesor: "Prof. González Roque" },
    martes: { materia: "TALLER DE PROGRAMACIÓN III", profesor: "Prof. Moreno Cristian" },
    miercoles: { materia: "EMPRENDIMIENTO TECNOLÓGICO", profesor: "Prof. Pozyvilco Miriam" },
    jueves: { materia: "TECNICAS AVANZADAS DE PROGRAMACION", profesor: "Prof. Rodriguez Ivana" },
    viernes: { materia: "GEST. DE PROYC. Y SOFTWARE DE CALIDAD", profesor: "Prof. Herrera Mario" }
  },
  {
    hora: "21:50 a 22:30",
    lunes: { materia: "INGLES TECNICO III", profesor: "Prof. González Roque" },
    martes: { materia: "TALLER DE PROGRAMACIÓN III", profesor: "Prof. Moreno Cristian" },
    miercoles: { materia: "EMPRENDIMIENTO TECNOLÓGICO", profesor: "Prof. Pozyvilco Miriam" },
    jueves: { materia: "TECNICAS AVANZADAS DE PROGRAMACION", profesor: "Prof. Rodriguez Ivana" },
    viernes: { materia: "DESARROLLO EMPRESARIAL", profesor: "Prof. Pozyvilco Miriam" }
  },
  {
    hora: "22:30 a 23:10",
    lunes: { materia: "", profesor: "" },
    martes: { materia: "", profesor: "" },
    miercoles: { materia: "", profesor: "" },
    jueves: { materia: "", profesor: "" },
    viernes: { materia: "DESARROLLO EMPRESARIAL", profesor: "Prof. Pozyvilco Miriam" }
  }
];

const generateGenerichorario = (nombreCarrera, año) => {
  const materias = [
    `Fundamentos de ${nombreCarrera.split(' ').pop()}`,
    `Práctica Profesional ${año}°`,
    `Taller Aplicado ${año}°`,
    'Comunicación Oral y Escrita',
    'Inglés Técnico',
    `Seminario de Actualización`
  ];
  const profesores = ['Prof. García', 'Prof. Rodríguez', 'Prof. López', 'Prof. Martínez', 'Prof. Fernández'];

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const basehorario = [
    { hora: "18:20 a 19:00" },
    { hora: "19:00 a 19:40" },
    { hora: "19:40 a 20:20" },
    { hora: "20:20 a 20:30", esRecreo: true },
    { hora: "20:30 a 21:10" },
    { hora: "21:10 a 21:50" },
    { hora: "21:50 a 22:30" }
  ];

  return basehorario.map(row => {
    if (row.esRecreo) return row;
    return {
      ...row,
      lunes: { materia: getRandom(materias), profesor: getRandom(profesores) },
      martes: { materia: getRandom(materias), profesor: getRandom(profesores) },
      miercoles: { materia: getRandom(materias), profesor: getRandom(profesores) },
      jueves: { materia: getRandom(materias), profesor: getRandom(profesores) },
      viernes: { materia: getRandom(materias), profesor: getRandom(profesores) }
    };
  });
};

const carrerasData = [
  {
    id: 1,
    nombre: 'Tecnicatura Superior en Desarrollo de Software',
    duracion: '3 años',
    tipo: 'Tecnicatura',
    horario: 'Turno Noche: 18:00 - 22:30 hs',
    descripcion: 'Aprende a diseñar, programar y mantener aplicaciones web, móviles y de escritorio utilizando las últimas tecnologías del mercado.',
    perfil: 'Capaz de analizar requerimientos, construir interfaces, programar backends y bases de datos, y desplegar aplicaciones.',
    habilidades: [
      'Desarrollo de aplicaciones web y móviles',
      'Programación en múltiples lenguajes',
      'Gestión de bases de datos',
      'Metodologías ágiles de desarrollo',
      'Testing y control de calidad',
      'Trabajo en equipo y comunicación efectiva'
    ],
    horariosSemanales: [
      { año: "1° Año", franjas: generateGenerichorario("Software", 1) },
      { año: "2° Año", franjas: generateGenerichorario("Software", 2) },
      { año: "3° Año", franjas: horarioSoftware3A }
    ]
  },
  {
    id: 2,
    nombre: 'Tecnicatura Superior en Agropecuaria',
    duracion: '3 años',
    tipo: 'Tecnicatura',
    horario: 'Turno Mañana: 07:00 - 12:00 hs',
    descripcion: 'Formación integral para la gestión, producción y optimización de recursos en el sector agrícola y ganadero.',
    perfil: 'Técnico especializado en la gestión integral de procesos agropecuarios, capaz de optimizar la producción de forma sustentable y rentable.',
    habilidades: [
      'Gestión de cultivos y producción agrícola',
      'Administración ganadera y sanidad animal',
      'Uso de tecnologías agrícolas modernas',
      'Gestión empresarial agropecuaria',
      'Producción sustentable y ambiental',
      'Análisis de mercado agropecuario',
      'Manejo de recursos naturales'
    ],
    horariosSemanales: [
      { año: "1° Año", franjas: generateGenerichorario("Agropecuaria", 1) },
      { año: "2° Año", franjas: generateGenerichorario("Agropecuaria", 2) },
      { año: "3° Año", franjas: generateGenerichorario("Agropecuaria", 3) }
    ]
  },
  {
    id: 3,
    nombre: 'Tecnicatura Superior en Agroindustria',
    duracion: '3 años',
    tipo: 'Tecnicatura',
    horario: 'Turno Tarde: 14:00 - 18:30 hs',
    descripcion: 'Especialízate en los procesos de transformación de materias primas agropecuarias agregando valor a la producción primaria.',
    perfil: 'Técnico especializado en procesamiento y control de calidad de alimentos, capaz de gestionar procesos productivos seguros e innovadores.',
    habilidades: [
      'Procesamiento y transformación de alimentos',
      'Control de calidad e inocuidad alimentaria',
      'Conocimiento de legislación alimentaria',
      'Gestión de procesos agroindustriales',
      'Uso de tecnología en la producción alimentaria',
      'Análisis microbiológicos y químicos',
      'Desarrollo y formulación de productos alimentarios'
    ],
    horariosSemanales: [
      { año: "1° Año", franjas: generateGenerichorario("Agroindustria", 1) },
      { año: "2° Año", franjas: generateGenerichorario("Agroindustria", 2) },
      { año: "3° Año", franjas: generateGenerichorario("Agroindustria", 3) }
    ]
  },
  {
    id: 4,
    nombre: 'Profesorado de Educación Secundaria en Matemática',
    duracion: '4 años',
    tipo: 'Profesorado',
    horario: 'Turno Noche: 18:00 - 22:30 hs',
    descripcion: 'Formación docente de excelencia para la enseñanza de las matemáticas con un enfoque didáctico y pedagógico moderno.',
    perfil: 'Docente especializado en la enseñanza de matemáticas, con sólidos fundamentos en teoría matemática y capacidad para transmitir conocimientos complejos de manera clara y motivadora.',
    habilidades: [
      'Dominio de álgebra, geometría, análisis y estadística',
      'Resolución de problemas y pensamiento lógico-deductivo',
      'Diseño de estrategias didácticas innovadoras',
      'Aplicación de tecnología educativa en matemáticas',
      'Evaluación formativa y retroalimentación constructiva',
      'Promoción del razonamiento crítico y analítico',
      'Capacidad de motivar y fomentar el interés por las matemáticas'
    ],
    horariosSemanales: [
      { año: "1° Año", franjas: generateGenerichorario("Matemática", 1) },
      { año: "2° Año", franjas: generateGenerichorario("Matemática", 2) },
      { año: "3° Año", franjas: generateGenerichorario("Matemática", 3) },
      { año: "4° Año", franjas: generateGenerichorario("Matemática", 4) }
    ]
  },
  {
    id: 5,
    nombre: 'Profesorado de Educación Secundaria en Historia',
    duracion: '4 años',
    tipo: 'Profesorado',
    horario: 'Turno Noche: 18:00 - 22:30 hs',
    descripcion: 'Prepárate para formar ciudadanos críticos a través de la enseñanza de los procesos históricos locales, nacionales y mundiales.',
    perfil: 'Docente capacitado para enseñar historia en educación secundaria, con sólidos conocimientos historiográficos y habilidades pedagógicas para estimular el pensamiento crítico y el análisis reflexivo en sus estudiantes.',
    habilidades: [
      'Dominio de períodos históricos (Antigüedad, Edad Media, Modernidad, Contemporáneo)',
      'Análisis crítico de fuentes y documentos históricos',
      'Diseño de estrategias didácticas innovadoras',
      'Gestión de espacios de debate y reflexión',
      'Integración de tecnología en la enseñanza de la historia',
      'Evaluación formativa y retroalimentación constructiva',
      'Promoción del pensamiento crítico y ciudadanía activa'
    ],
    horariosSemanales: [
      { año: "1° Año", franjas: generateGenerichorario("Historia", 1) },
      { año: "2° Año", franjas: generateGenerichorario("Historia", 2) },
      { año: "3° Año", franjas: generateGenerichorario("Historia", 3) },
      { año: "4° Año", franjas: generateGenerichorario("Historia", 4) }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB para Seeding');

    // Limpiar colección existente
    await Carrera.deleteMany({});
    console.log('Colección Carrera limpiada');

    // Insertar datos
    await Carrera.insertMany(carrerasData);
    console.log('Datos de carreras con grillas insertados correctamente');

    process.exit(0);
  } catch (error) {
    console.error('Error en el Seeding:', error);
    process.exit(1);
  }
};

seedDB();
