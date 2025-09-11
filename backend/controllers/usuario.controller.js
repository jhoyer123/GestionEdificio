import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import Personal from "../models/Personal.js";
import bcrypt from "bcrypt";
import sequelize from "../config/database.js";
import Residente from "../models/Residente.js";
import Habita from "../models/Habita.js";
import Departamento from "../models/Departamento.js";
import Funcion from "../models/Funcion.js";
import { QueryTypes } from "sequelize";

//***** Crear un usuario *****//
export const createUsuario = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar la entrada
    if (!nombre || !email || !password) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      where: { email },
      transaction: t,
    });

    if (usuarioExistente) {
      await t.rollback();
      return res.status(409).json({ message: "El usuario ya existe" });
    }

    // verificar si el rol existe
    const rolFind = await Rol.findOne({ where: { rol: rol }, transaction: t });

    if (!rolFind) {
      await t.rollback();
      return res.status(404).json({ message: "Rol no encontrado (id)" });
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
        estado: true,
      },
      { transaction: t }
    );

    // ✅ SOLUCIÓN: Asignar rol ANTES de convertir a objeto plano
    await nuevoUsuario.addRoles(rolFind.idRol, { transaction: t });

    if (rol === "administrador") {
      // ✅ Convertir a objeto plano DESPUÉS de usar addRol()
      nuevoUsuario = nuevoUsuario.get({ plain: true });
    }

    // Si el rol es 'personal'
    if (rol === "personal") {
      const { telefono, direccion, funcionId, fechaNacimiento, genero } =
        req.body;

      if (
        !telefono ||
        !direccion ||
        !funcionId ||
        !fechaNacimiento ||
        !genero
      ) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios" });
      }

      // verificar si la funcion existe
      const funcionFind = await Funcion.findByPk(funcionId, {
        transaction: t,
      });

      if (!funcionFind) {
        await t.rollback();
        return res.status(404).json({ message: "Funcion no encontrada (id)" });
      }
      
      let nuevoPersonal = await Personal.create(
        {
          fechaNacimiento,
          genero,
          telefono,
          direccion,
          funcionId,
          usuarioId: nuevoUsuario.idUsuario,
        },
        { transaction: t }
      );

      const personalResponse = nuevoPersonal.get({ plain: true });
      // ✅ Convertir a objeto plano DESPUÉS de todas las operaciones de Sequelize
      nuevoUsuario = { ...nuevoUsuario.get({ plain: true }), ...personalResponse };
    }

    if (rol === "residente") {
      const { telefono, tipoResidencia, departamentoId } = req.body;

      if (!telefono || !tipoResidencia || !departamentoId) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios (residente)" });
      }

      const deptoById = await Departamento.findByPk(departamentoId);
      if (!deptoById) {
        await t.rollback();
        return res
          .status(404)
          .json({ message: "Departamento no encontrado (id)" });
      }

      const usuariosActivosCount = await sequelize.query(
        `
        SELECT COUNT(*) as total 
        FROM habita h 
        INNER JOIN usuarios u ON h.usuarioId = u.idUsuario 
        WHERE h.departamentoId = :departamentoId 
          AND u.estado = true
      `,
        {
          replacements: { departamentoId },
          type: QueryTypes.SELECT,
          transaction: t,
        }
      );

      if (usuariosActivosCount[0].total > 0) {
        await t.rollback();
        return res.status(400).json({
          message: "Este departamento ya tiene un usuario asociado.",
        });
      }

      const fecha = new Date();

      let nuevoResidente = await Residente.create(
        {
          telefono,
          usuarioId: nuevoUsuario.idUsuario, // ✅ Corregido: era usuarioId sin definir
        },
        { transaction: t }
      );

      let nuevoHabita = await Habita.create(
        {
          departamentoId,
          fecha,
          tipoResidencia,
          usuarioId: nuevoUsuario.idUsuario, // ✅ Corregido: era usuarioId sin definir
        },
        { transaction: t }
      );

      const residenteResponse = nuevoResidente.get({ plain: true });
      const habitaResponse = nuevoHabita.get({ plain: true });

      // ✅ Convertir a objeto plano DESPUÉS de todas las operaciones
      nuevoUsuario = {
        ...nuevoUsuario.get({ plain: true }), // ✅ Corregido: era nuevoUsuarios
        ...residenteResponse,
        ...habitaResponse,
      };
    }

    // Limpiar campos sensibles
    delete nuevoUsuario.password;
    delete nuevoUsuario.createdAt;
    delete nuevoUsuario.updatedAt;

    await t.commit();
    res.status(201).json({
      usuario: nuevoUsuario,
      message: "Usuario creado exitosamente",
    });
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

//***** Obtener todos los usuarios   *****//
export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["createdAt", "updatedAt", "password"] },
      include: [
        {
          model: Rol,
          as: "roles",
          through: { attributes: [] },
          attributes: ["idRol", "rol"],
        },
      ],
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
      include: [
        {
          model: Rol,
          as: "roles",
        },
      ],
    });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado (id)" });
    }
    delete usuario.password; // No enviar la contraseña en la respuesta
    res.json(usuario);
  } catch (error) {
    console.error("Error fetching usuario:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//***** Eliminar un usuario *****//
export const deleteUsuario = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const usuarioFind = await Usuario.findByPk(id, {
      include: [
        {
          model: Rol,
          through: { attributes: [] }, // Excluye datos de tabla intermedia
        },
      ],
    });

    if (!usuarioFind) {
      await transaction.rollback();
      return res.status(404).json({ error: "Usuario no encontrado (id)" });
    }

    if (usuarioFind.Rols.some((r) => r.rol === "residente")) {
      // ✅ 1. PRIMERO eliminar los registros dependientes
      await Habita.destroy({
        where: { usuarioId: id },
        transaction,
      });

      // ✅ 2. Eliminar otros registros relacionados si existen
      await Residente.destroy({
        where: { usuarioId: id },
        transaction,
      });
    }
    // ✅ 3. FINALMENTE eliminar el usuario
    await usuarioFind.destroy({ transaction });

    await transaction.commit();
    res.json({
      message: "Usuario y registros relacionados eliminados correctamente",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
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
