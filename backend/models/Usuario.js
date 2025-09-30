// modelo de Usuario
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Usuario = sequelize.define(
  "Usuario",
  {
    idUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    two_factor_secret: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
          // 🔒 Gestión de intentos fallidos (fuerza bruta)
      failedLoginAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // número de intentos fallidos consecutivos
      },
      lastFailedAt: {
        type: DataTypes.DATE,
        allowNull: true, // fecha/hora del último intento fallido
      },
      blockedUntil: {
        type: DataTypes.DATE,
        allowNull: true, // hasta cuándo la cuenta está bloqueada
      },

      // 📧 Verificación de correo
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // false hasta que confirme el correo
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true, // token único para validar el correo
      },
      verificationTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true, // fecha de expiración del token de verificación
      },

      // 🔑 Recuperación de contraseña
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true, // token único para resetear la contraseña
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true, // fecha de expiración de ese token
      },
  },
  {
    tableName: "usuarios",
    timestamps: true,
  }
);

export default Usuario;
