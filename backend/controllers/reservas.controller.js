import Reserva from "../models/Reserva.js";
import AreaComun from "../models/AreaComun.js";
import Usuario from "../models/Usuario.js"; // Asegúrate de tener el modelo Usuario
import sequelize from "../config/database.js";
import Residente from "../models/Residente.js"; // si no lo tienes ya
// arriba del archivo (si no lo tienes ya)
import { Op } from "sequelize";

//Crear un reserva
/* export const createReserva = async (req, res) => {
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
}; */

export const createReserva = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      usuarioId,
      areaComunId,
      fechaReserva,
      horaInicio,
      horaFin,
      fechaFinReserva,
      motivo,
      numAsistentes,
      cajaId,
    } = req.body;

    // --- VALIDACIONES INICIALES (sin cambios) ---
    if (!usuarioId || !areaComunId || !fechaReserva) {
      await t.rollback();
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

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

    /*const [year, month, day] = fechaReserva.split("-").map(Number);
    const [hh, mm] = horaInicio.split(":").map(Number);

     const inicioReserva = new Date(year, month - 1, day, hh, mm, 0);
    const ahora = new Date();
    // Validar
    if (inicioReserva <= ahora) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "FECHA/HORA NO PERMITIDA (pasada)" });
    } */
    // --- Validación flexible ---
    let inicioReserva;

    if (!fechaReserva) {
      await t.rollback();
      return res.status(400).json({ message: "Fecha de reserva obligatoria" });
    }

    // Si hay horaInicio, hacemos reserva por horas
    if (horaInicio) {
      const [hh, mm] = horaInicio.split(":").map(Number);
      const [year, month, day] = fechaReserva.split("-").map(Number);
      inicioReserva = new Date(year, month - 1, day, hh, mm, 0);
    } else {
      // Solo fecha, hora 00:00 por defecto
      const [year, month, day] = fechaReserva.split("-").map(Number);
      inicioReserva = new Date(year, month - 1, day, 0, 0, 0);
    }

    // Validar que la fecha/hora no sea pasada
    if (inicioReserva <= new Date()) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "FECHA/HORA NO PERMITIDA (pasada)" });
    }

    // --- LÓGICA DE TIPO DE RESERVA (sin cambios) ---
    const esGimnasio = area.tipoArea === "gimnasio";
    const esParqueo = area.tipoArea === "parqueo";
    const esPorHoras = !!horaInicio && !!horaFin;
    const esPorDias = !!fechaFinReserva && !horaInicio && !horaFin;

    if (esGimnasio && !esPorHoras) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Para el gimnasio la reserva debe ser por horas" });
    }
    if (!esPorHoras && !esPorDias) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Debe elegir reserva por horas o por días" });
    }
    if (numAsistentes > area.capacidadMaxima || numAsistentes < 1) {
      await t.rollback();
      return res.status(400).json({
        message: `Número de asistentes inválido (min 1, máx ${area.capacidadMaxima})`,
      });
    }
    if (esParqueo && !cajaId) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Debe seleccionar un cajón de parqueo." });
    }

    // --- HELPERS DE FECHA Y HORA (sin cambios) ---
    const parseDateLocal = (dateStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    };
    const toMinutes = (hhmm) => {
      if (!hhmm) return 0;
      const [hh, mm] = hhmm.split(":").map(Number);
      return hh * 60 + mm;
    };

    // --- VALIDACIÓN DE SOLAPAMIENTO (CON CORRECCIONES) ---
    const reservasExistentes = await Reserva.findAll({
      where: {
        areaComunId,
        estado: { [Op.notIn]: ["cancelada", "rechazada"] },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (esGimnasio) {
      const startMinNueva = toMinutes(horaInicio);
      const endMinNueva = toMinutes(horaFin);
      let asistentesEnHorario = Number(numAsistentes);

      for (const r of reservasExistentes) {
        if (r.fechaReserva === fechaReserva && r.horaInicio && r.horaFin) {
          const startMinExistente = toMinutes(r.horaInicio);
          const endMinExistente = toMinutes(r.horaFin);
          if (
            startMinExistente < endMinNueva &&
            endMinExistente > startMinNueva
          ) {
            // ✨ **CORRECCIÓN 1: Asegurar que se suma un número**
            asistentesEnHorario += r.numAsistentes || 0;
          }
        }
      }

      if (asistentesEnHorario > area.capacidadMaxima) {
        await t.rollback();
        return res.status(400).json({
          message: `La capacidad máxima de ${area.capacidadMaxima} personas para este horario sería excedida. Ocupación actual + su reserva = ${asistentesEnHorario}.`,
        });
      }
    } else {
      // Lógica para Salones y Parqueo
      for (const r of reservasExistentes) {
        // ✨ **CORRECCIÓN 2: Usar comparación no estricta para cajaId**
        if (esParqueo && r.cajaId != cajaId) {
          continue;
        }

        const inicioExistDias = parseDateLocal(r.fechaReserva);
        const finExistDias = r.fechaFinReserva
          ? parseDateLocal(r.fechaFinReserva)
          : inicioExistDias;
        const inicioNuevaDias = parseDateLocal(fechaReserva);
        const finNuevaDias = esPorDias
          ? parseDateLocal(fechaFinReserva)
          : inicioNuevaDias;

        if (
          inicioNuevaDias <= finExistDias &&
          finNuevaDias >= inicioExistDias
        ) {
          if (esPorHoras && r.horaInicio) {
            const startMinNueva = toMinutes(horaInicio);
            const endMinNueva = toMinutes(horaFin);
            const startMinExistente = toMinutes(r.horaInicio);
            const endMinExistente = toMinutes(r.horaFin);
            /* console.log(
              "Comparando horarios:",
              r.idReserva,
              startMinExistente,
              endMinExistente,
              startMinNueva,
              endMinNueva
            ); */
            if (
              startMinExistente < endMinNueva &&
              endMinExistente > startMinNueva
              /* (startMinNueva >= startMinExistente &&
                startMinNueva < endMinExistente) ||
              (endMinNueva > startMinExistente &&
                endMinNueva <= endMinExistente) */
            ) {
              await t.rollback();
              return res.status(400).json({
                message:
                  "ya existe una reserva en este horario PUEDE REVISAR HORARIOS DISPONIBLES ARRIBA",
              });
            }
          } else {
            await t.rollback();
            return res.status(400).json({
              message:
                "ya existe una reserva en este rango de fechas PUEDE REVISAR HORARIOS DISPONIBLES ARRIBA",
            });
          }
        }
      }
    }

    // --- CÁLCULO DE COSTO TOTAL (sin cambios) ---
    let costoCalculado = 0;
    const toHours = (hhmm) => {
      if (!hhmm) return 0;
      const [hh, mm] = hhmm.split(":").map(Number);
      return hh + mm / 60;
    };
    if (esGimnasio) {
      costoCalculado = parseFloat(area.costoBase);
    } else {
      if (esPorHoras) {
        const duracionEnHoras = toHours(horaFin) - toHours(horaInicio);
        if (duracionEnHoras > 0) {
          costoCalculado = duracionEnHoras * parseFloat(area.costoBase);
        }
      } else if (esPorDias) {
        const fechaInicio = parseDateLocal(fechaReserva);
        const fechaFin = parseDateLocal(fechaFinReserva);
        const diffTime = Math.abs(fechaFin - fechaInicio);
        const numeroDeDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        let horasAbiertoPorDia =
          toHours(area.horarioCierre) - toHours(area.horarioApertura);
        //mi logica
        if (horasAbiertoPorDia === 0) {
          horasAbiertoPorDia = 24;
        }

        if (numeroDeDias > 0 && horasAbiertoPorDia > 0) {
          costoCalculado =
            numeroDeDias * horasAbiertoPorDia * parseFloat(area.costoBase);
        }
      }
    }

    // --- CREAR RESERVA (sin cambios) ---
    const estado = area.requiereAprobacion ? "pendiente" : "confirmada";
    const reservaPayload = {
      usuarioId,
      areaComunId,
      fechaReserva,
      horaInicio: esPorHoras ? horaInicio : null,
      horaFin: esPorHoras ? horaFin : null,
      fechaFinReserva: esPorDias ? fechaFinReserva : null,
      motivo: motivo || (esGimnasio ? "Ejercicio" : "General"),
      numAsistentes: Number(numAsistentes) || 1,
      cajaId: esParqueo ? cajaId : null,
      estado,
      pagado: false,
      costoTotal: costoCalculado.toFixed(2),
    };

    const nuevaReserva = await Reserva.create(reservaPayload, {
      transaction: t,
    });
    await t.commit();

    return res.status(201).json({
      reserva: nuevaReserva,
      message: "Reserva creada exitosamente",
    });
  } catch (error) {
    await t.rollback();
    console.error("createReserva error:", error);
    return res.status(500).json({ message: "Error al crear la reserva" });
  }
};

// Obtener todas las reservas con detalles del área común y residente
/* export const getReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        {
          model: AreaComun,
          as: "areaComun",
          attributes: ["idAreaComun", "nombreAreaComun", "costoPorHora"],
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
}; */
export const getReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        {
          model: AreaComun,
          as: "areaComun",
          attributes: [
            "idAreaComun",
            "nombreAreaComun",
            "costoBase",
            "horarioApertura",
            "horarioCierre",
          ],
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
        "fechaFinReserva",
        "horaInicio",
        "horaFin",
        "motivo",
        "numAsistentes",
        "estado",
        "pagado",
        "costoTotal",
      ],
    });

    const reservasLimpias = reservas.map((r) => {
      const reserva = r.toJSON();
      const esPorHoras = !!reserva.horaInicio && !!reserva.horaFin;
      const esPorDias = !!reserva.fechaFinReserva && !esPorHoras;

      return {
        idReserva: reserva.idReserva,
        fechaInicio: reserva.fechaReserva,
        fechaFin: reserva.fechaFinReserva || reserva.fechaReserva,
        horaInicio: reserva.horaInicio,
        horaFin: reserva.horaFin,
        esPorHoras,
        esPorDias,
        motivo: reserva.motivo,
        asistentes: reserva.numAsistentes,
        estado: reserva.estado,
        idAreaComun: reserva.areaComun?.idAreaComun || null,
        areaNombre: reserva.areaComun?.nombreAreaComun || "",
        usuario: reserva.residente?.usuario?.nombre || "",
        email: reserva.residente?.usuario?.email || "",
        telefono: reserva.residente?.telefono || "",
        pagado: reserva.pagado,
        costoTotal: reserva.costoTotal || 0,
        horarioApertura: reserva.areaComun?.horarioApertura || "00:00",
        horarioCierre: reserva.areaComun?.horarioCierre || "23:59",
        costoBase: reserva.areaComun?.costoBase || 0,
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
/* export const updateReservaAdmin = async (req, res) => {
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
      return res.status(400).json({
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
      return res.status(400).json({
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
      return res.status(400).json({
        message: "El horario está fuera del rango permitido por el área",
      });
    }

    if (
      datosActualizados.numAsistentes > area.capacidadMaxima ||
      datosActualizados.numAsistentes < 1
    ) {
      await t.rollback();
      return res.status(400).json({
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
        return res.status(409).json({
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
}; */
export const updateReservaAdmin = async (req, res) => {
  const { idReserva } = req.params;
  const t = await sequelize.transaction();
  const { Op } = require("sequelize");

  try {
    const reserva = await Reserva.findByPk(idReserva, { transaction: t });
    if (!reserva) {
      await t.rollback();
      return res.status(404).json({ message: "La reserva no existe" });
    }

    if (reserva.pagado) {
      await t.rollback();
      return res.status(403).json({
        message: "No se puede modificar una reserva que ya ha sido pagada.",
      });
    }

    if (reserva.estado !== "pendiente" && reserva.estado !== "confirmada") {
      await t.rollback();
      return res.status(403).json({
        message: `Una reserva en estado '${reserva.estado}' no puede ser modificada.`,
      });
    }

    const area = await AreaComun.findByPk(reserva.areaComunId, {
      transaction: t,
    });
    if (!area) {
      await t.rollback();
      return res.status(404).json({ message: "El área no existe" });
    }

    const esGimnasio = area.tipo === "gimnasio";

    const datosActualizados = {
      fechaReserva: req.body.fechaReserva || reserva.fechaReserva,
      fechaFinReserva: esGimnasio
        ? null
        : req.body.fechaFinReserva || reserva.fechaFinReserva,
      horaInicio: req.body.horaInicio ?? reserva.horaInicio,
      horaFin: req.body.horaFin ?? reserva.horaFin,
      motivo: req.body.motivo || reserva.motivo,
      numAsistentes: req.body.numAsistentes || reserva.numAsistentes,
    };

    if (
      esGimnasio &&
      (!datosActualizados.horaInicio || !datosActualizados.horaFin)
    ) {
      await t.rollback();
      return res.status(400).json({
        message: "Para el gimnasio, la reserva debe ser por horas",
      });
    }

    const toMinutes = (hhmm) => {
      if (!hhmm) return null;
      const [hh, mm] = hhmm.split(":").map(Number);
      return hh * 60 + mm;
    };

    const esPorHoras =
      !!datosActualizados.horaInicio && !!datosActualizados.horaFin;
    const esPorDias = !!datosActualizados.fechaFinReserva && !esPorHoras;

    // ---------- Validación de fechas y horas en el pasado ----------
    const ahora = new Date();
    const fechaInicioReserva = new Date(datosActualizados.fechaReserva);

    if (esPorHoras) {
      const [hIni, mIni] = datosActualizados.horaInicio.split(":").map(Number);
      const [hFin, mFin] = datosActualizados.horaFin.split(":").map(Number);

      fechaInicioReserva.setHours(hIni, mIni, 0, 0);
      const fechaFinReservaHora = new Date(datosActualizados.fechaReserva);
      fechaFinReservaHora.setHours(hFin, mFin, 0, 0);

      if (fechaInicioReserva < ahora) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "No se puede reservar en el pasado" });
      }

      if (fechaFinReservaHora < fechaInicioReserva) {
        await t.rollback();
        return res.status(400).json({
          message: "La hora de fin no puede ser anterior a la hora de inicio",
        });
      }
    }

    if (esPorDias && !esGimnasio) {
      const fechaFin = new Date(datosActualizados.fechaFinReserva);
      if (fechaInicioReserva < ahora || fechaFin < ahora) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "No se puede reservar en el pasado" });
      }
      if (fechaFin < fechaInicioReserva) {
        await t.rollback();
        return res.status(400).json({
          message: "La fecha de fin no puede ser anterior a la fecha de inicio",
        });
      }
    }

    const otrasReservas = await Reserva.findAll({
      where: {
        areaComunId: reserva.areaComunId,
        idReserva: { [Op.ne]: idReserva },
        estado: { [Op.ne]: "cancelada" },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // ---------- Reserva por horas ----------
    if (esPorHoras) {
      const startMin = toMinutes(datosActualizados.horaInicio);
      const endMin = toMinutes(datosActualizados.horaFin);

      if (startMin >= endMin) {
        await t.rollback();
        return res.status(400).json({
          message: "La hora de inicio debe ser anterior a la hora de fin",
        });
      }

      const areaStartMin = toMinutes(area.horarioApertura);
      const areaEndMin = toMinutes(area.horarioCierre);
      if (startMin < areaStartMin || endMin > areaEndMin) {
        await t.rollback();
        return res.status(400).json({
          message: "El horario está fuera del rango permitido por el área",
        });
      }

      for (const r of otrasReservas) {
        const rInicio = new Date(r.fechaReserva);
        const rFin = r.fechaFinReserva ? new Date(r.fechaFinReserva) : rInicio;
        const nuevaFecha = new Date(datosActualizados.fechaReserva);

        if (nuevaFecha <= rFin && nuevaFecha >= rInicio) {
          if (r.horaInicio && r.horaFin) {
            const sExist = toMinutes(r.horaInicio);
            const eExist = toMinutes(r.horaFin);
            if (sExist < endMin && eExist > startMin) {
              await t.rollback();
              return res.status(409).json({
                message:
                  "Conflicto: el horario se solapa con otra reserva existente",
              });
            }
          } else if (!esGimnasio) {
            await t.rollback();
            return res.status(409).json({
              message: "Conflicto: ya hay una reserva que ocupa todo el día",
            });
          }
        }
      }

      datosActualizados.costoTotal = esGimnasio
        ? Number(area.costoBase)
        : Number(
            (((endMin - startMin) / 60) * Number(area.costoBase || 0)).toFixed(
              2
            )
          );
    }

    // ---------- Reserva por días solo para áreas distintas al gimnasio ----------
    if (esPorDias && !esGimnasio) {
      const inicio = new Date(datosActualizados.fechaReserva);
      const fin = new Date(datosActualizados.fechaFinReserva);

      for (const r of otrasReservas) {
        const rInicio = new Date(r.fechaReserva);
        const rFin = r.fechaFinReserva ? new Date(r.fechaFinReserva) : rInicio;

        if (r.horaInicio && r.horaFin) {
          let currentDate = new Date(inicio);
          while (currentDate <= fin) {
            if (currentDate >= rInicio && currentDate <= rFin) {
              await t.rollback();
              return res.status(409).json({
                message: "Conflicto: hay una reserva por horas en estas fechas",
              });
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } else {
          if (inicio <= rFin && fin >= rInicio) {
            await t.rollback();
            return res.status(409).json({
              message:
                "Conflicto: el rango de fechas se solapa con otra reserva existente",
            });
          }
        }
      }

      const horasPorDia =
        toMinutes(area.horarioCierre) - toMinutes(area.horarioApertura);
      const numDias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
      datosActualizados.costoTotal = Number(
        (numDias * horasPorDia * Number(area.costoBase || 0)).toFixed(2)
      );
    }

    // Validación de capacidad
    if (
      datosActualizados.numAsistentes > area.capacidadMaxima ||
      datosActualizados.numAsistentes < 1
    ) {
      await t.rollback();
      return res.status(400).json({
        message: `El número de asistentes excede la capacidad del área (${area.capacidadMaxima})`,
      });
    }

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

// Actualizar estado de la reserva (confirmar, rechazar, cancelar)
export const updateEstadoReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    console.log(estado);
    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    // Validar el nuevo estado
    const estadosValidos = [
      "pendiente",
      "confirmada",
      "rechazada",
      "cancelada",
    ];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    reserva.estado = estado;
    await reserva.save();

    res.json({
      reserva,
      message: "Estado de la reserva actualizado correctamente",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al actualizar el estado de la reserva" });
  }
};

//traer reservas de un residente
// Obtener todas las reservas del usuario logueado
export const getMisReservas = async (req, res) => {
  try {
    const usuarioId = req.body.id; // suponer que lo tenemos del JWT o sesión

    const reservas = await Reserva.findAll({
      where: { usuarioId },
      include: [
        {
          model: AreaComun,
          as: "areaComun", // nombre del alias en tu asociación
          attributes: ["idAreaComun", "nombreAreaComun"], // solo campos que necesitas
        },
      ],
      order: [
        ["fechaReserva", "DESC"],
        ["horaInicio", "ASC"],
      ],
    });

    res.json(reservas);
  } catch (error) {
    console.error("Error al traer las reservas del usuario:", error);
    res.status(500).json({ message: "Error al obtener tus reservas" });
  }
};
