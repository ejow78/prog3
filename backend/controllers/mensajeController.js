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
    const includeDeleted = req.query.includeDeleted === 'true';
    const query = includeDeleted ? {} : { isDeleted: { $ne: true } };
    const mensajes = await Mensaje.find(query).sort({ createdAt: -1 }); // Los más recientes primero
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

// Borrado lógico (Soft delete) de un mensaje
export const deleteMensaje = async (req, res) => {
  try {
    const mensaje = await Mensaje.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.admin ? `${req.admin.username} (${req.admin.role})` : 'Sistema'
      },
      { new: true }
    );
    if (!mensaje) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }
    await logAudit(req, 'ELIMINAR_MENSAJE', 'Mensajes', `Se envió a papelera el mensaje de ${mensaje.nombre} ${mensaje.apellido || ''} (Email: ${mensaje.email})`);
    res.json({ message: 'Mensaje enviado a papelera de reciclaje', mensaje });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el mensaje', error: error.message });
  }
};

// Restaurar mensaje desde la papelera
export const restoreMensaje = async (req, res) => {
  try {
    const mensaje = await Mensaje.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      },
      { new: true }
    );
    if (!mensaje) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }
    await logAudit(req, 'RESTAURAR_MENSAJE', 'Mensajes', `Se restauró el mensaje de ${mensaje.nombre} ${mensaje.apellido || ''}`);
    res.json({ message: 'Mensaje restaurado correctamente', mensaje });
  } catch (error) {
    res.status(500).json({ message: 'Error al restaurar el mensaje', error: error.message });
  }
};
