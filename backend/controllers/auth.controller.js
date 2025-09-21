import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

// Controlador de autenticación Login
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto";

// Función para generar un token JWT
export const login = async (req, res) => {
  const { email, password, token } = req.body; // token opcional, solo si 2FA activado

  try {
    const usuario = await Usuario.findOne({
      where: { email },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: { model: Rol, as: "roles", attributes: ["rol"] },
    });

    if (!usuario) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Si usuario tiene 2FA activado
    if (usuario.two_factor_enabled) {
      // Si no envía token, pedimos que lo ingrese
      if (!token) {
        return res.status(200).json({
          message: "Se requiere código 2FA",
          twoFactorRequired: true,
        });
      }

      // Verificar token TOTP
      const verified = speakeasy.totp.verify({
        secret: usuario.two_factor_secret,
        encoding: "base32",
        token,
        window: 1,
      });

      if (!verified) {
        return res.status(401).json({ message: "Código 2FA inválido" });
      }
    }

    // Generar token JWT
    const jwtToken = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });

    const usuarioParaCliente = {
      id: usuario.idUsuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.roles,
      two_factor_enabled: usuario.two_factor_enabled,
    };

    res.json({
      token: jwtToken,
      usuario: usuarioParaCliente,
      message: "Inicio de sesión exitoso",
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Cerrar sesion logout
export const logout = (req, res) => {
  // Eliminar la cookie del token
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 0, // Establecer maxAge en 0 para eliminar la cookie
  });

  res.json({ message: "Sesión cerrada" });
};

//endpoints para la auth de 2FA (Two-Factor Authentication) podrian ser:
export const generate2FA = async (req, res) => {
  try {
    // 1. Generar secreto TOTP único
    const secret = speakeasy.generateSecret({
      name: "Habitat360 (" + req.body.username + ")", // opcional: nombre visible en Google Authenticator
    });

    // 2. Generar QR en base64
    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    // 3. Devolver QR y secret base32 al frontend
    res.json({
      qrCodeImageUrl: qrCodeDataURL,
      secretBase32: secret.base32, // esto lo puedes usar temporalmente hasta confirmación
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generando 2FA" });
  }
};

// POST /api/2fa/verify
// (También protegida por el middleware de autenticación)

export const verify2FA = async (req, res) => {
  try {
    const { id, token, secretBase32 } = req.body;

    if (!id || !token || !secretBase32) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // Verificar token
    const verified = speakeasy.totp.verify({
      secret: secretBase32,
      encoding: "base32",
      token: token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: "Código inválido" });
    }

    // Buscar usuario
    const user = await Usuario.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Activar 2FA y guardar secreto
    await user.update({
      two_factor_enabled: true,
      two_factor_secret: secretBase32,
    });

    return res.json({ message: "2FA activado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error activando 2FA" });
  }
};
