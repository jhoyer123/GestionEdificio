"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert("Areas_Comunes", [
        {
          nombreAreaComun: "SALON DE EVENTOS",
          descripcion: "Salón principal para eventos y reuniones comunitarias",
          capacidadMaxima: 50,
          tipoArea: "salones",
          costoBase: 100.00,
          horarioApertura: "08:00:00",
          horarioCierre: "22:00:00",
          requiereAprobacion: true,
          imageUrl: "salondeeventos.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombreAreaComun: "GIMNASIO",
          descripcion: "Área de ejercicio con equipos modernos",
          capacidadMaxima: 20,
          tipoArea: "gimnasio",
          costoBase: 50.00,
          horarioApertura: "06:00:00",
          horarioCierre: "22:00:00",
          requiereAprobacion: false,
          imageUrl: "gimnasio.jpeg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombreAreaComun: "PARQUEO",
          descripcion: "Espacios de parqueo para residentes y visitantes",
          capacidadMaxima: 30,
          tipoArea: "parqueo",
          costoBase: 10.00,
          horarioApertura: "00:00:00",
          horarioCierre: "23:59:59",
          requiereAprobacion: false,
          imageUrl: "parqueo.jpeg",
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
    await queryInterface.bulkDelete("areas_Comunes", null, {});
  },
};