import { useState, useEffect } from 'react';
import { BookOpen, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Horarios() {
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState('');
  const [añoActivo, setAñoActivo] = useState(0);

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/carreras');
        if (!response.ok) throw new Error('Error fetching carreras');
        const data = await response.json();
        data.sort((a, b) => a.id - b.id);
        setCarreras(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarreras();
  }, []);

  const carreraActual = carreras.find(c => c.id === parseInt(carreraSeleccionada));

  const activeHorariosList = carreraActual?.horariosSemanales
    ? carreraActual.horariosSemanales.filter(h => h.franjas && h.franjas.length > 0)
    : [];

  const exportarPDF = () => {
    if (!carreraActual || activeHorariosList.length === 0 || !activeHorariosList[añoActivo]) return;

    const horarioActivo = activeHorariosList[añoActivo];
    const doc = new jsPDF('landscape');

    // Título institucional y metadatos
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("HORARIO DE CLASES", 14, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text(`Carrera: ${carreraActual.nombre} (${carreraActual.tipo}) - ${horarioActivo.año}`, 14, 22);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    const fechaGen = new Date().toLocaleString('es-AR');
    doc.text(`Generado el: ${fechaGen}`, doc.internal.pageSize.getWidth() - 14, 22, { align: 'right' });

    const tableColumn = ["Horario", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    const tableRows = [];

    horarioActivo.franjas.forEach(franja => {
      if (franja.esRecreo) {
        tableRows.push([
          franja.hora,
          {
            content: 'RECREO',
            colSpan: 5,
            styles: {
              halign: 'center',
              valign: 'middle',
              fillColor: [226, 232, 240], // bg-slate-200
              textColor: [71, 85, 105],   // text-slate-600
              fontStyle: 'bold'
            }
          }
        ]);
      } else {
        const row = [franja.hora];
        ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].forEach(dia => {
          const celda = franja[dia];
          if (celda && celda.materia) {
            const profesorText = celda.profesor ? `\n(${celda.profesor})` : '';
            row.push(`${celda.materia.toUpperCase()}${profesorText}`);
          } else {
            row.push('-');
          }
        });
        tableRows.push(row);
      }
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 5,
        halign: 'center',
        valign: 'middle',
        overflow: 'linebreak',
        font: 'helvetica'
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 35 }
      },
      headStyles: {
        fillColor: [29, 78, 216], // Blue-700
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      }
    });

    const sanitizedCarrera = carreraActual.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const sanitizedAño = horarioActivo.año.toString().replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `horario_${sanitizedCarrera}_${sanitizedAño}.pdf`;
    doc.save(fileName);
  };

  // Resetear el año activo al cambiar de carrera
  useEffect(() => {
    setAñoActivo(0);
  }, [carreraSeleccionada]);

  return (
    <div className="bg-slate-50 py-16 animate-fade-in min-h-[calc(100vh-10rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-primary to-primary-dark p-8 md:p-12 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">Horarios de Cursado</h1>
            <p className="text-primary-100">Consultá la distribución horaria semanal y descargá tu cronograma en PDF.</p>
          </div>

          <div className="p-8 md:p-12">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-slate-500 font-medium">Cargando horarios de cursado...</p>
              </div>
            ) : !carreraActual ? (
              /* Grid of Career Cards Selector */
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-slate-800">Seleccioná tu Carrera</h2>
                  <p className="text-slate-500 text-sm mt-1">Hacé clic en una carrera para visualizar sus horarios.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {carreras.map((carrera) => {
                    const count = carrera.horariosSemanales
                      ? carrera.horariosSemanales.filter(h => h.franjas && h.franjas.length > 0).length
                      : 0;
                    return (
                      <button
                        key={carrera.id}
                        onClick={() => setCarreraSeleccionada(carrera.id.toString())}
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
                            <Clock className="h-4 w-4 text-slate-400 group-hover:text-primary transition-all shrink-0" />
                            Ver horarios
                          </span>
                          <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Detailed Active Schedule Table View */
              <div className="animate-fade-in-down space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <button
                    onClick={() => setCarreraSeleccionada('')}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 cursor-pointer"
                    title="Volver a Carreras"
                  >
                    <ArrowLeft className="h-5 w-5 text-slate-655" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{carreraActual.nombre}</h2>
                    <p className="text-slate-500 text-sm mt-1">{carreraActual.tipo} · {carreraActual.duracion}</p>
                  </div>
                </div>

                {activeHorariosList.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-150 text-slate-400 font-semibold text-sm">
                    Aún no hay horarios cargados para esta carrera académica.
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center gap-4 mb-6 flex-wrap border-b border-slate-100 pb-4">
                      <div className="flex gap-2 flex-wrap">
                        {activeHorariosList.map((horario, idx) => (
                          <button
                            key={idx}
                            onClick={() => setAñoActivo(idx)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                              añoActivo === idx 
                                ? 'bg-primary text-white shadow-md scale-105' 
                                : 'bg-slate-100 text-slate-655 hover:bg-slate-200'
                            }`}
                          >
                            {horario.año}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={exportarPDF}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all font-bold text-sm shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer border border-transparent"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Exportar PDF
                      </button>
                    </div>

                    {activeHorariosList[añoActivo] && (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm bg-white">
                        <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-4 py-4 font-bold text-slate-750 border-r border-slate-200 whitespace-nowrap text-center">Horario</th>
                              <th className="px-4 py-4 font-bold text-slate-750 border-r border-slate-200 min-w-[160px] text-center">Lunes</th>
                              <th className="px-4 py-4 font-bold text-slate-750 border-r border-slate-200 min-w-[160px] text-center">Martes</th>
                              <th className="px-4 py-4 font-bold text-slate-750 border-r border-slate-200 min-w-[160px] text-center">Miércoles</th>
                              <th className="px-4 py-4 font-bold text-slate-750 border-r border-slate-200 min-w-[160px] text-center">Jueves</th>
                              <th className="px-4 py-4 font-bold text-slate-750 min-w-[160px] text-center">Viernes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {activeHorariosList[añoActivo].franjas.map((franja, fIdx) => (
                              <tr key={fIdx} className={franja.esRecreo ? 'bg-slate-200' : 'hover:bg-slate-50 transition-colors'}>
                                <td className="px-4 py-3 font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap text-center align-middle bg-slate-50">
                                  {franja.hora}
                                </td>
                                {franja.esRecreo ? (
                                  <td colSpan={5} className="px-4 py-3 text-center text-slate-550 font-extrabold tracking-[0.8em] align-middle">
                                    RECREO
                                  </td>
                                ) : (
                                  ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map(dia => (
                                    <td key={dia} className="px-4 py-3 border-r border-slate-200 align-top last:border-r-0 text-center">
                                      <div className="flex flex-col gap-1.5 justify-center h-full min-h-[60px]">
                                        <span className="font-bold text-primary-dark text-xs leading-snug uppercase break-words">{franja[dia]?.materia || '-'}</span>
                                        {franja[dia]?.profesor && (
                                          <span className="text-slate-500 text-[11px] leading-tight font-medium bg-slate-100 rounded px-1.5 py-0.5 inline-block w-fit mx-auto">{franja[dia].profesor}</span>
                                        )}
                                      </div>
                                    </td>
                                  ))
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
