import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, Calendar as CalendarIcon, LogOut, 
  Settings, Menu, X, BookOpen, Clock, ArrowRight, CheckCircle2, AlertCircle, 
  ShieldCheck, Database, Server, Sparkles, Plus, Trash2, Edit3, Search, 
  Terminal, Activity, ChevronLeft, ChevronRight, Check, Square, CalendarDays,
  GraduationCap
} from 'lucide-react';
import AdminCarreras from './AdminCarreras';
import AdminPreinscripciones from './AdminPreinscripciones';
import AdminMensajes from './AdminMensajes';
import AdminExamenes from './AdminExamenes';
import AdminFechasExamenes from './AdminFechasExamenes';
import AdminMaterias from './AdminMaterias';
import AdminHorarios from './AdminHorarios';
import AdminGestionCentral from './AdminGestionCentral';


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

  // Sticky Notes (persisted in localStorage)
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('ies_admin_notes');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Reunión con el Rector el jueves a las 18:00 hs.', color: 'indigo' },
      { id: 2, text: 'Clave del aula virtual de informática: IESCocha2026*', color: 'amber' }
    ];
  });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const fetchStatsAndData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stats', {
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
  }, [token]);

  // Persist Notes
  useEffect(() => {
    localStorage.setItem('ies_admin_notes', JSON.stringify(notes));
  }, [notes]);



  // Sticky Notes methods
  const addNote = () => {
    const colors = ['indigo', 'amber', 'emerald', 'violet'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const note = { id: Date.now(), text: 'Doble clic para editar esta nota rápida...', color: randomColor };
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



  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 20) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center mt-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const preinscTotal = stats.preinscripciones.total || 0;
  const pctAprobadas = preinscTotal > 0 ? Math.round((stats.preinscripciones.aprobadas / preinscTotal) * 100) : 0;
  const pctPendientes = preinscTotal > 0 ? Math.round((stats.preinscripciones.pendientes / preinscTotal) * 100) : 0;
  const pctRechazadas = preinscTotal > 0 ? Math.round((stats.preinscripciones.rechazadas / preinscTotal) * 100) : 0;

  const examTotal = stats.examenes?.total || 0;
  const pctExamenAprobados = examTotal > 0 ? Math.round(((stats.examenes?.aprobados || 0) / examTotal) * 100) : 0;
  const pctExamenPendientes = examTotal > 0 ? Math.round(((stats.examenes?.pendientes || 0) / examTotal) * 100) : 0;
  const pctExamenRechazados = examTotal > 0 ? Math.round(((stats.examenes?.rechazados || 0) / examTotal) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* 1. Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300 border border-slate-700">
              Panel de Control
            </div>
            {admin?.role === 'superadmin' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/40 text-red-300 border border-red-900/50 rounded-full text-xs font-bold shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
                Modo: SuperUsuario
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, <span className="text-sky-300 font-semibold">{admin?.username || 'Administrador'}</span>!
          </h2>
        </div>
      </div>

      {/* 3. Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Carreras Card */}
        <div 
          onClick={() => navigate('/admin/carreras')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between shadow-xs group"
        >
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Carreras</span>
            <p className="text-3xl font-extrabold text-slate-800">{stats.carreras.total}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              {stats.carreras.tecnicaturas} Tecn. · {stats.carreras.profesorados || 0} Prof.
            </p>
          </div>
          <div className="h-12 w-12 bg-primary/5 group-hover:bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-all duration-300 shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Preinscripciones Card */}
        <div 
          onClick={() => navigate('/admin/preinscripciones')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between shadow-xs group"
        >
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Aspirantes</span>
            <p className="text-3xl font-extrabold text-slate-800">{stats.preinscripciones.total}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              {stats.preinscripciones.pendientes} Pendientes de revisar
            </p>
          </div>
          <div className="h-12 w-12 bg-primary/5 group-hover:bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-all duration-300 shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Exámenes Card */}
        <div 
          onClick={() => navigate('/admin/examenes')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between shadow-xs group"
        >
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Exámenes</span>
            <p className="text-3xl font-extrabold text-slate-800">{stats.examenes?.total || 0}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              {stats.examenes?.pendientes || 0} Solicitudes nuevas
            </p>
          </div>
          <div className="h-12 w-12 bg-primary/5 group-hover:bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-all duration-300 shrink-0">
            <CalendarIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Mensajes Card */}
        <div 
          onClick={() => navigate('/admin/mensajes')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between shadow-xs group"
        >
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Mensajes</span>
            <p className="text-3xl font-extrabold text-slate-800">{stats.mensajes.sinLeer}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              {stats.mensajes.total} Mensajes en buzón
            </p>
          </div>
          <div className="h-12 w-12 bg-primary/5 group-hover:bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-all duration-300 shrink-0">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 4. Dashboard Clean Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recents List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Original applicants list */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">Últimos Solicitantes</h3>
                <p className="text-xs text-slate-400 mt-0.5">Nuevos alumnos preinscriptos en el instituto</p>
              </div>
              <button 
                onClick={() => navigate('/admin/preinscripciones')}
                className="text-xs font-bold text-primary hover:text-blue-700 cursor-pointer bg-transparent border-none outline-none"
              >
                Ver todos
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.preinscripciones.recientes && stats.preinscripciones.recientes.length > 0 ? (
                stats.preinscripciones.recientes.map((p) => (
                  <div key={p._id} className="p-4 hover:bg-slate-50/30 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center text-sm shrink-0">
                        {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{p.apellido}, {p.nombre}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{p.carrera}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm font-medium">No hay solicitudes recientes.</div>
              )}
            </div>
          </div>

          {/* Inscripciones Recientes a Exámenes */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">Inscripciones Recientes a Exámenes</h3>
                <p className="text-xs text-slate-400 mt-0.5">Últimas solicitudes de mesas de exámenes recibidas</p>
              </div>
              <button 
                onClick={() => navigate('/admin/examenes')}
                className="text-xs font-bold text-primary hover:text-blue-700 cursor-pointer bg-transparent border-none outline-none"
              >
                Ver todas
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.examenes?.recientes && stats.examenes.recientes.length > 0 ? (
                stats.examenes.recientes.map((e) => (
                  <div key={e._id} className="p-4 hover:bg-slate-50/30 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 w-full min-w-0">
                      <div className="h-10 w-10 bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5">
                        {e.nombre.charAt(0)}{e.apellido.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="text-sm font-bold text-slate-800 truncate">{e.apellido}, {e.nombre}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">{new Date(e.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          DNI: {e.dni} | Carrera: {e.carrera} ({e.añoCursando}){e.turno && e.llamado && ` | ${e.turno} (${e.llamado})`}
                        </p>
                        <p className="text-[11px] text-slate-450 mt-1 truncate">
                          <span className="font-semibold text-slate-500">Materias:</span> {e.materias ? e.materias.join(', ') : 'Ninguna'}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          e.estado === 'Aprobada' ? 'bg-green-50 text-green-700 border-green-200' :
                          e.estado === 'Rechazada' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {e.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm font-medium">No hay inscripciones a exámenes recientes.</div>
              )}
            </div>
          </div>

          {/* Mensajes Recientes */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">Mensajes Recientes</h3>
                <p className="text-xs text-slate-400 mt-0.5">Últimas consultas recibidas en el buzón</p>
              </div>
              <button 
                onClick={() => navigate('/admin/mensajes')}
                className="text-xs font-bold text-primary hover:text-blue-700 cursor-pointer bg-transparent border-none outline-none"
              >
                Ver todos
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.mensajes.recientes && stats.mensajes.recientes.length > 0 ? (
                stats.mensajes.recientes.map((m) => (
                  <div key={m._id} className="p-4 hover:bg-slate-50/30 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-10 w-10 bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center text-sm shrink-0">
                        {m.nombre.charAt(0)}{m.apellido ? m.apellido.charAt(0) : ''}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="text-sm font-bold text-slate-800 truncate">{m.apellido}, {m.nombre}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">{new Date(m.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{m.mensaje}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm font-medium">No hay mensajes recientes.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Notes */}
        <div className="space-y-6">
          
          {/* Sticky Notes Widget */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-800">Notas Adhesivas</h3>
                <p className="text-xs text-slate-400 mt-0.5">Doble clic para editar recordatorios rápidos.</p>
              </div>
              <button 
                onClick={addNote}
                className="p-1.5 text-primary hover:bg-blue-50 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0 border border-transparent"
              >
                <Plus className="h-4 w-4" />
                Nueva
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {notes.map(note => {
                const colorClasses = {
                  indigo: 'border-l-indigo-500',
                  amber: 'border-l-amber-500',
                  emerald: 'border-l-emerald-500',
                  violet: 'border-l-violet-500'
                }[note.color] || 'border-l-slate-400';

                return (
                  <div 
                    key={note.id} 
                    className={`p-3.5 rounded-xl bg-slate-50 text-slate-800 border-y border-r border-l-4 border-y-slate-200 border-r-slate-200 shadow-xs transition-all relative group flex flex-col justify-between min-h-[85px] ${colorClasses}`}
                    onDoubleClick={() => handleEditNote(note)}
                  >
                    {editingNoteId === note.id ? (
                      <div className="flex flex-col gap-2 w-full h-full">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full text-xs font-semibold bg-white border border-slate-300 p-1.5 rounded-lg outline-none text-slate-800 resize-none h-14"
                          autoFocus
                          onBlur={() => saveNote(note.id)}
                        />
                        <button 
                          onMouseDown={() => saveNote(note.id)}
                          className="self-end px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold leading-relaxed flex-1 select-none whitespace-pre-wrap">{note.text}</p>
                        <div className="flex justify-end gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditNote(note)}
                            className="p-1 text-slate-500 hover:text-slate-800 bg-white/70 hover:bg-white rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => deleteNote(note.id)}
                            className="p-1 text-slate-500 hover:text-red-600 bg-white/70 hover:bg-white rounded transition-colors cursor-pointer"
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

const EnConstruccion = ({ title }) => (
  <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
    <Settings className="h-16 w-16 text-slate-300 mb-4 animate-spin-slow" />
    <h2 className="text-2xl font-bold text-slate-700 mb-2">{title}</h2>
    <p className="text-slate-500">Módulo en desarrollo.</p>
  </div>
);

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { logout, admin, token } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error al registrar cierre de sesión en el servidor:', error);
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
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> }
      ]
    },
    {
      title: 'Gestión Académica',
      items: [
        { name: 'Carreras', path: '/admin/carreras', icon: <GraduationCap className="h-5 w-5" /> },
        { name: 'Materias', path: '/admin/materias', icon: <BookOpen className="h-5 w-5" /> }
      ]
    },
    {
      title: 'Admisiones e Ingreso',
      items: [
        { name: 'Preinscripciones', path: '/admin/preinscripciones', icon: <Users className="h-5 w-5" /> },
        { name: 'Inscr. Exámenes', path: '/admin/examenes', icon: <CalendarIcon className="h-5 w-5" /> }
      ]
    },
    {
      title: 'Planificación',
      items: [
        { name: 'Horarios', path: '/admin/horarios', icon: <Clock className="h-5 w-5" /> },
        { name: 'Fechas Exámenes', path: '/admin/fechas-examenes', icon: <CalendarDays className="h-5 w-5" /> }
      ]
    },
    {
      title: 'Comunicación',
      items: [
        { name: 'Mensajes', path: '/admin/mensajes', icon: <MessageSquare className="h-5 w-5" /> }
      ]
    }
  ];

  if (admin?.role === 'superadmin') {
    navigationGroups.push({
      title: 'Administración Central',
      items: [
        { name: 'Gestión Central', path: '/admin/gestion-central', icon: <ShieldCheck className="h-5 w-5" /> }
      ]
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 flex h-screen overflow-hidden">
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">IES Admin</h1>
            <p className="text-xs text-slate-400 mt-1">Panel de Control</p>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <h3 className="px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500/90 select-none">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center px-4 py-2.5 rounded-lg transition-all ${isActive ? 'bg-primary text-white font-medium shadow-md shadow-primary/10' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors w-full"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Header mobile */}
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center md:hidden shrink-0 z-30 shadow-sm relative">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-bold text-lg">IES Admin</h1>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 p-2">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto bg-slate-50 relative z-0">
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
        </div>
      </main>
    </div>
  );
}
