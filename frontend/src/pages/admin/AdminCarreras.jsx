import { useState, useEffect } from 'react';
import { Pencil, Plus, Trash2, Clock, BookOpen } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';
import AdminDetallesCarrera from './AdminDetallesCarrera';

export default function AdminCarreras() {
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [editingDetallesCarrera, setEditingDetallesCarrera] = useState(null);
  const { token } = useContext(AuthContext);

  const fetchCarreras = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/carreras');
      if (!response.ok) throw new Error('Error al cargar carreras');
      const data = await response.json();
      data.sort((a, b) => a.id - b.id);
      setCarreras(data);
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'error', texto: 'No se pudieron cargar las carreras.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarreras();
  }, []);

  const handleSaveDetalles = async (dataToSave) => {
    try {
      setMensaje({ tipo: '', texto: '' });
      
      const isNew = !dataToSave.id;
      const url = isNew 
        ? 'http://localhost:5000/api/carreras' 
        : `http://localhost:5000/api/carreras/${dataToSave.id}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) throw new Error(isNew ? 'Error al crear carrera' : 'Error al actualizar carrera');

      setMensaje({ tipo: 'success', texto: isNew ? 'Carrera creada correctamente.' : 'Datos actualizados correctamente.' });
      setEditingDetallesCarrera(null);
      fetchCarreras();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message || 'No se pudo guardar la carrera.' });
    }
  };

  const handleDeleteCarrera = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la carrera "${nombre}"? Esta acción es irreversible.`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/carreras/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al eliminar');

      setMensaje({ tipo: 'success', texto: 'Carrera registrada eliminada correctamente.' });
      fetchCarreras();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar la carrera.' });
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Carreras (Detalles)</h2>
          <p className="text-slate-500 text-sm mt-1">Administra la información general, descripción, perfil y habilidades de la oferta académica.</p>
        </div>
        {!editingDetallesCarrera && (
          <button
            onClick={() => setEditingDetallesCarrera({})} // Empty object triggers new career creation
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm font-bold text-xs uppercase tracking-wider cursor-pointer border border-transparent active:scale-95 shrink-0"
          >
            <Plus className="h-5 w-5" />
            Nueva Carrera
          </button>
        )}
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-lg mb-6 border font-semibold text-sm ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {mensaje.texto}
        </div>
      )}

      {editingDetallesCarrera ? (
        <AdminDetallesCarrera
          carrera={editingDetallesCarrera}
          onBack={() => setEditingDetallesCarrera(null)}
          onSave={handleSaveDetalles}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {carreras.map((carrera) => (
            <div
              key={carrera.id}
              className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-primary/45 shadow-3xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between h-48 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none transform translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform"></div>
              
              <div className="space-y-3">
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

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-primary transition-all duration-300 w-full font-sans">
                <div className="flex items-center gap-1 text-[10px] text-slate-450 font-semibold max-w-[130px] truncate">
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{carrera.horario}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditingDetallesCarrera(carrera)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-655 hover:bg-slate-200 rounded-md transition-colors cursor-pointer border border-transparent font-bold text-[10px] uppercase tracking-wider active:scale-95"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Detalles
                  </button>
                  <button
                    onClick={() => handleDeleteCarrera(carrera.id, carrera.nombre)}
                    className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                    title="Eliminar Carrera"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
