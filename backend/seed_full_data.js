import mongoose from 'mongoose';
import Preinscripcion from './models/Preinscripcion.js';
import InscripcionExamen from './models/InscripcionExamen.js';
import FechaExamen from './models/FechaExamen.js';
import Mensaje from './models/Mensaje.js';
import Horario from './models/Horario.js';
import Carrera from './models/Carrera.js';
import Materia from './models/Materia.js';
import SystemSettings from './models/SystemSettings.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ieslacocha';

async function seedData() {
  try {
    console.log('Conectando a MongoDB en', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Conexión exitosa a MongoDB.');

    // 1. Settings
    let settings = await SystemSettings.findOne({});
    if (!settings) {
      settings = new SystemSettings({});
    }
    settings.activeYear = 2026;
    settings.preinscripcionesAbiertas = true;
    settings.examenesAbiertos = true;
    await settings.save();
    console.log('✔ SystemSettings configurado (Preinscripciones y Exámenes ABIERTOS, Ciclo 2026)');

    // 2. Preinscripciones
    console.log('--- Sembrando Preinscripciones ---');
    await Preinscripcion.deleteMany({});
    
    const preinscripcionesData = [
      {
        nombre: 'Sofía Valentina',
        apellido: 'Rodríguez',
        dni: '44892110',
        genero: 'Femenino',
        telefono: '3865412990',
        email: 'sofia.rodriguez@gmail.com',
        localidad: 'La Cocha',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        estado: 'Pendiente'
      },
      {
        nombre: 'Mateo Alejandro',
        apellido: 'González',
        dni: '45120349',
        genero: 'Masculino',
        telefono: '3865321877',
        email: 'mateo.gonzalez@gmail.com',
        localidad: 'J.B. Alberdi',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        estado: 'Aprobada'
      },
      {
        nombre: 'Camila Belén',
        apellido: 'Herrera',
        dni: '43987214',
        genero: 'Femenino',
        telefono: '3865664321',
        email: 'camila.herrera@hotmail.com',
        localidad: 'Graneros',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        estado: 'Pendiente'
      },
      {
        nombre: 'Lucas Gabriel',
        apellido: 'Díaz',
        dni: '46231094',
        genero: 'Masculino',
        telefono: '3865551982',
        email: 'lucas.diaz@gmail.com',
        localidad: 'Concepción',
        carrera: 'Tecnicatura Superior en Agropecuaria',
        estado: 'Aprobada'
      },
      {
        nombre: 'Martina Sol',
        apellido: 'Albornoz',
        dni: '45781290',
        genero: 'Femenino',
        telefono: '3865789012',
        email: 'martina.albornoz@outlook.com',
        localidad: 'Aguilares',
        carrera: 'Tecnicatura Superior en Agropecuaria',
        estado: 'Pendiente'
      },
      {
        nombre: 'Tomás Agustín',
        apellido: 'Morales',
        dni: '44321890',
        genero: 'Masculino',
        telefono: '3865234567',
        email: 'tomas.morales@gmail.com',
        localidad: 'La Cocha',
        carrera: 'Tecnicatura Superior en Agroindustria',
        estado: 'Aprobada'
      },
      {
        nombre: 'Florencia Lucía',
        apellido: 'Romero',
        dni: '43876543',
        genero: 'Femenino',
        telefono: '3865890123',
        email: 'flor.romero@gmail.com',
        localidad: 'J.B. Alberdi',
        carrera: 'Tecnicatura Superior en Agroindustria',
        estado: 'Pendiente'
      },
      {
        nombre: 'Facundo Nahuel',
        apellido: 'Sánchez',
        dni: '45678901',
        genero: 'Masculino',
        telefono: '3865345678',
        email: 'facundo.sanchez@yahoo.com.ar',
        localidad: 'Graneros',
        carrera: 'Profesorado de Educación Secundaria en Matemática',
        estado: 'Aprobada'
      },
      {
        nombre: 'Milagros Ailén',
        apellido: 'Pérez',
        dni: '46123456',
        genero: 'Femenino',
        telefono: '3865901234',
        email: 'mili.perez@gmail.com',
        localidad: 'La Cocha',
        carrera: 'Profesorado de Educación Secundaria en Matemática',
        estado: 'Pendiente'
      },
      {
        nombre: 'Joaquín Ignacio',
        apellido: 'Castro',
        dni: '44567891',
        genero: 'Masculino',
        telefono: '3865456789',
        email: 'joaco.castro@gmail.com',
        localidad: 'Concepción',
        carrera: 'Profesorado de Educación Secundaria en Historia',
        estado: 'Pendiente'
      },
      {
        nombre: 'Agustina Micaela',
        apellido: 'López',
        dni: '45234567',
        genero: 'Femenino',
        telefono: '3865678901',
        email: 'agus.lopez@gmail.com',
        localidad: 'Aguilares',
        carrera: 'Profesorado de Educación Secundaria en Historia',
        estado: 'Aprobada'
      },
      {
        nombre: 'Santiago Daniel',
        apellido: 'Mendoza',
        dni: '43567890',
        genero: 'Masculino',
        telefono: '3865781234',
        email: 'santiago.mendoza@gmail.com',
        localidad: 'La Cocha',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        estado: 'Rechazada'
      },
      {
        nombre: 'Rocío Nicole',
        apellido: 'Figueroa',
        dni: '46890123',
        genero: 'Femenino',
        telefono: '3865239876',
        email: 'rocio.figueroa@gmail.com',
        localidad: 'J.B. Alberdi',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        estado: 'Pendiente'
      },
      {
        nombre: 'Enzo Fabricio',
        apellido: 'Suárez',
        dni: '44901234',
        genero: 'Masculino',
        telefono: '3865432109',
        email: 'enzo.suarez@gmail.com',
        localidad: 'Graneros',
        carrera: 'Tecnicatura Superior en Agropecuaria',
        estado: 'Pendiente'
      },
      // 2 preinscripciones en papelera para probar borrado y restauración
      {
        nombre: 'Mariano Gastón',
        apellido: 'Quiroga',
        dni: '42111222',
        genero: 'Masculino',
        telefono: '3865112233',
        email: 'mariano.q@ejemplo.com',
        localidad: 'La Cocha',
        carrera: 'Tecnicatura Superior en Agroindustria',
        estado: 'Pendiente',
        isDeleted: true,
        deletedAt: new Date(Date.now() - 86400000 * 2),
        deletedBy: 'preceptor (preceptor)'
      },
      {
        nombre: 'Daniela Itatí',
        apellido: 'Vargas',
        dni: '43333444',
        genero: 'Femenino',
        telefono: '3865445566',
        email: 'daniela.v@ejemplo.com',
        localidad: 'Concepción',
        carrera: 'Profesorado de Educación Secundaria en Historia',
        estado: 'Pendiente',
        isDeleted: true,
        deletedAt: new Date(Date.now() - 86400000 * 5),
        deletedBy: 'admin (admin)'
      }
    ];

    await Preinscripcion.insertMany(preinscripcionesData);
    console.log(`✔ Insertadas ${preinscripcionesData.length} preinscripciones (incluye 2 en papelera).`);

    // 3. Inscripciones a Exámenes
    console.log('--- Sembrando Inscripciones a Exámenes ---');
    await InscripcionExamen.deleteMany({});

    const inscripcionesExamenData = [
      {
        nombre: 'Javier Alejandro',
        apellido: 'Medina',
        dni: '41234567',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        añoCursando: '3° Año',
        materias: ['PROGRAMACIÓN II', 'BASE DE DATOS I'],
        estado: 'Aprobada'
      },
      {
        nombre: 'Luciana Beatriz',
        apellido: 'Alvarez',
        dni: '42345678',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        añoCursando: '2° Año',
        materias: ['PROGRAMACIÓN I', 'MATEMÁTICA APLICADA'],
        estado: 'Pendiente'
      },
      {
        nombre: 'Carlos Esteban',
        apellido: 'Romano',
        dni: '40987654',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '2° Llamado',
        añoCursando: '3° Año',
        materias: ['REDES Y TELEPROCESAMIENTO'],
        estado: 'Pendiente'
      },
      {
        nombre: 'Valeria Giselle',
        apellido: 'Farías',
        dni: '43456789',
        carrera: 'Tecnicatura Superior en Agropecuaria',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        añoCursando: '2° Año',
        materias: ['BOTÁNICA AGRÍCOLA', 'QUÍMICA APLICADA'],
        estado: 'Aprobada'
      },
      {
        nombre: 'Nicolás Matías',
        apellido: 'Bustos',
        dni: '41876543',
        carrera: 'Tecnicatura Superior en Agropecuaria',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '2° Llamado',
        añoCursando: '3° Año',
        materias: ['PRODUCCIÓN VEGETAL II'],
        estado: 'Pendiente'
      },
      {
        nombre: 'Sabrina Noel',
        apellido: 'Córdoba',
        dni: '42765432',
        carrera: 'Tecnicatura Superior en Agroindustria',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        añoCursando: '1° Año',
        materias: ['MICROBIOLOGÍA DE LOS ALIMENTOS'],
        estado: 'Pendiente'
      },
      {
        nombre: 'Franco Daniel',
        apellido: 'Maldonado',
        dni: '43987123',
        carrera: 'Profesorado de Educación Secundaria en Matemática',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        añoCursando: '2° Año',
        materias: ['ÁLGEBRA I', 'GEOMETRÍA MÉTRICA'],
        estado: 'Aprobada'
      },
      {
        nombre: 'Carla Vanesa',
        apellido: 'Toledo',
        dni: '44012987',
        carrera: 'Profesorado de Educación Secundaria en Matemática',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '2° Llamado',
        añoCursando: '3° Año',
        materias: ['ANÁLISIS MATEMÁTICO II'],
        estado: 'Pendiente'
      },
      {
        nombre: 'Rodrigo Manuel',
        apellido: 'Coronel',
        dni: '42123980',
        carrera: 'Profesorado de Educación Secundaria en Historia',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        añoCursando: '2° Año',
        materias: ['HISTORIA AMERICANA I', 'HISTORIA ARGENTINA I'],
        estado: 'Aprobada'
      },
      {
        nombre: 'Noelia Soledad',
        apellido: 'Reyes',
        dni: '43543210',
        carrera: 'Profesorado de Educación Secundaria en Historia',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        añoCursando: '4° Año',
        materias: ['HISTORIA DEL MUNDO ACTUAL'],
        estado: 'Pendiente'
      },
      {
        nombre: 'Braian Emanuel',
        apellido: 'Acosta',
        dni: '44556677',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        añoCursando: '2° Año',
        materias: ['SISTEMAS OPERATIVOS'],
        estado: 'Rechazada'
      },
      {
        nombre: 'Melisa Ivana',
        apellido: 'Navarro',
        dni: '42887766',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '2° Llamado',
        añoCursando: '1° Año',
        materias: ['ARQUITECTURA DE COMPUTADORAS'],
        estado: 'Pendiente'
      },
      // 2 inscripciones en papelera para probar
      {
        nombre: 'Ignacio Javier',
        apellido: 'Salas',
        dni: '41999888',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        añoCursando: '3° Año',
        materias: ['INGLÉS TÉCNICO I'],
        estado: 'Pendiente',
        isDeleted: true,
        deletedAt: new Date(Date.now() - 86400000 * 3),
        deletedBy: 'preceptor (preceptor)'
      },
      {
        nombre: 'Giselle Andrea',
        apellido: 'Montenegro',
        dni: '42777666',
        carrera: 'Profesorado de Educación Secundaria en Matemática',
        turno: 'Noviembre-Diciembre 2026',
        llamado: '2° Llamado',
        añoCursando: '1° Año',
        materias: ['PEDAGOGÍA'],
        estado: 'Pendiente',
        isDeleted: true,
        deletedAt: new Date(Date.now() - 86400000 * 4),
        deletedBy: 'admin (admin)'
      }
    ];

    await InscripcionExamen.insertMany(inscripcionesExamenData);
    console.log(`✔ Insertadas ${inscripcionesExamenData.length} inscripciones a exámenes (incluye 2 en papelera).`);

    // 4. Fechas de Exámenes
    console.log('--- Sembrando Fechas de Exámenes ---');
    await FechaExamen.deleteMany({});

    const fechasExamenesData = [
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        llamadoFechas: 'Desde 24 de Noviembre al 05 de Diciembre',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        materia: ['PROGRAMACIÓN I', 'PROGRAMACIÓN II'],
        fecha: '2026-11-25',
        hora: '18:30',
        tribunal: 'Ing. Carlos Robles, Lic. Laura Juárez, Prof. Mario Albornoz'
      },
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        llamadoFechas: 'Desde 24 de Noviembre al 05 de Diciembre',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        materia: ['BASE DE DATOS I', 'ANÁLISIS Y DISEÑO DE SISTEMAS'],
        fecha: '2026-11-27',
        hora: '19:00',
        tribunal: 'Ing. Silvia Rossi, Ing. Carlos Robles, Prof. Marcos Medina'
      },
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        llamadoFechas: 'Desde 24 de Noviembre al 05 de Diciembre',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        materia: ['ARQUITECTURA DE COMPUTADORAS', 'SISTEMAS OPERATIVOS'],
        fecha: '2026-12-01',
        hora: '18:30',
        tribunal: 'Lic. Laura Juárez, Ing. Silvia Rossi, Ing. Carlos Robles'
      },
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '2° Llamado',
        llamadoFechas: 'Desde 09 de Diciembre al 19 de Diciembre',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        materia: ['PROGRAMACIÓN I', 'PROGRAMACIÓN II'],
        fecha: '2026-12-10',
        hora: '18:30',
        tribunal: 'Ing. Carlos Robles, Lic. Laura Juárez, Prof. Mario Albornoz'
      },
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '2° Llamado',
        llamadoFechas: 'Desde 09 de Diciembre al 19 de Diciembre',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        materia: ['MATEMÁTICA APLICADA', 'INGLÉS TÉCNICO I'],
        fecha: '2026-12-15',
        hora: '19:15',
        tribunal: 'Prof. Mario Albornoz, Prof. Marcos Medina, Ing. Silvia Rossi'
      },
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        llamadoFechas: 'Desde 24 de Noviembre al 05 de Diciembre',
        carrera: 'Tecnicatura Superior en Agropecuaria',
        materia: ['BOTÁNICA AGRÍCOLA', 'QUÍMICA APLICADA'],
        fecha: '2026-11-26',
        hora: '18:30',
        tribunal: 'Ing. Agr. Roberto Díaz, Dra. Elena Morales, Prof. Ana Valdés'
      },
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '2° Llamado',
        llamadoFechas: 'Desde 09 de Diciembre al 19 de Diciembre',
        carrera: 'Tecnicatura Superior en Agropecuaria',
        materia: ['PRODUCCIÓN VEGETAL II', 'EDAFOLOGÍA'],
        fecha: '2026-12-12',
        hora: '19:00',
        tribunal: 'Ing. Agr. Roberto Díaz, Prof. Marcelo Paz, Dra. Elena Morales'
      },
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        llamadoFechas: 'Desde 24 de Noviembre al 05 de Diciembre',
        carrera: 'Profesorado de Educación Secundaria en Matemática',
        materia: ['ÁLGEBRA I', 'GEOMETRÍA MÉTRICA'],
        fecha: '2026-11-28',
        hora: '18:30',
        tribunal: 'Prof. Dra. Marta Palacios, Lic. Gabriel Orellana, Prof. José Luján'
      },
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '2° Llamado',
        llamadoFechas: 'Desde 09 de Diciembre al 19 de Diciembre',
        carrera: 'Profesorado de Educación Secundaria en Matemática',
        materia: ['ANÁLISIS MATEMÁTICO II', 'CÁLCULO AVANZADO'],
        fecha: '2026-12-16',
        hora: '18:30',
        tribunal: 'Lic. Gabriel Orellana, Prof. Dra. Marta Palacios, Prof. José Luján'
      },
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        llamadoFechas: 'Desde 24 de Noviembre al 05 de Diciembre',
        carrera: 'Profesorado de Educación Secundaria en Historia',
        materia: ['HISTORIA AMERICANA I', 'HISTORIA ARGENTINA I'],
        fecha: '2026-11-30',
        hora: '18:30',
        tribunal: 'Lic. Ramiro Benítez, Prof. Alicia Mansilla, Prof. Sergio Argañaraz'
      },
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '2° Llamado',
        llamadoFechas: 'Desde 09 de Diciembre al 19 de Diciembre',
        carrera: 'Profesorado de Educación Secundaria en Historia',
        materia: ['HISTORIA DEL MUNDO ACTUAL', 'METODOLOGÍA DE LA INVESTIGACIÓN'],
        fecha: '2026-12-14',
        hora: '19:00',
        tribunal: 'Prof. Alicia Mansilla, Lic. Ramiro Benítez, Prof. Sergio Argañaraz'
      },
      // 2 fechas en papelera
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '1° Llamado',
        llamadoFechas: 'Desde 24 de Noviembre al 05 de Diciembre',
        carrera: 'Tecnicatura Superior en Agroindustria',
        materia: ['MICROBIOLOGÍA DE ALIMENTOS'],
        fecha: '2026-11-29',
        hora: '18:30',
        tribunal: 'Dra. Elena Morales, Prof. Marcelo Paz',
        isDeleted: true,
        deletedAt: new Date(Date.now() - 86400000 * 1),
        deletedBy: 'preceptor (preceptor)'
      },
      {
        turno: 'Noviembre-Diciembre 2026',
        llamado: '2° Llamado',
        llamadoFechas: 'Desde 09 de Diciembre al 19 de Diciembre',
        carrera: 'Tecnicatura Superior en Desarrollo de Software',
        materia: ['COMUNICACIÓN Y COMPRENSIÓN DE TEXTOS'],
        fecha: '2026-12-18',
        hora: '19:00',
        tribunal: 'Prof. Marcos Medina, Lic. Laura Juárez',
        isDeleted: true,
        deletedAt: new Date(Date.now() - 86400000 * 2),
        deletedBy: 'admin (admin)'
      }
    ];

    await FechaExamen.insertMany(fechasExamenesData);
    console.log(`✔ Insertadas ${fechasExamenesData.length} mesas de exámenes (incluye 2 en papelera).`);

    // 5. Mensajes / Consultas
    console.log('--- Sembrando Mensajes de Consultas ---');
    await Mensaje.deleteMany({});

    const mensajesData = [
      {
        nombre: 'Mariana',
        apellido: 'Castro',
        email: 'mariana.castro98@gmail.com',
        telefono: '3865441122',
        asunto: 'Equivalencias de materias desde la UNT',
        mensaje: 'Buenas tardes, quería consultar cómo es el trámite para solicitar equivalencias de materias aprobadas en la carrera de Sistemas de la UNT para la Tecnicatura en Software. Muchas gracias.',
        leido: false
      },
      {
        nombre: 'Hernán',
        apellido: 'Peralta',
        email: 'hernan.peralta@gmail.com',
        telefono: '3865667788',
        asunto: 'Horario del turno vespertino y transporte',
        mensaje: 'Hola! Quería saber si los horarios de cursado de Desarrollo de Software finalizan a tiempo para tomar el colectivo hacia Alberdi. Saludos cordiales.',
        leido: true
      },
      {
        nombre: 'Silvina',
        apellido: 'Gutiérrez',
        email: 'silvina.guti@hotmail.com',
        telefono: '3865889900',
        asunto: 'Documentación física para preinscripción 2026',
        mensaje: 'Hola estimado equipo. Ya completé la preinscripción online para el Profesorado en Matemática, ¿en qué fechas debo presentar la carpeta física con el título secundario en secretaría?',
        leido: false
      },
      {
        nombre: 'Esteban',
        apellido: 'Villafañe',
        email: 'esteban.v@gmail.com',
        telefono: '3865123123',
        asunto: 'Inscripción a exámenes como alumno libre',
        mensaje: 'Buenos días preceptores. Quisiera rendir Programación I en condición Libre en el primer llamado de diciembre. ¿El sistema online permite la selección o debo acercarme personalmente?',
        leido: true
      },
      {
        nombre: 'Lucía',
        apellido: 'Salvatierra',
        email: 'lucia.salva@yahoo.com.ar',
        telefono: '3865987654',
        asunto: 'Constancia de título en trámite',
        mensaje: 'Estimados, necesito solicitar una constancia de finalización de estudios secundarios con título en trámite para mi legajo del IES. ¿Dónde puedo remitirla por mail?',
        leido: false
      },
      {
        nombre: 'Gonzalo',
        apellido: 'Soria',
        email: 'gonza.soria@gmail.com',
        telefono: '3865554433',
        asunto: 'Taller de ambientación para ingresantes',
        mensaje: 'Hola, quería consultar cuándo comienza el curso de nivelación o taller de ambientación obligatorio para ingresantes a las carreras técnicas. ¡Muchas gracias!',
        leido: true
      },
      {
        nombre: 'Paola',
        apellido: 'Chávez',
        email: 'pao.chavez@gmail.com',
        telefono: '3865778899',
        asunto: 'Boleto Estudiantil Gratuito (BEEG)',
        mensaje: 'Consulta para preceptoría: ¿A partir de qué fecha se emiten los certificados de alumno regular para gestionar la tarjeta del Boleto Estudiantil Gratuito del interior?',
        leido: false
      },
      {
        nombre: 'Matías',
        apellido: 'Bravo',
        email: 'mati.bravo@gmail.com',
        telefono: '3865332211',
        asunto: 'Validez nacional de títulos',
        mensaje: 'Hola, quisiera confirmar si el título de Técnico Superior en Agroindustria cuenta con resolución ministerial de validez a nivel nacional. Muchas gracias.',
        leido: true
      },
      // 2 mensajes en papelera
      {
        nombre: 'Federico',
        apellido: 'Roldán',
        email: 'fede.roldan@spam.com',
        telefono: '3865000000',
        asunto: 'Oferta publicitaria externa',
        mensaje: 'Mensaje no deseado de prueba enviado al formulario de contacto institucional.',
        leido: true,
        isDeleted: true,
        deletedAt: new Date(Date.now() - 86400000 * 2),
        deletedBy: 'preceptor (preceptor)'
      },
      {
        nombre: 'Clara',
        apellido: 'Sosa',
        email: 'clara.sosa@test.com',
        telefono: '3865111111',
        asunto: 'Prueba de formulario',
        mensaje: 'Probando si llega el mensaje desde el formulario web.',
        leido: true,
        isDeleted: true,
        deletedAt: new Date(Date.now() - 86400000 * 5),
        deletedBy: 'admin (admin)'
      }
    ];

    await Mensaje.insertMany(mensajesData);
    console.log(`✔ Insertados ${mensajesData.length} mensajes (incluye 2 en papelera).`);

    // 6. Horarios Semanales
    console.log('--- Verificando y Completando Horarios Semanales ---');
    const softwareCarrera = await Carrera.findOne({ id: 1 });
    if (softwareCarrera) {
      const franjasDefault = [
        {
          hora: '18:30 - 19:10',
          esRecreo: false,
          lunes: { materia: 'PROGRAMACIÓN I', profesor: 'Ing. Carlos Robles' },
          martes: { materia: 'SISTEMAS OPERATIVOS', profesor: 'Lic. Laura Juárez' },
          miercoles: { materia: 'MATEMÁTICA APLICADA', profesor: 'Prof. Mario Albornoz' },
          jueves: { materia: 'ARQUITECTURA DE COMPUTADORAS', profesor: 'Ing. Silvia Rossi' },
          viernes: { materia: 'INGLÉS TÉCNICO I', profesor: 'Prof. Marcos Medina' }
        },
        {
          hora: '19:10 - 19:50',
          esRecreo: false,
          lunes: { materia: 'PROGRAMACIÓN I', profesor: 'Ing. Carlos Robles' },
          martes: { materia: 'SISTEMAS OPERATIVOS', profesor: 'Lic. Laura Juárez' },
          miercoles: { materia: 'MATEMÁTICA APLICADA', profesor: 'Prof. Mario Albornoz' },
          jueves: { materia: 'ARQUITECTURA DE COMPUTADORAS', profesor: 'Ing. Silvia Rossi' },
          viernes: { materia: 'INGLÉS TÉCNICO I', profesor: 'Prof. Marcos Medina' }
        },
        {
          hora: '19:50 - 20:30',
          esRecreo: false,
          lunes: { materia: 'COMUNICACIÓN Y COMPRENSIÓN DE TEXTOS', profesor: 'Prof. Liliana Rivas' },
          martes: { materia: 'SISTEMAS OPERATIVOS', profesor: 'Lic. Laura Juárez' },
          miercoles: { materia: 'PROGRAMACIÓN I', profesor: 'Ing. Carlos Robles' },
          jueves: { materia: 'ARQUITECTURA DE COMPUTADORAS', profesor: 'Ing. Silvia Rossi' },
          viernes: { materia: 'MATEMÁTICA APLICADA', profesor: 'Prof. Mario Albornoz' }
        },
        {
          hora: '20:30 - 20:45',
          esRecreo: true,
          lunes: { materia: 'RECREO', profesor: '' },
          martes: { materia: 'RECREO', profesor: '' },
          miercoles: { materia: 'RECREO', profesor: '' },
          jueves: { materia: 'RECREO', profesor: '' },
          viernes: { materia: 'RECREO', profesor: '' }
        },
        {
          hora: '20:45 - 21:25',
          esRecreo: false,
          lunes: { materia: 'COMUNICACIÓN Y COMPRENSIÓN DE TEXTOS', profesor: 'Prof. Liliana Rivas' },
          martes: { materia: 'PROGRAMACIÓN I (PRÁCTICAS)', profesor: 'Ing. Carlos Robles' },
          miercoles: { materia: 'PROGRAMACIÓN I (PRÁCTICAS)', profesor: 'Ing. Carlos Robles' },
          jueves: { materia: 'TALLER DE INNOVACIÓN DIGITAL', profesor: 'Lic. Laura Juárez' },
          viernes: { materia: 'TALLER DE INNOVACIÓN DIGITAL', profesor: 'Lic. Laura Juárez' }
        },
        {
          hora: '21:25 - 22:05',
          esRecreo: false,
          lunes: { materia: 'TALLER DE HARDWARE', profesor: 'Ing. Silvia Rossi' },
          martes: { materia: 'TALLER DE HARDWARE', profesor: 'Ing. Silvia Rossi' },
          miercoles: { materia: 'TALLER INTEGRADOR I', profesor: 'Ing. Carlos Robles' },
          jueves: { materia: 'TALLER INTEGRADOR I', profesor: 'Ing. Carlos Robles' },
          viernes: { materia: 'TALLER INTEGRADOR I', profesor: 'Ing. Carlos Robles' }
        }
      ];

      await Horario.findOneAndUpdate(
        { carreraId: 1, año: '1° Año' },
        {
          carreraId: 1,
          carreraNombre: softwareCarrera.nombre,
          año: '1° Año',
          franjas: franjasDefault,
          isDeleted: false
        },
        { upsert: true }
      );
      console.log('✔ Horarios semanales de 1° Año de Desarrollo de Software cargados con éxito.');
    }

    console.log('\n==========================================');
    console.log('¡TODOS LOS MÓDULOS FUERON SEMBRADOS CON ÉXITO!');
    console.log('==========================================');
    process.exit(0);
  } catch (error) {
    console.error('Error al sembrar datos:', error);
    process.exit(1);
  }
}

seedData();
