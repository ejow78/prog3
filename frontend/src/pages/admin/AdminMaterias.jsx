import { useState, useEffect, useContext } from 'react';
import { Save, Plus, Trash2, Edit3, Check, X, BookOpen, AlertCircle, CheckCircle, ArrowLeft, ChevronRight } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

// Helper to determine the exact academic years based on career duration string
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
  return ['1° Año', '2° Año', '3° Año']; // fallback
};

export default function AdminMaterias() {
  const [carreras, setCarreras] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Materias state for editing
  // Format: { [año]: [ { nombre: 'MATERIA 1', profesor: 'JUAN PÉREZ' } ] }
  const [materiasMap, setMateriasMap] = useState({});
  const [añoActivo, setAñoActivo] = useState(null);
  const [nuevaMateriaInput, setNuevaMateriaInput] = useState('');
  const [nuevoProfesorInput, setNuevoProfesorInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingNombre, setEditingNombre] = useState('');
  const [editingProfesor, setEditingProfesor] = useState('');

  const { token } = useContext(AuthContext);

  const fetchCarreras = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/carreras');
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
    setEditingIndex(null);
    setNuevaMateriaInput('');
    setNuevoProfesorInput('');

    // Determine available academic years based on career duration
    const years = getYearsList(carrera.duracion);
    setAñoActivo(years[0]);

    // Build initial materias map
    const initialMap = {};
    years.forEach(y => {
      // 1. Check if Carrera already has structured materias saved in the database
      const savedObj = carrera.materias?.find(m => m.año === y);
      if (savedObj !== undefined) {
        initialMap[y] = (savedObj.materiasDetalle || []).map(item => ({
          nombre: item.nombre.trim().toUpperCase(),
          profesor: (item.profesor || '').trim()
        }));
        if (initialMap[y].length === 0 && savedObj.nombres && savedObj.nombres.length > 0) {
          initialMap[y] = savedObj.nombres.map(name => ({
            nombre: name.trim().toUpperCase(),
            profesor: ''
          }));
        }
      } else {
        // 2. Fallback: extract unique subjects and professors from schedules (horariosSemanales)
        const uniqueSubsMap = new Map();
        const scheduleObj = carrera.horariosSemanales?.find(h => h.año === y);
        if (scheduleObj && scheduleObj.franjas) {
          scheduleObj.franjas.forEach(f => {
            if (f.esRecreo) return;
            ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].forEach(dia => {
              const cell = f[dia];
              const mName = cell?.materia;
              const mProf = cell?.profesor;
              if (mName && mName.trim() !== '' && !mName.toLowerCase().includes('recreo')) {
                const upperName = mName.trim().toUpperCase();
                const currentProf = uniqueSubsMap.get(upperName);
                if (!currentProf && mProf && mProf.trim() !== '') {
                  uniqueSubsMap.set(upperName, mProf.trim());
                } else if (!uniqueSubsMap.has(upperName)) {
                  uniqueSubsMap.set(upperName, '');
                }
              }
            });
          });
        }
        initialMap[y] = Array.from(uniqueSubsMap.entries()).map(([nombre, profesor]) => ({
          nombre,
          profesor
        })).sort((a, b) => a.nombre.localeCompare(b.nombre));
      }
    });

    setMateriasMap(initialMap);
  };

  const handleAddMateria = () => {
    if (!nuevaMateriaInput.trim()) return;
    const uppercaseSub = nuevaMateriaInput.trim().toUpperCase();
    const profName = nuevoProfesorInput.trim();

    const currentList = materiasMap[añoActivo] || [];
    if (currentList.some(item => item.nombre === uppercaseSub)) {
      mostrarAlerta('La asignatura ya existe en este año.', 'error');
      return;
    }

    setMateriasMap({
      ...materiasMap,
      [añoActivo]: [...currentList, { nombre: uppercaseSub, profesor: profName }]
    });
    setNuevaMateriaInput('');
    setNuevoProfesorInput('');
    mostrarAlerta('Asignatura agregada a la lista.', 'exito');
  };

  const handleRemoveMateria = (idx) => {
    const currentList = [...(materiasMap[añoActivo] || [])];
    currentList.splice(idx, 1);
    setMateriasMap({
      ...materiasMap,
      [añoActivo]: currentList
    });
    setEditingIndex(null);
  };

  const handleStartEdit = (idx, item) => {
    setEditingIndex(idx);
    setEditingNombre(item.nombre);
    setEditingProfesor(item.profesor || '');
  };

  const handleSaveEdit = (idx) => {
    if (!editingNombre.trim()) return;
    const uppercaseVal = editingNombre.trim().toUpperCase();
    const profVal = editingProfesor.trim();

    const currentList = [...(materiasMap[añoActivo] || [])];
    // Check duplication (excluding itself)
    if (currentList.some((sub, i) => i !== idx && sub.nombre === uppercaseVal)) {
      mostrarAlerta('Ya existe otra asignatura con ese nombre.', 'error');
      return;
    }

    currentList[idx] = { nombre: uppercaseVal, profesor: profVal };
    setMateriasMap({
      ...materiasMap,
      [añoActivo]: currentList
    });
    setEditingIndex(null);
  };

  const handleSaveAll = async () => {
    if (!carreraSeleccionada) return;

    setSaving(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      // Reformat materias map back to database schema structure
      const formattedMaterias = Object.entries(materiasMap).map(([año, items]) => {
        const cleanItems = items.filter(item => item.nombre.trim() !== '');
        return {
          año,
          nombres: cleanItems.map(item => item.nombre), // backward compatibility list of strings
          materiasDetalle: cleanItems.map(item => ({
            nombre: item.nombre,
            profesor: item.profesor || ''
          }))
        };
      });

      const response = await fetch(`http://localhost:5000/api/carreras/${carreraSeleccionada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ materias: formattedMaterias })
      });

      if (!response.ok) throw new Error('Error al actualizar las materias');

      const updatedCarrera = await response.json();
      
      // Update our local carreras state to reflect changes
      setCarreras(carreras.map(c => c.id === updatedCarrera.id ? updatedCarrera : c));
      setCarreraSeleccionada(updatedCarrera);

      mostrarAlerta('Asignaturas y docentes guardados correctamente.', 'exito');
    } catch (err) {
      console.error(err);
      mostrarAlerta(err.message || 'Error al guardar los cambios.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getMateriasCount = (carrera) => {
    if (!carrera.materias || carrera.materias.length === 0) return 0;
    return carrera.materias.reduce((acc, current) => {
      const items = current.materiasDetalle || [];
      return acc + items.length;
    }, 0);
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col justify-center items-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm mt-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-slate-500 font-semibold text-sm">Cargando asignaturas académicas...</p>
      </div>
    );
  }

  if (carreraSeleccionada) {
    const activeSubjectsList = materiasMap[añoActivo] || [];

    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCarreraSeleccionada(null);
                fetchCarreras(); // reload careers data to update subject counts
              }}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 cursor-pointer"
              title="Volver a Carreras"
            >
              <ArrowLeft className="h-5 w-5 text-slate-650" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Asignaturas: {carreraSeleccionada.nombre}</h2>
              <p className="text-slate-500 text-sm mt-1">Configura el plan de materias y docentes por año académico.</p>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-md font-bold text-sm cursor-pointer border border-transparent shrink-0 active:scale-95"
          >
            <Save className="h-4.5 w-4.5" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        {/* Alert message banner */}
        {mensaje.texto && (
          <div className={`p-4 rounded-xl flex items-center gap-2.5 animate-fade-in ${
            mensaje.tipo === 'error' 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-blue-50 text-primary border border-blue-200'
          }`}>
            {mensaje.tipo === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-500 animate-bounce" />
            ) : (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
            <span className="font-semibold text-sm">{mensaje.texto}</span>
          </div>
        )}

        {/* Subjects Management Grid - Full Width */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <span className="text-[10px] bg-blue-50 text-primary font-bold px-2.5 py-1 rounded-full uppercase border border-blue-150/40">
              Plan de Estudios Activo
            </span>
            <h3 className="text-lg font-extrabold text-slate-800 mt-2">
              Asignaturas de {carreraSeleccionada.nombre}
            </h3>
          </div>

          {/* Year tabs (strictly driven by carreraSeleccionada.duracion) */}
          <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-100">
            {getYearsList(carreraSeleccionada.duracion).map((y) => {
              const count = materiasMap[y]?.length || 0;
              return (
                <button
                  key={y}
                  onClick={() => {
                    setAñoActivo(y);
                    setEditingIndex(null);
                  }}
                  className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    añoActivo === y
                      ? 'border-primary text-primary font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{y}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    añoActivo === y ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List and add materias */}
          <div className="space-y-4">
            {/* Add New Subject */}
            <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <input
                  type="text"
                  placeholder="Materia (ej: PROGRAMACIÓN I)"
                  value={nuevaMateriaInput}
                  onChange={(e) => setNuevaMateriaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddMateria();
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-primary text-xs font-bold text-slate-800 uppercase bg-white"
                />
                <input
                  type="text"
                  placeholder="Profesor a cargo (ej: Ing. Juan Pérez)"
                  value={nuevoProfesorInput}
                  onChange={(e) => setNuevoProfesorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddMateria();
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-primary text-xs font-bold text-slate-800 bg-white"
                />
              </div>
              <button
                onClick={handleAddMateria}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary text-white hover:bg-primary-dark rounded-xl transition-all font-bold text-xs cursor-pointer border border-transparent uppercase tracking-wider shrink-0 shadow-sm active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>

            {/* List of Subjects */}
            <div className="bg-slate-50/30 rounded-2xl border border-slate-150 p-4 min-h-[250px] max-h-[450px] overflow-y-auto">
              {activeSubjectsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-slate-400 italic text-xs font-medium">
                  No hay materias cargadas para este año académico.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeSubjectsList.map((item, idx) => {
                    const isEditing = editingIndex === idx;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs hover:shadow-2xs transition-all hover:border-slate-355"
                      >
                        {isEditing ? (
                          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                              <input
                                type="text"
                                value={editingNombre}
                                onChange={(e) => setEditingNombre(e.target.value)}
                                placeholder="Nombre de la Materia"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 uppercase outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(idx);
                                  if (e.key === 'Escape') setEditingIndex(null);
                                }}
                                autoFocus
                              />
                              <input
                                type="text"
                                value={editingProfesor}
                                onChange={(e) => setEditingProfesor(e.target.value)}
                                placeholder="Profesor"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(idx);
                                  if (e.key === 'Escape') setEditingIndex(null);
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleSaveEdit(idx)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <Check className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="p-1.5 text-slate-455 hover:bg-slate-100 rounded"
                              >
                                <X className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
                                {item.nombre}
                              </span>
                              {item.profesor ? (
                                <span className="text-[10px] font-bold text-primary bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full w-max">
                                  Docente: {item.profesor}
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-slate-400 italic">
                                  Sin docente asignado
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleStartEdit(idx, item)}
                                className="p-1.5 text-slate-450 hover:text-primary hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100/50 cursor-pointer"
                                title="Editar Materia y Docente"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveMateria(idx)}
                                className="p-1.5 text-slate-450 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100/50 cursor-pointer"
                                title="Quitar de la lista"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Career Selector - Grid Layout (identical to Horarios and Exámenes selectors)
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Asignaturas (Materias)</h2>
        <p className="text-slate-500 text-sm mt-1">
          Configura y organiza el catálogo de materias y profesores asignados para cada carrera.
        </p>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl flex items-center gap-2.5 animate-fade-in ${
          mensaje.tipo === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-blue-50 text-primary border border-blue-200'
        }`}>
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span className="font-semibold text-xs leading-relaxed">{mensaje.texto}</span>
        </div>
      )}

      {/* Grid of career cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carreras.map((carrera) => {
          const mCount = getMateriasCount(carrera);
          return (
            <button
              key={carrera.id}
              onClick={() => handleSelectCarrera(carrera)}
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

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-primary transition-all duration-300 w-full font-sans">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-slate-400 group-hover:text-primary transition-all shrink-0" />
                  {mCount} {mCount === 1 ? 'Materia Configurada' : 'Materias Configuradas'}
                </span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
