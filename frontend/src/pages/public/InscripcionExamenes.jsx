import { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function InscripcionExamenes() {
  const [carreras, setCarreras] = useState([]);
  const [loadingCarreras, setLoadingCarreras] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Settings checking
  const [settings, setSettings] = useState({ examenesAbiertos: true });
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    carrera: '',
    turno: '',
    llamado: '',
    añoCursando: '',
    materias: []
  });

  // Cargar settings del sistema
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const [añosDisponibles, setAñosDisponibles] = useState([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [fechasExamenes, setFechasExamenes] = useState([]);
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [llamadosDisponibles, setLlamadosDisponibles] = useState([]);
  const [llamadoStatus, setLlamadoStatus] = useState({ isOpen: true, mensaje: '' });

  // Cargar las carreras y fechas de examen al inicializar la página
  useEffect(() => {
    const fetchCarrerasYFechas = async () => {
      try {
        const resCarreras = await fetch('http://localhost:5000/api/carreras');
        if (!resCarreras.ok) throw new Error('Error al cargar carreras');
        const dataCarreras = await resCarreras.json();
        dataCarreras.sort((a, b) => a.id - b.id);
        setCarreras(dataCarreras);

        const resFechas = await fetch('http://localhost:5000/api/fechas-examenes');
        if (resFechas.ok) {
          const dataFechas = await resFechas.json();
          setFechasExamenes(dataFechas);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las carreras o fechas disponibles. Por favor, intente más tarde.');
      } finally {
        setLoadingCarreras(false);
      }
    };
    fetchCarrerasYFechas();
  }, []);

  // Helper para resolver el año de una materia específica
  const resolveAñoDeMateria = (carreraObj, materiaName) => {
    if (!carreraObj) return null;
    const uppercaseMateria = materiaName.trim().toUpperCase();
    
    // 1. Buscar en carrera.materias oficiales
    if (carreraObj.materias) {
      const match = carreraObj.materias.find(m => {
        const list = m.materiasDetalle && m.materiasDetalle.length > 0
          ? m.materiasDetalle.map(item => item.nombre.trim().toUpperCase())
          : (m.nombres || []).map(name => name.trim().toUpperCase());
        return list.includes(uppercaseMateria);
      });
      if (match) return match.año;
    }

    // 2. Fallback a horarios semanales
    if (carreraObj.horariosSemanales) {
      const matchSchedule = carreraObj.horariosSemanales.find(h => {
        if (!h.franjas) return false;
        return h.franjas.some(f => {
          if (f.esRecreo) return false;
          return ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].some(dia => 
            f[dia]?.materia?.trim().toUpperCase() === uppercaseMateria
          );
        });
      });
      if (matchSchedule) return matchSchedule.año;
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Escuchar cambios en la carrera seleccionada
  useEffect(() => {
    if (!formData.carrera) {
      setTurnosDisponibles([]);
      setLlamadosDisponibles([]);
      setAñosDisponibles([]);
      setMateriasDisponibles([]);
      setFormData(prev => ({ ...prev, turno: '', llamado: '', añoCursando: '', materias: [] }));
      return;
    }

    // Filtrar turnos únicos para esta carrera
    const turnos = [...new Set(
      fechasExamenes
        .filter(f => f.carrera === formData.carrera)
        .map(f => f.turno)
    )].sort();
    setTurnosDisponibles(turnos);

    // Resetear turno, llamado, año y materias
    setLlamadosDisponibles([]);
    setAñosDisponibles([]);
    setMateriasDisponibles([]);
    setFormData(prev => ({ ...prev, turno: '', llamado: '', añoCursando: '', materias: [] }));
  }, [formData.carrera, fechasExamenes]);

  // Escuchar cambios en el turno seleccionado
  useEffect(() => {
    if (!formData.turno) {
      setLlamadosDisponibles([]);
      setAñosDisponibles([]);
      setMateriasDisponibles([]);
      setFormData(prev => ({ ...prev, llamado: '', añoCursando: '', materias: [] }));
      return;
    }

    // Filtrar llamados únicos para la carrera y turno seleccionados
    const filterFechas = fechasExamenes.filter(
      f => f.carrera === formData.carrera && f.turno === formData.turno
    );

    const llamadosMap = {};
    filterFechas.forEach(f => {
      if (!llamadosMap[f.llamado]) {
        llamadosMap[f.llamado] = {
          fechas: f.llamadoFechas
        };
      }
    });

    const llamados = Object.keys(llamadosMap).map(name => ({
      nombre: name,
      fechas: llamadosMap[name].fechas
    })).sort((a, b) => a.nombre.localeCompare(b.nombre));

    setLlamadosDisponibles(llamados);

    // Resetear llamado, año y materias
    setAñosDisponibles([]);
    setMateriasDisponibles([]);
    setFormData(prev => ({ ...prev, llamado: '', añoCursando: '', materias: [] }));
  }, [formData.turno, formData.carrera, fechasExamenes]);

  // Escuchar cambios en el llamado seleccionado
  useEffect(() => {
    if (!formData.llamado) {
      setAñosDisponibles([]);
      setMateriasDisponibles([]);
      setLlamadoStatus({ isOpen: true, mensaje: '' });
      setFormData(prev => ({ ...prev, añoCursando: '', materias: [] }));
      return;
    }

    let inicio = null;
    let fin = null;
    if (formData.llamado === 'Primer Llamado') {
      inicio = settings.examenes1LlamadoInicio;
      fin = settings.examenes1LlamadoFin;
    } else if (formData.llamado === 'Segundo Llamado') {
      inicio = settings.examenes2LlamadoInicio;
      fin = settings.examenes2LlamadoFin;
    } else if (formData.llamado === 'Llamado Especial') {
      inicio = settings.examenesEspLlamadoInicio;
      fin = settings.examenesEspLlamadoFin;
    }

    if (inicio && fin) {
      const d = new Date();
      const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const formatStringDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
      };

      if (localToday < inicio) {
        setLlamadoStatus({
          isOpen: false,
          mensaje: `El periodo de inscripción para el ${formData.llamado} aún no se ha habilitado. Se abrirá el ${formatStringDate(inicio)}.`
        });
        setAñosDisponibles([]);
        setMateriasDisponibles([]);
        setFormData(prev => ({ ...prev, añoCursando: '', materias: [] }));
        return;
      }

      if (localToday > fin) {
        setLlamadoStatus({
          isOpen: false,
          mensaje: `El periodo de inscripción para el ${formData.llamado} finalizó el ${formatStringDate(fin)}.`
        });
        setAñosDisponibles([]);
        setMateriasDisponibles([]);
        setFormData(prev => ({ ...prev, añoCursando: '', materias: [] }));
        return;
      }
    }

    setLlamadoStatus({ isOpen: true, mensaje: '' });

    const carreraObj = carreras.find(c => c.nombre === formData.carrera);
    if (!carreraObj) return;

    // Obtener las fechas de examen correspondientes al llamado, turno y carrera
    const filterFechas = fechasExamenes.filter(
      f => f.carrera === formData.carrera && f.turno === formData.turno && f.llamado === formData.llamado
    );

    // Recolectar materias programadas
    const materiasProgramadas = [];
    filterFechas.forEach(f => {
      if (Array.isArray(f.materia)) {
        materiasProgramadas.push(...f.materia);
      }
    });

    // Identificar los años a los que pertenecen estas materias
    const añosConMesas = new Set();
    materiasProgramadas.forEach(mat => {
      const año = resolveAñoDeMateria(carreraObj, mat);
      if (año) {
        añosConMesas.add(año);
      }
    });

    // Ordenar años disponibles
    const años = [...añosConMesas].sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numA - numB;
    });

    setAñosDisponibles(años);

    // Resetear año y materias
    setMateriasDisponibles([]);
    setFormData(prev => ({ ...prev, añoCursando: '', materias: [] }));
  }, [formData.llamado, formData.turno, formData.carrera, fechasExamenes, carreras, llamadosDisponibles, settings]);

  // Escuchar cambios en el año seleccionado
  useEffect(() => {
    if (!formData.añoCursando) {
      setMateriasDisponibles([]);
      setFormData(prev => ({ ...prev, materias: [] }));
      return;
    }

    const carreraObj = carreras.find(c => c.nombre === formData.carrera);
    if (!carreraObj) return;

    // Obtener las fechas de examen correspondientes al llamado, turno y carrera
    const filterFechas = fechasExamenes.filter(
      f => f.carrera === formData.carrera && f.turno === formData.turno && f.llamado === formData.llamado
    );

    // Recolectar materias programadas
    const materiasProgramadas = [];
    filterFechas.forEach(f => {
      if (Array.isArray(f.materia)) {
        materiasProgramadas.push(...f.materia);
      }
    });

    // Filtrar aquellas materias programadas que correspondan al año seleccionado
    const materiasFiltradas = materiasProgramadas.filter(mat => {
      const año = resolveAñoDeMateria(carreraObj, mat);
      return año === formData.añoCursando;
    });

    // Eliminar duplicados si los hubiere
    const materiasUnicas = [...new Set(materiasFiltradas)].sort();

    setMateriasDisponibles(materiasUnicas);
    setFormData(prev => ({ ...prev, materias: [] }));
  }, [formData.añoCursando, formData.llamado, formData.turno, formData.carrera, fechasExamenes, carreras]);


  const handleMateriaToggle = (materia) => {
    setFormData(prev => {
      const yaSeleccionada = prev.materias.includes(materia);
      const nuevasMaterias = yaSeleccionada
        ? prev.materias.filter(m => m !== materia)
        : [...prev.materias, materia];
      return { ...prev, materias: nuevasMaterias };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.materias.length === 0) {
      setError('Debes seleccionar al menos una materia para rendir.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/inscripciones-examenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la inscripción.');
      }

      setEnviado(true);
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        carrera: '',
        añoCursando: '',
        materias: []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (settings.isExamenesOpen === false) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-slate-200">
          <AlertCircle className="h-20 w-20 text-amber-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Inscripciones Cerradas</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {settings.examenesMensaje || "El periodo de inscripciones para las mesas de exámenes finales se encuentra actualmente cerrado."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-md text-sm font-semibold"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-slate-100">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Inscripción Exitosa!</h2>
          <p className="text-slate-600 mb-6">
            Hemos recibido tus datos correctamente. Tu inscripción para las mesas de exámenes ha sido registrada.
          </p>
          <button
            onClick={() => setEnviado(false)}
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Volver al formulario
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-16 animate-fade-in min-h-[calc(100vh-10rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-primary to-primary-dark p-8 md:p-12 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">Inscripción a Mesas de Exámenes</h1>
            <p className="text-primary-100">Completá tus datos y seleccioná las materias que vas a rendir.</p>
          </div>

          <div className="p-8 md:p-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {loadingCarreras ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-slate-500 font-medium">Cargando carreras y planes de estudio...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                    <input 
                      required 
                      type="text" 
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800" 
                      placeholder="Juan" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                    <input 
                      required 
                      type="text" 
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800" 
                      placeholder="Pérez" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                    <input 
                      required 
                      type="text" 
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800" 
                      placeholder="Sin puntos" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Carrera</label>
                    <select 
                      required
                      name="carrera"
                      value={formData.carrera}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white text-slate-800"
                    >
                      <option value="">Seleccione una carrera...</option>
                      {carreras.map(c => (
                        <option key={c.id} value={c.nombre}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Turno Académico</label>
                    <select 
                      required
                      name="turno"
                      value={formData.turno}
                      onChange={handleChange}
                      disabled={!formData.carrera || turnosDisponibles.length === 0}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">
                        {!formData.carrera 
                          ? "Primero seleccione carrera" 
                          : turnosDisponibles.length === 0 
                            ? "No hay turnos programados" 
                            : "Seleccione el turno..."}
                      </option>
                      {turnosDisponibles.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Llamado</label>
                    <select 
                      required
                      name="llamado"
                      value={formData.llamado}
                      onChange={handleChange}
                      disabled={!formData.turno || llamadosDisponibles.length === 0}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">
                        {!formData.turno 
                          ? "Primero seleccione turno" 
                          : llamadosDisponibles.length === 0 
                            ? "No hay llamados programados" 
                            : "Seleccione el llamado..."}
                      </option>
                      {llamadosDisponibles.map(ll => (
                        <option key={ll.nombre} value={ll.nombre}>
                          {ll.nombre} {ll.fechas ? `(${ll.fechas})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!llamadoStatus.isOpen && (
                   <div className="p-4 bg-amber-50 border border-amber-250 text-amber-800 rounded-xl flex items-start gap-2.5 animate-fade-in">
                     <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                     <div className="text-sm font-semibold leading-relaxed">
                       {llamadoStatus.mensaje}
                     </div>
                   </div>
                 )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Año de la materia</label>
                    <select 
                      required
                      name="añoCursando"
                      value={formData.añoCursando}
                      onChange={handleChange}
                      disabled={!formData.llamado || añosDisponibles.length === 0 || !llamadoStatus.isOpen}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">
                        {!formData.llamado 
                          ? "Primero seleccione llamado" 
                          : añosDisponibles.length === 0 
                            ? "No hay años disponibles" 
                            : "Seleccione el año..."}
                      </option>
                      {añosDisponibles.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selección de Materias */}
                <div className="pt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Materias que va a rendir</label>
                  
                  {!formData.carrera || !formData.turno || !formData.llamado || !formData.añoCursando ? (
                    <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-slate-400 text-sm font-medium">
                      Seleccioná Carrera, Turno, Llamado y Año para cargar las materias disponibles.
                    </div>
                  ) : materiasDisponibles.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-slate-400 text-sm font-medium">
                      No hay materias configuradas para este llamado en este año académico.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {materiasDisponibles.map(m => {
                        const isChecked = formData.materias.includes(m);
                        return (
                          <div 
                            key={m}
                            onClick={() => handleMateriaToggle(m)}
                            className={`p-4 rounded-lg border cursor-pointer select-none transition-all flex items-center gap-3 ${
                              isChecked 
                                ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm' 
                                : 'bg-white border-slate-300 hover:border-slate-400 text-slate-700'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Manejado por el onClick del contenedor
                              className="rounded border-slate-300 text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
                            />
                            <span className="text-sm leading-tight uppercase font-medium">{m}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || formData.materias.length === 0 || !llamadoStatus.isOpen}
                  className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg flex justify-center items-center gap-2 mt-8 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Inscribirme a Exámenes
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
