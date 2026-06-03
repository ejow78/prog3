import { useState } from 'react';
import { Save, X, Plus, Trash2, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export default function AdminHorariosGrid({ carrera, onBack, onSave }) {
  const yearsList = getYearsList(carrera.duracion);

  // Inicializamos el estado de las horarios con todos los años definidos por duración
  const [horarios, setHorarios] = useState(() => {
    return yearsList.map(yName => {
      const existing = carrera.horariosSemanales?.find(h => h.año === yName);
      return existing 
        ? JSON.parse(JSON.stringify(existing)) 
        : { año: yName, franjas: [] };
    });
  });

  const [añoActivo, setAñoActivo] = useState(yearsList.length > 0 ? 0 : null);

  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

  const getMateriasSuggestions = () => {
    if (añoActivo === null || !horarios[añoActivo]) return [];
    const activeAñoName = horarios[añoActivo].año;
    
    // 1. Prioritize official carrera.materias list
    const savedObj = carrera.materias?.find(m => m.año === activeAñoName);
    if (savedObj && savedObj.nombres && savedObj.nombres.length > 0) {
      return savedObj.nombres;
    }
    
    // 2. Fallback to unique subjects extracted from current loaded grid in horarios
    const uniqueSubs = new Set();
    const franjas = horarios[añoActivo].franjas || [];
    franjas.forEach(f => {
      if (f.esRecreo) return;
      dias.forEach(dia => {
        const m = f[dia]?.materia;
        if (m && m.trim() !== '' && !m.toLowerCase().includes('recreo')) {
          uniqueSubs.add(m.trim().toUpperCase());
        }
      });
    });
    return Array.from(uniqueSubs).sort();
  };

  const handleAddFranja = () => {
    if (añoActivo === null) return;
    const horariosCopy = [...horarios];
    horariosCopy[añoActivo].franjas.push({
      hora: 'Nueva Franja',
      esRecreo: false,
      lunes: { materia: '', profesor: '' },
      martes: { materia: '', profesor: '' },
      miercoles: { materia: '', profesor: '' },
      jueves: { materia: '', profesor: '' },
      viernes: { materia: '', profesor: '' },
    });
    setHorarios(horariosCopy);
  };

  const handleRemoveFranja = (franjaIndex) => {
    if (añoActivo === null) return;
    const horariosCopy = [...horarios];
    horariosCopy[añoActivo].franjas.splice(franjaIndex, 1);
    setHorarios(horariosCopy);
  };

  const handleUpdateFranja = (franjaIndex, field, value) => {
    if (añoActivo === null) return;
    const horariosCopy = [...horarios];
    horariosCopy[añoActivo].franjas[franjaIndex][field] = value;
    setHorarios(horariosCopy);
  };

  const handleUpdateCelda = (franjaIndex, dia, campo, valor) => {
    if (añoActivo === null) return;
    const horariosCopy = [...horarios];
    if (!horariosCopy[añoActivo].franjas[franjaIndex][dia]) {
      horariosCopy[añoActivo].franjas[franjaIndex][dia] = { materia: '', profesor: '' };
    }
    horariosCopy[añoActivo].franjas[franjaIndex][dia][campo] = valor;
    setHorarios(horariosCopy);
  };

  const handleSaveAll = () => {
    onSave(carrera.id, { horariosSemanales: horarios });
  };

  const exportarPDF = () => {
    if (añoActivo === null || !horarios[añoActivo]) return;
    
    const horarioActivo = horarios[añoActivo];
    const doc = new jsPDF('landscape');
    
    // Título institucional y metadatos
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("HORARIO DE CLASES", 14, 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text(`Carrera: ${carrera.nombre} (${carrera.tipo}) - ${horarioActivo.año}`, 14, 22);
    
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
        dias.forEach(dia => {
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

    const sanitizedCarrera = carrera.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const sanitizedAño = horarioActivo.año.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `horario_${sanitizedCarrera}_${sanitizedAño}_admin.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6 animate-fade-in">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer border border-transparent">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h3 className="text-lg font-bold text-slate-800">
            Horarios Semanales: {carrera.nombre}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {añoActivo !== null && (
            <button
              onClick={exportarPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors font-medium text-sm cursor-pointer shadow-sm hover:shadow active:scale-95 border border-transparent"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Exportar PDF
            </button>
          )}
          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-medium text-sm cursor-pointer active:scale-95 border border-transparent shadow-sm"
          >
            <Save className="h-4 w-4" />
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Tabs list (strictly matching career duration years) */}
      <div className="p-4 border-b border-slate-100 flex gap-2 overflow-x-auto items-center">
        {horarios.map((horario, idx) => (
          <button
            key={idx}
            onClick={() => setAñoActivo(idx)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer border ${
              añoActivo === idx 
                ? 'bg-blue-100 text-primary border-blue-200/60 font-bold shadow-xs' 
                : 'bg-slate-100 text-slate-650 hover:bg-slate-200 border-transparent'
            }`}
          >
            {horario.año}
          </button>
        ))}
      </div>

      {añoActivo !== null && horarios[añoActivo] && (
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2 w-32">Horario</th>
                <th className="border border-slate-300 p-2 w-48">Lunes</th>
                <th className="border border-slate-300 p-2 w-48">Martes</th>
                <th className="border border-slate-300 p-2 w-48">Miércoles</th>
                <th className="border border-slate-300 p-2 w-48">Jueves</th>
                <th className="border border-slate-300 p-2 w-48">Viernes</th>
                <th className="border border-slate-300 p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {horarios[añoActivo].franjas.map((franja, fIdx) => {
                const activeAñoName = horarios[añoActivo]?.año;
                const savedObj = carrera.materias?.find(m => m.año === activeAñoName);
                const subjectsList = savedObj?.materiasDetalle && savedObj.materiasDetalle.length > 0
                  ? savedObj.materiasDetalle
                  : (savedObj?.nombres || []).map(name => ({ nombre: name, profesor: '' }));

                return (
                  <tr key={fIdx} className={franja.esRecreo ? 'bg-slate-200/50' : 'bg-white'}>
                    <td className="border border-slate-300 p-2">
                      <input
                        type="text"
                        value={franja.hora}
                        onChange={(e) => handleUpdateFranja(fIdx, 'hora', e.target.value)}
                        className="w-full bg-transparent outline-none text-center font-medium"
                      />
                      <label className="flex items-center justify-center gap-1 mt-1 text-xs text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={franja.esRecreo || false}
                          onChange={(e) => handleUpdateFranja(fIdx, 'esRecreo', e.target.checked)}
                        />
                        Recreo
                      </label>
                    </td>

                    {franja.esRecreo ? (
                      <td colSpan={5} className="border border-slate-300 p-2 text-center text-slate-500 font-bold tracking-widest bg-slate-100">
                        R E C R E O
                      </td>
                    ) : (
                      dias.map(dia => {
                        const currentVal = (franja[dia]?.materia || '').trim().toUpperCase();
                        const options = [...subjectsList];
                        if (currentVal && !options.some(opt => opt.nombre.trim().toUpperCase() === currentVal)) {
                          options.push({ nombre: currentVal, profesor: franja[dia]?.profesor || '' });
                        }

                        return (
                          <td key={dia} className="border border-slate-300 p-2">
                            <select
                              value={franja[dia]?.materia || ''}
                              onChange={(e) => {
                                const selectedMateria = e.target.value;
                                handleUpdateCelda(fIdx, dia, 'materia', selectedMateria);
                                const matchedSubject = subjectsList.find(s => s.nombre === selectedMateria);
                                if (matchedSubject) {
                                  handleUpdateCelda(fIdx, dia, 'profesor', matchedSubject.profesor || '');
                                } else if (selectedMateria === '') {
                                  handleUpdateCelda(fIdx, dia, 'profesor', '');
                                }
                              }}
                              className="w-full bg-transparent outline-none font-bold text-center mb-1 text-xs uppercase text-slate-800 border border-slate-200 rounded p-1 cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="">Materia...</option>
                              {options.map((opt, oIdx) => (
                                <option key={oIdx} value={opt.nombre}>
                                  {opt.nombre}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Profesor..."
                              value={franja[dia]?.profesor || ''}
                              onChange={(e) => handleUpdateCelda(fIdx, dia, 'profesor', e.target.value)}
                              className="w-full bg-transparent outline-none text-center text-xs text-slate-650"
                            />
                          </td>
                        );
                      })
                    )}

                    <td className="border border-slate-300 p-2 text-center">
                      <button onClick={() => handleRemoveFranja(fIdx)} className="text-red-500 hover:text-red-700 cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            onClick={handleAddFranja}
            className="mt-4 flex items-center gap-2 text-primary hover:text-primary-dark text-sm font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Añadir Horario
          </button>
        </div>
      )}
    </div>
  );
}
