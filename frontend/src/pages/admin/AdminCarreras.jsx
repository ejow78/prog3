import { useState, useEffect, useContext } from 'react';
import { 
  Pencil, Plus, Trash2, RotateCcw, Clock, BookOpen, GraduationCap, 
  Award, Layers, Search, Filter, AlertCircle, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import AdminDetallesCarrera from './AdminDetallesCarrera';
import SoftDeleteFilter from '../../components/admin/SoftDeleteFilter';

export default function AdminCarreras() {
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [editingDetallesCarrera, setEditingDetallesCarrera] = useState(null);
  const [activeTab, setActiveTab] = useState('activos'); // 'activos' o 'papelera'
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  const { token, admin } = useContext(AuthContext);

  const fetchCarreras = async () => {
    try {
      setLoading(true);
      // Siempre pedimos todas para contar activos y papelera
      const response = await fetch('/api/carreras?includeDeleted=true');
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
      const url = isNew ? '/api/carreras' : `/api/carreras/${dataToSave.id}`;
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

  // Borrado lógico (Soft delete)
  const handleDeleteCarrera = async (id, nombre) => {
    if (!window.confirm(`¿Enviar a la papelera la carrera "${nombre}"? Podrás restaurarla en cualquier momento.`)) return;

    try {
      const response = await fetch(`/api/carreras/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al enviar a papelera');

      setMensaje({ tipo: 'success', texto: `Carrera "${nombre}" enviada a papelera de reciclaje.` });
      fetchCarreras();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar la carrera.' });
    }
  };

  // Restaurar desde la papelera
  const handleRestoreCarrera = async (id, nombre) => {
    try {
      const response = await fetch(`/api/carreras/${id}/restore`, { 
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al restaurar carrera');

      setMensaje({ tipo: 'success', texto: `Carrera "${nombre}" restaurada con éxito.` });
      fetchCarreras();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al restaurar la carrera.' });
    }
  };

  // Eliminación definitiva (Hard delete)
  const handleForceDeleteCarrera = async (id, nombre) => {
    if (!window.confirm(`¿ELIMINAR DEFINITIVAMENTE la carrera "${nombre}"?\n\nEsta acción NO se puede deshacer y borrará la carrera de la base de datos permanentemente.`)) return;

    try {
      const response = await fetch(`/api/carreras/${id}/force`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al eliminar definitivamente');

      setMensaje({ tipo: 'success', texto: `Carrera "${nombre}" eliminada de forma permanente.` });
      fetchCarreras();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar definitivamente la carrera.' });
    }
  };

  // Vaciar papelera de carreras
  const handleEmptyTrashCarreras = async () => {
    if (!window.confirm('¿VACIAR PAPELERA DE CARRERAS?\n\nSe eliminarán de forma irreversible todas las carreras en la papelera.')) return;

    try {
      const response = await fetch('/api/carreras/trash/empty', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al vaciar papelera');

      const data = await response.json();
      setMensaje({ tipo: 'success', texto: data.message || 'Papelera vaciada correctamente.' });
      fetchCarreras();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al vaciar la papelera de carreras.' });
    }
  };

  // Separar activas vs papelera
  const activas = carreras.filter(c => !c.isDeleted);
  const papelera = carreras.filter(c => c.isDeleted);

  // Lista según pestaña
  const listaBase = activeTab === 'activos' ? activas : papelera;

  // Filtrado por buscador y tipo
  const filtradas = listaBase.filter(c => {
    const matchBusqueda = (c.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                          (c.tipo || '').toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo = filtroTipo === 'Todos' || c.tipo === filtroTipo;
    return matchBusqueda && matchTipo;
  });

  if (loading && carreras.length === 0) {
    return (
      <div className="p-12 flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-slate-500 text-xs font-semibold">Cargando carreras académicas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Gestión de Oferta Académica</h2>
              <p className="text-slate-500 text-xs">Administra los planes formativos, duraciones y resoluciones oficiales.</p>
            </div>
          </div>
        </div>

        {!editingDetallesCarrera && (
          <button
            onClick={() => setEditingDetallesCarrera({})}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20 font-bold text-xs uppercase tracking-wider cursor-pointer border border-transparent active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nueva Carrera
          </button>
        )}
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-bold ${
          mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {mensaje.tipo === 'error' ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            <span>{mensaje.texto}</span>
          </div>
          <button onClick={() => setMensaje({ tipo: '', texto: '' })} className="text-slate-400 hover:text-slate-700 font-bold">&times;</button>
        </div>
      )}

      {editingDetallesCarrera ? (
        <AdminDetallesCarrera
          carrera={editingDetallesCarrera}
          onBack={() => setEditingDetallesCarrera(null)}
          onSave={handleSaveDetalles}
        />
      ) : (
        <>
          {/* Métricas Visuales Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Oferta Total Activa</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">{activas.length}</h3>
                <span className="text-[11px] text-slate-400 font-medium">Planes de estudio vigentes</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tecnicaturas Superiores</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">
                  {activas.filter(c => (c.tipo || '').toLowerCase().includes('tecnicatura')).length}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Área técnica y profesional</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profesorados</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">
                  {activas.filter(c => (c.tipo || '').toLowerCase().includes('profesorado')).length}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Formación docente inicial</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Barra de Filtros y Selector de Papelera */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <SoftDeleteFilter 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                totalActivos={activas.length}
                totalPapelera={papelera.length}
              />

              {activeTab === 'papelera' && papelera.length > 0 && ['admin', 'superadmin'].includes(admin?.role) && (
                <button
                  onClick={handleEmptyTrashCarreras}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Vaciar Papelera ({papelera.length})
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar carrera..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="Todos">Todos los tipos</option>
                <option value="Tecnicatura Superior">Tecnicaturas</option>
                <option value="Profesorado">Profesorados</option>
              </select>
            </div>
          </div>

          {/* Grilla Simplificada y Moderna de Carreras */}
          {filtradas.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 shadow-2xs">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No se encontraron carreras</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === 'papelera' ? 'La papelera de reciclaje está vacía.' : 'Intenta ajustar los filtros de búsqueda.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtradas.map((carrera) => (
                <div
                  key={carrera.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-2xs hover:shadow-md ${
                    carrera.isDeleted 
                      ? 'border-red-200 bg-red-50/20 opacity-80' 
                      : 'border-slate-200/90 hover:border-primary/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        (carrera.tipo || '').toLowerCase().includes('profesorado')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {carrera.tipo}
                      </span>

                      {carrera.isDeleted && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                          En Papelera
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                        {carrera.nombre}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Duración: <strong className="text-slate-700 font-bold">{carrera.duracion}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{carrera.horario || 'Turno vespertino'}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {carrera.isDeleted ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => handleRestoreCarrera(carrera.id, carrera.nombre)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restaurar
                        </button>
                        {['admin', 'superadmin'].includes(admin?.role) && (
                          <button
                            onClick={() => handleForceDeleteCarrera(carrera.id, carrera.nombre)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                            title="Eliminar de forma permanente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingDetallesCarrera(carrera)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar Datos
                        </button>

                        <button
                          onClick={() => handleDeleteCarrera(carrera.id, carrera.nombre)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Enviar a papelera"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
