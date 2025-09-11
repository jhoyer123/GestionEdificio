"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("personales", {
      idPersonal: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      direccion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fechaNacimiento: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      genero: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      funcionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "funciones",
          key: "idFuncion",
        },
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "idUsuario",
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
    await queryInterface.dropTable("personales");
  },
};
