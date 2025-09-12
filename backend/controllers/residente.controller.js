import Usuario from "../models/Usuario.js";
import Residente from "../models/Residente.js";
import Departamento from "../models/Departamento.js";
import Habita from "../models/Habita.js";
import Rol from "../models/Rol.js";
import sequelize from "../config/database.js";

// crear un nuevo usuario residente

export const createResidente = async (req, res) => {
  const { telefono, departamentoId, usuarioId, tipoResidencia ,idRol} = req.body;

  try {
    if (!telefono || !departamentoId || !usuarioId || !tipoResidencia || !idRol) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    // Verificar si el usuario existe
    const newUsuario = await Usuario.findByPk(usuarioId);
    if (!newUsuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    // Verificar si el departamento existe
    const departamento = await Departamento.findByPk(departamentoId);
    if (!departamento) {
      return res.status(404).json({ error: "Departamento no encontrado" });
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
    await Residente.create({
      telefono,
      usuarioId,
    }, { transaction: t });

    // Crear la relación en la tabla Habita
    await Habita.create({
      fecha,
      tipoResidencia,
      usuarioId,
      departamentoId,
    }, { transaction: t });

    // Asignar el rol de residente al usuario
    await newUsuario.addRoles(idRol, { transaction: t }); // 3 es el idRol para Residente

    await t.commit();

    res.status(201).json({ message: "Rol Residente agregado exitosamente" });
  } catch (error) {
    console.error("Error creating residente:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
