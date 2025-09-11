"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("turnos", {
      idTurno: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      horaInicio: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      horaFin: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      dia: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable("turnos");
  },
};
