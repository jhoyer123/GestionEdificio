import { Model, Op } from "sequelize";
import Factura from "../../models/Factura.js";
import Reserva from "../../models/Reserva.js";
import AreaComun from "../../models/AreaComun.js";
import Sequelize from "sequelize";

export const getDashboardStats = async (req, res) => {
  try {
    // Obtener la fecha actual
    //Contar el total de facturas (mantenimiento y reservas) emitidas en el mes actual y sus totales
    const inicioMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const totalFacturasMes = await Factura.count({
      where: { fechaEmision: { [Op.gte]: inicioMes } },
    });

    const ingresosMes = await Factura.sum("montoTotal", {
      where: { estado: "pagada", fechaEmision: { [Op.gte]: inicioMes } },
    });
    const montoPendiente = await Factura.sum("montoTotal", {
      where: { estado: "pendiente" },
    });

    //contar total facturas mantenimiento pagadas
    const totalFacturasMantenimientoPagadas = await Factura.count({
      where: {
        reservaId: null,
        estado: "pagada",
        fechaEmision: { [Op.gte]: inicioMes },
      },
    });

    //contar total facturas mantenimiento pendientes
    const totalFacturasMantenimientoPendientes = await Factura.count({
      where: {
        departamentoId: null,
        estado: "pendiente",
        fechaEmision: { [Op.gte]: inicioMes },
      },
    });

    //contar total facturas mantenimiento
    const totalFacturasMantenimiento = await Factura.count({
      where: { reservaId: null, fechaEmision: { [Op.gte]: inicioMes } },
    });

    //contar total facturas reservas
    const totalFacturasReservas = await Factura.count({
      where: { departamentoId: null, fechaEmision: { [Op.gte]: inicioMes } },
    });

    //Reservas del dia de hoy de salones de uso común************
    const hoy = new Date().toISOString().slice(0, 10);
    const reservas = await Reserva.findAll({
      include: [{ model: AreaComun, as: "areaComun" }],
    });
    let cont = 0;
    reservas.forEach((reserva) => {
      if (
        reserva.fechaReserva === hoy &&
        reserva.estado === "confirmada" &&
        reserva.areaComun.tipoArea === "salones"
      ) {
        cont++;
      }
    });
    const reservasHoySalones = cont;

    // Reservas totales de salones
    const reservasTotalesSalones = await Reserva.count({
      where: {
        estado: "confirmada",
      },
      include: [
        {
          model: AreaComun,
          as: "areaComun",
          where: { tipoArea: "salones" },
          required: true, // INNER JOIN para contar solo las que tienen área común
        },
      ],
    });
    //reservas totales de gimnasio
    const reservasTotalesGimnasio = await Reserva.count({
      where: {
        estado: "confirmada",
      },
      include: [
        {
          model: AreaComun,
          as: "areaComun",
          where: { tipoArea: "gimnasio" },
          required: true,
        },
      ],
    });
    //reservas totales de parqueo
    const reservasTotalesParqueo = await Reserva.count({
      where: {
        estado: "confirmada",
      },
      include: [
        {
          model: AreaComun,
          as: "areaComun",
          where: { tipoArea: "parqueo" },
          required: true,
        },
      ],
    });

    //Todas las reservas del dia de hoy de todas las areas existentes********
    const hoy2 = new Date();
    const año = hoy2.getFullYear();
    const mes = String(hoy2.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy2.getDate()).padStart(2, "0");
    const fechaHoy = `${año}-${mes}-${dia}`;

    const reservasHoyData = await Reserva.count({
      where: Sequelize.literal(`DATE(fechaReserva) = '${fechaHoy}'`),
    });

    /* 
    //ultimas 5 facturas emitidas
    const recentFacturas = await Factura.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      attributes: [
        "idFactura",
        "nroFactura",
        "fechaEmision",
        "montoTotal",
        "pagado",
      ],
    });

    //Agrupar ingresos por mes
    const ingresosPorMes = await sequelize.query(
      `SELECT to_char("fechaEmision", 'YYYY-MM') as month, sum("montoTotal") as total
   FROM facturas
   GROUP BY month
   ORDER BY month`,
      { type: sequelize.QueryTypes.SELECT }
    );  */

    res.json({
      totalFacturasMes,
      ingresosMes: ingresosMes || 0,
      montoPendiente: montoPendiente || 0,
      reservasHoySalones,
      reservasHoyData,
      reservasTotalesSalones,
      reservasTotalesGimnasio,
      reservasTotalesParqueo,
      totalFacturasMantenimientoPagadas,
      totalFacturasMantenimientoPendientes,
      totalFacturasMantenimiento,
      totalFacturasReservas,
      /* reservasActivasAhora, */
      /* recentFacturas,
      ingresosPorMes,  */
    });
  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
