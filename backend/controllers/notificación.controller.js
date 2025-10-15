import Notificaciones from "../models/Notificaciones.js";
import Usuario from "../models/Usuario.js";

// Crear una nueva notificación
export const createNotificacion = async (req, res, t) => {
  try {
    const { titulo, mensaje, usuarioId } = req.body;
    if (!titulo || !mensaje || !usuarioId) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const nuevaNotificacion = await Notificaciones.create({
      titulo,
      mensaje,
      usuarioId,
    });
    res
      .status(201)
      .json({ message: "Notificación creada", data: nuevaNotificacion });
  } catch (error) {
    res.status(500).json({ message: "Error al crear notificación", error });
  }
};
