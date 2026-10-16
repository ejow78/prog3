// ==================================================================================
// GUÍA DE DEFENSA TÉCNICA - COMPONENTE: AdminMensajes.jsx
// ==================================================================================
// Este archivo gestiona la lectura, modificación de estado (leído/no leído) y 
// eliminación física de las consultas recibidas desde el formulario de contacto.
// Implementa el ciclo completo de consumo de una API REST utilizando React y Fetch.
// ==================================================================================

// 1. IMPORTACIONES DE HERRAMIENTAS Y LIBRERÍAS
// ----------------------------------------------------------------------------------
// useState: Hook de React para crear "variables de estado" que, al cambiar, re-renderizan la pantalla.
// useEffect: Hook para ejecutar efectos secundarios (como pedir datos al servidor cuando la página carga).
import { useState, useEffect } from 'react';

// Iconos visuales modernos provistos por la librería Lucide-React
import { Mail, MailOpen, Trash2, AlertCircle } from 'lucide-react';

// Contexto global de autenticación: provee los datos de la sesión del administrador
import { AuthContext } from '../../contexts/AuthContext';

// useContext: Hook de React que permite suscribirse a un contexto global sin pasar props manualmente
import { useContext } from 'react';


// 2. DECLARACIÓN DEL COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------------------
export default function AdminMensajes() {

  // --------------------------------------------------------------------------------
  // A. DECLARACIÓN DE ESTADOS LOCALES (useState)
  // --------------------------------------------------------------------------------
  
  // 'mensajes': Arreglo (array) que almacenará la lista de consultas traídas desde MongoDB.
  // Inicia como un arreglo vacío [].
  const [mensajes, setMensajes] = useState([]);

  // 'loading': Booleano que indica si la petición de red todavía está viajando.
  // Inicia en true para mostrar la animación de carga mientras esperamos al backend.
  const [loading, setLoading] = useState(true);

  // 'mensajeUI': Objeto para mostrar alertas visuales de éxito o error al usuario.
  const [mensajeUI, setMensajeUI] = useState({ texto: '', tipo: '' });

  // 'token': Obtenemos el Token JWT del administrador logueado desde el AuthContext.
  // Es la "llave de seguridad" que debemos enviarle al backend para que nos autorice.
  const { token } = useContext(AuthContext);


  // --------------------------------------------------------------------------------
  // B. FUNCIÓN PARA OBTENER DATOS (LECTURA - OPERACIÓN GET)
  // --------------------------------------------------------------------------------
  // 'async': Le avisa al navegador que esta función contiene tareas asíncronas de red.
  const fetchMensajes = async () => {
    try {
      // 'fetch': Función nativa de JS que dispara la petición HTTP por internet.
      // 'await': Pausa la función hasta que el servidor backend responde la Promesa.
      const response = await fetch('/api/mensajes', {
        headers: { 
          // Enviamos el Token en la cabecera Authorization (Bearer Token)
          'Authorization': `Bearer ${token}` 
        }
      });

      // response.ok es true si el código HTTP está entre 200 y 299.
      // Si el servidor devolvió 401 (no autorizado) o 500 (error), lanzamos un error manual.
      if (!response.ok) throw new Error('Error al obtener mensajes');

      // response.json() desempaqueta la respuesta del servidor y la transforma en arreglo JS.
      const data = await response.json();

      // Actualizamos el estado con los datos frescos de MongoDB.
      setMensajes(data);

    } catch (error) {
      // Si se cortó internet o falló el backend, el código salta acá sin romper la app.
      console.error(error);
      setMensajeUI({ texto: 'Error al cargar los mensajes', tipo: 'error' });
    } finally {
      // 'finally' se ejecuta SIEMPRE, haya salido todo bien o con error.
      // Apagamos el spinner de carga para mostrar el contenido final.
      setLoading(false);
    }
  };


  // --------------------------------------------------------------------------------
  // C. CICLO DE VIDA (useEffect)
  // --------------------------------------------------------------------------------
  // Este hook se ejecuta automáticamente cuando el componente se dibuja por primera vez en pantalla.
  // El arreglo de dependencias vacío [] al final le dice a React: "Ejecutate solo al montar la página (Mount)".
  useEffect(() => {
    fetchMensajes();
  }, []);


  // --------------------------------------------------------------------------------
  // D. FUNCIÓN PARA MODIFICAR (ACTUALIZACIÓN - OPERACIÓN PUT)
  // --------------------------------------------------------------------------------
  // Cambia el estado del mensaje entre "Leído" y "No Leído".
  const toggleLeido = async (id, estadoActual) => {
    try {
      // Petición HTTP al endpoint de modificación usando el verbo PUT
      const response = await fetch(`/api/mensajes/${id}/leido`, {
        method: 'PUT', // Verbo HTTP para modificar
        headers: { 
          'Content-Type': 'application/json', // Le aclaramos al backend que enviamos un JSON
          'Authorization': `Bearer ${token}`   // Llave de seguridad
        },
        // Invertimos el valor booleano: si estaba false pasa a true, y viceversa.
        body: JSON.stringify({ leido: !estadoActual }) 
      });

      if (!response.ok) throw new Error('Error al actualizar el estado');
      
      // Una vez confirmado el cambio en MongoDB, refrescamos la lista
      fetchMensajes();

    } catch (error) {
      console.error(error);
      setMensajeUI({ texto: 'Error al actualizar el estado', tipo: 'error' });
      // Limpiamos la alerta luego de 3 segundos
      setTimeout(() => setMensajeUI({ texto: '', tipo: '' }), 3000);
    }
  };


  // --------------------------------------------------------------------------------
  // E. FUNCIÓN PARA ELIMINAR (ELIMINACIÓN - OPERACIÓN DELETE)
  // --------------------------------------------------------------------------------
  const eliminarMensaje = async (id) => {
    // window.confirm muestra el cartel nativo del navegador con botones "Aceptar" y "Cancelar".
    // Si el usuario presiona "Cancelar", la función se corta de inmediato (return).
    if (!window.confirm('¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.')) return;
    
    try {
      // Petición HTTP con verbo DELETE hacia el backend
      const response = await fetch(`/api/mensajes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al eliminar el mensaje');
      
      // Notificación de éxito
      setMensajeUI({ texto: 'Mensaje eliminado', tipo: 'exito' });

      // Volvemos a consultar la base de datos para que la lista quede actualizada
      fetchMensajes();

    } catch (error) {
      console.error(error);
      setMensajeUI({ texto: 'Error al eliminar el mensaje', tipo: 'error' });
    }

    setTimeout(() => setMensajeUI({ texto: '', tipo: '' }), 3000);
  };


  // --------------------------------------------------------------------------------
  // F. RENDERIZADO CONDICIONAL DE CARGA
  // --------------------------------------------------------------------------------
  // Si loading es true, devolvemos un spinner giratorio y no mostramos la pantalla todavía.
  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }


  // --------------------------------------------------------------------------------
  // G. RENDERIZADO DE LA INTERFAZ VISUAL (JSX)
  // --------------------------------------------------------------------------------
  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* Título de la sección */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Bandeja de Mensajes</h2>
        <p className="text-slate-500 text-sm mt-1">Lee y gestiona las consultas recibidas desde la página de contacto.</p>
      </div>

      {/* Cartel de Alerta (Renderizado condicional: solo se dibuja si mensajeUI.texto tiene contenido) */}
      {mensajeUI.texto && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${mensajeUI.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          <AlertCircle className="h-5 w-5" />
          {mensajeUI.texto}
        </div>
      )}

      {/* Contenedor principal de mensajes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Caso 1: Arreglo vacío (no hay mensajes) */}
        {mensajes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay mensajes en la bandeja de entrada.
          </div>
        ) : (
          /* Caso 2: Iteramos el arreglo con el método .map() */
          <div className="divide-y divide-slate-200">
            {mensajes.map((msg) => (
              <div 
                // key={msg._id}: Obligatorio en React para que identifique cada elemento del DOM eficientemente
                key={msg._id} 
                // Si el mensaje no está leído, se resalta con fondo azul tenue (bg-blue-50/50)
                className={`p-6 transition-colors ${msg.leido ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Columna Izquierda: Información de la consulta */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {/* Puntito indicador de no leído */}
                      {!msg.leido && (
                        <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" title="Mensaje no leído"></span>
                      )}
                      
                      {/* Asunto */}
                      <h3 className={`text-lg ${msg.leido ? 'font-medium text-slate-800' : 'font-bold text-slate-900'}`}>
                        {msg.asunto || 'Sin Asunto'}
                      </h3>
                      
                      {/* Fecha formateada con toLocaleString en horario argentino */}
                      <span className="text-xs text-slate-500 ml-auto md:ml-4 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })} hs
                      </span>
                    </div>
                    
                    {/* Datos del remitente */}
                    <div className="text-sm text-slate-600 font-medium mb-3">
                      De: {msg.nombre} {msg.apellido} &lt;<a href={`mailto:${msg.email}`} className="text-primary hover:underline">{msg.email}</a>&gt;
                      {msg.telefono && <span className="ml-3 text-slate-500">Tel: {msg.telefono}</span>}
                    </div>
                    
                    {/* Cuerpo del mensaje */}
                    <div className="text-slate-700 text-sm whitespace-pre-wrap bg-white/50 p-4 rounded-lg border border-slate-100 mt-2">
                      {msg.mensaje}
                    </div>
                  </div>
                  
                  {/* Columna Derecha: Botones de Acción */}
                  <div className="flex items-center gap-2 md:flex-col justify-end shrink-0 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 mt-4 md:mt-0">
                    
                    {/* Botón para Modificar Estado (PUT) */}
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
                    
                    {/* Botón para Eliminar (DELETE) */}
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
