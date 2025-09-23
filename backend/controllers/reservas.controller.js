import Reserva from "../models/Reserva.js";
import AreaComun from "../models/AreaComun.js";
import Usuario from "../models/Usuario.js"; // Asegúrate de tener el modelo Usuario
import sequelize from "../config/database.js";
import Residente from "../models/Residente.js"; // si no lo tienes ya
// arriba del archivo (si no lo tienes ya)
import { Op } from "sequelize";

export const createReserva = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      usuarioId,
      areaComunId,
      fechaReserva, // "YYYY-MM-DD"
      horaInicio, // "HH:mm"
      horaFin, // "HH:mm"
      motivo,
      numAsistentes,
    } = req.body;

    // ---------- validaciones básicas ----------
    if (
      !usuarioId ||
      !areaComunId ||
      !fechaReserva ||
      !horaInicio ||
      !horaFin
    ) {
      await t.rollback();
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(horaInicio) || !timeRegex.test(horaFin)) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Formato de hora inválido. Use HH:mm" });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaReserva)) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Formato de fecha inválido. Use YYYY-MM-DD" });
    }

    const toMinutes = (hhmm) => {
      const [hh, mm] = hhmm.split(":").map(Number);
      return hh * 60 + mm;
    };

    const startMin = toMinutes(horaInicio);
    const endMin = toMinutes(horaFin);
    if (startMin >= endMin) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "horaInicio debe ser anterior a horaFin" });
    }

    // ---------- buscar recursos (dentro de la transacción) ----------
    const area = await AreaComun.findByPk(areaComunId, { transaction: t });
    if (!area) {
      await t.rollback();
      return res.status(404).json({ message: "El área común no existe" });
    }

    const residente = await Residente.findByPk(usuarioId, { transaction: t });
    if (!residente) {
      await t.rollback();
      return res.status(404).json({ message: "El residente no existe" });
    }

    // ---------- comprobar que la reserva no sea en el pasado ----------
    // construimos Date en zona del servidor (new Date(year, monthIndex, day, hour, minute))
    const [y, m, d] = fechaReserva.split("-").map(Number);
    const reservaStartDate = new Date(
      y,
      m - 1,
      d,
      Math.floor(startMin / 60),
      startMin % 60
    );
    const now = new Date();
    if (reservaStartDate < now) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "No se puede reservar en una fecha/hora pasada" });
    }

    // ---------- comprobar rango permitido por el area ----------
    if (!area.horarioInicio || !area.horarioFin) {
      await t.rollback();
      return res
        .status(500)
        .json({ message: "El área no tiene horario configurado" });
    }
    const areaStartMin = toMinutes(area.horarioInicio);
    const areaEndMin = toMinutes(area.horarioFin);
    if (startMin < areaStartMin || endMin > areaEndMin) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Horario fuera del rango permitido por el área" });
    }

    // ---------- comprobar capacidad ----------
    if (numAsistentes > area.capacidadMaxima || numAsistentes < 1) {
      await t.rollback();
      return res.status(400).json({
        message: `El Número de asistentes excede la capacidad (${area.capacidadMaxima})`,
      });
    }

    // ---------- comprobación de solapamiento ----------
    // Lógica de solapamiento (intervalos en la misma fecha y área):
    // Dos intervalos [S1, E1) y [S2, E2) se solapan si: S1 < E2 && E1 > S2
    // Validar solapamiento de reservas en la misma área y fecha
    // obtener reservas existentes para el area y bloquear filas (evita race conditions)
    const reservasExistentes = await Reserva.findAll({
      where: { areaComunId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // filtrar por la misma fecha en JS — evitamos problemas por timezone/DATE vs DATEONLY
    const sameDay = reservasExistentes.filter((r) => {
      const d = new Date(r.fechaReserva);
      const ymd = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
      // si tu `fechaReserva` viene con zona, asegúrate que el formato sea "YYYY-MM-DD"
      return (
        ymd ===
        (fechaReserva.length > 10 ? fechaReserva.slice(0, 10) : fechaReserva)
      );
    });

    // comprobar solapamiento en JS
    for (const r of sameDay) {
      const sExist = toMinutes(r.horaInicio);
      const eExist = toMinutes(r.horaFin);
      // overlap if: sExist < endMin && eExist > startMin
      if (sExist < endMin && eExist > startMin) {
        await t.rollback();
        return res.status(400).json({
          message:
            "Ya existe una reserva en este horario PUEDE REVISAR HORARIOS DISPONIBLES ARRIBA",
        });
      }
    }

    // ---------- calcular costo ----------
    const duracionHoras = (endMin - startMin) / 60;
    const costoPorHora = Number(area.costoPorHora || 0);
    const costoTotal = Number((duracionHoras * costoPorHora).toFixed(2));

    // ---------- estado inicial ----------
    const estado = area.requiereAprobacion ? "pendiente" : "confirmada";

    // ---------- crear reserva dentro de la transacción ----------
    const reserva = await Reserva.create(
      {
        usuarioId,
        areaComunId,
        fechaReserva,
        horaInicio,
        horaFin,
        motivo,
        numAsistentes,
        estado,
        costoTotal,
        pagado: false,
      },
      { transaction: t }
    );

    await t.commit();
    return res
      .status(201)
      .json({ reserva: reserva, message: "Reserva creada exitosamente" });
  } catch (error) {
    await t.rollback();
    console.error("createReserva error:", error);
    return res.status(500).json({ message: "Error al crear la reserva" });
  }
};

// Obtener todas las reservas con detalles del área común y residente
export const getReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        {
          model: AreaComun,
          as: "areaComun",
          attributes: ["idAreaComun", "nombreAreaComun","costoPorHora" ],
        },
        {
          model: Residente,
          as: "residente",
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["idUsuario", "nombre", "email"],
            },
          ],
          attributes: ["idResidente", "telefono"],
        },
      ],
      attributes: [
        "idReserva",
        "fechaReserva",
        "horaInicio",
        "horaFin",
        "motivo",
        "numAsistentes",
        "estado",
        "pagado",
        // si necesitas costo o pagado los puedes dejar
      ],
    });

    // 🔑 Mapear solo los campos que te interesan
    const reservasLimpias = reservas.map((r) => {
      const reserva = r.toJSON();
      return {
        idReserva: reserva.idReserva,
        fecha: reserva.fechaReserva,
        horaInicio: reserva.horaInicio,
        horaFin: reserva.horaFin,
        motivo: reserva.motivo,
        asistentes: reserva.numAsistentes,
        estado: reserva.estado,
        idAreaComun: reserva.areaComun?.idAreaComun || null,
        areaNombre: reserva.areaComun?.nombreAreaComun || "",
        usuario: reserva.residente?.usuario?.nombre || "",
        email: reserva.residente?.usuario?.email || "",
        telefono: reserva.residente?.telefono || "",
        pagado: reserva.pagado,
        costoPorHora: reserva.areaComun?.costoPorHora || 0,
      };
    });

    res.json(reservasLimpias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las reservas" });
  }
};

