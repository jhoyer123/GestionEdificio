"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("anuncioUsuarios", {
      idAnuncioUsuario: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      anuncioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "anuncios",
          key: "idAnuncio",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "idUsuario",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      visto: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      fechaVisto: {
        type: Sequelize.DATE,
        allowNull: false,
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
    await queryInterface.dropTable("anuncioUsuarios");
  },
};
