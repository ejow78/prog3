import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  // Públicas
  '/': 'Inicio | IES La Cocha',
  '/carreras': 'Oferta Académica | IES La Cocha',
  '/horarios': 'Horarios de Cursada | IES La Cocha',
  '/preinscripcion': 'Preinscripción Online | IES La Cocha',
  '/contacto': 'Contacto y Consultas | IES La Cocha',
  '/fechas-examenes': 'Fechas de Exámenes | IES La Cocha',
  '/inscripcion-examenes': 'Inscripción a Exámenes | IES La Cocha',

  // Administración
  '/admin/login': 'Acceso Administrativo | IES La Cocha',
  '/admin/register': 'Registro de Administrador | IES La Cocha',
  '/admin': 'Dashboard | IES La Cocha',
  '/admin/dashboard': 'Dashboard | IES La Cocha',
  '/admin/carreras': 'Gestión de Carreras | IES La Cocha',
  '/admin/materias': 'Gestión de Materias | IES La Cocha',
  '/admin/horarios': 'Planificación de Horarios | IES La Cocha',
  '/admin/preinscripciones': 'Admisiones y Preinscripciones | IES La Cocha',
  '/admin/examenes': 'Inscripciones a Exámenes | IES La Cocha',
  '/admin/fechas-examenes': 'Fechas de Exámenes | IES La Cocha',
  '/admin/mensajes': 'Mensajes y Consultas | IES La Cocha',
  '/admin/gestion-central': 'Gestión Central | IES La Cocha'
};

export default function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.length > 1 && location.pathname.endsWith('/')
      ? location.pathname.slice(0, -1)
      : location.pathname;

    let title = routeTitles[path];

    if (!title) {
      if (path.startsWith('/admin')) {
        title = 'Panel Administrativo | IES La Cocha';
      } else {
        title = 'IES La Cocha - Instituto de Educación Superior';
      }
    }

    document.title = title;
  }, [location.pathname]);

  return null;
}
