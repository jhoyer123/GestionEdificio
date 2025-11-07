import { Model, Op } from "sequelize";
import Factura from "../../models/Factura.js";
import Reserva from "../../models/Reserva.js";
import AreaComun from "../../models/AreaComun.js";
import Departamento from "../../models/Departamento.js";
import Usuario from "../../models/Usuario.js";
import Residente from "../../models/Residente.js";
import Habita from "../../models/Habita.js";
import Sequelize from "sequelize";

export const getDashboardStats = async (req, res) => {
  try {
    // ============ FECHAS BASE ============
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioMesAnterior = new Date(
      hoy.getFullYear(),
      hoy.getMonth() - 1,
      1
    );
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    const inicio6Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);

    const fechaHoy = hoy.toISOString().slice(0, 10);

    // ============ KPIs ACTUALES ============
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
        reservaId: null,
        estado: "pendiente",
        fechaEmision: { [Op.gte]: inicioMes },
      },
    });

    //contar total facturas mantenimiento
    const totalFacturasMantenimiento = await Factura.count({
      where: { reservaId: null, fechaEmision: { [Op.gte]: inicioMes } },
    });

    // Reservas de hoy
    const reservasHoy = await Reserva.count({
      where: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("DATE", Sequelize.col("fechaReserva")),
            fechaHoy
          ),
          { estado: "confirmada" },
        ],
      },
    });

    // Reservas de hoy por tipo
    const reservasHoySalones = await Reserva.count({
      where: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("DATE", Sequelize.col("fechaReserva")),
            fechaHoy
          ),
          { estado: "confirmada" },
        ],
      },
      include: [
        {
          model: AreaComun,
          as: "areaComun",
          where: { tipoArea: "salones" },
          required: true,
        },
      ],
    });

    /* // ============ NUEVO: INGRESOS ÚLTIMOS 6 MESES ============
    const ingresosPorMes = await Factura.findAll({
      attributes: [
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("fechaEmision"),
            "%Y-%m-01"
          ),
          "mes",
        ],
        [Sequelize.fn("SUM", Sequelize.col("montoTotal")), "totalIngresos"],
        [Sequelize.fn("COUNT", Sequelize.col("idFactura")), "totalFacturas"],
      ],
      where: {
        fechaEmision: { [Op.gte]: inicio6Meses },
        estado: "pagada",
      },
      group: [
        Sequelize.fn("DATE_FORMAT", Sequelize.col("fechaEmision"), "%Y-%m-01"),
      ],
      order: [
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("fechaEmision"),
            "%Y-%m-01"
          ),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Formatear datos de ingresos
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ]; 

  
    const ingresosMensuales = ingresosPorMes.map((item) => ({
      mes: meses[new Date(item.mes).getMonth()],
      ingresos: parseFloat(item.totalIngresos) || 0,
      facturas: parseInt(item.totalFacturas) || 0,
    }));*/
    // ============ NUEVO: INGRESOS ÚLTIMOS 6 MESES ============

    const ingresosPorMes = await Factura.findAll({
      attributes: [
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("fechaEmision"),
            "%Y-%m-01"
          ),
          "mes",
        ],
        [Sequelize.fn("SUM", Sequelize.col("montoTotal")), "totalIngresos"],
        [Sequelize.fn("COUNT", Sequelize.col("idFactura")), "totalFacturas"],
      ],
      where: {
        fechaEmision: { [Op.gte]: inicio6Meses },
        estado: "pagada",
      },
      group: [
        Sequelize.fn("DATE_FORMAT", Sequelize.col("fechaEmision"), "%Y-%m-01"),
      ],
      order: [
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("fechaEmision"),
            "%Y-%m-01"
          ),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Nombres de los meses
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    // Formatear datos de ingresos sin usar new Date()
    const ingresosMensuales = ingresosPorMes.map((item) => {
      const [year, month] = item.mes.split("-"); // "2025-10-01" → ["2025","10","01"]
      return {
        mes: meses[parseInt(month, 10) - 1], // mes correcto
        ingresos: parseFloat(item.totalIngresos) || 0,
        facturas: parseInt(item.totalFacturas) || 0,
      };
    });

    // ============ NUEVO: RESERVAS POR TIPO DE ÁREA (TOTAL HISTÓRICO) ============
    const reservasPorTipoArea = await Reserva.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("Reserva.idReserva")), "cantidad"],
      ],
      where: { estado: "confirmada" },
      include: [
        {
          model: AreaComun,
          as: "areaComun",
          attributes: ["tipoArea"],
          required: true,
        },
      ],
      group: ["areaComun.tipoArea"],
      raw: true,
    });

    // Formatear datos con porcentajes
    const totalReservas = reservasPorTipoArea.reduce(
      (sum, item) => sum + parseInt(item.cantidad),
      0
    );
    const reservasPorArea = reservasPorTipoArea.map((item) => {
      const cantidad = parseInt(item.cantidad);
      return {
        area: item["areaComun.tipoArea"],
        cantidad: cantidad,
        porcentaje:
          totalReservas > 0 ? Math.round((cantidad / totalReservas) * 100) : 0,
      };
    });

    // ============ NUEVO: ESTADO DE PAGOS (FACTURAS) ============
    const estadoPagos = await Factura.findAll({
      attributes: [
        "estado",
        [Sequelize.fn("COUNT", Sequelize.col("idFactura")), "cantidad"],
        [Sequelize.fn("SUM", Sequelize.col("montoTotal")), "monto"],
      ],
      group: ["estado"],
      raw: true,
    });

    const estadoPagosFormateado = {
      pagadas: 0,
      pendientes: 0,
      vencidas: 0,
      montoPagado: 0,
      montoPendiente: 0,
      montoVencido: 0,
    };

    estadoPagos.forEach((item) => {
      if (item.estado === "pagada") {
        estadoPagosFormateado.pagadas = parseInt(item.cantidad);
        estadoPagosFormateado.montoPagado = parseFloat(item.monto) || 0;
      } else if (item.estado === "pendiente") {
        estadoPagosFormateado.pendientes = parseInt(item.cantidad);
        estadoPagosFormateado.montoPendiente = parseFloat(item.monto) || 0;
      } else if (item.estado === "vencida") {
        estadoPagosFormateado.vencidas = parseInt(item.cantidad);
        estadoPagosFormateado.montoVencido = parseFloat(item.monto) || 0;
      }
    });

    // ============ NUEVO: ÚLTIMAS 10 RESERVAS ============
    const ultimasReservas = await Reserva.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      attributes: [
        "idReserva",
        "fechaReserva",
        "horaInicio",
        "horaFin",
        "estado",
        "costoTotal",
        "motivo",
      ],
      include: [
        {
          model: AreaComun,
          as: "areaComun",
          attributes: ["nombreAreaComun", "tipoArea"],
        },
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "email"],
          include: [
            {
              model: Residente,
              as: "residente",
              attributes: ["telefono"],
            },
          ],
        },
      ],
    });

    // Formatear últimas reservas
    const ultimasReservasFormateadas = ultimasReservas.map((reserva) => ({
      id: reserva.idReserva,
      fecha: reserva.fechaReserva,
      horario:
        reserva.horaInicio && reserva.horaFin
          ? `${reserva.horaInicio.slice(0, 5)} - ${reserva.horaFin.slice(0, 5)}`
          : "Todo el día",
      area: reserva.areaComun?.nombreAreaComun || "N/A",
      tipoArea: reserva.areaComun?.tipoArea || "N/A",
      residente: reserva.usuario?.nombre || "N/A",
      telefono: reserva.usuario?.residente?.telefono || "N/A",
      estado: reserva.estado,
      costo: parseFloat(reserva.costoTotal) || 0,
    }));

    // ============ NUEVO: FACTURAS PRÓXIMAS A VENCER (< 7 días) ============
    const fecha7Dias = new Date();
    fecha7Dias.setDate(fecha7Dias.getDate() + 7);

    const facturasProximasVencer = await Factura.findAll({
      where: {
        estado: "pendiente",
        fechaVencimiento: {
          [Op.between]: [hoy, fecha7Dias],
        },
        departamentoId: { [Op.ne]: null }, // Solo facturas de mantenimiento
      },
      order: [["fechaVencimiento", "ASC"]],
      limit: 10,
      include: [
        {
          model: Departamento,
          as: "departamento",
          attributes: ["idDepartamento", "numero", "piso"],
        },
      ],
    });

    // Obtener usuarios de cada departamento de forma más simple
    const facturasConUsuarios = await Promise.all(
      facturasProximasVencer.map(async (factura) => {
        if (factura.departamentoId !== null) {
          try {
            // Obtener usuario directamente desde el departamento usando la asociación many-to-many
            const usuarios = await factura.departamento.getUsuarios({
              attributes: ["nombre", "email"],
            });

            const usuario = usuarios[0];
            return {
              ...factura.toJSON(),
              departamento: {
                ...factura.departamento.toJSON(),
                usuarios: usuario ? [usuario] : [],
              },
            };
          } catch (error) {
            console.error(
              `Error obteniendo usuarios para departamento ${factura.departamentoId}:`,
              error
            );
            return {
              ...factura.toJSON(),
              departamento: {
                ...factura.departamento.toJSON(),
                usuarios: [],
              },
            };
          }
        }
        return factura.toJSON();
      })
    );
    // Formatear facturas próximas a vencer
    const facturasProximasFormateadas = facturasConUsuarios.map((factura) => {
      const diasRestantes = Math.ceil(
        (new Date(factura.fechaVencimiento) - hoy) / (1000 * 60 * 60 * 24)
      );
      const usuario = factura.departamento?.usuarios?.[0];

      return {
        id: factura.idFactura,
        numero: factura.nroFactura,
        monto: parseFloat(factura.montoTotal) || 0,
        fechaVencimiento: factura.fechaVencimiento,
        diasRestantes: diasRestantes,
        departamento: factura.departamento?.numero || "N/A",
        residente: usuario ? usuario.nombre : "Sin asignar",
        urgencia:
          diasRestantes <= 3 ? "alta" : diasRestantes <= 5 ? "media" : "baja",
      };
    });

    // ============ NUEVO: COMPARATIVA MES ACTUAL VS ANTERIOR ============
    const ingresosMesAnterior = await Factura.sum("montoTotal", {
      where: {
        estado: "pagada",
        fechaEmision: {
          [Op.between]: [inicioMesAnterior, finMesAnterior],
        },
      },
    });

    const reservasMesAnterior = await Reserva.count({
      where: {
        estado: "confirmada",
        fechaReserva: {
          [Op.between]: [
            inicioMesAnterior.toISOString().slice(0, 10),
            finMesAnterior.toISOString().slice(0, 10),
          ],
        },
      },
    });

    const reservasMesActual = await Reserva.count({
      where: {
        estado: "confirmada",
        fechaReserva: { [Op.gte]: inicioMes.toISOString().slice(0, 10) },
      },
    });

    const calcularPorcentajeCambio = (actual, anterior) => {
      if (!anterior || anterior === 0) return actual > 0 ? 100 : 0;
      return Math.round(((actual - anterior) / anterior) * 100 * 10) / 10;
    };

    const comparativaMensual = {
      ingresosMesActual: parseFloat(ingresosMes) || 0,
      ingresosMesAnterior: parseFloat(ingresosMesAnterior) || 0,
      porcentajeCambioIngresos: calcularPorcentajeCambio(
        ingresosMes || 0,
        ingresosMesAnterior || 0
      ),
      reservasMesActual,
      reservasMesAnterior,
      porcentajeCambioReservas: calcularPorcentajeCambio(
        reservasMesActual,
        reservasMesAnterior
      ),
    };

    // ============ TOP 5 ÁREAS MÁS RESERVADAS ============
    const topAreasReservadas = await AreaComun.findAll({
      attributes: [
        "idAreaComun",
        "nombreAreaComun",
        "tipoArea",
        [
          // SOLUCIÓN: Usar Sequelize.literal para el COUNT.
          // Esto fuerza el alias de la tabla 'reservas' y la columna 'areaComunId'
          // a ser reconocidos directamente por MySQL como parte del JOIN subyacente.
          Sequelize.literal("COUNT(reservas.areaComunId)"),
          "totalReservas",
        ],
      ],
      include: [
        {
          model: Reserva,
          as: "reservas",
          attributes: [],
          where: { estado: "confirmada" },
          // required: true es esencial para el INNER JOIN
          required: true,
          // Una optimización que puede ayudar al JOIN
          duplicating: false,
        },
      ],
      group: [
        // La cláusula GROUP BY debe ser perfecta
        "AreaComun.idAreaComun",
        "AreaComun.nombreAreaComun",
        "AreaComun.tipoArea",
        // NOTA: Algunos motores de MySQL/MariaDB pueden requerir que el ID sea referenciado
        // por su alias de tabla: "AreaComun.idAreaComun"
      ],
      // Ordena por el alias calculado
      order: [[Sequelize.literal("totalReservas"), "DESC"]],
      limit: 5,
      raw: true,
    });

    const topAreasFormateadas = topAreasReservadas.map((area) => ({
      id: area.idAreaComun,
      nombre: area.nombreAreaComun,
      tipo: area.tipoArea,
      reservas: parseInt(area.totalReservas) || 0,
    }));

    // ============ RESPUESTA FINAL ============
    res.json({
      // KPIs Actuales
      kpis: {
        totalFacturasMes,
        ingresosMes: parseFloat(ingresosMes) || 0,
        montoPendiente: parseFloat(montoPendiente) || 0,
        reservasHoy,
        reservasHoySalones,
        totalFacturasMantenimientoPagadas,
        totalFacturasMantenimientoPendientes,
        totalFacturasMantenimiento,
      },

      // Gráficas
      ingresosMensuales,
      reservasPorArea,
      estadoPagos: estadoPagosFormateado,

      // Tablas
      ultimasReservas: ultimasReservasFormateadas,
      facturasProximasVencer: facturasProximasFormateadas,
      topAreasReservadas: topAreasFormateadas,

      // Comparativas
      comparativaMensual,
    });
  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    res.status(500).json({
      error: "Error al obtener estadísticas",
      detalles: error.message,
    });
  }
};

export const executeQuery = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({
      status: "error",
      message: 'Falta la propiedad "query" en el cuerpo de la solicitud.',
    });
  }

  console.log(`[BD Query] Recibida la consulta SQL: ${query}`);

  try {
    // Usamos sequelize.query() para ejecutar SQL crudo (raw queries),
    // que es lo que el Agente de IA va a generar.
    // El 'type: Sequelize.QueryTypes.SELECT' es para obtener solo los resultados.
    const [results, metadata] = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    // Éxito: Devolvemos los resultados en el formato esperado por n8n.
    res.json({
      status: "success",
      data: results,
    });
  } catch (error) {
    console.error("ERROR al ejecutar la consulta:", error.message);

    // Fallo: Devolvemos un error, lo cual le ayudará al Agente de IA a entender que algo salió mal.
    res.status(500).json({
      status: "error",
      message: "Error al ejecutar la consulta en la base de datos.",
      details: error.message, // Útil para depuración, pero ten cuidado de no exponer demasiada info en producción.
    });
  }
};
