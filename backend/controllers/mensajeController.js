import Mensaje from '../models/Mensaje.js';
import { logAudit } from '../utils/auditLogger.js';

// Crear un nuevo mensaje de contacto
export const crearMensaje = async (req, res) => {
  try {
    const nuevoMensaje = new Mensaje(req.body);
    await nuevoMensaje.save();
    
    res.status(201).json({ 
      message: 'Mensaje enviado con éxito',
      mensaje: nuevoMensaje
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar el mensaje', error: error.message });
  }
};

// Obtener todos los mensajes (Para el admin dashboard)
export const getMensajes = async (req, res) => {
  try {
    const mensajes = await Mensaje.find({}).sort({ createdAt: -1 }); // Los más recientes primero
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los mensajes', error: error.message });
  }
};

// Alternar el estado de leído/no leído
export const toggleLeido = async (req, res) => {
  try {
    const { id } = req.params;
    const { leido } = req.body;

    const mensajeActualizado = await Mensaje.findByIdAndUpdate(
      id,
      { leido },
      { new: true }
    );

    if (!mensajeActualizado) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    await logAudit(req, leido ? 'LEER_MENSAJE' : 'NO_LEER_MENSAJE', 'Mensajes', `Se marcó como ${leido ? 'leído' : 'no leído'} el mensaje de ${mensajeActualizado.nombre} ${mensajeActualizado.apellido || ''} (Email: ${mensajeActualizado.email})`);

    res.json({
      message: `Mensaje marcado como ${leido ? 'leído' : 'no leído'}`,
      mensaje: mensajeActualizado
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado del mensaje', error: error.message });
  }
};

// Borrar un mensaje
export const deleteMensaje = async (req, res) => {
  try {
    const mensaje = await Mensaje.findByIdAndDelete(req.params.id);
    if (!mensaje) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }
    await logAudit(req, 'ELIMINAR_MENSAJE', 'Mensajes', `Se eliminó el mensaje de ${mensaje.nombre} ${mensaje.apellido || ''} (Email: ${mensaje.email})`);
    res.json({ message: 'Mensaje eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el mensaje', error: error.message });
  }
};
