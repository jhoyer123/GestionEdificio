// generarFacturas.js
import cron from "node-cron";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Departamento from "../models/Departamento.js";
import Factura from "../models/Factura.js";
import DetalleFactura from "../models/DetallesFactura.js";
import Usuario from "../models/Usuario.js";

async function generarFacturas(periodDate = new Date()) {
  const year = periodDate.getFullYear();
  const month = periodDate.getMonth() + 1; // 1-12
  //Esto en producción sería el primer y último día del mes
/*   const start = new Date(year, month - 1, 1, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59); // último día del mes */
  // En desarrollo: período por minuto
  const minute = periodDate.getMinutes();
  const start = new Date(year, month-1, periodDate.getDate(), periodDate.getHours(), minute, 0);
  const end = new Date(year, month-1, periodDate.getDate(), periodDate.getHours(), minute, 59);

  const departamentos = await Departamento.findAll({
    include: [
      {
        model: Usuario,
        through: { attributes: ["tipoResidencia"] }, // Incluir datos de la tabla intermedia
        as: "usuarios",
        required: true, // Solo departamentos con usuarios
      },
    ],
  });

  for (const d of departamentos) {
    // evita duplicados
    const existing = await Factura.findOne({
      where: {
        departamentoId: d.idDepartamento,
        fechaEmision: { [Op.between]: [start, end] },
      },
    });
    if (existing) continue;
    // construir detalles
    const detalles = [];
    if (d.usuarios[0].Habita.tipoResidencia !== "propietario") {
      detalles.push({
        concepto: "Alquiler",
        monto: d.alquilerPrecio,
      });
    }

    /* // ejemplo: mantenimiento puede venir del departamento o de config
    const mantenimiento = d.mantenimientoMensual || 0;
    if (mantenimiento > 0)
      detalles.push({
        concepto: "Mantenimiento",
        cantidad: 1,
        precioUnitario: mantenimiento,
        subtotal: mantenimiento,
      }); */

    const montoTotal = detalles.reduce((s, it) => s + it.monto, 0);

    // generar numero (FAC-YYYYMM-XXXX)
    const countThisMonth = await Factura.count({
      where: { fechaEmision: { [Op.between]: [start, end] } },
    });
    const seq = String(countThisMonth + 1).padStart(4, "0");
    // ESTO ES PARA PRODUCCION CADA MES
    /* const numero = `FAC-${year}${String(month).padStart(2, "0")}-${seq}`; */
    const numero = `FAC-${year}${String(month).padStart(2, "0")}-${Date.now()}-${seq}`;

    // crear factura y detalles en transacción
    const t = await sequelize.transaction();
    try {
      const factura = await Factura.create(
        {
          nroFactura: numero,
          departamentoId: d.idDepartamento,
          fechaEmision: new Date(),
          fechaVencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          montoTotal,
          estado: "pendiente",
        },
        { transaction: t }
      );

      for (const det of detalles) {
        await DetalleFactura.create(
          { ...det, facturaId: factura.idFactura },
          { transaction: t }
        );
      }

      await t.commit();
      console.log("Factura creada:", numero);
    } catch (err) {
      await t.rollback();
      console.error("Error creando factura para departamento", d.id, err);
    }
  }
}

// SCHEDULE: en desarrollo cada minuto; en produccion usar '0 0 1 * *'
cron.schedule("* * * * *", () => generarFacturas());
// cron.schedule('0 0 1 * *', () => generarFacturas());

export { generarFacturas };
