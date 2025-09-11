import Rol from "../models/Rol.js";

//*****  Crear un rol *****//
export const createRol = async (req, res) => {
  try {
    const { rol } = req.body;
    if (!rol) {
      return res.status(400).json({ error: "El campo 'rol' es obligatorio" });
    }
    const rolExistente = await Rol.findOne({ where: { rol } });
    if (rolExistente) {
      return res.status(400).json({ error: "El rol ya existe" });
    }
    const nuevoRol = await Rol.create({ rol });
    res.status(201).json(nuevoRol);
  } catch (error) {
    console.error("Error al crear el rol:", error);
    res.status(500).json({ error: "Error al crear el rol" });
  }
};

// obtener todos los roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    res.json(roles);
  } catch (error) {
    console.error("Error al obtener los roles:", error);
    res.status(500).json({ error: "Error al obtener los roles" });
  }
};
