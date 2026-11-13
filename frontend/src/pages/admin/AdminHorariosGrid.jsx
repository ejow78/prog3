import { useState } from 'react';
import { Save, Plus, Trash2, ArrowLeft, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

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

export default function AdminHorariosGrid({ carrera, onBack, onSave }) {
  const yearsList = getYearsList(carrera.duracion);

  // Inicializar estado de horarios por año
  const [horarios, setHorarios] = useState(() => {
    return yearsList.map(yName => {
      const existing = carrera.horariosSemanales?.find(h => h.año === yName);
      return existing 
        ? JSON.parse(JSON.stringify(existing)) 
        : { año: yName, franjas: [] };
    });
  });

  const [añoActivoIndex, setAñoActivoIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [alerta, setAlerta] = useState({ texto: '', tipo: '' });

  const dias = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
  ];

  const currentYearObj = horarios[añoActivoIndex] || { año: yearsList[0], franjas: [] };
  const franjas = currentYearObj.franjas || [];

  // Obtener sugerencias de materias cargadas en la carrera para este año
  const getSugerenciasMaterias = () => {
    const activeAño = currentYearObj.año;
    const plan = carrera.materias?.find(m => m.año === activeAño);
    if (plan && plan.materiasDetalle && plan.materiasDetalle.length > 0) {
      return plan.materiasDetalle;
    }
    if (plan && plan.nombres && plan.nombres.length > 0) {
      return plan.nombres.map(n => ({ nombre: n, profesor: '' }));
    }
    return [];
  };

  const sugerencias = getSugerenciasMaterias();

  const handleAddFranja = () => {
    const copy = [...horarios];
    copy[añoActivoIndex].franjas.push({
      hora: '18:30 a 19:15',
      esRecreo: false,
      lunes: { materia: '', profesor: '' },
      martes: { materia: '', profesor: '' },
      miercoles: { materia: '', profesor: '' },
      jueves: { materia: '', profesor: '' },
      viernes: { materia: '', profesor: '' },
    });
    setHorarios(copy);
  };

  const handleAddRecreo = () => {
    const copy = [...horarios];
    copy[añoActivoIndex].franjas.push({
      hora: '20:45 a 21:00',
      esRecreo: true,
      lunes: { materia: 'RECREO', profesor: '' },
      martes: { materia: 'RECREO', profesor: '' },
      miercoles: { materia: 'RECREO', profesor: '' },
      jueves: { materia: 'RECREO', profesor: '' },
      viernes: { materia: 'RECREO', profesor: '' },
    });
    setHorarios(copy);
  };

  const handleRemoveFranja = (index) => {
    const copy = [...horarios];
    copy[añoActivoIndex].franjas.splice(index, 1);
    setHorarios(copy);
  };

  const handleUpdateFranjaHora = (index, value) => {
    const copy = [...horarios];
    copy[añoActivoIndex].franjas[index].hora = value;
    setHorarios(copy);
  };

  const handleUpdateCelda = (franjaIndex, diaKey, materiaNombre) => {
    const copy = [...horarios];
    const franja = copy[añoActivoIndex].franjas[franjaIndex];
    
    // Auto-asignar docente si está en la lista de materias de la carrera
    const foundDocente = sugerencias.find(s => s.nombre === materiaNombre)?.profesor || '';

    franja[diaKey] = {
      materia: materiaNombre,
      profesor: foundDocente || franja[diaKey]?.profesor || ''
    };
    setHorarios(copy);
  };

  const handleUpdateDocente = (franjaIndex, diaKey, docenteNombre) => {
    const copy = [...horarios];
    const franja = copy[añoActivoIndex].franjas[franjaIndex];
    if (!franja[diaKey]) {
      franja[diaKey] = { materia: '', profesor: '' };
    }
    franja[diaKey].profesor = docenteNombre;
    setHorarios(copy);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(carrera.id, { horariosSemanales: horarios });
      setAlerta({ texto: 'Cronograma semanal guardado correctamente.', tipo: 'exito' });
      setTimeout(() => setAlerta({ texto: '', tipo: '' }), 3000);
    } catch (err) {
      setAlerta({ texto: 'Error al guardar los horarios.', tipo: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-snug">{carrera.nombre}</h2>
            <p className="text-xs text-slate-500 font-medium">Planificación de horarios semanales y distribución por módulos</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar Horarios'}
        </button>
      </div>

      {alerta.texto && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-xs font-bold ${
          alerta.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {alerta.tipo === 'error' ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{alerta.texto}</span>
        </div>
      )}

      {/* Selector de Años */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {yearsList.map((yName, index) => (
          <button
            key={yName}
            onClick={() => setAñoActivoIndex(index)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              añoActivoIndex === index
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {yName}
          </button>
        ))}
      </div>

      {/* Controles de Acción: Agregar Franja o Recreo */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddFranja}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-primary hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Módulo de Clase
          </button>
          <button
            onClick={handleAddRecreo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            + Franja de Recreo
          </button>
        </div>
        <span className="text-xs text-slate-400 font-semibold">{franjas.length} Módulos configurados</span>
      </div>

      {/* Grilla Semanal Limpia y Clara */}
      {franjas.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 shadow-2xs">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No hay módulos de horario configurados para {currentYearObj.año}</p>
          <p className="text-xs text-slate-400 mt-0.5">Haz clic en "+ Módulo de Clase" arriba para comenzar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="p-3.5 w-36">Horario</th>
                {dias.map(d => (
                  <th key={d.key} className="p-3.5">{d.label}</th>
                ))}
                <th className="p-3.5 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {franjas.map((franja, fIdx) => {
                if (franja.esRecreo) {
                  return (
                    <tr key={fIdx} className="bg-amber-50/40">
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={franja.hora}
                          onChange={(e) => handleUpdateFranjaHora(fIdx, e.target.value)}
                          className="w-full px-2 py-1 bg-amber-100/60 border border-amber-200 rounded text-center text-xs font-bold text-amber-900 outline-none"
                        />
                      </td>
                      <td colSpan={5} className="p-2.5 text-center font-bold text-amber-800 uppercase tracking-widest text-[11px]">
                        ☕ Recreo Institucional
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleRemoveFranja(fIdx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={fIdx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-2.5 align-top">
                      <input
                        type="text"
                        value={franja.hora}
                        onChange={(e) => handleUpdateFranjaHora(fIdx, e.target.value)}
                        placeholder="18:30 a 19:15"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary"
                      />
                    </td>
                    {dias.map(d => {
                      const celda = franja[d.key] || { materia: '', profesor: '' };
                      return (
                        <td key={d.key} className="p-2.5 align-top space-y-1">
                          {/* Selector o texto de materia */}
                          <input
                            type="text"
                            list={`sug-${añoActivoIndex}`}
                            value={celda.materia}
                            onChange={(e) => handleUpdateCelda(fIdx, d.key, e.target.value)}
                            placeholder="Materia..."
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800 outline-none focus:border-primary uppercase"
                          />
                          {/* Docente */}
                          <input
                            type="text"
                            value={celda.profesor}
                            onChange={(e) => handleUpdateDocente(fIdx, d.key, e.target.value)}
                            placeholder="Docente..."
                            className="w-full px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[11px] text-slate-600 outline-none focus:bg-white"
                          />
                        </td>
                      );
                    })}
                    <td className="p-2.5 align-middle text-center">
                      <button
                        onClick={() => handleRemoveFranja(fIdx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar franja"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Datalist para autocompletar materias del año */}
          <datalist id={`sug-${añoActivoIndex}`}>
            {sugerencias.map((s, i) => (
              <option key={i} value={s.nombre}>{s.profesor ? `Docente: ${s.profesor}` : ''}</option>
            ))}
          </datalist>
        </div>
      )}
    </div>
  );
}
