import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext, lazy, Suspense } from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, Calendar as CalendarIcon, LogOut, 
  Settings, Menu, X, BookOpen, Clock, ArrowRight, CheckCircle2, AlertCircle, 
  ShieldCheck, Database, Server, Sparkles, Plus, Trash2, Edit3, Search, 
  Terminal, Activity, ChevronLeft, ChevronRight, Check, Square, CalendarDays,
  GraduationCap, UserCheck, ChevronDown, Sliders
} from 'lucide-react';

// Lazy loading para pantallas
const AdminCarreras = lazy(() => import('./AdminCarreras'));
const AdminPreinscripciones = lazy(() => import('./AdminPreinscripciones'));
const AdminMensajes = lazy(() => import('./AdminMensajes'));
const AdminExamenes = lazy(() => import('./AdminExamenes'));
const AdminFechasExamenes = lazy(() => import('./AdminFechasExamenes'));
const AdminMaterias = lazy(() => import('./AdminMaterias'));
const AdminHorarios = lazy(() => import('./AdminHorarios'));
const AdminGestionCentral = lazy(() => import('./AdminGestionCentral'));

const Resumen = () => {
  const [stats, setStats] = useState({
    preinscripciones: { total: 0, pendientes: 0, aprobadas: 0, rechazadas: 0, recientes: [] },
    mensajes: { sinLeer: 0, total: 0, recientes: [] },
    carreras: { total: 0, tecnicaturas: 0, profesorados: 0, cursos: 0 },
    examenes: { total: 0, pendientes: 0, aprobados: 0, rechazados: 0, recientes: [] }
  });
  const [loading, setLoading] = useState(true);
  const { token, admin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('ies_admin_notes');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Reunión directiva el jueves a las 18:30 hs.', color: 'indigo' },
      { id: 2, text: 'Recordar cargar las actas de exámenes finales de noviembre.', color: 'amber' }
    ];
  });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [settings, setSettings] = useState({
    activeYear: 2026,
    preinscripcionesAbiertas: true,
    examenesAbiertos: true
  });
  const [toggleLoading, setToggleLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings in Dashboard:', err);
    }
  };

  const handleTogglePeriod = async (field) => {
    try {
      setToggleLoading(true);
      const res = await fetch(`/api/settings/toggle/${field}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggleLoading(false);
    }
  };

  const fetchStatsAndData = async () => {
    try {
      const response = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndData();
    fetchSettings();
  }, [token]);

  useEffect(() => {
    localStorage.setItem('ies_admin_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const colors = ['indigo', 'amber', 'emerald', 'violet'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const note = { id: Date.now(), text: 'Nueva nota rápida...', color: randomColor };
    setNotes(prev => [...prev, note]);
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
  };

  const saveNote = (id) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text: editingText } : n));
    setEditingNoteId(null);
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-slate-500 text-xs font-semibold">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Encabezado Institucional estilo Home */}
      <div className="bg-gradient-to-r from-primary-dark via-primary to-blue-700 text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/10 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-bold text-white mb-1 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>Sistema Académico Institucional</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Panel de Control
          </h2>
          <p className="text-slate-200 text-xs md:text-sm max-w-xl font-medium">
            Supervisa el estado de inscripciones, carreras activas, llamados a exámenes y consultas en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => navigate('/admin/preinscripciones')}
            className="px-4 py-2 bg-white text-primary hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            Ver Aspirantes
          </button>
          <button
            onClick={() => navigate('/admin/examenes')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CalendarIcon className="w-4 h-4" />
            Exámenes
          </button>
        </div>
      </div>

      {/* Control Rápido de Apertura/Cierre de Inscripciones (Preceptor, Admin, Superadmin) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Estado de Periodos e Inscripciones</h3>
              <p className="text-xs text-slate-400">Apertura y cierre inmediato para Preceptoría y Administración</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full w-fit">
            Ciclo Lectivo {settings.activeYear || 2026}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preinscripciones Toggle Card */}
          <div className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
            settings.preinscripcionesAbiertas
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Preinscripciones a Carreras</span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  settings.preinscripcionesAbiertas
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-700'
                }`}>
                  {settings.preinscripcionesAbiertas ? 'Abiertas' : 'Cerradas'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {settings.preinscripcionesAbiertas
                  ? 'Aspirantes pueden completar el formulario de ingreso.'
                  : 'Formulario web público cerrado para nuevos ingresos.'}
              </p>
            </div>

            <button
              onClick={() => handleTogglePeriod('preinscripcionesAbiertas')}
              disabled={toggleLoading}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 ${
                settings.preinscripcionesAbiertas
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {settings.preinscripcionesAbiertas ? 'Cerrar Periodo' : 'Habilitar Periodo'}
            </button>
          </div>

          {/* Exámenes Toggle Card */}
          <div className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
            settings.examenesAbiertos
              ? 'bg-indigo-50/50 border-indigo-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Inscripción a Mesas de Exámenes</span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  settings.examenesAbiertos
                    ? 'bg-primary text-white'
                    : 'bg-slate-300 text-slate-700'
                }`}>
                  {settings.examenesAbiertos ? 'Habilitadas' : 'Cerradas'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {settings.examenesAbiertos
                  ? 'Alumnos regulares y libres pueden anotarse a llamados.'
                  : 'Inscripción a mesas finalizada o en receso.'}
              </p>
            </div>

            <button
              onClick={() => handleTogglePeriod('examenesAbiertos')}
              disabled={toggleLoading}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 ${
                settings.examenesAbiertos
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                  : 'bg-primary hover:bg-primary-dark text-white'
              }`}
            >
              {settings.examenesAbiertos ? 'Cerrar Mesas' : 'Habilitar Mesas'}
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas Analíticas con Estilo Limpio (Inspiradas en Features del Home) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Carreras Card */}
        <div 
          onClick={() => navigate('/admin/carreras')}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Oferta Académica</span>
            <p className="text-3xl font-black text-slate-800">{stats.carreras.total}</p>
            <p className="text-xs text-slate-500 font-semibold">
              {stats.carreras.tecnicaturas} Técnicas · {stats.carreras.profesorados || 0} Prof.
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Preinscripciones Card */}
        <div 
          onClick={() => navigate('/admin/preinscripciones')}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Aspirantes de Ingreso</span>
            <p className="text-3xl font-black text-slate-800">{stats.preinscripciones.total}</p>
            <p className="text-xs text-slate-500 font-semibold">
              <strong className="text-amber-600 font-bold">{stats.preinscripciones.pendientes}</strong> pendientes de evaluar
            </p>
          </div>
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Exámenes Card */}
        <div 
          onClick={() => navigate('/admin/examenes')}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Mesas de Exámenes</span>
            <p className="text-3xl font-black text-slate-800">{stats.examenes?.total || 0}</p>
            <p className="text-xs text-slate-500 font-semibold">
              <strong className="text-blue-600 font-bold">{stats.examenes?.pendientes || 0}</strong> solicitudes nuevas
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <CalendarIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Mensajes Card */}
        <div 
          onClick={() => navigate('/admin/mensajes')}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">Consultas Recibidas</span>
            <p className="text-3xl font-black text-slate-800">{stats.mensajes.sinLeer}</p>
            <p className="text-xs text-slate-500 font-semibold">
              {stats.mensajes.total} consultas en total
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Grilla Principal de Operaciones y Actividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Actividad Operativa */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Aspirantes Recientes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Últimos Aspirantes Registrados</h3>
                <p className="text-xs text-slate-400">Postulantes para el ciclo lectivo</p>
              </div>
              <button 
                onClick={() => navigate('/admin/preinscripciones')}
                className="text-xs font-bold text-primary hover:text-primary-dark cursor-pointer bg-transparent border-none outline-none flex items-center gap-1"
              >
                Ver todos &rarr;
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.preinscripciones.recientes && stats.preinscripciones.recientes.length > 0 ? (
                stats.preinscripciones.recientes.map((p) => (
                  <div key={p._id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-50 text-primary font-bold rounded-xl flex items-center justify-center text-xs shrink-0">
                        {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{p.apellido}, {p.nombre}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.carrera}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">
                      {new Date(p.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">No hay solicitudes recientes.</div>
              )}
            </div>
          </div>

          {/* Inscripciones a Exámenes Recientes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Inscripciones Recientes a Exámenes</h3>
                <p className="text-xs text-slate-400">Solicitudes de mesas de examen</p>
              </div>
              <button 
                onClick={() => navigate('/admin/examenes')}
                className="text-xs font-bold text-primary hover:text-primary-dark cursor-pointer bg-transparent border-none outline-none flex items-center gap-1"
              >
                Ver todas &rarr;
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.examenes.recientes && stats.examenes.recientes.length > 0 ? (
                stats.examenes.recientes.map((e) => (
                  <div key={e._id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-50 text-indigo-600 font-bold rounded-xl flex items-center justify-center text-xs shrink-0">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{e.apellido}, {e.nombre}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{e.carrera} · {e.llamado}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">
                      {new Date(e.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">No hay inscripciones recientes a exámenes.</div>
              )}
            </div>
          </div>

        </div>

        {/* Columna Derecha: Recordatorios y Notas Adhesivas */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Notas Rápidas</h3>
                <p className="text-xs text-slate-400">Recordatorios para el equipo</p>
              </div>
              <button 
                onClick={addNote}
                className="px-2.5 py-1 text-primary hover:bg-blue-50 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-primary/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Nueva
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {notes.map(note => {
                const colorClasses = {
                  indigo: 'border-l-primary bg-blue-50/30 text-slate-800',
                  amber: 'border-l-amber-500 bg-amber-50/30 text-slate-800',
                  emerald: 'border-l-emerald-500 bg-emerald-50/30 text-slate-800',
                  violet: 'border-l-purple-500 bg-purple-50/30 text-slate-800'
                }[note.color] || 'border-l-slate-400 bg-slate-50 text-slate-800';

                return (
                  <div 
                    key={note.id} 
                    className={`p-3.5 rounded-xl border border-slate-200 border-l-4 shadow-2xs transition-all relative group flex flex-col justify-between min-h-[80px] ${colorClasses}`}
                    onDoubleClick={() => handleEditNote(note)}
                  >
                    {editingNoteId === note.id ? (
                      <div className="flex flex-col gap-2 w-full h-full">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full text-xs font-semibold bg-white border border-slate-300 p-2 rounded-lg outline-none text-slate-800 resize-none h-14"
                          autoFocus
                          onBlur={() => saveNote(note.id)}
                        />
                        <button 
                          onMouseDown={() => saveNote(note.id)}
                          className="self-end px-2.5 py-1 bg-primary text-white rounded-md text-[10px] font-bold cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-semibold leading-relaxed flex-1 select-none whitespace-pre-wrap">{note.text}</p>
                        <div className="flex justify-end gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditNote(note)}
                            className="p-1 text-slate-500 hover:text-slate-800 bg-white/80 rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => deleteNote(note.id)}
                            className="p-1 text-slate-500 hover:text-red-600 bg-white/80 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, admin, token } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error al registrar cierre de sesión:', error);
    }
    navigate('/', { replace: true });
    setTimeout(() => {
      logout();
    }, 100);
  };

  const navigationGroups = [
    {
      title: 'Principal',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }
      ]
    },
    {
      title: 'Gestión Académica',
      items: [
        { name: 'Carreras', path: '/admin/carreras', icon: <GraduationCap className="h-4 w-4" /> },
        { name: 'Materias', path: '/admin/materias', icon: <BookOpen className="h-4 w-4" /> }
      ]
    },
    {
      title: 'Admisiones e Ingreso',
      items: [
        { name: 'Preinscripciones', path: '/admin/preinscripciones', icon: <Users className="h-4 w-4" /> },
        { name: 'Inscr. Exámenes', path: '/admin/examenes', icon: <CalendarIcon className="h-4 w-4" /> }
      ]
    },
    {
      title: 'Planificación',
      items: [
        { name: 'Horarios', path: '/admin/horarios', icon: <Clock className="h-4 w-4" /> },
        { name: 'Fechas Exámenes', path: '/admin/fechas-examenes', icon: <CalendarDays className="h-4 w-4" /> }
      ]
    },
    {
      title: 'Comunicación',
      items: [
        { name: 'Mensajes', path: '/admin/mensajes', icon: <MessageSquare className="h-4 w-4" /> }
      ]
    }
  ];

  if (admin?.role === 'superadmin') {
    navigationGroups.push({
      title: 'Administración Central',
      items: [
        { name: 'Gestión Central', path: '/admin/gestion-central', icon: <ShieldCheck className="h-4 w-4" /> }
      ]
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex h-screen overflow-hidden font-sans">
      
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar con Identidad Visual del Navbar Institucional */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-dark text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl border-r border-primary/30 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera del Sidebar */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-primary/20 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-primary flex items-center justify-center font-black shadow-md">
              IES
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight leading-tight">IES La Cocha</h1>
              <p className="text-[10px] text-slate-300 font-medium">Panel Administrativo</p>
            </div>
          </div>
          <button className="md:hidden text-white/70 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación por Grupos */}
        <nav className="flex-1 p-3.5 space-y-5 overflow-y-auto">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <h3 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-300/70 select-none">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-white text-primary shadow-md shadow-black/10' 
                          : 'text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer del Sidebar: Tarjeta de Usuario Integrada y Botón Cerrar Sesión */}
        <div className="p-3.5 border-t border-white/10 bg-primary/20 space-y-2.5">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/10 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-white text-primary font-black flex items-center justify-center text-xs shrink-0 shadow-sm">
              {admin?.username ? admin.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-white truncate leading-tight">
                {admin?.username || 'Usuario'}
              </p>
              <span className="inline-block text-[10px] font-bold text-sky-200 uppercase tracking-wider">
                {admin?.role === 'superadmin' ? 'Superadmin' : admin?.role === 'admin' ? 'Admin' : 'Preceptor/a'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all w-full cursor-pointer shadow-sm active:scale-98 border border-white/15"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Header móvil */}
        <header className="bg-primary text-white p-4 flex justify-between items-center md:hidden shrink-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-bold text-base">IES La Cocha</h1>
          </div>
          <button onClick={handleLogout} className="text-white hover:bg-white/10 p-1.5 rounded-lg">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        {/* Contenido Dinámico con Lazy Loading */}
        <div className="flex-1 overflow-auto bg-slate-50 relative z-0">
          <Suspense fallback={
            <div className="p-12 flex flex-col justify-center items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-slate-400 text-xs font-semibold">Cargando...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Resumen />} />
              <Route path="carreras" element={<AdminCarreras />} />
              <Route path="materias" element={<AdminMaterias />} />
              <Route path="horarios" element={<AdminHorarios />} />
              <Route path="preinscripciones" element={<AdminPreinscripciones />} />
              <Route path="mensajes" element={<AdminMensajes />} />
              <Route path="examenes" element={<AdminExamenes />} />
              <Route path="fechas-examenes" element={<AdminFechasExamenes />} />
              {admin?.role === 'superadmin' && (
                <Route path="gestion-central" element={<AdminGestionCentral />} />
              )}
            </Routes>
          </Suspense>
        </div>
      </main>

    </div>
  );
}
