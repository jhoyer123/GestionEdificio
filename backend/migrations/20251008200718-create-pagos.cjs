"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pagos", {
      idPago: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_unico_pago: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      usuarioId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "usuarios",
          key: "idUsuario",
        },
      },
      facturaId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "facturas",
          key: "idFactura",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reservaId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "reservas",
          key: "idReserva",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      planillaId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "planillas",
          key: "idPlanilla",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      metodoPago: {
        type: Sequelize.ENUM("transferencia", "QR", "efectivo"),
        allowNull: false,
        defaultValue: "QR",
      },
      fechaPago: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      estado: {
        type: Sequelize.ENUM("pendiente", "confirmado", "rechazado"),
        defaultValue: "pendiente",
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
    await queryInterface.dropTable("pagos");
  },
};
