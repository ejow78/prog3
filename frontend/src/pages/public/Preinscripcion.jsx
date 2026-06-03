import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function Preinscripcion() {
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  
  // Settings checking
  const [settings, setSettings] = useState({ preinscripcionesAbiertas: true });
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    genero: '',
    telefono: '',
    email: '',
    localidad: '',
    carrera: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const paramCarrera = searchParams.get('carrera');
    if (paramCarrera) {
      setFormData(prev => ({ ...prev, carrera: paramCarrera }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/preinscripciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar la preinscripción');
      }
      
      setEnviado(true);
      setFormData({
        nombre: '', apellido: '', dni: '', genero: '', 
        telefono: '', email: '', localidad: '', carrera: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (settings.isPreinscripcionesOpen === false) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-slate-200">
          <AlertCircle className="h-20 w-20 text-amber-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Preinscripciones Cerradas</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {settings.preinscripcionesMensaje || "El periodo de preinscripciones para las carreras del IES La Cocha se encuentra temporalmente cerrado."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-md text-sm font-semibold"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-slate-100">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Preinscripción Exitosa!</h2>
          <p className="text-slate-600 mb-6">
            Hemos recibido tus datos correctamente. Nos pondremos en contacto contigo pronto con los siguientes pasos.
          </p>
          <button
            onClick={() => setEnviado(false)}
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Volver al formulario
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-16 animate-fade-in min-h-[calc(100vh-10rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-primary to-primary-dark p-8 md:p-12 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">Formulario de Preinscripción</h1>
            <p className="text-primary-100">Completá tus datos para iniciar el proceso de admisión.</p>
          </div>

          <div className="p-8 md:p-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input 
                    required 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                    placeholder="Juan" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                  <input 
                    required 
                    type="text" 
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                    placeholder="Pérez" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                  <input 
                    required 
                    type="text" 
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                    placeholder="Sin puntos" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Género</label>
                  <select 
                    required
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input 
                    required 
                    type="tel" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                    placeholder="Ej: 3865 123456" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    required 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                    placeholder="juan@ejemplo.com" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Localidad</label>
                <input 
                  required 
                  type="text" 
                  name="localidad"
                  value={formData.localidad}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                  placeholder="Ciudad, Provincia" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Carrera de Interés</label>
                <select
                  required
                  name="carrera"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                  value={formData.carrera}
                  onChange={handleChange}
                >
                  <option value="">Seleccione una carrera...</option>
                  <option value="Tecnicatura Superior en Desarrollo de Software">Tecnicatura Superior en Desarrollo de Software</option>
                  <option value="Tecnicatura Superior en Agropecuaria">Tecnicatura Superior en Agropecuaria</option>
                  <option value="Tecnicatura Superior en Agroindustria">Tecnicatura Superior en Agroindustria</option>
                  <option value="Profesorado de Educación Secundaria en Matemática">Profesorado de Educación Secundaria en Matemática</option>
                  <option value="Profesorado de Educación Secundaria en Historia">Profesorado de Educación Secundaria en Historia</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg flex justify-center items-center gap-2 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Preinscribirme
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
