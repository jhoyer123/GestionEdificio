import Personal from "../models/Personal.js";
import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import Funcion from "../models/Funcion.js";
import sequelize from "../config/database.js";

//Crear un nuevo personal y ademas agregar la relacion en rolesUsuario
export const createPersonal = async (req, res) => {
  const {
    telefono,
    direccion,
    fechaNacimiento,
    genero,
    funcionId,
    usuarioId,
    idRol,
  } = req.body;

  try {
    // Validar que se recibieron todos los datos necesarios
    if (
      !telefono ||
      !direccion ||
      !fechaNacimiento ||
      !genero ||
      !funcionId ||
      !usuarioId ||
      !idRol
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario existe
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    // Verificar si la función existe
    const funcion = await Funcion.findByPk(funcionId);
    if (!funcion) {
      return res.status(404).json({ message: "Función no encontrada" });
    }
    // Verificar si el rol existe
    const rol = await Rol.findByPk(idRol);
    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    //definir la transaccion
    const t = await sequelize.transaction();

    // Crear el nuevo personal
    const newPersonal = await Personal.create(
      {
        telefono,
        direccion,
        fechaNacimiento,
        genero,
        funcionId,
        usuarioId,
      },
      { transaction: t }
    );

    // Agregar la relación en rolesUsuario
    await usuario.addRoles(idRol, { transaction: t });

    await t.commit();
    res.status(201).json({
      personal: newPersonal,
      message: "Personal creado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el personal" });
  }
};

//Obtener todos los personales
export const getAllPersonales = async (req, res) => {
  try {
    const personales = await Personal.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
          include: {
            model: Rol,
            as: "roles",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        },
        {
          model: Funcion,
          as: "funcion",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    // 🔹 Convertimos cada registro en un objeto plano
    const data = personales.map((p) => ({
      idPersonal: p.idPersonal,
      telefono: p.telefono,
      direccion: p.direccion,
      genero: p.genero,
      fechaNacimiento: p.fechaNacimiento.toISOString().split("T")[0],

      funcionId: p.funcionId,
      cargo: p.funcion.cargo,

      usuarioId: p.usuario.idUsuario,
      nombre: p.usuario.nombre,
      email: p.usuario.email,
      estado: p.usuario.estado,
      rol: p.usuario.rol, // 👈 aplanado
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los personales" });
  }
};

//Actualizar personal
export const updatePersonal = async (req, res) => {
  try {
    const { id } = req.params;
    const { telefono, direccion, fechaNacimiento, genero } = req.body;
    if (!telefono || !direccion || !fechaNacimiento || !genero) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    const personal = await Personal.findByPk(id);
    if (!personal) {
      return res.status(404).json({ message: "Personal no encontrado (id)" });
    }

    await personal.update({ telefono, direccion, fechaNacimiento, genero });
    res.json({
      personal: personal.get({ plain: true }),
      message: "Personal actualizado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el personal" });
  }
};

// Obtener un personal por ID
export const getPersonalById = async (req, res) => {
  try {
    const { id } = req.params;
    const personal = await Personal.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
          include: {
            model: Rol,
            as: "roles",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        },
        {
          model: Funcion,
          as: "funcion",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!personal) {
      return res.status(404).json({ message: "Personal no encontrado" });
    }
    res.status(200).json({
      idPersonal: personal.idPersonal,
      telefono: personal.telefono,
      direccion: personal.direccion,
      genero: personal.genero,
      fechaNacimiento: personal.fechaNacimiento.toISOString().split("T")[0],
      funcionId: personal.funcionId,
      cargo: personal.funcion.cargo,
      usuarioId: personal.usuario.idUsuario,
      nombre: personal.usuario.nombre,
      email: personal.usuario.email,
      estado: personal.usuario.estado,
      rol: personal.usuario.rol,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el personal" });
  }
};

//Eliminar un personal
export const deletePersonal = async (req, res) => {
  try {
    const { id } = req.params;
    const { idRol } = req.body; // Recibir idRol desde el cuerpo de la solicitud
    if (!idRol) {
      return res.status(400).json({ message: "idRol es obligatorio" });
    }
    const personal = await Personal.findOne({ where: { usuarioId: id } });
    if (!personal) {
      return res.status(404).json({ message: "Personal no encontrado" });
    }
    const t = await sequelize.transaction(); 
    await personal.destroy({ transaction: t });

    //Tambien eliminar la relacion en rolesUsuario
    const usuario = await Usuario.findByPk(personal.usuarioId);

    await usuario.removeRoles(idRol, { transaction: t });
    await t.commit();
    res.status(200).json({ message: "Personal eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el personal" });
  }
};
