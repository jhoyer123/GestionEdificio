"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      // Crear 5 conceptos de mantenimiento: 1 anual, 1 único, 3 mensuales
      await queryInterface.bulkInsert("conceptos_mantenimiento", [
        {
          titulo: "Mantenimiento Anual de Ascensores",
          descripcion: "Revisión y mantenimiento preventivo anual de todos los ascensores del edificio",
          monto: 150.00,
          frecuencia: "anual",
          usado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          titulo: "Reparación de Techo - Eventual",
          descripcion: "Reparación extraordinaria del techo del edificio por filtraciones",
          monto: 500.00,
          frecuencia: "unico",
          usado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          titulo: "Limpieza Común Mensual",
          descripcion: "Servicio de limpieza de áreas comunes del edificio",
          monto: 80.00,
          frecuencia: "mensual",
          usado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          titulo: "Mantenimiento de Jardines",
          descripcion: "Cuidado y mantenimiento mensual de áreas verdes",
          monto: 120.00,
          frecuencia: "mensual",
          usado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          titulo: "Servicio de Seguridad",
          descripcion: "Servicio de vigilancia y seguridad mensual",
          monto: 200.00,
          frecuencia: "mensual",
          usado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ], { transaction: t });

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("conceptos_mantenimiento", null, {});
  },
};