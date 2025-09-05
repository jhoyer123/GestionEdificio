import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import Personal from "../models/Personal.js";
import bcrypt from "bcrypt";
import sequelize from "../config/database.js";
import Residente from "../models/Residente.js";
import Habita from "../models/Habita.js";
import Departamento from "../models/Departamento.js";

//***** Obtener todos los usuarios   *****//
export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["createdAt", "updatedAt", "password"] },
      include: { model: Rol, as: "rol", attributes: ["rol"] },
    });
    res.json(usuarios);
  } catch (error) {
    console.error("Error fetching usuarios:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Obtener un usuario
export const getUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ["createdAt", "updatedAt", "password"] },
    });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado (id)" });
    }
    delete usuario.password; // No enviar la contraseña en la respuesta
    res.json(usuario);
  } catch (error) {
    console.error("Error fetching usuario:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//***** Crear un nuevo usuario *****//
export const createUsuario = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombre, email, password, rolId } = req.body;

    // Validar la entrada
    if (!nombre || !email || !password || !rolId) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    // verificar si el rol existe
    const rolFind = await Rol.findByPk(rolId);
    if (!rolFind) {
      return res.status(404).json({ error: "Rol no encontrado (id)" });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Creamos el nuevo usuario
    let nuevoUsuario = await Usuario.create(
      {
        nombre,
        email,
        password: hashedPassword,
        rolId,
      },
      { transaction: t }
    );

    // Convertimos la instancia de Sequelize a un objeto plano para evitar problemas
    let usuarioResponse = nuevoUsuario.get({ plain: true });

    // Si el rol es 'personal', creamos un registro en la tabla Personal y lo combinamos con el usuario
    if (rolFind.rol === "personal") {
      const { telefono, direccion, funcionId } = req.body;

      if (!telefono || !direccion || !funcionId) {
        return res
          .status(400)
          .json({ error: "Todos los campos son obligatorios" });
      }

      let nuevoPersonal = await Personal.create(
        {
          telefono,
          direccion,
          funcionId,
          usuarioId: usuarioResponse.id, // Usamos el ID del usuario recién creado
        },
        { transaction: t }
      );

      // Convertimos la instancia de Sequelize de Personal a un objeto plano
      const personalResponse = nuevoPersonal.get({ plain: true });

      // Combinamos ambos objetos planos. Este es el paso clave.
      usuarioResponse = { ...usuarioResponse, ...personalResponse };
    }

    if (rolFind.rol === "residente") {
      const { telefono, tipoResidencia, departamentoId } = req.body;
      const fecha = new Date(); // Fecha actual
      const verDepartamento = await Departamento.findByPk(departamentoId, {
        include: [
          {
            model: Usuario,
            as: "usuarios",
            where: { estado: true }, // 👈 solo trae usuarios activos
            through: { attributes: [] },
          },
        ],
      });

      if (verDepartamento.usuarios && verDepartamento.usuarios.length > 0) {
        return res
          .status(400)
          .json({ error: "Este departamento ya tiene un usuario asociado." });
      }

      if (!telefono || !fecha || !tipoResidencia || !departamentoId) {
        return res
          .status(400)
          .json({ error: "Todos los campos son obligatorios (residente)" });
      }

      const deptoById = await Departamento.findByPk(departamentoId);

      if (!deptoById) {
        return res
          .status(404)
          .json({ error: "Departamento no encontrado (id)" });
      }

      let nuevoResidente = await Residente.create(
        {
          telefono,
          id: usuarioResponse.id, // Usamos el ID del usuario recién creado
        },
        { transaction: t }
      );

      // Crear un nuevo registro en la tabla Habita
      let nuevoHabita = await Habita.create(
        {
          departamentoId,
          fecha,
          tipoResidencia,
          usuarioId: usuarioResponse.id, // Usamos el ID del usuario recién creado
        },
        { transaction: t }
      );

      // Convertimos la instancia de Sequelize de Residente a un objeto plano
      const residenteResponse = nuevoResidente.get({ plain: true });
      const habitanResponse = nuevoHabita.get({ plain: true });

      // Combinamos ambos objetos planos. Este es el paso clave.
      usuarioResponse = {
        ...usuarioResponse,
        ...residenteResponse,
        ...habitanResponse,
      };
    }

    // Excluimos campos sensibles como la contraseña y los timestamps antes de responder
    delete usuarioResponse.password;
    delete usuarioResponse.createdAt;
    delete usuarioResponse.updatedAt;

    await t.commit();
    res.status(201).json(usuarioResponse);
  } catch (error) {
    await t.rollback();
    console.error("Error creating usuario:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//***** Actualizar un usuario *****//
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rolId } = req.body;
    const usuarioFind = await Usuario.findByPk(id);
    if (!usuarioFind) {
      return res.status(404).json({ error: "Usuario no encontrado (id)" });
    }
    const rolFind = await Rol.findByPk(rolId);
    if (!rolFind) {
      return res.status(404).json({ error: "Rol no encontrado (id)" });
    }
    await usuarioFind.update({ nombre, email, rolId });
    res.json(usuarioFind);
  } catch (error) {
    console.error("Error updating usuario:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//***** Eliminar un usuario *****//
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioFind = await Usuario.findByPk(id);
    if (!usuarioFind) {
      return res.status(404).json({ error: "Usuario no encontrado (id)" });
    }
    await usuarioFind.destroy();
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error deleting usuario:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//***** Activar o desactivar un usuario *****//
export const toggleUsuarioEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioFind = await Usuario.findByPk(id);
    if (!usuarioFind) {
      return res.status(404).json({ error: "Usuario no encontrado (id)" });
    }
    usuarioFind.estado = !usuarioFind.estado;
    await usuarioFind.save();
    res.json(usuarioFind, { message: "Usuario activado" });
  } catch (error) {
    console.error("Error toggling usuario estado:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};