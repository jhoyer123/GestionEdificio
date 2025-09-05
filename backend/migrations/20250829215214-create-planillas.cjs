"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Planillas", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      mes: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      anio: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      salario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      personalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Personal",
          key: "id",
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
    await queryInterface.dropTable("Planillas");
  },
};
