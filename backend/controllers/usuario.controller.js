import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import Personal from "../models/Personal.js";
import bcrypt from "bcrypt";
import sequelize from "../config/database.js";
import Residente from "../models/Residente.js";
import Habita from "../models/Habita.js";
import Departamento from "../models/Departamento.js";
import Funcion from "../models/funcion.js";
import { QueryTypes } from "sequelize";
import Administrador from "../models/Administrador.js";
import { transporter } from "./helpers/mails.js";
import crypto from "crypto";
import { Op } from "sequelize";

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

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Creamos el nuevo usuario
    let nuevoUsuario = await Usuario.create(
      {
        nombre,
        email,
        password: hashedPassword,
        estado: true,
        verificationTokenExpires,
        verificationToken,
      },
      { transaction: t }
    );

    // ✅ SOLUCIÓN: Asignar rol ANTES de convertir a objeto plano
    await nuevoUsuario.addRoles(rolFind.idRol, { transaction: t });

    if (rol === "administrador") {
      const { cedula } = req.body;

      if (!cedula) {
        await t.rollback();
        return res.status(400).json({
          message: "Todos los campos son obligatorios (administrador)",
        });
      }
      let nuevoAdministrador = await Administrador.create(
        {
          cedula,
          usuarioId: nuevoUsuario.idUsuario,
        },
        { transaction: t }
      );
      nuevoAdministrador = nuevoAdministrador.get({ plain: true });
      // ✅ Convertir a objeto plano DESPUÉS de usar addRol()
      nuevoUsuario = nuevoUsuario.get({ plain: true });
      nuevoUsuario = { ...nuevoUsuario, ...nuevoAdministrador };
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
      nuevoUsuario = {
        ...nuevoUsuario.get({ plain: true }),
        ...personalResponse,
      };
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

    try {
      // El objeto 'nuevoUsuario' ya tiene el 'idUsuario' después de ser creado
      await transporter.sendMail({
        from: `"Gestión Edificio (Habitat360)" <${process.env.SMTP_USER}>`,
        to: nuevoUsuario.email,
        subject: "Verifica tu correo",
        // <<--- ¡CAMBIO AQUÍ! Añadimos el userId a la URL
        html: `<p>Hola ${nuevoUsuario.nombre},</p>
               <p>Para activar tu cuenta haz clic <a href="http://localhost:5173/verify-email?token=${verificationToken}&userId=${nuevoUsuario.idUsuario}">aquí</a></p>`,
      });
    } catch (mailError) {
      console.error("Error enviando correo de verificación:", mailError);
      // No rompemos la creación del usuario
    }

    // Limpiar campos sensibles
    delete nuevoUsuario.password;
    delete nuevoUsuario.createdAt;
    delete nuevoUsuario.updatedAt;

    await t.commit();
    res.status(201).json({
      usuario: nuevoUsuario,
      message:
        "Usuario creado exitosamente. El mail de verificación fue enviado.",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error creating usuario:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//**** Verificar correo electrónico *****/
export const verifyEmail = async (req, res) => {
  try {
    const { userId, token } = req.query; // recibimos el token como query

    if (!token || !userId) {
      return res
        .status(400)
        .json({ message: "Token de verificación o ID de usuario faltante." });
    }

    // Buscar usuario con ese token y que no haya expirado
    const usuario1 = await Usuario.findByPk(userId);
    if (usuario1.isVerified) {
      return res.status(200).json({
        message: "Ya has verificado tu correo puedes iniciar sesión.",
      });
    }

    // Buscar usuario con ese token y que no haya expirado
    const usuario = await Usuario.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: { [Op.gt]: new Date() },
      },
    });

    if (!usuario) {
      return res.status(400).json({ message: "Token inválido o expirado." });
    }

    // Activar la cuenta
    usuario.isVerified = true;
    usuario.verificationToken = null;
    usuario.verificationTokenExpires = null;
    await usuario.save();

    res.json({ message: "Cuenta verificada correctamente." });
  } catch (error) {
    console.error("Error verificando correo:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

//***** Reenvío de correo electrónico *****//
export const resendVerifyEmail = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "El ID de usuario es obligatorio." });
    }

    // Buscar al usuario
    const usuario = await Usuario.findByPk(userId);

    if (!usuario) {
      return res.status(200).json({
        message:
          "Si existe una cuenta con este usuario, se ha enviado un enlace de verificación.",
      });
    }

    if (usuario.isVerified) {
      return res.status(200).json({
        message: "Esta cuenta ya ha sido verificada. Puedes iniciar sesión.",
      });
    }

    const newVerificationToken = crypto.randomBytes(32).toString("hex");
    const newVerificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    usuario.verificationToken = newVerificationToken;
    usuario.verificationTokenExpires = newVerificationTokenExpires;
    await usuario.save();

    await transporter.sendMail({
      from: `"Gestión Edificio (Habitat360)" <${process.env.SMTP_USER}>`,
      to: usuario.email, // el correo que ya tiene asignado
      subject: "Verifica tu correo (Nuevo Intento)",
      html: `<p>Hola ${usuario.nombre},</p>
             <p>Has solicitado un nuevo enlace de verificación. Para activar tu cuenta haz clic <a href="http://localhost:5173/verify-email?token=${newVerificationToken}&userId=${usuario.idUsuario}">aquí</a></p>`,
    });

    res.status(200).json({
      message: "Se ha reenviado un nuevo enlace de verificación a tu correo.",
    });
  } catch (error) {
    console.error("Error en resendVerifyEmail:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//***** Actualizar un usuario *****//
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;
    if (!nombre || !email) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    const usuarioFind = await Usuario.findByPk(id);
    if (!usuarioFind) {
      return res.status(404).json({ error: "Usuario no encontrado (id)" });
    }
    await usuarioFind.update({ nombre, email });
    res.status(200).json({
      usuario: usuarioFind,
      message: "Datos actualizados exitosamente",
    });
  } catch (error) {
    console.error("Error updating usuario:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
          attributes: { exclude: ["createdAt", "updatedAt"] },
          through: { attributes: [] },
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
export const EliminarUsuario = async (req, res) => {
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

//Aqui user el cambio de contraseña del helper de usuario.js
import { cambiarContrasena, resetPassword, sendResetPasswordEmail } from "./helpers/usuario.js";
export { cambiarContrasena, resetPassword, sendResetPasswordEmail };

// Eliminar un usuario probando el ondelete cascade
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioFind = await Usuario.findByPk(id);
    if (!usuarioFind) {
      return res.status(404).json({ error: "Usuario no encontrado (id)" });
    }
    await usuarioFind.destroy();
    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting usuario:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
