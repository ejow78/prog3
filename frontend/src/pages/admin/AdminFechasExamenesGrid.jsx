import { useState, useEffect, useContext } from 'react';
import { Save, Plus, Trash2, ArrowLeft, Calendar, Clock, User, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

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
  return ['1° Año', '2° Año', '3° Año'];
};

export default function AdminFechasExamenesGrid({ carrera, onBack }) {
  const { token } = useContext(AuthContext);
  
  // Turno and Range States
  const [turnoActivo, setTurnoActivo] = useState('Febrero-Marzo 2026');
  const [turnosExistentes, setTurnosExistentes] = useState([]);
  const [rangoPrimerLlamado, setRangoPrimerLlamado] = useState('');
  const [rangoSegundoLlamado, setRangoSegundoLlamado] = useState('');
  const [rangoLlamadoEspecial, setRangoLlamadoEspecial] = useState('');



  // UI Control States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [añoActivo, setAñoActivo] = useState(null);
  const [nuevaMateriaNombre, setNuevaMateriaNombre] = useState('');

  // Primary Grid State
  // Format: { [año]: { [materia]: { [llamado]: { id, fecha, hora, tribunal } } } }
  const [gridData, setGridData] = useState({});
  const [yearsList, setYearsList] = useState([]);

  // Helper to build a fresh, empty grid mapping years to subjects and called objects
  const buildInitialGrid = (years) => {
    const grid = {};
    years.forEach(y => {
      grid[y] = {};
      
      // Determine subjects list for this year:
      // Use strictly official carrera.materias
      const savedObj = carrera.materias?.find(m => m.año === y);
      let subjectsList = [];
      if (savedObj) {
        if (savedObj.materiasDetalle && savedObj.materiasDetalle.length > 0) {
          subjectsList = savedObj.materiasDetalle.map(item => item.nombre);
        } else if (savedObj.nombres && savedObj.nombres.length > 0) {
          subjectsList = savedObj.nombres;
        }
      }

      // Map subjects into called slots
      subjectsList.forEach(sub => {
        const uppercaseSub = sub.trim().toUpperCase();
        grid[y][uppercaseSub] = {
          'Primer Llamado': { id: '', fecha: '', hora: '18:30', tribunal: '' },
          'Segundo Llamado': { id: '', fecha: '', hora: '18:30', tribunal: '' },
          'Llamado Especial': { id: '', fecha: '', hora: '18:30', tribunal: '' }
        };
      });
    });
    return grid;
  };


  // Extract years and unique subjects from Schedules, and fetch from API
  useEffect(() => {
    const initializeGridAndLoadData = async () => {
      try {
        setLoading(true);

        // 1. Identify years from career duration
        const years = getYearsList(carrera.duracion);
        
        setYearsList(years);
        setAñoActivo(years[0]);

        // 2. Build empty grid with subjects (prioritizing carrera.materias)
        const initialGrid = buildInitialGrid(years);

        // 3. Fetch existing exam dates from backend
        const response = await fetch('http://localhost:5000/api/fechas-examenes');
        if (!response.ok) throw new Error('Error al cargar mesas de exámenes');
        const allFechas = await response.json();

        // Filter dates for this career
        const matchingFechas = allFechas.filter(f => f.carrera === carrera.nombre);

        // Extract available turnos for convenience dropdown
        const uniqueTurnos = [...new Set(matchingFechas.map(f => f.turno))];
        setTurnosExistentes(uniqueTurnos);

        // Determine initial active turno
        let activeT = turnoActivo;
        if (uniqueTurnos.length > 0) {
          activeT = uniqueTurnos[0];
          setTurnoActivo(activeT);
        }

        // Apply matching DB records to the grid
        applyDbFechasToGrid(matchingFechas, activeT, initialGrid, years);

      } catch (error) {
        console.error(error);
        mostrarAlerta('No se pudieron inicializar las fechas de exámenes.', 'error');
      } finally {
        setLoading(false);
      }
    };

    initializeGridAndLoadData();
  }, [carrera]);

  // Apply DB Fechas to our local grid structure
  const applyDbFechasToGrid = (fechasList, activeTurno, currentGrid, years) => {
    // Reset range states
    let range1 = '';
    let range2 = '';
    let rangeEsp = '';



    // Create a copy of current grid to populate
    const gridCopy = JSON.parse(JSON.stringify(currentGrid));

    fechasList.forEach(doc => {
      if (doc.turno !== activeTurno) return;

      // Extract ranges
      if (doc.llamado === 'Primer Llamado') {
        if (!range1) range1 = doc.llamadoFechas;
      }
      if (doc.llamado === 'Segundo Llamado') {
        if (!range2) range2 = doc.llamadoFechas;
      }
      if (doc.llamado === 'Llamado Especial') {
        if (!rangeEsp) rangeEsp = doc.llamadoFechas;
      }

      // Map subject (materia array or string)
      const materiasArray = Array.isArray(doc.materia) ? doc.materia : [doc.materia];

      materiasArray.forEach(mName => {
        const uppercaseMateria = mName.trim().toUpperCase();

        // Find which academic year this subject belongs to
        let targetYear = years[0]; // default to first year if not found
        let foundInPlan = false;
        
        // 1. Check in official carrera.materias first
        for (const y of years) {
          const savedObj = carrera.materias?.find(m => m.año === y);
          if (savedObj && savedObj.nombres && savedObj.nombres.some(n => n.trim().toUpperCase() === uppercaseMateria)) {
            targetYear = y;
            foundInPlan = true;
            break;
          }
        }
        
        // 2. Fallback to weekly schedules search
        if (!foundInPlan) {
          for (const y of years) {
            const scheduleForYear = carrera.horariosSemanales?.find(h => h.año === y);
            let foundInSchedule = false;
            if (scheduleForYear && scheduleForYear.franjas) {
              foundInSchedule = scheduleForYear.franjas.some(f => {
                if (f.esRecreo) return false;
                return ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].some(dia => 
                  f[dia]?.materia?.trim().toUpperCase() === uppercaseMateria
                );
              });
            }
            if (foundInSchedule) {
              targetYear = y;
              break;
            }
          }
        }

        // Ensure subject row exists in gridCopy
        if (!gridCopy[targetYear]) {
          gridCopy[targetYear] = {};
        }
        if (!gridCopy[targetYear][uppercaseMateria]) {
          gridCopy[targetYear][uppercaseMateria] = {
            'Primer Llamado': { id: '', fecha: '', hora: '18:30', tribunal: '' },
            'Segundo Llamado': { id: '', fecha: '', hora: '18:30', tribunal: '' },
            'Llamado Especial': { id: '', fecha: '', hora: '18:30', tribunal: '' }
          };
        }

        // Set DB data into the cell
        gridCopy[targetYear][uppercaseMateria][doc.llamado] = {
          id: doc._id,
          fecha: doc.fecha,
          hora: doc.hora,
          tribunal: doc.tribunal
        };
      });
    });

    setRangoPrimerLlamado(range1);
    setRangoSegundoLlamado(range2);
    setRangoLlamadoEspecial(rangeEsp);
    

    
    setGridData(gridCopy);
  };

  // Reload when changing Turno input
  const handleTurnoChange = async (newTurno) => {
    setTurnoActivo(newTurno);
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/fechas-examenes');
      if (!response.ok) throw new Error('Error al cargar mesas');
      const allFechas = await response.json();
      const matchingFechas = allFechas.filter(f => f.carrera === carrera.nombre);

      // Re-initialize empty grid using our helper
      const initialGrid = buildInitialGrid(yearsList);

      applyDbFechasToGrid(matchingFechas, newTurno, initialGrid, yearsList);
    } catch (err) {
      console.error(err);
      mostrarAlerta('Error al cambiar de turno.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  // Add custom manual subject row to grid for active academic year
  const handleAddManualMateria = () => {
    if (!nuevaMateriaNombre.trim()) return;
    const uppercaseSub = nuevaMateriaNombre.trim().toUpperCase();

    if (gridData[añoActivo]?.[uppercaseSub]) {
      mostrarAlerta('La asignatura ya está en la grilla para este año.', 'error');
      return;
    }

    const gridCopy = { ...gridData };
    if (!gridCopy[añoActivo]) {
      gridCopy[añoActivo] = {};
    }
    gridCopy[añoActivo][uppercaseSub] = {
      'Primer Llamado': { id: '', fecha: '', hora: '18:30', tribunal: '' },
      'Segundo Llamado': { id: '', fecha: '', hora: '18:30', tribunal: '' },
      'Llamado Especial': { id: '', fecha: '', hora: '18:30', tribunal: '' }
    };

    setGridData(gridCopy);
    setNuevaMateriaNombre('');
    mostrarAlerta(`Asignatura "${uppercaseSub}" añadida a la grilla.`, 'exito');
  };

  // Remove manual subject row if it has no database ID
  const handleRemoveManualMateria = (subName) => {
    const calleds = gridData[añoActivo]?.[subName] || {};
    const hasSavedData = Object.values(calleds).some(c => c.id !== '');

    if (hasSavedData) {
      if (!window.confirm(`La materia "${subName}" tiene mesas guardadas en la base de datos. Si eliminas la fila, se borrarán las mesas al guardar. ¿Quieres continuar?`)) {
        return;
      }
    }

    const gridCopy = { ...gridData };
    
    // If it has saved database records, we mark them for deletion by clearing the cells
    if (hasSavedData) {
      Object.keys(gridCopy[añoActivo][subName]).forEach(calledType => {
        gridCopy[añoActivo][subName][calledType] = {
          ...gridCopy[añoActivo][subName][calledType],
          fecha: '',
          tribunal: ''
        };
      });
      setGridData(gridCopy);
      mostrarAlerta(`Asignatura "${subName}" marcada para ser eliminada de la base de datos al guardar.`, 'exito');
    } else {
      // Just remove from local memory
      delete gridCopy[añoActivo][subName];
      setGridData(gridCopy);
      mostrarAlerta(`Asignatura "${subName}" quitada de la vista.`, 'exito');
    }
  };

  // Update specific input inside a cell
  const handleUpdateCell = (year, subject, calledType, field, value) => {
    const gridCopy = { ...gridData };
    if (!gridCopy[year][subject][calledType]) {
      gridCopy[year][subject][calledType] = { id: '', fecha: '', hora: '18:30', tribunal: '' };
    }
    gridCopy[year][subject][calledType][field] = value;
    setGridData(gridCopy);
  };

  // Save all changes in bulk
  const handleSaveAll = async () => {
    if (!turnoActivo.trim()) {
      mostrarAlerta('Por favor ingrese el nombre del Turno Académico.', 'error');
      return;
    }

    setSaving(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      const posts = [];
      const puts = [];
      const deletes = [];

      // Validate cells and classify actions
      let validationError = null;

      Object.entries(gridData).forEach(([year, subjectsObj]) => {
        Object.entries(subjectsObj).forEach(([subject, calleds]) => {
          Object.entries(calleds).forEach(([calledType, cellData]) => {
            const hasFecha = cellData.fecha.trim() !== '';
            const hasHora = cellData.hora.trim() !== '';
            const hasTribunal = cellData.tribunal.trim() !== '';
            const hasId = cellData.id !== '';

            // Partially filled cells validation: cell is active if fecha or tribunal is populated
            const isActive = hasFecha || hasTribunal;
            if (isActive && !(hasFecha && hasHora && hasTribunal)) {
              validationError = `La asignatura "${subject}" en el "${calledType}" (${year}) está incompleta. Debe rellenar Fecha, Hora y Tribunal, o bien dejar los campos vacíos.`;
            }

            const rangeMap = {
              'Primer Llamado': rangoPrimerLlamado,
              'Segundo Llamado': rangoSegundoLlamado,
              'Llamado Especial': rangoLlamadoEspecial
            };
            const currentRange = rangeMap[calledType] || '';

            if (hasFecha && hasHora && hasTribunal) {
              const body = {
                turno: turnoActivo.trim(),
                llamado: calledType,
                llamadoFechas: currentRange.trim() || 'Fechas a definir',
                carrera: carrera.nombre,
                materia: [subject],
                fecha: cellData.fecha,
                hora: cellData.hora,
                tribunal: cellData.tribunal.trim()
              };

              if (!hasId) {
                // Perform POST
                posts.push(body);
              } else {
                // Perform PUT (only if modified or if the range changed)
                puts.push({ id: cellData.id, body });
              }
            } else if (hasId) {
              // Perform DELETE because fields are empty now
              deletes.push(cellData.id);
            }
          });
        });
      });

      if (validationError) {
        mostrarAlerta(validationError, 'error');
        setSaving(false);
        return;
      }

      // Execute DELETEs
      for (const id of deletes) {
        const response = await fetch(`http://localhost:5000/api/fechas-examenes/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al eliminar mesa desprogramada.');
      }

      // Execute POSTs
      for (const body of posts) {
        const response = await fetch('http://localhost:5000/api/fechas-examenes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Error al programar nueva mesa.');
      }

      // Execute PUTs
      for (const item of puts) {
        const response = await fetch(`http://localhost:5000/api/fechas-examenes/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(item.body)
        });
        if (!response.ok) throw new Error('Error al actualizar mesa programada.');
      }

      mostrarAlerta('¡Cambios guardados con éxito en la base de datos!', 'exito');
      
      // Reload everything to get fresh IDs and updated states
      setTimeout(() => {
        handleTurnoChange(turnoActivo);
      }, 1000);

    } catch (error) {
      console.error(error);
      mostrarAlerta(error.message || 'Ocurrió un error al guardar los cambios.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col justify-center items-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm mt-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-slate-500 font-semibold text-sm">Cargando grilla interactiva y mesas asociadas...</p>
      </div>
    );
  }

  const subjectsInActiveYear = gridData[añoActivo] ? Object.keys(gridData[añoActivo]) : [];

  // Calculate available official subjects not yet in the grid
  const activeYearPlan = carrera.materias?.find(m => m.año === añoActivo);
  const officialSubjects = activeYearPlan
    ? (activeYearPlan.materiasDetalle && activeYearPlan.materiasDetalle.length > 0
        ? activeYearPlan.materiasDetalle.map(item => item.nombre.trim().toUpperCase())
        : (activeYearPlan.nombres || []).map(name => name.trim().toUpperCase()))
    : [];
  const subjectsInGrid = subjectsInActiveYear.map(name => name.trim().toUpperCase());
  const availableSubjects = officialSubjects.filter(sub => !subjectsInGrid.includes(sub));

  return (
    <div className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden mt-6 animate-fade-in pb-8">
      {/* 1. Header Area */}
      <div className="p-5 bg-white border-b border-slate-200 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200"
            title="Volver a Carreras"
          >
            <ArrowLeft className="h-5 w-5 text-slate-650" />
          </button>
          <div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full uppercase border border-emerald-150 inline-block mb-1">
              Modo Planilla Exámenes
            </span>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {carrera.nombre}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-bold text-sm cursor-pointer shadow-md border border-transparent ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Save className="h-4.5 w-4.5" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* 2. Global Turno & Range Configuration */}
      <div className="mx-5 mt-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {/* Fila 1: Turno y Rangos de Examen */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Turno Académico Activo
            </label>
            <div className="relative flex gap-2">
              <input
                type="text"
                placeholder="Ej: Febrero-Marzo 2026"
                value={turnoActivo}
                onChange={(e) => setTurnoActivo(e.target.value)}
                onBlur={(e) => handleTurnoChange(e.target.value)}
                className="w-full px-3.5 py-1.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-bold text-slate-800 uppercase"
              />
              {turnosExistentes.length > 0 && (
                <select
                  onChange={(e) => handleTurnoChange(e.target.value)}
                  value={turnoActivo}
                  className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-slate-50 cursor-pointer text-slate-600"
                  title="Seleccionar Turno Existente"
                >
                  <option value={turnoActivo}>-- Ver Historial --</option>
                  {turnosExistentes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
              Rango Primer Llamado
            </label>
            <input
              type="text"
              placeholder="Ej: 20 al 24 de Febrero"
              value={rangoPrimerLlamado}
              onChange={(e) => setRangoPrimerLlamado(e.target.value)}
              className="w-full px-3.5 py-1.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm text-slate-700 font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
              Rango Segundo Llamado
            </label>
            <input
              type="text"
              placeholder="Ej: 27 de Feb al 3 de Mar"
              value={rangoSegundoLlamado}
              onChange={(e) => setRangoSegundoLlamado(e.target.value)}
              className="w-full px-3.5 py-1.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm text-slate-700 font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
              Rango Llamado Especial
            </label>
            <input
              type="text"
              placeholder="Ej: 10 al 14 de Marzo"
              value={rangoLlamadoEspecial}
              onChange={(e) => setRangoLlamadoEspecial(e.target.value)}
              className="w-full px-3.5 py-1.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm text-slate-700 font-semibold"
            />
          </div>
        </div>


      </div>

      {/* Alert message banner */}
      {mensaje.texto && (
        <div className="mx-5 mt-4">
          <div className={`p-4 rounded-xl flex items-center gap-2.5 animate-fade-in ${
            mensaje.tipo === 'error' 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {mensaje.tipo === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            )}
            <span className="font-semibold text-xs leading-relaxed">{mensaje.texto}</span>
          </div>
        </div>
      )}

      {/* 3. Year Selection Tabs */}
      <div className="mx-5 mt-5 flex gap-2.5 overflow-x-auto pb-1.5">
        {yearsList.map((y) => (
          <button
            key={y}
            onClick={() => setAñoActivo(y)}
            className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-bold text-xs uppercase tracking-wider transition-all border cursor-pointer ${
              añoActivo === y
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* 4. Table Grid */}
      <div className="mx-5 mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[240px]">Asignatura</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[250px]">Primer Llamado</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[250px]">Segundo Llamado</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[250px]">Llamado Especial</th>
                <th className="p-4 w-[60px] text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectsInActiveYear.length > 0 ? (
                subjectsInActiveYear.map((subName) => {
                  const cells = gridData[añoActivo]?.[subName] || {};
                  
                  return (
                    <tr key={subName} className="hover:bg-slate-50/50 transition-colors">
                      {/* Subject label */}
                      <td className="p-4">
                        <span className="text-xs font-bold text-slate-800 uppercase block leading-relaxed break-words max-w-[210px]">
                          {subName}
                        </span>
                      </td>

                      {/* Called Columns */}
                      {['Primer Llamado', 'Segundo Llamado', 'Llamado Especial'].map((calledType) => {
                        const cell = cells[calledType] || { id: '', fecha: '', hora: '18:30', tribunal: '' };

                        return (
                          <td key={calledType} className="p-3">
                            <div className="flex flex-col gap-2 bg-slate-50/60 p-2.5 rounded-xl border border-slate-150/70">
                              {/* Date Input */}
                              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-3xs">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <input
                                  type="date"
                                  value={cell.fecha}
                                  onChange={(e) => handleUpdateCell(añoActivo, subName, calledType, 'fecha', e.target.value)}
                                  className="bg-transparent text-xs text-slate-700 outline-none w-full cursor-pointer font-medium"
                                />
                              </div>

                              {/* Time Input */}
                              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-3xs">
                                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <input
                                  type="time"
                                  value={cell.hora}
                                  onChange={(e) => handleUpdateCell(añoActivo, subName, calledType, 'hora', e.target.value)}
                                  className="bg-transparent text-xs text-slate-700 outline-none w-full cursor-pointer font-medium"
                                />
                              </div>

                              {/* Tribunal Input */}
                              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-3xs">
                                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <input
                                  type="text"
                                  placeholder="Docentes..."
                                  value={cell.tribunal}
                                  onChange={(e) => handleUpdateCell(añoActivo, subName, calledType, 'tribunal', e.target.value)}
                                  className="bg-transparent text-xs text-slate-700 outline-none w-full font-medium"
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleRemoveManualMateria(subName)}
                          className="p-1.5 text-slate-450 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                          title="Quitar Fila"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50/20">
                    No hay asignaturas en este año académico. Utilice "Añadir Asignatura" abajo para inyectar filas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add Custom Subject Bar */}
      <div className="mx-5 mt-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {availableSubjects.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                Añadir asignatura oficial pendiente:
              </span>
              <select
                value={nuevaMateriaNombre}
                onChange={(e) => setNuevaMateriaNombre(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-primary text-xs font-bold text-slate-800 uppercase bg-slate-50 cursor-pointer"
              >
                <option value="">-- Seleccionar Asignatura --</option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddManualMateria}
              disabled={!nuevaMateriaNombre}
              className={`flex items-center justify-center gap-1.5 px-4.5 py-2 bg-primary text-white hover:bg-primary-dark rounded-xl transition-all font-bold text-xs shrink-0 border border-transparent uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Plus className="h-4 w-4" />
              Añadir Asignatura
            </button>
          </>
        ) : (
          <div className="w-full text-center text-xs font-semibold text-slate-400 py-1.5 italic uppercase tracking-wider">
            Todas las asignaturas oficiales de este año académico están en la grilla.
          </div>
        )}
      </div>
    </div>
  );
}
