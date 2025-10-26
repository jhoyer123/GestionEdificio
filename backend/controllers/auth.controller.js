import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import fetch from "node-fetch";
// Controlador de autenticación Login
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto";

// Función para validar token de reCAPTCHA
async function verifyCaptcha(recaptchaToken) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", recaptchaToken);

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    { method: "POST", body: params }
  );

  const data = await response.json();
  return data.success;
}

/* export const login = async (req, res) => {
  const { email, password, token, recaptchaToken } = req.body; // token opcional 2FA, recaptchaToken opcional

  try {
    //validar que se envien datos obligatorios
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Complete todos los campos por favor" });
    }

    const usuario = await Usuario.findOne({
      where: { email },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: { model: Rol, as: "roles", attributes: ["rol"] },
    });

    if (!usuario) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }


    //verificar si el usuario verifico su correo
    if (!usuario.isVerified) {
      return res.status(403).json({
        message: "Por favor verifica tu correo antes de iniciar sesión.",
      });
    }

    const ahora = new Date(); // siempre está en UTC internamente
    const blockedUntilDate = usuario.blockedUntil
      ? new Date(usuario.blockedUntil.replace(" ", "T") + "Z")
      : null;
    // Bloqueo
    if (usuario.blockedUntil && blockedUntilDate > ahora) {
      //console.log("Usuario bloqueado hasta:", blockedUntilDate);
      //console.log("ahora:", ahora);

      const minutosRestantes = Math.ceil(
        (blockedUntilDate.getTime() - ahora.getTime()) / 60000
      );

      return res.status(423).json({
        message: `Cuenta bloqueada. Intente de nuevo en ${minutosRestantes} minutos.`,
      });
    }

    if (usuario.failedLoginAttempts >= 3) {
      // Requiere reCAPTCHA
      if (!recaptchaToken) {
        return res.status(401).json({
          message: "Es necesario completar el reCAPTCHA por seguridad",
          intentosRestantes: 5 - usuario.failedLoginAttempts,
        });
      }

      // Verificar reCAPTCHA si se proporciona el token
      const captchaValid = await verifyCaptcha(recaptchaToken);
      if (!captchaValid) {
        return res.status(400).json({ message: "reCAPTCHA inválido" });
      }
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      usuario.failedLoginAttempts = (usuario.failedLoginAttempts || 0) + 1;
      usuario.lastFailedAt = ahora.toISOString(); // <<< Guardar como UTC

      if (usuario.failedLoginAttempts >= 5) {
        usuario.blockedUntil = new Date(
          ahora.getTime() + 2 * 60 * 1000
        ).toISOString();
        usuario.failedLoginAttempts = 0;
        await usuario.save();
        return res.status(423).json({
          message:
            "Cuenta bloqueada temporalmente por múltiples intentos fallidos.",
        });
      }

      await usuario.save();
      return res.status(401).json({
        message: "Credenciales inválidas",
        intentosRestantes: 5 - usuario.failedLoginAttempts,
      });
    }

    // Resetear contadores si login exitoso
    usuario.failedLoginAttempts = 0;
    usuario.lastFailedAt = null;
    usuario.blockedUntil = null;
    await usuario.save();

    // Verificar 2FA
    if (usuario.two_factor_enabled) {
      if (!token) {
        return res.status(200).json({
          message: "Se requiere código 2FA",
          twoFactorRequired: true,
        });
      }

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

    // Generar JWT
    const jwtToken = jwt.sign(
      { id: usuario.idUsuario, email: usuario.email },
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
}; */

//login normal sin ninguna verificaion para pruebas
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Complete todos los campos por favor" });
    }
    const usuario = await Usuario.findOne({
      where: { email },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: {
        model: Rol,
        as: "roles",
        attributes: ["rol"],
        through: { attributes: [] },
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar JWT
    const jwtToken = jwt.sign(
      { id: usuario.idUsuario, email: usuario.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const usuarioParaCliente = {
      id: usuario.idUsuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.roles,
      two_factor_enabled: usuario.two_factor_enabled,
    };

    //limpiar los datos de sus roles---------------
    usuarioParaCliente.rol = usuario.roles.map((rol) => {
      return {
        id: rol.idRol,
        nombre: rol.rol,
      };
    });
    //usuarioParaCliente.rol = usuario.roles;
    //---------------------------------------------

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
