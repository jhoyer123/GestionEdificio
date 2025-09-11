"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("facturas", {
      idFactura: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nroFactura: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      fechaEmision: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      fechaVencimiento: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      montoTotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM("pendiente", "pagada", "vencida"),
        allowNull: false,
        defaultValue: "pendiente",
      },
      departamentoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "departamentos", // nombre de la tabla referenciada
          key: "idDepartamento", // columna referenciada
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
    await queryInterface.dropTable("facturas");
  },
};
