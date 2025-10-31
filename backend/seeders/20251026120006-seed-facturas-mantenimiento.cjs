"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      // Obtener departamentos ocupados por residentes
      const departamentosResult = await queryInterface.sequelize.query(
        `SELECT DISTINCT d.idDepartamento, d.numero
         FROM departamentos d
         INNER JOIN habita h ON d.idDepartamento = h.departamentoId
         INNER JOIN residentes r ON h.usuarioId = r.usuarioId
         ORDER BY d.idDepartamento;`,
        { transaction: t }
      );
      const departamentos = departamentosResult[0] || [];

      // Obtener conceptos de mantenimiento
      const conceptosResult = await queryInterface.sequelize.query(
        'SELECT idConcepto, titulo, descripcion, monto, frecuencia, usado FROM conceptos_mantenimiento ORDER BY idConcepto;',
        { transaction: t }
      );
      const conceptos = conceptosResult[0] || [];

      if (departamentos.length === 0 || conceptos.length === 0) {
        throw new Error("No hay departamentos ocupados o conceptos de mantenimiento para crear facturas");
      }

      // Crear facturas para 4 meses diferentes (del actual hacia atrás)
      const ahora = new Date();
      const meses = [];

      // Mes actual y 3 meses anteriores
      for (let i = 0; i < 4; i++) {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        meses.push({
          year: fecha.getFullYear(),
          month: fecha.getMonth(),
          fechaEmision: new Date(fecha.getFullYear(), fecha.getMonth(), 15), // Mitad del mes
        });
      }

      const facturasData = [];

      // Procesar cada mes
      for (const mesData of meses) {
        const fechaFactura = mesData.fechaEmision.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

        // Contar facturas existentes para esta fecha
        const totalFacturasFechaResult = await queryInterface.sequelize.query(
          `SELECT COUNT(*) as count FROM facturas WHERE nroFactura LIKE 'FAC-${fechaFactura}-%'`,
          { transaction: t }
        );
        let contador = (totalFacturasFechaResult[0][0].count || 0) + 1;

        // Para cada mes, crear facturas para TODOS los departamentos ocupados
        const departamentosMes = [...departamentos]; // Todos los departamentos ocupados

        for (const departamento of departamentosMes) {
          const mesIndex = meses.indexOf(mesData);

          // Filtrar conceptos según frecuencia y mes
          let conceptosParaFactura = conceptos.filter(concepto => {
            if (concepto.frecuencia === 'mensual') {
              return true; // Siempre incluir mensuales
            }
            if (concepto.frecuencia === 'anual') {
              return mesIndex === 0; // Solo en el mes actual
            }
            if (concepto.frecuencia === 'unico') {
              return !concepto.usado && mesIndex === 0; // Solo una vez y en mes actual
            }
            return false;
          });

          // Asegurar que al menos haya conceptos mensuales
          if (conceptosParaFactura.length === 0) {
            conceptosParaFactura = conceptos.filter(c => c.frecuencia === 'mensual');
          }

          // Si aún no hay conceptos, continuar con el siguiente departamento
          if (conceptosParaFactura.length === 0) continue;

          // Calcular monto total
          const montoTotal = conceptosParaFactura.reduce((sum, c) => {
            return sum + parseFloat(c.monto);
          }, 0);

          // Fecha de vencimiento: 30 días después de emisión, pero para facturas "próximas a vencer"
          // hacer que algunas estén a punto de vencer (5 días restantes)
          let fechaVencimiento;
          let estadoFactura = 'pendiente';
          if (mesIndex === 0 && Math.random() < 0.4) { // 40% de las del mes actual próximas a vencer
            fechaVencimiento = new Date(ahora.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 días desde ahora
          } else {
            fechaVencimiento = new Date(mesData.fechaEmision.getTime() + 30 * 24 * 60 * 60 * 1000);
            // Si la fecha de vencimiento ya pasó, marcar como pagada
            if (fechaVencimiento < ahora) {
              estadoFactura = 'pagada';
            }
          }

          const nroFactura = `FAC-${fechaFactura}-${String(contador).padStart(3, '0')}`;

          facturasData.push({
            nroFactura,
            fechaEmision: mesData.fechaEmision,
            fechaVencimiento,
            montoTotal: montoTotal.toFixed(2),
            estado: estadoFactura,
            departamentoId: departamento.idDepartamento,
          });

          contador++;
        }
      }

      // Insertar facturas
      await queryInterface.bulkInsert("facturas", facturasData.map(f => ({
        ...f,
        createdAt: new Date(),
        updatedAt: new Date(),
      })), { transaction: t });

      // Obtener IDs de las facturas insertadas
      const facturasInsertadasResult = await queryInterface.sequelize.query(
        `SELECT idFactura, nroFactura, montoTotal, estado, departamentoId FROM facturas WHERE nroFactura LIKE 'FAC-%' AND fechaEmision >= '${meses[meses.length-1].fechaEmision.toISOString().slice(0, 10)}' ORDER BY idFactura DESC LIMIT ${facturasData.length};`,
        { transaction: t }
      );
      const facturasInsertadas = facturasInsertadasResult[0] || [];

      // Crear pagos para facturas pagadas
      const pagosData = [];
      facturasInsertadas.forEach(factura => {
        if (factura.estado === 'pagada') {
          // Encontrar la factura original para obtener la fecha de emisión correcta
          const facturaOriginal = facturasData.find(f => f.nroFactura === factura.nroFactura);

          pagosData.push({
            usuarioId: null, // Se asignará después
            facturaId: factura.idFactura,
            monto: factura.montoTotal,
            metodoPago: Math.random() < 0.5 ? "QR" : "transferencia",
            fechaPago: new Date(facturaOriginal.fechaEmision.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 días después de emisión
            estado: "confirmado",
          });
        }
      });

      // Asignar usuarios a los pagos
      if (pagosData.length > 0) {
        const usuariosResult = await queryInterface.sequelize.query(
          `SELECT DISTINCT h.usuarioId, h.departamentoId FROM habita h INNER JOIN residentes r ON h.usuarioId = r.usuarioId;`,
          { transaction: t }
        );
        const usuariosDepartamentos = usuariosResult[0] || [];

        pagosData.forEach((pago, index) => {
          const factura = facturasInsertadas.find(f => f.idFactura === pago.facturaId);
          const usuarioDep = usuariosDepartamentos.find(u => u.departamentoId === factura.departamentoId);
          if (usuarioDep) {
            pago.usuarioId = usuarioDep.usuarioId;
            pago.id_unico_pago = `PAY-MANT-${factura.idFactura}`;
          }
        });

        // Insertar pagos
        await queryInterface.bulkInsert("pagos", pagosData.map(p => ({
          ...p,
          createdAt: new Date(),
          updatedAt: new Date(),
        })), { transaction: t });
      }

      // Asignar IDs correctos a las relaciones concepto-factura
      // Necesitamos trackear qué conceptos van con qué factura
      const facturasConConceptos = facturasData.map((factura, index) => {
        const mesIndex = meses.findIndex(m => m.fechaEmision.getTime() === factura.fechaEmision.getTime());
        const conceptosFactura = conceptos.filter(concepto => {
          if (concepto.frecuencia === 'mensual') {
            return true;
          }
          if (concepto.frecuencia === 'anual') {
            return mesIndex === 0;
          }
          if (concepto.frecuencia === 'unico') {
            return !concepto.usado && mesIndex === 0;
          }
          return false;
        });

        // Fallback a mensuales si no hay conceptos
        const conceptosFinales = conceptosFactura.length > 0 ? conceptosFactura : conceptos.filter(c => c.frecuencia === 'mensual');

        return {
          factura: facturasInsertadas.find(f => f.nroFactura === factura.nroFactura),
          conceptos: conceptosFinales
        };
      });

      // Crear las relaciones concepto-factura
      const relacionesConceptos = [];
      facturasConConceptos.forEach(({ factura, conceptos }) => {
        if (factura && conceptos.length > 0) {
          conceptos.forEach(concepto => {
            relacionesConceptos.push({
              facturaId: factura.idFactura,
              conceptoMantenimientoId: concepto.idConcepto,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          });
        }
      });

      // Insertar relaciones en tabla intermedia
      if (relacionesConceptos.length > 0) {
        await queryInterface.bulkInsert("factura_concepto", relacionesConceptos, { transaction: t });
      }

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar relaciones primero
    await queryInterface.bulkDelete("factura_concepto", null, {});

    // Luego eliminar facturas de mantenimiento (facturas con departamentoId no null y sin reservaId)
    await queryInterface.bulkDelete("facturas", {
      departamentoId: { [Sequelize.Op.ne]: null },
      reservaId: null
    }, {});
  },
};