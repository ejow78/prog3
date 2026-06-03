import { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function AdminDetallesCarrera({ carrera, onBack, onSave }) {
  // Inicializamos el formulario con los datos de la carrera (o vacío si es nueva)
  const [formData, setFormData] = useState({
    nombre: carrera?.nombre || '',
    tipo: carrera?.tipo || 'Tecnicatura Superior',
    duracion: carrera?.duracion || '3 Años',
    horario: carrera?.horario || '',
    descripcion: carrera?.descripcion || '',
    perfil: carrera?.perfil || '',
    habilidades: carrera?.habilidades || [],
    horariosSemanales: carrera?.horariosSemanales || [],
    id: carrera?.id
  });

  const [nuevaHabilidad, setNuevaHabilidad] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddHabilidad = (e) => {
    e.preventDefault(); // Prevenir submit del form si se usa enter
    if (nuevaHabilidad.trim() === '') return;
    setFormData({
      ...formData,
      habilidades: [...formData.habilidades, nuevaHabilidad.trim()]
    });
    setNuevaHabilidad('');
  };

  const handleRemoveHabilidad = (index) => {
    const newHabilidades = [...formData.habilidades];
    newHabilidades.splice(index, 1);
    setFormData({
      ...formData,
      habilidades: newHabilidades
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
            title="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              {carrera?.id ? `Editar: ${carrera.nombre}` : 'Crear Nueva Carrera'}
            </h3>
            <p className="text-xs text-slate-500">
              Modifica la información general, descripción y perfil profesional.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Columna Izquierda: Datos Básicos */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de la Carrera *</label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Ej: Tecnicatura Superior en..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo *</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  <option value="Tecnicatura Superior">Tecnicatura Superior</option>
                  <option value="Profesorado">Profesorado</option>
                  <option value="Curso">Curso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Duración *</label>
                <input
                  type="text"
                  name="duracion"
                  required
                  value={formData.duracion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Ej: 3 Años"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Horario de Cursado *</label>
              <input
                type="text"
                name="horario"
                required
                value={formData.horario}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Ej: Turno Noche: 18:00 - 22:30 hs"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción Breve *</label>
              <textarea
                name="descripcion"
                required
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                placeholder="Un resumen corto de qué trata la carrera..."
              />
            </div>
          </div>

          {/* Columna Derecha: Perfil y Habilidades */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Perfil Profesional *</label>
              <textarea
                name="perfil"
                required
                value={formData.perfil}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                placeholder="Descripción detallada de lo que el egresado será capaz de hacer..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Habilidades del Egresado</label>
              <p className="text-xs text-slate-500 mb-2">Añade línea por línea las habilidades que se mostrarán como lista (viñetas).</p>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={nuevaHabilidad}
                  onChange={(e) => setNuevaHabilidad(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHabilidad(e);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="Ej: Desarrollar aplicaciones web modernas..."
                />
                <button
                  type="button"
                  onClick={handleAddHabilidad}
                  className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center shrink-0"
                  title="Añadir habilidad"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg border border-slate-200 max-h-[160px] overflow-y-auto p-2">
                {formData.habilidades.length === 0 ? (
                  <div className="text-center text-sm text-slate-400 py-4 italic">
                    No se han añadido habilidades aún.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {formData.habilidades.map((hab, index) => (
                      <li key={index} className="flex justify-between items-start gap-2 bg-white p-2 rounded-md border border-slate-100 shadow-sm text-sm">
                        <span className="text-slate-700 leading-tight flex-1">{hab}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHabilidad(index)}
                          className="text-red-400 hover:text-red-600 p-1 bg-red-50 hover:bg-red-100 rounded transition-colors shrink-0"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors flex items-center gap-2 shadow-md shadow-primary/20"
          >
            <Save className="h-5 w-5" />
            Guardar Carrera
          </button>
        </div>
      </form>
    </div>
  );
}
