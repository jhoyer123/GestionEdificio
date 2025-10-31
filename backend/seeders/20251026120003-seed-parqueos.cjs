"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert("parqueocajas", [
        {
          numeroCaja: "P001",
          estado: true,
          residenteAsignadoId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          numeroCaja: "P002",
          estado: true,
          residenteAsignadoId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          numeroCaja: "P003",
          estado: true,
          residenteAsignadoId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          numeroCaja: "P004",
          estado: true,
          residenteAsignadoId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          numeroCaja: "P005",
          estado: true,
          residenteAsignadoId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ], { transaction: t });

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("parqueocajas", null, {});
  },
};