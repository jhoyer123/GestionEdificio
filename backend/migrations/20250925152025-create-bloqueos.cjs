"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bloqueos", {
      idBloqueo: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      // La clave foránea es OPCIONAL: si tiene valor, bloquea solo ESA área.
      areaComunId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Areas_Comunes",
          key: "idAreaComun",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      // Bloquea por TIPO (Ej: Bloquear TODOS los gimnasios).
      // Se usa cuando areaComunId es NULL.
      tipoAreaBloqueada: {
        allowNull: true,
        type: Sequelize.ENUM(
          "salon",
          "gimnasio",
          "parqueo_visitas",
          "parqueo_extra"
        ),
      },

      fechaInicio: {
        allowNull: false,
        type: Sequelize.DATEONLY, // Solo necesitamos la fecha
      },

      fechaFin: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },

      motivo: {
        allowNull: false,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("bloqueos");
  },
};
