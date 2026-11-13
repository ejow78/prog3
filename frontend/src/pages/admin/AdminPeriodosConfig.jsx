import { useState, useEffect, useContext } from 'react';
import { 
  Calendar, Clock, Save, CheckCircle2, AlertCircle, ArrowLeft, 
  CalendarDays, Settings, Sparkles, Check, X, ShieldAlert 
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPeriodosConfig() {
  const { token, admin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alerta, setAlerta] = useState({ texto: '', tipo: '' });

  const [formData, setFormData] = useState({
    activeYear: new Date().getFullYear(),
    preinscripcionesAbiertas: true,
    preinscripcionesInicio: '',
    preinscripcionesFin: '',
    examenesAbiertos: true,
    examenes1LlamadoInicio: '',
    examenes1LlamadoFin: '',
    examenes2LlamadoInicio: '',
    examenes2LlamadoFin: '',
    examenesEspLlamadoInicio: '',
    examenesEspLlamadoFin: ''
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Error al cargar la configuración');
      const data = await res.json();
      
      setFormData({
        activeYear: data.activeYear || new Date().getFullYear(),
        preinscripcionesAbiertas: data.preinscripcionesAbiertas ?? true,
        preinscripcionesInicio: data.preinscripcionesInicio ? data.preinscripcionesInicio.substring(0, 10) : '',
        preinscripcionesFin: data.preinscripcionesFin ? data.preinscripcionesFin.substring(0, 10) : '',
        examenesAbiertos: data.examenesAbiertos ?? true,
        examenes1LlamadoInicio: data.examenes1LlamadoInicio ? data.examenes1LlamadoInicio.substring(0, 10) : '',
        examenes1LlamadoFin: data.examenes1LlamadoFin ? data.examenes1LlamadoFin.substring(0, 10) : '',
        examenes2LlamadoInicio: data.examenes2LlamadoInicio ? data.examenes2LlamadoInicio.substring(0, 10) : '',
        examenes2LlamadoFin: data.examenes2LlamadoFin ? data.examenes2LlamadoFin.substring(0, 10) : '',
        examenesEspLlamadoInicio: data.examenesEspLlamadoInicio ? data.examenesEspLlamadoInicio.substring(0, 10) : '',
        examenesEspLlamadoFin: data.examenesEspLlamadoFin ? data.examenesEspLlamadoFin.substring(0, 10) : ''
      });
    } catch (err) {
      console.error(err);
      setAlerta({ texto: 'No se pudo cargar la configuración de fechas.', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al guardar los cambios');
      }

      const updated = await res.json();
      setAlerta({ texto: 'Fechas y calendario escolar actualizados correctamente.', tipo: 'exito' });
    } catch (err) {
      console.error(err);
      setAlerta({ texto: err.message || 'Error al conectar con el servidor', tipo: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setAlerta({ texto: '', tipo: '' }), 4000);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-slate-500 text-xs font-semibold">Cargando configuración del ciclo lectivo...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-50 text-primary border border-blue-100">
            <CalendarDays className="w-3.5 h-3.5" />
            Calendario y Periodos Lectivos
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Configuración de Inscripciones y Fechas
          </h2>
          <p className="text-slate-500 text-xs md:text-sm">
            Control de fechas límites para preinscripciones de aspirantes y llamados a exámenes finales (1°, 2° y Especial).
          </p>
        </div>

        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel
        </button>
      </div>

      {alerta.texto && (
        <div className={`p-4 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-xs ${
          alerta.tipo === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {alerta.tipo === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span>{alerta.texto}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección 1: Ciclo Lectivo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Año / Ciclo Lectivo Activo
              </h3>
              <p className="text-xs text-slate-400">
                Determina el año para el filtrado de inscripciones, libros de actas y registros.
              </p>
            </div>
          </div>

          <div className="max-w-xs">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Año Escolar
            </label>
            <input
              type="number"
              min="2020"
              max="2035"
              value={formData.activeYear}
              onChange={(e) => setFormData({ ...formData, activeYear: parseInt(e.target.value, 10) || 2026 })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
        </div>

        {/* Sección 2: Preinscripciones de Ingreso */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Preinscripciones a Carreras (Ingresantes)
                </h3>
                <p className="text-xs text-slate-400">
                  Control de recepción de aspirantes mediante el formulario público web.
                </p>
              </div>
            </div>

            {/* Switch Habilitar / Deshabilitar */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <span className={`text-xs font-bold ${formData.preinscripcionesAbiertas ? 'text-emerald-700' : 'text-slate-400'}`}>
                {formData.preinscripcionesAbiertas ? 'Periodo Habilitado' : 'Periodo Cerrado'}
              </span>
              <input
                type="checkbox"
                checked={formData.preinscripcionesAbiertas}
                onChange={(e) => setFormData({ ...formData, preinscripcionesAbiertas: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Fecha de Inicio de Preinscripción (Opcional)
              </label>
              <input
                type="date"
                value={formData.preinscripcionesInicio}
                onChange={(e) => setFormData({ ...formData, preinscripcionesInicio: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Fecha Límite / Cierre (Opcional)
              </label>
              <input
                type="date"
                value={formData.preinscripcionesFin}
                onChange={(e) => setFormData({ ...formData, preinscripcionesFin: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Si no completas las fechas límites, las preinscripciones se mantendrán abiertas de forma continua mientras el interruptor esté activo.
          </p>
        </div>

        {/* Sección 3: Inscripciones a Exámenes Finales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Inscripciones a Mesas de Exámenes Finales
                </h3>
                <p className="text-xs text-slate-400">
                  Configura los periodos de habilitación para el 1° llamado, 2° llamado y llamado especial.
                </p>
              </div>
            </div>

            {/* Switch Maestro de Exámenes */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <span className={`text-xs font-bold ${formData.examenesAbiertos ? 'text-primary' : 'text-slate-400'}`}>
                {formData.examenesAbiertos ? 'Inscripciones Habilitadas' : 'Inscripciones Cerradas'}
              </span>
              <input
                type="checkbox"
                checked={formData.examenesAbiertos}
                onChange={(e) => setFormData({ ...formData, examenesAbiertos: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative"></div>
            </label>
          </div>

          <div className="space-y-6">
            {/* 1° Llamado */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Fechas del 1° Llamado a Exámenes
                </h4>
                {(formData.examenes1LlamadoInicio || formData.examenes1LlamadoFin) && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, examenes1LlamadoInicio: '', examenes1LlamadoFin: '' })}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Limpiar fechas
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Inicio de Inscripción
                  </label>
                  <input
                    type="date"
                    value={formData.examenes1LlamadoInicio}
                    onChange={(e) => setFormData({ ...formData, examenes1LlamadoInicio: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Cierre de Inscripción
                  </label>
                  <input
                    type="date"
                    value={formData.examenes1LlamadoFin}
                    onChange={(e) => setFormData({ ...formData, examenes1LlamadoFin: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* 2° Llamado */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  Fechas del 2° Llamado a Exámenes
                </h4>
                {(formData.examenes2LlamadoInicio || formData.examenes2LlamadoFin) && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, examenes2LlamadoInicio: '', examenes2LlamadoFin: '' })}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Limpiar fechas
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Inicio de Inscripción
                  </label>
                  <input
                    type="date"
                    value={formData.examenes2LlamadoInicio}
                    onChange={(e) => setFormData({ ...formData, examenes2LlamadoInicio: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Cierre de Inscripción
                  </label>
                  <input
                    type="date"
                    value={formData.examenes2LlamadoFin}
                    onChange={(e) => setFormData({ ...formData, examenes2LlamadoFin: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Llamado Especial */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  Fechas del Llamado Especial
                </h4>
                {(formData.examenesEspLlamadoInicio || formData.examenesEspLlamadoFin) && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, examenesEspLlamadoInicio: '', examenesEspLlamadoFin: '' })}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Limpiar fechas
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Inicio de Inscripción
                  </label>
                  <input
                    type="date"
                    value={formData.examenesEspLlamadoInicio}
                    onChange={(e) => setFormData({ ...formData, examenesEspLlamadoInicio: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Cierre de Inscripción
                  </label>
                  <input
                    type="date"
                    value={formData.examenesEspLlamadoFin}
                    onChange={(e) => setFormData({ ...formData, examenesEspLlamadoFin: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardar Cambios...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  );
}
