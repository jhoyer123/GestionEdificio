'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Areas_Comunes', {
      idAreaComun: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombreAreaComun: {
        allowNull: false,
        type: Sequelize.STRING
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      capacidadMaxima: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      costoPorHora: {
        defaultValue: 0,
        type: Sequelize.DECIMAL(10, 2)
      },
      horarioInicio: {
        allowNull: false,
        type: Sequelize.TIME
      },
      horarioFin: {
        allowNull: false,
        type: Sequelize.TIME
      },
      requiereAprobacion: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Areas_Comunes');
  }
};
