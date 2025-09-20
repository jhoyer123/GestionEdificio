"use strict";

const { default: sequelize } = require('../config/database');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("habita", {
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "idUsuario",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      departamentoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "departamentos",
          key: "idDepartamento",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      tipoResidencia: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable("habita");
  },
};
