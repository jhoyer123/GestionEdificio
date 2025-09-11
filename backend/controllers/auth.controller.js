import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Controlador de autenticación Login
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto";

// Función para generar un token JWT
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({
      where: { email },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: Rol,
          as: "roles",
          through: { attributes: [] }, // Excluye datos de tabla intermedia
        },
      ],
    });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // AQUI FEBERIA VERIFICAR SI ES USUARIO ESTA ACTIVO MEDIANTE EL PERMISO DEL ADMINISTRADO ???

    // Generar el token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Configurar cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Usa https en producción
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000, // 1 hora
    });

    const usuarioParaCliente = {
      // Asumiendo que tu modelo tiene un campo 'nombre'
      nombre: usuario.nombre,
      email: usuario.email,
      // Accedemos al rol a través de la relación que definiste
      rol: usuario.rol,
    }; // 2. Enviamos la respuesta estructurada.

    res.json({
      token: token, // Para clientes que no usan cookies (ej. apps móviles)
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
