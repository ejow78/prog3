import { useState, useEffect } from 'react';
import { Code, Tractor, Factory, Calculator, Book, X, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper component para renderizar el icono basado en el nombre de la carrera
const getIcon = (nombre) => {
  if (nombre.includes('Software')) return <Code className="h-10 w-10 text-primary" />;
  if (nombre.includes('Agropecuaria')) return <Tractor className="h-10 w-10 text-primary" />;
  if (nombre.includes('Agroindustria')) return <Factory className="h-10 w-10 text-primary" />;
  if (nombre.includes('Matemática')) return <Calculator className="h-10 w-10 text-primary" />;
  if (nombre.includes('Historia')) return <Book className="h-10 w-10 text-primary" />;
  return <Book className="h-10 w-10 text-primary" />;
};

export default function Carreras() {
  const [selectedCarrera, setSelectedCarrera] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/carreras');
        if (!response.ok) throw new Error('Error fetching carreras');
        const data = await response.json();

        // Asignar el componente de icono dinámicamente al recibir los datos
        const carrerasConIconos = data.map(c => ({
          ...c,
          icon: getIcon(c.nombre)
        }));

        // Ordenar por ID para mantener consistencia visual
        carrerasConIconos.sort((a, b) => a.id - b.id);
        setCarreras(carrerasConIconos);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarreras();
  }, []);

  return (
    <div className="bg-slate-50 py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Oferta Académica</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Descubri nuestras carreras y da el primer paso hacia tu futuro profesional. Educación pública y gratuita.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {carreras.map((carrera) => (
              <div key={carrera.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 flex flex-col overflow-hidden group">
                <div className="p-8 flex flex-col flex-grow">
                  <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {carrera.icon}
                  </div>
                  <div className="mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent">{carrera.tipo}</span>
                    <span className="text-xs font-medium text-slate-400 ml-3">· {carrera.duracion}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight">
                    {carrera.nombre}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 flex-grow">
                    {carrera.descripcion}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Link
                      to={`/preinscripcion?carrera=${encodeURIComponent(carrera.nombre)}`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto"
                    >
                      Preinscribirme
                    </Link>
                    <button
                      onClick={() => setSelectedCarrera(carrera)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors w-full sm:w-auto"
                    >
                      Más detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {selectedCarrera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-down">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedCarrera(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl text-primary">
                  {selectedCarrera.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedCarrera.nombre}</h2>
                  <span className="text-sm font-medium text-accent">{selectedCarrera.tipo} · {selectedCarrera.duracion}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-8 text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedCarrera.horario}</span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Perfil del Egresado</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedCarrera.perfil}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Habilidades Profesionales</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCarrera.habilidades.map((hab, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        <span>{hab}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 flex gap-4 pt-6 border-t border-slate-100">
                <Link
                  to={`/preinscripcion?carrera=${encodeURIComponent(selectedCarrera.nombre)}`}
                  className="flex-1 text-center py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg"
                >
                  Preinscribirme a esta carrera
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
