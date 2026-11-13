import { useState, useEffect, useContext } from 'react';
import { 
  Save, Plus, Trash2, Edit3, Check, X, BookOpen, AlertCircle, 
  CheckCircle2, ArrowLeft, GraduationCap, Users, UserCheck, 
  UserX, Search, Sparkles 
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

const getYearsList = (duracion) => {
  if (!duracion) return ['1° Año', '2° Año', '3° Año'];
  const match = duracion.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num > 0) {
      const list = [];
      for (let i = 1; i <= num; i++) {
        list.push(`${i}° Año`);
      }
      return list;
    }
  }
  return ['1° Año', '2° Año', '3° Año'];
};

export default function AdminMaterias() {
  const [carreras, setCarreras] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Materias organizadas por año: { [año]: [ { nombre: '', profesor: '' } ] }
  const [materiasMap, setMateriasMap] = useState({});
  const [añoActivo, setAñoActivo] = useState(null);

  // Formulario rápido para nueva materia
  const [nuevaMateriaNombre, setNuevaMateriaNombre] = useState('');
  const [nuevoProfesorNombre, setNuevoProfesorNombre] = useState('');

  // Buscador de materias
  const [busqueda, setBusqueda] = useState('');

  const { token } = useContext(AuthContext);

  const fetchCarreras = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/carreras');
      if (!response.ok) throw new Error('Error al obtener carreras');
      const data = await response.json();
      data.sort((a, b) => a.id - b.id);
      setCarreras(data);
    } catch (err) {
      console.error(err);
      mostrarAlerta('No se pudieron obtener las carreras.', 'error');
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

  const handleSelectCarrera = (carrera) => {
    setCarreraSeleccionada(carrera);
    const years = getYearsList(carrera.duracion);
    setAñoActivo(years[0]);

    const initialMap = {};
    years.forEach(y => {
      const savedObj = carrera.materias?.find(m => m.año === y);
      if (savedObj && savedObj.materiasDetalle && savedObj.materiasDetalle.length > 0) {
        initialMap[y] = savedObj.materiasDetalle.map(m => ({
          nombre: (m.nombre || '').trim().toUpperCase(),
          profesor: (m.profesor || '').trim()
        }));
      } else if (savedObj && savedObj.nombres && savedObj.nombres.length > 0) {
        initialMap[y] = savedObj.nombres.map(name => ({
          nombre: (name || '').trim().toUpperCase(),
          profesor: ''
        }));
      } else {
        initialMap[y] = [];
      }
    });

    setMateriasMap(initialMap);
  };

  const handleAddMateria = (e) => {
    e.preventDefault();
    if (!nuevaMateriaNombre.trim()) {
      mostrarAlerta('El nombre de la materia es obligatorio.', 'error');
      return;
    }

    const nombreUpper = nuevaMateriaNombre.trim().toUpperCase();
    const currentList = materiasMap[añoActivo] || [];

    if (currentList.some(m => m.nombre === nombreUpper)) {
      mostrarAlerta('Esa materia ya existe en este año lectivo.', 'error');
      return;
    }

    setMateriasMap({
      ...materiasMap,
      [añoActivo]: [
        ...currentList,
        { nombre: nombreUpper, profesor: nuevoProfesorNombre.trim() }
      ]
    });

    setNuevaMateriaNombre('');
    setNuevoProfesorNombre('');
    mostrarAlerta('Materia agregada a la lista. Guarda los cambios para confirmar.', 'exito');
  };

  const handleUpdateProfesor = (index, nuevoProfesor) => {
    const list = [...(materiasMap[añoActivo] || [])];
    list[index].profesor = nuevoProfesor;
    setMateriasMap({
      ...materiasMap,
      [añoActivo]: list
    });
  };

  const handleDeleteMateria = (index, nombre) => {
    if (!window.confirm(`¿Quitar la materia "${nombre}" del plan de estudio?`)) return;
    const list = [...(materiasMap[añoActivo] || [])];
    list.splice(index, 1);
    setMateriasMap({
      ...materiasMap,
      [añoActivo]: list
    });
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const payloadMaterias = Object.entries(materiasMap).map(([año, items]) => ({
        año,
        nombres: items.map(i => i.nombre),
        materiasDetalle: items.map(i => ({
          nombre: i.nombre,
          profesor: i.profesor
        }))
      }));

      const response = await fetch(`/api/carreras/${carreraSeleccionada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ materias: payloadMaterias })
      });

      if (!response.ok) throw new Error('Error al guardar las materias.');

      const updatedCarrera = await response.json();
      setCarreras(carreras.map(c => c.id === updatedCarrera.id ? updatedCarrera : c));
      setCarreraSeleccionada(updatedCarrera);
      mostrarAlerta('Plan de materias y docentes guardado con éxito.', 'exito');
    } catch (err) {
      console.error(err);
      mostrarAlerta(err.message || 'Error al guardar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading && carreras.length === 0) {
    return (
      <div className="p-12 flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-slate-500 text-xs font-semibold">Cargando materias académicas...</p>
      </div>
    );
  }

  // Vista 1: Selector simple y limpio de carrera
  if (!carreraSeleccionada) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Plan de Materias y Docentes</h2>
            <p className="text-slate-500 text-xs">Selecciona una carrera para asignar asignaturas por año y docentes a cargo.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carreras.map((c) => {
            const totalMaterias = (c.materias || []).reduce((acc, y) => acc + (y.nombres?.length || 0), 0);
            return (
              <button
                key={c.id}
                onClick={() => handleSelectCarrera(c)}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-primary/50 hover:shadow-md transition-all text-left flex flex-col justify-between h-44 group cursor-pointer"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600">
                    {c.tipo}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors mt-2 line-clamp-2">
                    {c.nombre}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Duración: {c.duracion}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{totalMaterias} Materias cargadas</span>
                  <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Gestionar &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Vista 2: Gestión Simplificada de la Carrera Seleccionada
  const currentList = materiasMap[añoActivo] || [];
  const filtradas = currentList.filter(m => 
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    m.profesor.toLowerCase().includes(busqueda.toLowerCase())
  );
  const years = getYearsList(carreraSeleccionada.duracion);

  const conDocente = currentList.filter(m => m.profesor && m.profesor.trim() !== '').length;
  const sinDocente = currentList.length - conDocente;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Barra Superior con botón Volver y Guardar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCarreraSeleccionada(null)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Volver a seleccionar carrera"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-snug">{carreraSeleccionada.nombre}</h2>
            <p className="text-xs text-slate-500 font-medium">Asignación de asignaturas y equipo docente por año académico</p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar Todo'}
        </button>
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

      {/* Selector de Años tipo Píldoras Modernas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {years.map((y) => {
          const count = (materiasMap[y] || []).length;
          const isActive = añoActivo === y;
          return (
            <button
              key={y}
              onClick={() => setAñoActivo(y)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{y}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenido Principal: Formulario de Alta Rápida + Lista de Materias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Formulario Rápido de Alta */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Plus className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Agregar Materia a {añoActivo}</h3>
          </div>

          <form onSubmit={handleAddMateria} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nombre de la Asignatura</label>
              <input
                type="text"
                placeholder="Ej: Programación III"
                value={nuevaMateriaNombre}
                onChange={(e) => setNuevaMateriaNombre(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Profesor/a a Cargo (Opcional)</label>
              <input
                type="text"
                placeholder="Ej: Prof. Gómez, María"
                value={nuevoProfesorNombre}
                onChange={(e) => setNuevoProfesorNombre(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer mt-2"
            >
              + Agregar Asignatura
            </button>
          </form>

          {/* Resumen del año */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Total Materias:</span>
              <strong className="text-slate-800">{currentList.length}</strong>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Con Docente Asignado:</span>
              <strong>{conDocente}</strong>
            </div>
            <div className="flex justify-between text-amber-600 font-semibold">
              <span>Sin Docente Asignado:</span>
              <strong>{sinDocente}</strong>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Lista Simplificada con Edición Inmediata */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Buscar en ${añoActivo}...`}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <span className="text-xs text-slate-400 font-bold shrink-0">{filtradas.length} Asignaturas</span>
          </div>

          {filtradas.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 shadow-2xs">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No hay materias cargadas para {añoActivo}</p>
              <p className="text-xs text-slate-400 mt-0.5">Usa el formulario de la izquierda para agregar la primera asignatura.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtradas.map((materia, idx) => (
                <div
                  key={materia.nombre + idx}
                  className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 flex-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                      {añoActivo}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{materia.nombre}</h4>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex-1 sm:w-60">
                      <input
                        type="text"
                        placeholder="Sin profesor asignado"
                        value={materia.profesor}
                        onChange={(e) => handleUpdateProfesor(idx, e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-xs font-semibold outline-none transition-all ${
                          materia.profesor && materia.profesor.trim() !== ''
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-500 focus:bg-white focus:border-primary'
                        }`}
                        title="Escribe directamente aquí el nombre del docente"
                      />
                    </div>

                    <button
                      onClick={() => handleDeleteMateria(idx, materia.nombre)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Quitar materia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
