import Usuario from "../../models/Usuario.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { transporter } from "./mails.js";
import { Op } from "sequelize";

//Cambiar contraseña del usuario
export const cambiarContrasena = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Verificar si el usuario existe
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar la contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, usuario.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "La contraseña actual es incorrecta" });
    }

    // Actualizar la contraseña
    usuario.password = await bcrypt.hash(newPassword, 5);
    await usuario.save();

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Cambiar la contraseña desde el envio de un correo electronico
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "todos los campos son requeridos" });
    }

    // Verificar si el token es válido
    const usuario = await Usuario.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: Date.now(),
        },
      },
    });

    if (!usuario) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Actualizar la contraseña
    usuario.password = await bcrypt.hash(newPassword, 5);
    await usuario.save();

    res.json({ message: "Contraseña actualizada exitosamente, por favor inicia sesión con tu nueva contraseña." });
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//***** Enviar correo para reestablecer la contraseña del usuario *****/
export const sendResetPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ message: "Email inválido" });
    }

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString("hex");
    usuario.resetPasswordToken = resetToken;
    usuario.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await usuario.save();

    // Enviar correo electrónico
    await transporter.sendMail({
      from: `"Gestión Edificio (Habitat360)" <${process.env.SMTP_USER}>`,
      to: usuario.email,
      subject: "Restablecer contraseña",
      html: `<p>Hola ${usuario.nombre},</p>
             <p>Para restablecer tu contraseña, haz clic <a href="http://localhost:5173/reset-password?token=${resetToken}">aquí</a></p>`,
    });

    res.json({ message: "Correo de restablecimiento de contraseña enviado." });
  } catch (error) {
    console.error("Error enviando correo de restablecimiento:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
