"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("usuarios", {
      idUsuario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      two_factor_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      two_factor_secret: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      // 🔒 Gestión de intentos fallidos (fuerza bruta)
      failedLoginAttempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // número de intentos fallidos consecutivos
      },
      lastFailedAt: {
        type: Sequelize.DATE,
        allowNull: true, // fecha/hora del último intento fallido
      },
      blockedUntil: {
        type: Sequelize.DATE,
        allowNull: true, // hasta cuándo la cuenta está bloqueada
      },

      // 📧 Verificación de correo
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // false hasta que confirme el correo
      },
      verificationToken: {
        type: Sequelize.STRING,
        allowNull: true, // token único para validar el correo
      },
      verificationTokenExpires: {
        type: Sequelize.DATE,
        allowNull: true, // fecha de expiración del token de verificación
      },

      // 🔑 Recuperación de contraseña
      resetPasswordToken: {
        type: Sequelize.STRING,
        allowNull: true, // token único para resetear la contraseña
      },
      resetPasswordExpires: {
        type: Sequelize.DATE,
        allowNull: true, // fecha de expiración de ese token
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("usuarios");
  },
};
