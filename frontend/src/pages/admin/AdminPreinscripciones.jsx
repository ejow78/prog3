import { useState, useEffect } from 'react';
import { Check, X, Clock, AlertCircle, Download, FileSpreadsheet, Trash2, Search } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminPreinscripciones() {
  const [preinscripciones, setPreinscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [filtroCarrera, setFiltroCarrera] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const { token, admin } = useContext(AuthContext);

  const fetchPreinscripciones = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/preinscripciones', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener preinscripciones');
      const data = await response.json();
      setPreinscripciones(data);
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error al cargar los datos', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreinscripciones();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await fetch(`http://localhost:5000/api/preinscripciones/${id}/estado`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (!response.ok) throw new Error('Error al actualizar el estado');
      
      setMensaje({ texto: `Estado actualizado a ${nuevoEstado}`, tipo: 'exito' });
      fetchPreinscripciones(); // Recargar la tabla
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error al actualizar el estado', tipo: 'error' });
    }
    
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const eliminarPreinscripcion = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta preinscripción? Esta acción no se puede deshacer.')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/preinscripciones/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al eliminar');
      
      setMensaje({ texto: 'Preinscripción eliminada correctamente', tipo: 'exito' });
      fetchPreinscripciones();
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error al eliminar la preinscripción', tipo: 'error' });
    }
    
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const carrerasUnicas = ['Todas', ...new Set(preinscripciones.map(p => p.carrera))];

  const filtradas = preinscripciones.filter(p => {
    const matchEstado = filtroEstado === 'Todas' || p.estado === filtroEstado;
    const matchCarrera = filtroCarrera === 'Todas' || p.carrera === filtroCarrera;
    
    const query = searchQuery.toLowerCase().trim();
    const matchSearch = !query || 
      (p.nombre || '').toLowerCase().includes(query) || 
      (p.apellido || '').toLowerCase().includes(query) || 
      (p.dni || '').includes(query) ||
      (p.email || '').toLowerCase().includes(query) ||
      (p.carrera || '').toLowerCase().includes(query) ||
      (p.localidad || '').toLowerCase().includes(query);

    return matchEstado && matchCarrera && matchSearch;
  });

  const exportarPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.text('Listado de Preinscripciones', 14, 15);
    doc.setFontSize(10);
    doc.text(`Filtros - Carrera: ${filtroCarrera} | Estado: ${filtroEstado}`, 14, 22);
    
    const tableColumn = ["Fecha", "DNI", "Nombre", "Apellido", "Teléfono", "Email", "Localidad", "Carrera", "Estado"];
    const tableRows = [];

    filtradas.forEach(p => {
      const pData = [
        new Date(p.createdAt).toLocaleDateString('es-AR'),
        p.dni,
        p.nombre,
        p.apellido,
        p.telefono,
        p.email,
        p.localidad,
        p.carrera,
        p.estado
      ];
      tableRows.push(pData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    const fileName = `preinscripciones_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };

  const exportarCSV = () => {
    const tableColumn = ["Fecha", "DNI", "Nombre", "Apellido", "Teléfono", "Email", "Localidad", "Carrera", "Estado"];
    
    // Añadir BOM (Byte Order Mark) para que Excel reconozca correctamente UTF-8 (acentos y ñ)
    let csvContent = "\uFEFF" + tableColumn.join(",") + "\n";

    // Función auxiliar para escapar comillas dobles y envolver el texto en comillas
    const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

    filtradas.forEach(p => {
      const pData = [
        escapeCsv(new Date(p.createdAt).toLocaleDateString('es-AR')),
        escapeCsv(p.dni),
        escapeCsv(p.nombre),
        escapeCsv(p.apellido),
        escapeCsv(p.telefono),
        escapeCsv(p.email),
        escapeCsv(p.localidad),
        escapeCsv(p.carrera),
        escapeCsv(p.estado)
      ];
      csvContent += pData.join(",") + "\n";
    });

    // Usar Blob para manejar mejor la codificación en lugar de encodeURI
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `preinscripciones_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Preinscripciones</h2>
          <p className="text-slate-500 text-sm mt-1">Revisa y aprueba las solicitudes de los alumnos.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors shadow-sm whitespace-nowrap text-sm cursor-pointer font-semibold active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </button>
          <button
            onClick={exportarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm whitespace-nowrap text-sm cursor-pointer font-semibold active:scale-95"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          <AlertCircle className="h-5 w-5 animate-pulse text-current" />
          <span className="font-semibold text-sm">{mensaje.texto}</span>
        </div>
      )}

      {/* Search & Filters Card */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6 space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-2.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar aspirantes por nombre, apellido, DNI, carrera, localidad o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all bg-slate-50/50 text-slate-800"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carrera</label>
            <select 
              value={filtroCarrera} 
              onChange={(e) => setFiltroCarrera(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white font-medium text-slate-700"
            >
              {carrerasUnicas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado de Preinscripción</label>
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white font-medium text-slate-700"
            >
              <option value="Todas">Todos los estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Aprobada">Aprobadas</option>
              <option value="Rechazada">Rechazadas</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Aspirante</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Carrera</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No se encontraron preinscripciones con estos filtros.
                  </td>
                </tr>
              ) : (
                filtradas.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{new Date(p.createdAt).toLocaleDateString('es-AR')}</div>
                      <div className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{p.apellido}, {p.nombre}</div>
                      <div className="text-xs text-slate-500 mt-1">DNI: {p.dni}</div>
                      <div className="text-xs text-slate-500">{p.localidad}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{p.email}</div>
                      <div className="text-sm text-slate-600">{p.telefono}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800 line-clamp-2 max-w-xs" title={p.carrera}>{p.carrera}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                        ${p.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                          p.estado === 'Aprobada' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}
                      >
                        {p.estado === 'Pendiente' && <Clock className="w-3.5 h-3.5" />}
                        {p.estado === 'Aprobada' && <Check className="w-3.5 h-3.5" />}
                        {p.estado === 'Rechazada' && <X className="w-3.5 h-3.5" />}
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 justify-end items-center">
                        {p.estado === 'Pendiente' ? (
                          <>
                            <button
                              onClick={() => cambiarEstado(p._id, 'Aprobada')}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-md transition-colors"
                              title="Aprobar"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => cambiarEstado(p._id, 'Rechazada')}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors"
                              title="Rechazar"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => cambiarEstado(p._id, 'Pendiente')}
                            className="text-xs text-slate-400 hover:text-slate-600 underline mr-2"
                          >
                            Hacer Pendiente
                          </button>
                        )}
                        <button
                          onClick={() => eliminarPreinscripcion(p._id)}
                          className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
