"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("detallesFactura", {
      idDetalle: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      concepto: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      facturaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "facturas",
          key: "idFactura",
        },
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
    await queryInterface.dropTable("detallesFactura");
  },
};
