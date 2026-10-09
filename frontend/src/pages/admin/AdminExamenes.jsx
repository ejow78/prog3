import { useState, useEffect } from 'react';
import { Check, X, Clock, AlertCircle, Download, FileSpreadsheet, Trash2, Search, Calendar, Eye, BookOpen, GraduationCap, User, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminExamenes() {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [filtroCarrera, setFiltroCarrera] = useState('Todas');
  const [filtroAño, setFiltroAño] = useState('Todos');
  const [filtroTurno, setFiltroTurno] = useState('Todos');
  const [filtroLlamado, setFiltroLlamado] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState(null);
  const { token, admin } = useContext(AuthContext);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroCarrera, filtroAño, filtroTurno, filtroLlamado, filtroEstado, searchQuery]);

  const fetchInscripciones = async () => {
    try {
      const response = await fetch('/api/inscripciones-examenes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener inscripciones');
      const data = await response.json();
      setInscripciones(data);
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error al cargar los datos', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await fetch(`/api/inscripciones-examenes/${id}/estado`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (!response.ok) throw new Error('Error al actualizar el estado');
      
      setMensaje({ texto: `Inscripción ${nuevoEstado.toLowerCase()} correctamente`, tipo: 'exito' });
      fetchInscripciones();
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error al actualizar el estado', tipo: 'error' });
    }
    
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const eliminarInscripcion = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta inscripción a exámenes? Esta acción no se puede deshacer.')) return;
    
    try {
      const response = await fetch(`/api/inscripciones-examenes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al eliminar');
      
      setMensaje({ texto: 'Inscripción eliminada correctamente', tipo: 'exito' });
      fetchInscripciones();
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error al eliminar la inscripción', tipo: 'error' });
    }
    
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const carrerasUnicas = ['Todas', ...new Set(inscripciones.map(i => i.carrera))];

  const turnosUnicos = [
    'Todos',
    ...new Set(
      inscripciones
        .filter(i => filtroCarrera === 'Todas' || i.carrera === filtroCarrera)
        .map(i => i.turno)
        .filter(Boolean)
    )
  ].sort();

  const llamadosUnicos = [
    'Todos',
    ...new Set(
      inscripciones
        .filter(i => (filtroCarrera === 'Todas' || i.carrera === filtroCarrera) && (filtroTurno === 'Todos' || i.turno === filtroTurno))
        .map(i => i.llamado)
        .filter(Boolean)
    )
  ].sort();

  const añosUnicos = [
    'Todos',
    ...new Set(
      inscripciones
        .filter(i => filtroCarrera === 'Todas' || i.carrera === filtroCarrera)
        .map(i => i.añoCursando)
    )
  ].sort();

  const filtradas = inscripciones.filter(i => {
    const matchEstado = filtroEstado === 'Todas' || i.estado === filtroEstado;
    const matchCarrera = filtroCarrera === 'Todas' || i.carrera === filtroCarrera;
    const matchAño = filtroAño === 'Todos' || i.añoCursando === filtroAño;
    const matchTurno = filtroTurno === 'Todos' || i.turno === filtroTurno;
    const matchLlamado = filtroLlamado === 'Todos' || i.llamado === filtroLlamado;
    
    const query = searchQuery.toLowerCase().trim();
    const matchSearch = !query || 
      (i.nombre || '').toLowerCase().includes(query) || 
      (i.apellido || '').toLowerCase().includes(query) || 
      (i.dni || '').includes(query) ||
      (i.carrera || '').toLowerCase().includes(query) ||
      (i.añoCursando || '').toLowerCase().includes(query) ||
      (i.materias || []).some(m => m.toLowerCase().includes(query));

    return matchEstado && matchCarrera && matchAño && matchTurno && matchLlamado && matchSearch;
  });

  const totalItems = filtradas.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filtradas.slice(startIndex, endIndex);

  const exportarPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.text('Listado de Inscripciones a Mesas de Exámenes', 14, 15);
    doc.setFontSize(10);
    doc.text(`Filtros - Carrera: ${filtroCarrera} | Turno: ${filtroTurno} | Llamado: ${filtroLlamado} | Año: ${filtroAño} | Estado: ${filtroEstado}`, 14, 22);
    
    const tableColumn = ["Fecha", "DNI", "Nombre", "Apellido", "Carrera", "Turno", "Llamado", "Año", "Materias a Rendir", "Estado"];
    const tableRows = [];

    filtradas.forEach(i => {
      const iData = [
        new Date(i.createdAt).toLocaleDateString('es-AR'),
        i.dni,
        i.nombre,
        i.apellido,
        i.carrera,
        i.turno || '-',
        i.llamado || '-',
        i.añoCursando,
        i.materias.join(', '),
        i.estado
      ];
      tableRows.push(iData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    const fileName = `inscripciones_examenes_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };

  const descargarComprobanteExamen = (i) => {
    const doc = new jsPDF('portrait');

    // Encabezado institucional
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTITUTO DE ENSEÑANZA SUPERIOR LA COCHA', 105, 13, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprobante Oficial de Inscripción a Mesas de Examen', 105, 21, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Secretaría Académica - Turnos y Llamados Ordinarios/Especiales', 105, 27, { align: 'center' });

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    const fechaHora = `${new Date(i.createdAt).toLocaleDateString('es-AR')} - ${new Date(i.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs`;
    doc.text(`Fecha y Hora de Solicitud: ${fechaHora}`, 14, 42);
    doc.text(`Identificador de Acta: ${i._id}`, 14, 48);

    const bodyData = [
      ['Alumno / Solicitante', `${i.apellido}, ${i.nombre}`],
      ['Documento Nacional de Identidad (DNI)', i.dni],
      ['Carrera Perteneciente', i.carrera],
      ['Año que se encuentra cursando', i.añoCursando],
      ['Turno de Examen', i.turno || 'No especificado'],
      ['Llamado Correspondiente', i.llamado || 'No especificado'],
      ['Estado Actual de la Inscripción', i.estado]
    ];

    autoTable(doc, {
      startY: 54,
      head: [['Parámetro', 'Datos Registrados del Alumno']],
      body: bodyData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3.5 },
      columnStyles: {
        0: { fontStyle: 'bold', width: 65, fillColor: [248, 250, 252] },
        1: { width: 115 }
      }
    });

    const materiasStartY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Materias Solicitadas para Rendir:', 14, materiasStartY);

    const materiasRows = (i.materias || []).map((m, idx) => [
      `${idx + 1}`,
      m,
      'Examen Final'
    ]);

    autoTable(doc, {
      startY: materiasStartY + 4,
      head: [['#', 'Asignatura / Espacio Curricular', 'Condición']],
      body: materiasRows,
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { width: 12, halign: 'center' },
        1: { width: 130 },
        2: { width: 38 }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 18;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('• El alumno debe presentarse a la mesa de examen con Libreta del Estudiante y DNI físico en mano.', 14, finalY);
    doc.text('• La inscripción queda sujeta a la aprobación de correlatividades por parte de Bedelía/Secretaría.', 14, finalY + 5);

    doc.setDrawColor(203, 213, 225);
    doc.line(120, finalY + 28, 185, finalY + 28);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Firma y Sello de Autoridad', 152, finalY + 34, { align: 'center' });

    doc.save(`Inscripcion_Examen_${i.dni}_${i.apellido}.pdf`);
  };

  const exportarCSV = () => {
    const tableColumn = ["Fecha", "DNI", "Nombre", "Apellido", "Carrera", "Turno", "Llamado", "Año", "Materias a Rendir", "Estado"];
    let csvContent = "\uFEFF" + tableColumn.join(",") + "\n";

    const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

    filtradas.forEach(i => {
      const iData = [
        escapeCsv(new Date(i.createdAt).toLocaleDateString('es-AR')),
        escapeCsv(i.dni),
        escapeCsv(i.nombre),
        escapeCsv(i.apellido),
        escapeCsv(i.carrera),
        escapeCsv(i.turno || '-'),
        escapeCsv(i.llamado || '-'),
        escapeCsv(i.añoCursando),
        escapeCsv(i.materias.join('; ')),
        escapeCsv(i.estado)
      ];
      csvContent += iData.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inscripciones_examenes_${new Date().getTime()}.csv`);
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
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Mesas de Exámenes</h2>
          <p className="text-slate-500 text-sm mt-1">Revisa y procesa las inscripciones a exámenes finales de los alumnos ({new Date().getFullYear()}).</p>
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
            placeholder="Buscar por nombre, apellido, DNI, carrera, año o materia específica..."
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carrera</label>
            <select 
              value={filtroCarrera} 
              onChange={(e) => {
                setFiltroCarrera(e.target.value);
                setFiltroAño('Todos');
                setFiltroTurno('Todos');
                setFiltroLlamado('Todos');
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white font-medium text-slate-700"
            >
              {carrerasUnicas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turno</label>
            <select 
              value={filtroTurno} 
              onChange={(e) => {
                setFiltroTurno(e.target.value);
                setFiltroLlamado('Todos');
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white font-medium text-slate-700"
            >
              {turnosUnicos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Llamado</label>
            <select 
              value={filtroLlamado} 
              onChange={(e) => setFiltroLlamado(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white font-medium text-slate-700"
            >
              {llamadosUnicos.map(ll => <option key={ll} value={ll}>{ll}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Año de Cursada</label>
            <select 
              value={filtroAño} 
              onChange={(e) => setFiltroAño(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white font-medium text-slate-700"
            >
              {añosUnicos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado de Inscripción</label>
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Alumno</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Carrera / Turno / Llamado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Materias a Rendir</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((i) => (
                  <tr key={i._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                      {new Date(i.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{i.apellido}, {i.nombre}</span>
                        <span className="text-xs text-slate-500 font-medium mt-0.5">DNI: {i.dni}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 block whitespace-normal" title={i.carrera}>{i.carrera}</span>
                        <span className="text-xs text-slate-500 font-semibold mt-0.5 uppercase tracking-wider">{i.añoCursando}</span>
                        <span className="text-[11px] text-primary font-bold mt-0.5 truncate uppercase" title={`${i.turno} - ${i.llamado}`}>
                          {i.turno} ({i.llamado})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                        {i.materias.map((materia) => (
                          <span 
                            key={materia} 
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide leading-tight truncate max-w-[200px]"
                            title={materia}
                          >
                            {materia}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        i.estado === 'Aprobada' ? 'bg-green-50 text-green-700 border border-green-200' :
                        i.estado === 'Rechazada' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {i.estado === 'Aprobada' && <Check className="h-3.5 w-3.5" />}
                        {i.estado === 'Rechazada' && <X className="h-3.5 w-3.5" />}
                        {i.estado === 'Pendiente' && <Clock className="h-3.5 w-3.5" />}
                        {i.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => setInscripcionSeleccionada(i)}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-200"
                          title="Ver Ficha de Examen"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {i.estado === 'Pendiente' && (
                          <>
                            <button
                              onClick={() => cambiarEstado(i._id, 'Aprobada')}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors cursor-pointer border border-green-200"
                              title="Aprobar Inscripción"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => cambiarEstado(i._id, 'Rechazada')}
                              className="p-1.5 bg-red-50 text-red-650 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border border-red-200"
                              title="Rechazar Inscripción"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => eliminarInscripcion(i._id)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors ml-1 cursor-pointer border border-transparent"
                          title="Eliminar Inscripción"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm font-semibold">
                    No se encontraron inscripciones a exámenes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
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

      {/* Modal Ficha Individual de Inscripción a Exámenes */}
      {inscripcionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-white flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200">
                    Ficha de Examen
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    inscripcionSeleccionada.estado === 'Aprobada' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                    inscripcionSeleccionada.estado === 'Rechazada' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                    'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                  }`}>
                    {inscripcionSeleccionada.estado === 'Aprobada' && <Check className="w-3 h-3" />}
                    {inscripcionSeleccionada.estado === 'Rechazada' && <X className="w-3 h-3" />}
                    {inscripcionSeleccionada.estado === 'Pendiente' && <Clock className="w-3 h-3" />}
                    {inscripcionSeleccionada.estado}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  {inscripcionSeleccionada.apellido}, {inscripcionSeleccionada.nombre}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Solicitud enviada el {new Date(inscripcionSeleccionada.createdAt).toLocaleDateString('es-AR')} a las {new Date(inscripcionSeleccionada.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                </p>
              </div>
              <button
                onClick={() => setInscripcionSeleccionada(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Cerrar Ficha"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
              {/* Carrera y Año Cursando */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carrera y Ciclo</span>
                    <p className="text-sm font-bold text-slate-800 leading-snug">{inscripcionSeleccionada.carrera}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shrink-0">
                  {inscripcionSeleccionada.añoCursando}
                </span>
              </div>

              {/* Grilla Informativa */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="border border-slate-100 rounded-xl p-3.5 bg-white shadow-2xs space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    DNI Alumno
                  </span>
                  <p className="text-sm font-bold text-slate-800 font-mono">{inscripcionSeleccionada.dni}</p>
                </div>

                <div className="border border-slate-100 rounded-xl p-3.5 bg-white shadow-2xs space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Turno Evaluativo
                  </span>
                  <p className="text-xs font-bold text-slate-800 truncate" title={inscripcionSeleccionada.turno}>{inscripcionSeleccionada.turno || 'No especificado'}</p>
                </div>

                <div className="border border-slate-100 rounded-xl p-3.5 bg-white shadow-2xs space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Llamado
                  </span>
                  <p className="text-xs font-bold text-slate-800 truncate" title={inscripcionSeleccionada.llamado}>{inscripcionSeleccionada.llamado || 'No especificado'}</p>
                </div>
              </div>

              {/* Materias Solicitadas */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Materias Solicitadas para Rendir ({inscripcionSeleccionada.materias?.length || 0})
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Condición: Final</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inscripcionSeleccionada.materias?.map((mat, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/90 rounded-lg p-2.5 flex items-center gap-2 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide truncate" title={mat}>
                        {mat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modificar Estado */}
              <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modificar Estado:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      cambiarEstado(inscripcionSeleccionada._id, 'Aprobada');
                      setInscripcionSeleccionada({ ...inscripcionSeleccionada, estado: 'Aprobada' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      inscripcionSeleccionada.estado === 'Aprobada'
                        ? 'bg-green-600 text-white shadow-xs'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Aprobada
                  </button>

                  <button
                    onClick={() => {
                      cambiarEstado(inscripcionSeleccionada._id, 'Pendiente');
                      setInscripcionSeleccionada({ ...inscripcionSeleccionada, estado: 'Pendiente' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      inscripcionSeleccionada.estado === 'Pendiente'
                        ? 'bg-yellow-600 text-white shadow-xs'
                        : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Pendiente
                  </button>

                  <button
                    onClick={() => {
                      cambiarEstado(inscripcionSeleccionada._id, 'Rechazada');
                      setInscripcionSeleccionada({ ...inscripcionSeleccionada, estado: 'Rechazada' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      inscripcionSeleccionada.estado === 'Rechazada'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    Rechazada
                  </button>
                </div>
              </div>
            </div>

            {/* Footer con Acciones */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
              <button
                onClick={() => {
                  const idToDelete = inscripcionSeleccionada._id;
                  setInscripcionSeleccionada(null);
                  eliminarInscripcion(idToDelete);
                }}
                className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Registro
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => descargarComprobanteExamen(inscripcionSeleccionada)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Descargar Acta en PDF
                </button>
                <button
                  onClick={() => setInscripcionSeleccionada(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
