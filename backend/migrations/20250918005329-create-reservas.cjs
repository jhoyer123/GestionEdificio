"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reservas", {
      idReserva: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      usuarioId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "usuarios",
          key: "idUsuario",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      areaComunId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Areas_Comunes",
          key: "idAreaComun",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      fechaReserva: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      horaInicio: {
        allowNull: false,
        type: Sequelize.TIME,
      },
      horaFin: {
        allowNull: false,
        type: Sequelize.TIME,
      },
      motivo: {
        type: Sequelize.TEXT,
      },
      numAsistentes: {
        type: Sequelize.INTEGER,
      },
      estado: {
        allowNull: false,
        type: Sequelize.ENUM("pendiente", "confirmada","rechazada", "cancelada"),
        defaultValue: "pendiente",
      },
      costoTotal: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      pagado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable("reservas");
  },
};