// Obtener reserva por ID
export const obtenerReservaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    res.json(reserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la reserva" });
  }
};

// Actualizar reserva
export const updateReservaAdmin = async (req, res) => {
  // CORREGIDO: Usamos idReserva para coincidir con tu modelo
  const { idReserva } = req.params;
  const t = await sequelize.transaction();

  try {
    // 1. Buscar la reserva 
    const reserva = await Reserva.findByPk(idReserva, { transaction: t });
    if (!reserva) {
      await t.rollback();
      return res.status(404).json({ message: "La reserva no existe" });
    }

    // 2. NUEVO: Validaciones de estado y pago (lógica de negocio crucial)
    if (reserva.pagado) {
      await t.rollback();
      return res.status(403).json({
        // 403 Forbidden es más adecuado aquí
        message: "No se puede modificar una reserva que ya ha sido pagada.",
      });
    }

    // Solo se permite modificar si está en estado 'pendiente' o 'confirmada'
    if (reserva.estado !== "pendiente" && reserva.estado !== "confirmada") {
      await t.rollback();
      return res.status(403).json({
        message: `Una reserva en estado '${reserva.estado}' no puede ser modificada.`,
      });
    }

    // 3. Obtener los nuevos datos (o mantener los existentes si no se envían)
    const datosActualizados = {
      fechaReserva: req.body.fechaReserva || reserva.fechaReserva,
      horaInicio: req.body.horaInicio || reserva.horaInicio,
      horaFin: req.body.horaFin || reserva.horaFin,
      motivo: req.body.motivo || reserva.motivo,
      numAsistentes: req.body.numAsistentes || reserva.numAsistentes,
    };

    // 4. Re-validar toda la lógica de negocio con los nuevos datos
    const toMinutes = (hhmm) => {
      const [hh, mm] = hhmm.split(":").map(Number);
      return hh * 60 + mm;
    };

    const startMin = toMinutes(datosActualizados.horaInicio);
    const endMin = toMinutes(datosActualizados.horaFin);

    if (startMin >= endMin) {
      await t.rollback();
      return res
        .status(400)
        .json({
          message: "La hora de inicio debe ser anterior a la hora de fin",
        });
    }

    const [y, m, d] = new Date(datosActualizados.fechaReserva)
      .toISOString()
      .slice(0, 10)
      .split("-")
      .map(Number);
    const reservaStartDate = new Date(
      y,
      m - 1,
      d,
      Math.floor(startMin / 60),
      startMin % 60
    );
    if (reservaStartDate < new Date()) {
      await t.rollback();
      return res
        .status(400)
        .json({
          message: "No se puede mover una reserva a una fecha/hora pasada",
        });
    }

    const area = await AreaComun.findByPk(reserva.areaComunId, {
      transaction: t,
    });
    const areaStartMin = toMinutes(area.horarioInicio);
    const areaEndMin = toMinutes(area.horarioFin);

    if (startMin < areaStartMin || endMin > areaEndMin) {
      await t.rollback();
      return res
        .status(400)
        .json({
          message: "El horario está fuera del rango permitido por el área",
        });
    }

    if (
      datosActualizados.numAsistentes > area.capacidadMaxima ||
      datosActualizados.numAsistentes < 1
    ) {
      await t.rollback();
      return res
        .status(400)
        .json({
          message: `El número de asistentes excede la capacidad del área (${area.capacidadMaxima})`,
        });
    }

    // 5. Comprobación de solapamiento (excluyendo la reserva actual)
    const otrasReservas = await Reserva.findAll({
      where: {
        areaComunId: reserva.areaComunId,
        // CORREGIDO: Se usa 'idReserva' y el operador Op.ne (not equal)
        idReserva: { [Op.ne]: idReserva },
        estado: { [Op.ne]: "cancelada" }, // No considerar canceladas para solapamiento
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const fechaNuevaStr = new Date(datosActualizados.fechaReserva)
      .toISOString()
      .slice(0, 10);
    const sameDayReservas = otrasReservas.filter(
      (r) =>
        new Date(r.fechaReserva).toISOString().slice(0, 10) === fechaNuevaStr
    );

    for (const r of sameDayReservas) {
      const sExist = toMinutes(r.horaInicio);
      const eExist = toMinutes(r.horaFin);
      if (sExist < endMin && eExist > startMin) {
        await t.rollback();
        return res
          .status(409)
          .json({
            message:
              "Conflicto: El nuevo horario se solapa con otra reserva existente.",
          }); // 409 Conflict es más adecuado
      }
    }

    // 6. Recalcular costo y actualizar
    const duracionHoras = (endMin - startMin) / 60;
    datosActualizados.costoTotal = Number(
      (duracionHoras * Number(area.costoPorHora || 0)).toFixed(2)
    );

    // Usamos el método 'set' para actualizar los campos
    reserva.set(datosActualizados);

    await reserva.save({ transaction: t });
    await t.commit();

    return res
      .status(200)
      .json({ reserva, message: "Reserva actualizada exitosamente" });
  } catch (error) {
    await t.rollback();
    console.error("updateReserva error:", error);
    return res
      .status(500)
      .json({ message: "Error interno al actualizar la reserva" });
  }
};

// Eliminar reserva
export const deleteReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    await reserva.destroy();
    res.json({ message: "Reserva eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la reserva" });
  }
};
