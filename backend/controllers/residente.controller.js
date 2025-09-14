import Usuario from "../models/Usuario.js";
import Residente from "../models/Residente.js";
import Departamento from "../models/Departamento.js";
import Habita from "../models/Habita.js";
import Rol from "../models/Rol.js";
import sequelize from "../config/database.js";

// crear un nuevo usuario residente

export const createResidente = async (req, res) => {
  const { telefono, departamentoId, usuarioId, tipoResidencia, idRol } =
    req.body;

  try {
    if (
      !telefono ||
      !departamentoId ||
      !usuarioId ||
      !tipoResidencia ||
      !idRol
    ) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Verificar si el departamento existe
    const departamento = await Departamento.findByPk(departamentoId);
    if (!departamento) {
      return res.status(404).json({ message: "Departamento no encontrado" });
    }
    //verificar si el departamento esta ocupado
    const departamentoOcupado = await Habita.findOne({
      where: { departamentoId },
    });

    if (departamentoOcupado) {
      return res
        .status(400)
        .json({ message: "El departamento ya está ocupado" });
    }
    // Verificar si el usuario existe
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el rol existe
    const rol = await Rol.findByPk(idRol);
    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    //definir la transaccion
    const t = await sequelize.transaction();

    // crear la fecha actual
    const fecha = new Date();

    // Crear el residente
    await Residente.create(
      {
        telefono,
        usuarioId,
      },
      { transaction: t }
    );

    // Crear la relación en la tabla Habita
    await Habita.create(
      {
        fecha,
        tipoResidencia,
        usuarioId,
        departamentoId,
      },
      { transaction: t }
    );

    // Asignar el rol de residente al usuario
    await usuario.addRoles(idRol, { transaction: t }); // 3 es el idRol para Residente

    await t.commit();

    res.status(201).json({ message: "Rol Residente agregado exitosamente" });
  } catch (error) {
    console.error("Error creating residente:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//eliminar un usuario residente el rol de residente pero no el usuario
export const deleteResidente = async (req, res) => {
  try {
    const { id } = req.params;
    const { idRol } = req.body;
    if (!idRol) {
      return res.status(404).json({ error: "idRol es requerido" });
    }
    // Verificar si el usuario existe
    const residente = await Residente.findOne({ where: { usuarioId: id } });
    if (!residente) {
      return res.status(404).json({ error: "Residente no encontrado" });
    }
    //eliminar la relacion en la tabla habita
    await Habita.destroy({ where: { usuarioId: id } });
    // Definir la transacción
    const t = await sequelize.transaction();
    await residente.destroy({ transaction: t });
    const usuario = await Usuario.findByPk(id);
    // Eliminar el rol de residente del usuario
    await usuario.removeRoles(idRol, { transaction: t });

    await t.commit();

    res.status(200).json({ message: "Rol Residente eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting residente:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Obtener todos los usuarios residentes
export const getResidentes = async (req, res) => {
  try {
    let residentes = await Residente.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
          include: [
            {
              model: Departamento,
              as: "departamentos",
              through: { attributes: ["fecha", "tipoResidencia"] }, // columnas de Habita
              attributes: ["numero"],
            },
            {
              model: Rol,
              as: "roles",
              through: { attributes: [] }, // no incluir columnas de la tabla intermedia
              attributes: ["idRol", "rol"],
            },
          ],
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    residentes = residentes.map((r) => ({
      idResidente: r.idResidente,
      telefono: r.telefono,
      usuarioId: r.usuario.idUsuario,
      nombre: r.usuario.nombre,
      email: r.usuario.email,
      estado: r.usuario.estado,
      rol: r.usuario.roles,
      departamento: r.usuario.departamentos[0]
        ? {
            numero: r.usuario.departamentos[0].numero,
            fecha: r.usuario.departamentos[0].Habita.fecha
              .toISOString()
              .split("T")[0],
            tipoResidencia: r.usuario.departamentos[0].Habita.tipoResidencia,
          }
        : null,
    }));
    res.json(residentes);
  } catch (error) {
    console.error("Error fetching residentes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
