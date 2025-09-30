"use strict";
import bcrypt from "bcrypt";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 1. Insertar roles
    await queryInterface.bulkInsert("roles", [
      {
        rol: "administrador",
      },
      {
        rol: "personal",
      },
      {
        rol: "residente",
      },
    ]);

    // 2. Obtener el idRol del rol Administrador
    const [roles] = await queryInterface.sequelize.query(
      'SELECT idRol FROM roles WHERE rol = "administrador" LIMIT 1;'
    );
    const adminRolId = roles[0].idRol;

    // 3. Insertar usuario administrador
    const hashedPassword = await bcrypt.hash("admin", 10);
    await queryInterface.bulkInsert("usuarios", [
      {
        nombre: "admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        estado: true,
      },
    ]);

    // 4. Obtener el id del usuario insertado
    const [usuarios] = await queryInterface.sequelize.query(
      'SELECT id FROM usuarios WHERE email = "admin@gmail.com" LIMIT 1;'
    );
    const adminUserId = usuarios[0].idUsuario;

    // 5. Insertar registro en administradores
    await queryInterface.bulkInsert("administradores", [
      {
        cedula: "1234567890",
        usuarioId: adminUserId,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("administradores", {
      cedula: "1234567890",
    });
    await queryInterface.bulkDelete("usuarios", {
      email: "admin@gmail.com",
    });
    await queryInterface.bulkDelete("roles", {
      rol: ["administrador", "residente", "personal"],
    });
  },
};
