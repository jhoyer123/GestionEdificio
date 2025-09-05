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
          key: "id",
        },
      },
      departamentoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "departamentos",
          key: "id",
        },
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
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("habita");
  },
};
