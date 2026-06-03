import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Search, ShieldAlert, Calendar, RefreshCw, Clock, Filter } from 'lucide-react';

const moduloDisplayNames = {
  'Todos': 'Todos los módulos',
  'Seguridad': 'Seguridad y Accesos',
  'Preinscripciones': 'Preinscripciones de Ingreso',
  'Exámenes': 'Inscripción a Exámenes',
  'Carreras': 'Carreras y Programas',
  'Horarios': 'Horarios de Cursado',
  'Materias': 'Materias y Profesores',
  'Fechas Exámenes': 'Fechas de Exámenes (Mesas)',
  'Mensajes': 'Mensajes de Contacto'
};

export default function AdminAuditorias() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('Todos');
  const [filtroAccion, setFiltroAccion] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const { token } = useContext(AuthContext);

  const ITEMS_PER_PAGE = 15;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auditorias', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error al obtener auditorías:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroModulo, filtroAccion, searchQuery]);

  const modulosUnicos = ['Todos', ...new Set(logs.map(log => log.modulo))];
  const accionesUnicas = ['Todas', ...new Set(logs.map(log => log.accion))];

  const filtrados = logs.filter(log => {
    const matchModulo = filtroModulo === 'Todos' || log.modulo === filtroModulo;
    const matchAccion = filtroAccion === 'Todas' || log.accion === filtroAccion;

    const query = searchQuery.toLowerCase().trim();
    const matchSearch = !query ||
      (log.username || '').toLowerCase().includes(query) ||
      (log.accion || '').toLowerCase().includes(query) ||
      (log.modulo || '').toLowerCase().includes(query) ||
      (log.detalle || '').toLowerCase().includes(query);

    return matchModulo && matchAccion && matchSearch;
  });

  const totalItems = filtrados.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLogs = filtrados.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="p-6 flex justify-center mt-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-xs font-bold mb-2">
            <ShieldAlert className="h-3.5 w-3.5" />
            Acceso SuperUsuario
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Auditoría y Registro de Acciones</h2>
          <p className="text-slate-500 text-sm mt-1">Historial detallado de todas las operaciones realizadas por los administradores en el sistema.</p>
        </div>
        
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-350 border-slate-200 rounded-lg text-sm font-semibold text-slate-650 bg-white hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-2.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, acción, módulo o palabra clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all bg-slate-50/50 text-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrar por Módulo</label>
            <select
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white font-medium text-slate-700"
            >
              {modulosUnicos.map(m => (
                <option key={m} value={m}>
                  {moduloDisplayNames[m] || m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrar por Acción</label>
            <select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white font-medium text-slate-700"
            >
              {accionesUnicas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Módulo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acción</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Detalle de la Operación</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(log.fecha).toLocaleString('es-AR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{log.username}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-750 border border-slate-200 uppercase tracking-wider">
                        {log.modulo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border uppercase tracking-wider ${
                        log.accion.includes('ELIMINAR') || log.accion.includes('RECHAZAR') ? 'bg-red-50 text-red-700 border-red-200' :
                        log.accion.includes('CREAR') || log.accion.includes('REGISTRO') || log.accion.includes('APROBAR') ? 'bg-green-50 text-green-700 border-green-200' :
                        log.accion === 'LOGIN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        log.accion === 'LOGOUT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-650 font-medium max-w-[400px] truncate" title={log.detalle}>
                      {log.detalle}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm font-semibold">
                    No se encontraron registros de auditoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Mostrando <span className="font-bold text-slate-800">{startIndex + 1}</span> a{' '}
                  <span className="font-bold text-slate-800">{Math.min(endIndex, totalItems)}</span> de{' '}
                  <span className="font-bold text-slate-800">{totalItems}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        aria-current={currentPage === pageNum ? "page" : undefined}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer transition-colors ${
                          currentPage === pageNum
                            ? 'z-10 bg-primary border-primary text-white font-bold'
                            : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
