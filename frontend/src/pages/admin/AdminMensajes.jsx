import { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';

export default function AdminMensajes() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeUI, setMensajeUI] = useState({ texto: '', tipo: '' });
  const { token } = useContext(AuthContext);

  const fetchMensajes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/mensajes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener mensajes');
      const data = await response.json();
      setMensajes(data);
    } catch (error) {
      console.error(error);
      setMensajeUI({ texto: 'Error al cargar los mensajes', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMensajes();
  }, []);

  const toggleLeido = async (id, estadoActual) => {
    try {
      const response = await fetch(`http://localhost:5000/api/mensajes/${id}/leido`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ leido: !estadoActual })
      });
      if (!response.ok) throw new Error('Error al actualizar el estado');
      
      fetchMensajes();
    } catch (error) {
      console.error(error);
      setMensajeUI({ texto: 'Error al actualizar el estado', tipo: 'error' });
      setTimeout(() => setMensajeUI({ texto: '', tipo: '' }), 3000);
    }
  };

  const eliminarMensaje = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/mensajes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al eliminar el mensaje');
      
      setMensajeUI({ texto: 'Mensaje eliminado', tipo: 'exito' });
      fetchMensajes();
    } catch (error) {
      console.error(error);
      setMensajeUI({ texto: 'Error al eliminar el mensaje', tipo: 'error' });
    }
    setTimeout(() => setMensajeUI({ texto: '', tipo: '' }), 3000);
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Bandeja de Mensajes</h2>
        <p className="text-slate-500 text-sm mt-1">Lee y gestiona las consultas recibidas desde la página de contacto.</p>
      </div>

      {mensajeUI.texto && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${mensajeUI.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          <AlertCircle className="h-5 w-5" />
          {mensajeUI.texto}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {mensajes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay mensajes en la bandeja de entrada.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {mensajes.map((msg) => (
              <div 
                key={msg._id} 
                className={`p-6 transition-colors ${msg.leido ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {!msg.leido && (
                        <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" title="Mensaje no leído"></span>
                      )}
                      <h3 className={`text-lg ${msg.leido ? 'font-medium text-slate-800' : 'font-bold text-slate-900'}`}>
                        {msg.asunto || 'Sin Asunto'}
                      </h3>
                      <span className="text-xs text-slate-500 ml-auto md:ml-4 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })} hs
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-600 font-medium mb-3">
                      De: {msg.nombre} {msg.apellido} &lt;<a href={`mailto:${msg.email}`} className="text-primary hover:underline">{msg.email}</a>&gt;
                      {msg.telefono && <span className="ml-3 text-slate-500">Tel: {msg.telefono}</span>}
                    </div>
                    
                    <div className="text-slate-700 text-sm whitespace-pre-wrap bg-white/50 p-4 rounded-lg border border-slate-100 mt-2">
                      {msg.mensaje}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:flex-col justify-end shrink-0 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 mt-4 md:mt-0">
                    <button
                      onClick={() => toggleLeido(msg._id, msg.leido)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors w-full md:w-auto justify-center ${
                        msg.leido 
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {msg.leido ? (
                        <><MailOpen className="h-4 w-4" /> Marcar como no leído</>
                      ) : (
                        <><Mail className="h-4 w-4" /> Marcar como leído</>
                      )}
                    </button>
                    
                    <button
                      onClick={() => eliminarMensaje(msg._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md text-sm font-medium transition-colors w-full md:w-auto justify-center"
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
