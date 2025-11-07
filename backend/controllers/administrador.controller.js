import Administrador from "../models/Administrador.js";
import Usuario from "../models/Usuario.js";
//Crear un administrador desde el agregr rol
export const createAdministrador = async (req, res) => {
  try {
    const { usuarioId, cedula, idRol } = req.body;
    if (!usuarioId || !cedula || !idRol) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    const t = await sequelize.transaction();
    const nuevoAdministrador = await Administrador.create(
      {
        usuarioId,
        cedula,
      },
      { transaction: t }
    );
    // agregar rol
    const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    usuario.addRoles(idRol, { transaction: t });
    await t.commit();
    res
      .status(201)
      .json({ message: "Rol Administrador agregado exitosamente" });
  } catch (error) {
    console.error("Error creating administrador:", error);
    throw error;
  }
};

//Eliminar un administrador desde el quitar rol
export const deleteAdministrador = async (req, res) => {
  try {
    const { id } = req.params;
    const administrador = await Administrador.findOne({
      where: { usuarioId: id },
    });
    if (!administrador) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }
    const t = await sequelize.transaction();
    const usuario = await Usuario.findByPk(id, { transaction: t });
    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const { idRol } = req.body;
    usuario.removeRoles(idRol, { transaction: t });
    await administrador.destroy({ transaction: t });
    await t.commit();
    res.json({ message: "Rol Administrador eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting administrador:", error);
    throw error;
  }
};

//Dashboard stats
import { getDashboardStats, executeQuery } from "./helpers/dashboard.js";
export { getDashboardStats, executeQuery };
