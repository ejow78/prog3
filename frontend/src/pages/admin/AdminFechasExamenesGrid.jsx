import { useState, useEffect, useContext } from 'react';
import { 
  Save, Plus, Trash2, ArrowLeft, Calendar, Clock, User, 
  CheckCircle2, AlertCircle, Search, Filter 
} from 'lucide-react';
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
  const years = getYearsList(carrera.duracion);

  const [turnoActivo, setTurnoActivo] = useState('Noviembre-Diciembre 2026');
  const [añoActivo, setAñoActivo] = useState(years[0]);
  const [llamadoActivo, setLlamadoActivo] = useState('Primer Llamado'); // 'Primer Llamado', 'Segundo Llamado', 'Especial'
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alerta, setAlerta] = useState({ texto: '', tipo: '' });

  // Lista de mesas de examen obtenidas de la BD para esta carrera
  const [mesas, setMesas] = useState([]);

  // Formulario rápido para programar una mesa
  const [nuevaMateria, setNuevaMateria] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('18:30');
  const [nuevoTribunal, setNuevoTribunal] = useState('');

  // Cargar lista de materias oficiales de la carrera
  const materiasDelAño = (() => {
    const plan = carrera.materias?.find(m => m.año === añoActivo);
    if (plan && plan.materiasDetalle && plan.materiasDetalle.length > 0) {
      return plan.materiasDetalle.map(d => d.nombre);
    }
    if (plan && plan.nombres && plan.nombres.length > 0) {
      return plan.nombres;
    }
    return [];
  })();

  const fetchMesas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fechas-examenes?carrera=${encodeURIComponent(carrera.nombre)}`);
      if (!response.ok) throw new Error('Error al cargar mesas');
      const data = await response.json();
      setMesas(data);
    } catch (err) {
      console.error(err);
      setAlerta({ texto: 'No se pudieron cargar las fechas de examen.', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, [carrera]);

  // Filtrar mesas para el turno, año y llamado activo
  const mesasFiltradas = mesas.filter(m => {
    const matchTurno = !turnoActivo || m.turno === turnoActivo;
    const matchLlamado = m.llamado === llamadoActivo;
    const matchAño = m.año ? m.año === añoActivo : true;
    return matchTurno && matchLlamado && matchAño;
  });

  const handleCrearMesa = async (e) => {
    e.preventDefault();
    if (!nuevaMateria.trim() || !nuevaFecha || !nuevoTribunal.trim()) {
      setAlerta({ texto: 'Por favor completa la materia, fecha y tribunal examinador.', tipo: 'error' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        carrera: carrera.nombre,
        turno: turnoActivo,
        llamado: llamadoActivo,
        año: añoActivo,
        materia: nuevaMateria.trim().toUpperCase(),
        fecha: nuevaFecha,
        hora: nuevaHora || '18:30',
        tribunal: nuevoTribunal.trim()
      };

      const response = await fetch('/api/fechas-examenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al programar mesa');

      setNuevaMateria('');
      setNuevaFecha('');
      setNuevoTribunal('');
      setAlerta({ texto: 'Mesa de examen programada con éxito.', tipo: 'exito' });
      fetchMesas();
    } catch (err) {
      setAlerta({ texto: err.message || 'Error al programar la mesa.', tipo: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarMesa = async (id, materiaNombre) => {
    if (!window.confirm(`¿Eliminar la mesa de examen para "${materiaNombre}"?`)) return;

    try {
      const response = await fetch(`/api/fechas-examenes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al eliminar');

      setAlerta({ texto: `Mesa de examen de "${materiaNombre}" eliminada.`, tipo: 'exito' });
      fetchMesas();
    } catch (err) {
      setAlerta({ texto: 'No se pudo eliminar la mesa.', tipo: 'error' });
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
            <p className="text-xs text-slate-500 font-medium">Cronograma oficial de mesas de exámenes finales y tribunales</p>
          </div>
        </div>

        {/* Selector de Turno de Examen */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Turno:</label>
          <input
            type="text"
            value={turnoActivo}
            onChange={(e) => setTurnoActivo(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:bg-white"
            placeholder="Ej: Noviembre-Diciembre 2026"
          />
        </div>
      </div>

      {alerta.texto && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-bold ${
          alerta.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {alerta.tipo === 'error' ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            <span>{alerta.texto}</span>
          </div>
          <button onClick={() => setAlerta({ texto: '', tipo: '' })} className="text-slate-400 hover:text-slate-700 font-bold">&times;</button>
        </div>
      )}

      {/* Pestañas de Años y Llamados */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Selector de Años */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setAñoActivo(y)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                añoActivo === y
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Selector de Llamados */}
        <div className="flex items-center gap-1.5 p-1 bg-blue-50/60 rounded-xl border border-blue-100">
          {['Primer Llamado', 'Segundo Llamado', 'Llamado Especial'].map((llamado) => (
            <button
              key={llamado}
              onClick={() => setLlamadoActivo(llamado)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                llamadoActivo === llamado
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-blue-700 hover:bg-blue-100/60'
              }`}
            >
              {llamado}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario Rápido de Mesa + Grilla de Mesas Programadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario para Crear Mesa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Plus className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Programar Mesa ({añoActivo})
            </h3>
          </div>

          <form onSubmit={handleCrearMesa} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Materia a Evaluar</label>
              <input
                type="text"
                list="sugerencias-materias-examen"
                placeholder="Selecciona o escribe materia..."
                value={nuevaMateria}
                onChange={(e) => setNuevaMateria(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary uppercase"
              />
              <datalist id="sugerencias-materias-examen">
                {materiasDelAño.map((m, i) => <option key={i} value={m} />)}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Fecha</label>
                <input
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Hora</label>
                <input
                  type="text"
                  placeholder="18:30"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tribunal Examinador</label>
              <input
                type="text"
                placeholder="Ej: Pérez (P), Gómez (V1), Ruiz (V2)"
                value={nuevoTribunal}
                onChange={(e) => setNuevoTribunal(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer mt-2 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : '+ Programar Mesa'}
            </button>
          </form>
        </div>

        {/* Lista de Mesas del Llamado Seleccionado */}
        <div className="lg:col-span-2 space-y-3">
          {mesasFiltradas.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 shadow-2xs">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No hay mesas programadas</p>
              <p className="text-xs text-slate-400 mt-0.5">
                No hay fechas de examen registradas para {añoActivo} en el {llamadoActivo}.
              </p>
            </div>
          ) : (
            mesasFiltradas.map((mesa) => (
              <div
                key={mesa._id}
                className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {mesa.año || añoActivo}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      📅 {mesa.fecha} — ⏰ {mesa.hora} hs
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{mesa.materia}</h4>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Tribunal:</strong> {mesa.tribunal}
                  </p>
                </div>

                <button
                  onClick={() => handleEliminarMesa(mesa._id, mesa.materia)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Eliminar mesa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
