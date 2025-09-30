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
      cajaId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "parqueocajas",
          key: "idParqueoCaja",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      fechaReserva: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      // CAMBIO 1: Hacemos la hora de inicio opcional (NULLABLE)
      horaInicio: {
        allowNull: true, // ¡ANTES era false!
        type: Sequelize.TIME,
      },

      // CAMBIO 2: Hacemos la hora de fin opcional (NULLABLE)
      horaFin: {
        allowNull: true, // ¡ANTES era false!
        type: Sequelize.TIME,
      },

      // CAMBIO 3: Añadimos la fecha de fin de reserva (Para reservas de varios días)
      fechaFinReserva: {
        allowNull: true,
        type: Sequelize.DATEONLY, // Usar DATEONLY si solo te interesa el día
      },
      /* horaInicio: {
        allowNull: false,
        type: Sequelize.TIME,
      },
      horaFin: {
        allowNull: false,
        type: Sequelize.TIME,
      }, */
      motivo: {
        type: Sequelize.TEXT,
      },
      numAsistentes: {
        type: Sequelize.INTEGER,
      },
      estado: {
        allowNull: false,
        type: Sequelize.ENUM(
          "pendiente",
          "confirmada",
          "rechazada",
          "cancelada"
        ),
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
