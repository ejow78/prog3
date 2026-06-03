import { useState, useEffect, useContext } from 'react';
import { BookOpen, Clock, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import AdminHorariosGrid from './AdminHorariosGrid';

export default function AdminHorarios() {
  const [carreras, setCarreras] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const { token } = useContext(AuthContext);

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

  const handleSaveHorarios = async (carreraId, payload) => {
    try {
      setMensaje({ texto: '', tipo: '' });
      const response = await fetch(`http://localhost:5000/api/carreras/${carreraId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al actualizar los horarios');

      const updatedCarrera = await response.json();
      
      // Update local state
      setCarreras(carreras.map(c => c.id === updatedCarrera.id ? updatedCarrera : c));
      setCarreraSeleccionada(updatedCarrera);
      mostrarAlerta('Horarios semanales actualizados correctamente.', 'exito');
    } catch (err) {
      console.error(err);
      mostrarAlerta(err.message || 'No se pudieron guardar los horarios.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col justify-center items-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm mt-6 max-w-5xl mx-auto">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-slate-500 font-semibold text-sm">Cargando distribución de horarios...</p>
      </div>
    );
  }

  if (carreraSeleccionada) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {mensaje.texto && (
          <div className={`p-4 rounded-xl flex items-center gap-2.5 mb-4 animate-fade-in ${
            mensaje.tipo === 'error' 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {mensaje.tipo === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            )}
            <span className="font-semibold text-xs leading-relaxed">{mensaje.texto}</span>
          </div>
        )}
        <AdminHorariosGrid 
          carrera={carreraSeleccionada} 
          onBack={() => setCarreraSeleccionada(null)} 
          onSave={handleSaveHorarios} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Distribución de Horarios Semanales</h2>
        <p className="text-slate-500 text-sm mt-1">
          Planifica y edita la distribución horaria semanal de clases para cada carrera de la oferta académica.
        </p>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl flex items-center gap-2.5 animate-fade-in ${
          mensaje.tipo === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {mensaje.tipo === 'error' ? (
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          )}
          <span className="font-semibold text-xs leading-relaxed">{mensaje.texto}</span>
        </div>
      )}

      {/* Grid selector of careers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carreras.map((carrera) => (
          <button
            key={carrera.id}
            onClick={() => setCarreraSeleccionada(carrera)}
            className="group w-full text-left bg-white p-5 rounded-2xl border border-slate-200 hover:border-primary/45 shadow-3xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between h-48 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none transform translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform"></div>
            
            <div className="space-y-3">
              <div className="h-10 w-10 bg-primary/5 group-hover:bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-all duration-300">
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
              <span className="flex items-center gap-1.5 font-sans">
                <Clock className="h-4 w-4 text-slate-400 group-hover:text-primary transition-all shrink-0" />
                {(() => {
                  const count = carrera.horariosSemanales
                    ? carrera.horariosSemanales.filter(h => h.franjas && h.franjas.length > 0).length
                    : 0;
                  return count === 1 ? '1 Año Configurado' : `${count} Años Configurados`;
                })()}
              </span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
