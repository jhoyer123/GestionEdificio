"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("anuncios", {
      idAnuncio: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      visiblePara: {
        type: Sequelize.ENUM("residente", "personal", "todos"),
        allowNull: false,
      },
      fechaExpiracion: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        references: {
          model: "usuarios",
          key: "idUsuario",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("anuncios");
  },
};
