import { useState, useEffect } from 'react';
import { BookOpen, CalendarDays, AlertCircle, ChevronRight } from 'lucide-react';
import AdminFechasExamenesGrid from './AdminFechasExamenesGrid';

export default function AdminFechasExamenes() {
  const [carreras, setCarreras] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const fetchCarreras = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/carreras');
      if (!response.ok) throw new Error('Error al obtener las carreras');
      const data = await response.json();
      data.sort((a, b) => a.id - b.id);
      setCarreras(data);
    } catch (err) {
      console.error(err);
      mostrarAlerta('No se pudieron cargar las carreras.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarreras();
  }, []);

  const mostrarAlerta = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col justify-center items-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm mt-6 max-w-5xl mx-auto">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-slate-500 font-semibold text-sm">Cargando selector de exámenes...</p>
      </div>
    );
  }

  if (carreraSeleccionada) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <AdminFechasExamenesGrid 
          carrera={carreraSeleccionada} 
          onBack={() => {
            setCarreraSeleccionada(null);
            fetchCarreras(); // Reload to refresh any potential data changes
          }} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cronograma de Fechas de Exámenes</h2>
        <p className="text-slate-500 text-sm mt-1">
          Configura y organiza el calendario y los llamados para los exámenes finales de cada carrera académica en formato grilla interactiva.
        </p>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl flex items-center gap-2.5 animate-fade-in ${
          mensaje.tipo === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span className="font-semibold text-xs leading-relaxed">{mensaje.texto}</span>
        </div>
      )}

      {/* Grid selector of careers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carreras.map((carrera) => (
          <button
            key={carrera.id}
            onClick={() => setCarreraSeleccionada(carrera)}
            className="group w-full text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all duration-300 flex flex-col justify-between h-48 cursor-pointer relative"
          >
            <div className="space-y-3 w-full">
              <div className="h-10 w-10 bg-primary/5 group-hover:bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-all duration-300 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 uppercase tracking-wide">
                  {carrera.nombre}
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                  {carrera.tipo} · {carrera.duracion}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-primary transition-all duration-300 w-full">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-slate-400 group-hover:text-primary transition-all shrink-0" />
                Planilla de Exámenes
              </span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
