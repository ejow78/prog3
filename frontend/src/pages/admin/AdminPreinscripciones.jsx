import { useState, useEffect } from 'react';
import { Check, X, Clock, AlertCircle, Download, FileSpreadsheet, Trash2, Search, Eye, Phone, Mail, FileText, Printer, MessageCircle, ExternalLink, Calendar, MapPin, User, GraduationCap } from 'lucide-react';
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
  const [preinscripcionSeleccionada, setPreinscripcionSeleccionada] = useState(null);
  const { token, admin } = useContext(AuthContext);

  const fetchPreinscripciones = async () => {
    try {
      const response = await fetch('/api/preinscripciones', {
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
      const response = await fetch(`/api/preinscripciones/${id}/estado`, {
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
      const response = await fetch(`/api/preinscripciones/${id}`, {
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

  const descargarFichaIndividual = (p) => {
    const doc = new jsPDF('portrait');

    // Encabezado decorativo
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTITUTO DE ENSEÑANZA SUPERIOR LA COCHA', 105, 13, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Ficha Oficial de Preinscripción de Aspirante', 105, 21, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Sistema de Gestión Académica', 105, 27, { align: 'center' });

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    const fechaHora = `${new Date(p.createdAt).toLocaleDateString('es-AR')} - ${new Date(p.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs`;
    doc.text(`Fecha y Hora de Registro: ${fechaHora}`, 14, 42);
    doc.text(`Identificador de Trámite: ${p._id}`, 14, 48);

    const bodyData = [
      ['Apellido y Nombre', `${p.apellido}, ${p.nombre}`],
      ['Documento Nacional de Identidad (DNI)', p.dni],
      ['Género', p.genero || 'No especificado'],
      ['Carrera a la que aspira', p.carrera],
      ['Localidad / Domicilio', p.localidad],
      ['Teléfono de Contacto', p.telefono],
      ['Correo Electrónico', p.email],
      ['Estado Actual de la Solicitud', p.estado]
    ];

    autoTable(doc, {
      startY: 54,
      head: [['Campo', 'Información Declarada por el Aspirante']],
      body: bodyData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', width: 65, fillColor: [248, 250, 252] },
        1: { width: 115 }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('• Este comprobante certifica que la solicitud fue registrada en la plataforma oficial del IES La Cocha.', 14, finalY);
    doc.text('• La inscripción definitiva queda sujeta a la presentación de la documentación física requerida en Secretaría.', 14, finalY + 5);

    doc.setDrawColor(203, 213, 225);
    doc.line(120, finalY + 30, 185, finalY + 30);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Firma y Sello de Secretaría', 152, finalY + 36, { align: 'center' });

    doc.save(`Ficha_Preinscripcion_${p.dni}_${p.apellido}.pdf`);
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
                        <button
                          onClick={() => setPreinscripcionSeleccionada(p)}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors cursor-pointer"
                          title="Ver Ficha Detallada"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {p.estado === 'Pendiente' ? (
                          <>
                            <button
                              onClick={() => cambiarEstado(p._id, 'Aprobada')}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-md transition-colors cursor-pointer"
                              title="Aprobar"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => cambiarEstado(p._id, 'Rechazada')}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors cursor-pointer"
                              title="Rechazar"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => cambiarEstado(p._id, 'Pendiente')}
                            className="text-xs text-slate-400 hover:text-slate-600 underline mr-2 cursor-pointer"
                          >
                            Hacer Pendiente
                          </button>
                        )}
                        <button
                          onClick={() => eliminarPreinscripcion(p._id)}
                          className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors cursor-pointer"
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

      {/* Modal Ficha Individual del Aspirante */}
      {preinscripcionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-white flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200">
                    Ficha de Admisión
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    preinscripcionSeleccionada.estado === 'Aprobada' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                    preinscripcionSeleccionada.estado === 'Rechazada' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                    'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                  }`}>
                    {preinscripcionSeleccionada.estado === 'Aprobada' && <Check className="w-3 h-3" />}
                    {preinscripcionSeleccionada.estado === 'Rechazada' && <X className="w-3 h-3" />}
                    {preinscripcionSeleccionada.estado === 'Pendiente' && <Clock className="w-3 h-3" />}
                    {preinscripcionSeleccionada.estado}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  {preinscripcionSeleccionada.apellido}, {preinscripcionSeleccionada.nombre}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Registrado el {new Date(preinscripcionSeleccionada.createdAt).toLocaleDateString('es-AR')} a las {new Date(preinscripcionSeleccionada.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                </p>
              </div>
              <button
                onClick={() => setPreinscripcionSeleccionada(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Cerrar Ficha"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
              {/* Carrera Solicitada */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Carrera Solicitada</span>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{preinscripcionSeleccionada.carrera}</p>
                </div>
              </div>

              {/* Grilla de Datos Personales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="border border-slate-100 rounded-xl p-3.5 bg-white shadow-2xs space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Documento Nacional (DNI)
                  </span>
                  <p className="text-sm font-bold text-slate-800 font-mono">{preinscripcionSeleccionada.dni}</p>
                </div>

                <div className="border border-slate-100 rounded-xl p-3.5 bg-white shadow-2xs space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Género Declarado
                  </span>
                  <p className="text-sm font-bold text-slate-800">{preinscripcionSeleccionada.genero || 'No especificado'}</p>
                </div>

                <div className="border border-slate-100 rounded-xl p-3.5 bg-white shadow-2xs space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Localidad / Residencia
                  </span>
                  <p className="text-sm font-bold text-slate-800">{preinscripcionSeleccionada.localidad || 'No especificada'}</p>
                </div>

                <div className="border border-slate-100 rounded-xl p-3.5 bg-white shadow-2xs space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    ID de Registro
                  </span>
                  <p className="text-xs font-mono text-slate-600 truncate" title={preinscripcionSeleccionada._id}>
                    {preinscripcionSeleccionada._id}
                  </p>
                </div>
              </div>

              {/* Canales de Contacto Directo */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Contacto con el Aspirante</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* WhatsApp / Teléfono */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Teléfono</span>
                      <p className="text-xs font-bold text-slate-800 font-mono truncate">{preinscripcionSeleccionada.telefono}</p>
                    </div>
                    {preinscripcionSeleccionada.telefono && (
                      <a
                        href={`https://wa.me/${preinscripcionSeleccionada.telefono.replace(/\D/g, '').startsWith('54') ? preinscripcionSeleccionada.telefono.replace(/\D/g, '') : '549' + preinscripcionSeleccionada.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs font-bold transition-colors shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    )}
                  </div>

                  {/* Email */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Email</span>
                      <p className="text-xs font-bold text-slate-800 truncate" title={preinscripcionSeleccionada.email}>{preinscripcionSeleccionada.email}</p>
                    </div>
                    {preinscripcionSeleccionada.email && (
                      <a
                        href={`mailto:${preinscripcionSeleccionada.email}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors shrink-0"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Cambiar Estado Directo */}
              <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modificar Estado:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      cambiarEstado(preinscripcionSeleccionada._id, 'Aprobada');
                      setPreinscripcionSeleccionada({ ...preinscripcionSeleccionada, estado: 'Aprobada' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      preinscripcionSeleccionada.estado === 'Aprobada'
                        ? 'bg-green-600 text-white shadow-xs'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Aprobada
                  </button>

                  <button
                    onClick={() => {
                      cambiarEstado(preinscripcionSeleccionada._id, 'Pendiente');
                      setPreinscripcionSeleccionada({ ...preinscripcionSeleccionada, estado: 'Pendiente' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      preinscripcionSeleccionada.estado === 'Pendiente'
                        ? 'bg-yellow-600 text-white shadow-xs'
                        : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Pendiente
                  </button>

                  <button
                    onClick={() => {
                      cambiarEstado(preinscripcionSeleccionada._id, 'Rechazada');
                      setPreinscripcionSeleccionada({ ...preinscripcionSeleccionada, estado: 'Rechazada' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      preinscripcionSeleccionada.estado === 'Rechazada'
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
                  const idToDelete = preinscripcionSeleccionada._id;
                  setPreinscripcionSeleccionada(null);
                  eliminarPreinscripcion(idToDelete);
                }}
                className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Registro
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => descargarFichaIndividual(preinscripcionSeleccionada)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Descargar Ficha en PDF
                </button>
                <button
                  onClick={() => setPreinscripcionSeleccionada(null)}
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
