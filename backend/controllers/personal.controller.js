import Personal from "../models/Personal.js";
import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";

//Los personales ya son creados en el controlador de usuarios crear usuario

//Obtener todos los personales
export const getAllPersonales = async (req, res) => {
  try {
    const personales = await Personal.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: {
        model: Usuario,
        as: "usuario",
        attributes: ["id", "nombre", "email", "estado"],
        include: { model: Rol, as: "rol", attributes: ["rol"] },
      },
    });

    // 🔹 Convertimos cada registro en un objeto plano
    const data = personales.map((p) => ({
      id: p.id,
      telefono: p.telefono,
      direccion: p.direccion,
      funcionId: p.funcionId,
      usuarioId: p.usuarioId,
      nombre: p.usuario?.nombre,
      email: p.usuario?.email,
      estado: p.usuario?.estado,
      rol: p.usuario?.rol?.rol, // 👈 aplanado
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los personales" });
  }
};
