"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar roles
    await queryInterface.bulkInsert("roles", [
      {
        rol: "administrador",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        rol: "residente",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        rol: "personal",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Insertar funciones (cargos para personal)
    await queryInterface.bulkInsert("funciones", [
      {
        cargo: "Portero",
        descripcion: "Encargado de la seguridad y recepción",
        salario: 1200.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cargo: "Jardinero",
        descripcion: "Mantenimiento de áreas verdes",
        salario: 1000.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cargo: "Limpieza",
        descripcion: "Servicio de limpieza general",
        salario: 900.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        cargo: "Mantenimiento",
        descripcion: "Reparaciones y mantenimiento técnico",
        salario: 1300.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("funciones", null, {});
    await queryInterface.bulkDelete("roles", null, {});
  },
};
