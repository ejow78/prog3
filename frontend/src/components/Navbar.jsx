import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [inscripcionesOpen, setInscripcionesOpen] = useState(false); // Dropdown Inscripciones state
  const [academicoOpen, setAcademicoOpen] = useState(false); // Dropdown Académico state

  const inscripcionesRef = useRef(null);
  const academicoRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (inscripcionesRef.current && !inscripcionesRef.current.contains(event.target)) {
        setInscripcionesOpen(false);
      }
      if (academicoRef.current && !academicoRef.current.contains(event.target)) {
        setAcademicoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-primary/90 backdrop-blur-md text-white shadow-lg sticky top-0 z-50 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex shrink-0 items-center gap-2 group">
              <span className="font-bold text-xl tracking-tight">IES La Cocha</span>
            </Link>
          </div>

          {/* Menu escritorio */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark hover:text-accent transition-colors"
            >
              Inicio
            </Link>

            <Link
              to="/carreras"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark hover:text-accent transition-colors"
            >
              Carreras
            </Link>

            {/* Dropdown Inscripciones */}
            <div className="relative" ref={inscripcionesRef}>
              <button
                onClick={() => {
                  setInscripcionesOpen(!inscripcionesOpen);
                  setAcademicoOpen(false);
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark hover:text-accent transition-colors cursor-pointer bg-transparent border-none outline-none text-white font-sans"
              >
                Inscripciones
                <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${inscripcionesOpen ? 'rotate-180' : ''}`} />
              </button>

              {inscripcionesOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-100 z-50 divide-y divide-slate-100 overflow-hidden animate-fade-in origin-top-left">
                  <div className="p-1">
                    <Link
                      to="/preinscripcion"
                      onClick={() => setInscripcionesOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      Preinscripción de Ingreso
                    </Link>
                    <Link
                      to="/inscripcion-examenes"
                      onClick={() => setInscripcionesOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      Inscripción a Exámenes
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Académico */}
            <div className="relative" ref={academicoRef}>
              <button
                onClick={() => {
                  setAcademicoOpen(!academicoOpen);
                  setInscripcionesOpen(false);
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark hover:text-accent transition-colors cursor-pointer bg-transparent border-none outline-none text-white font-sans"
              >
                Horarios y Exámenes
                <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${academicoOpen ? 'rotate-180' : ''}`} />
              </button>

              {academicoOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-100 z-50 divide-y divide-slate-100 overflow-hidden animate-fade-in origin-top-left">
                  <div className="p-1">
                    <Link
                      to="/horarios"
                      onClick={() => setAcademicoOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      Horarios de Clases
                    </Link>
                    <Link
                      to="/fechas-examenes"
                      onClick={() => setAcademicoOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      Fechas de Exámenes
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/contacto"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark hover:text-accent transition-colors"
            >
              Contacto
            </Link>

            <Link
              to="/admin/login"
              className="ml-4 px-4 py-2 rounded-md text-sm font-bold bg-white text-primary hover:bg-slate-100 transition-colors shadow-md border border-slate-200"
            >
              Dashboard
            </Link>
          </div>

          {/* Boton menu moviles */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-transparent border-none text-white cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu moviles */}
      {isOpen && (
        <div className="md:hidden bg-primary-dark animate-fade-in-down border-t border-primary-dark">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary hover:text-accent transition-colors"
            >
              Inicio
            </Link>

            <Link
              to="/carreras"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary hover:text-accent transition-colors"
            >
              Carreras
            </Link>

            {/* Grupo Inscripciones Móvil */}
            <div className="space-y-1 py-1">
              <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-350">Inscripciones</div>
              <Link
                to="/preinscripcion"
                onClick={() => setIsOpen(false)}
                className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-slate-100 hover:bg-primary hover:text-white transition-colors"
              >
                Preinscripción de Ingreso
              </Link>
              <Link
                to="/inscripcion-examenes"
                onClick={() => setIsOpen(false)}
                className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-slate-100 hover:bg-primary hover:text-white transition-colors"
              >
                Inscripción a Exámenes
              </Link>
            </div>

            {/* Grupo Horarios y Exámenes Móvil */}
            <div className="space-y-1 py-1">
              <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-355 text-slate-350">Horarios y Exámenes</div>
              <Link
                to="/horarios"
                onClick={() => setIsOpen(false)}
                className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-slate-100 hover:bg-primary hover:text-white transition-colors"
              >
                Horarios de Clases
              </Link>
              <Link
                to="/fechas-examenes"
                onClick={() => setIsOpen(false)}
                className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-slate-100 hover:bg-primary hover:text-white transition-colors"
              >
                Fechas de Exámenes
              </Link>
            </div>

            <Link
              to="/contacto"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary hover:text-accent transition-colors"
            >
              Contacto
            </Link>

            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-bold bg-white text-primary mt-4 mx-2 text-center shadow-md border border-slate-200"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
