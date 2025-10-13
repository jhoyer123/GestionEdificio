"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("factura_concepto", {
      facturaId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "facturas",
          key: "idFactura",
        },
      },
      conceptoMantenimientoId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "conceptos_mantenimiento",
          key: "idConcepto",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("factura_concepto");
  },
};
