import Reserva from "../models/Reserva.js";
import AreaComun from "../models/AreaComun.js";
import Usuario from "../models/Usuario.js";
import sequelize from "../config/database.js";
import Residente from "../models/Residente.js"; 
import Rol from "../models/Rol.js";
import { Op } from "sequelize";
import ParqueoCaja from "../models/ParqueoCaja.js";
import Departamento from "../models/Departamento.js";

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

    if (!usuarioId || !areaComunId || !fechaReserva) {
      await t.rollback();
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const area = await AreaComun.findByPk(areaComunId, { transaction: t });
    if (!area) {
      await t.rollback();
      return res.status(404).json({ message: "El área común no existe" });
    }
    //solo residentes pueden reservar
    const residente = await Residente.findOne({
      where: { usuarioId: usuarioId },
      transaction: t,
    });
    const usuario = await Usuario.findByPk(usuarioId, {
      include: [{ model: Rol, as: "roles" }],
      transaction: t,
    });

    const tieneRolAdmin = usuario.roles.some((r) => r.rol === "administrador");
    if (!residente && !tieneRolAdmin) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Solo un usuario residente puede reservar" });
    }
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

    // --- HELPERS DE FECHA Y HORA ---
    const parseDateLocal = (dateStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    };
    const toMinutes = (hhmm) => {
      if (!hhmm) return 0;
      const [hh, mm] = hhmm.split(":").map(Number);
      return hh * 60 + mm;
    };

    // --- VALIDACIÓN DE SOLAPAMIENTO ---
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
            //Asegurar que se suma un número
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
        //Usar comparación no estricta para cajaId
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
            if (
              startMinExistente < endMinNueva &&
              endMinExistente > startMinNueva
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

    //CÁLCULO DE COSTO TOTAL
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

    //CREAR RESERVA
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
            "tipoArea",
          ],
        },
        {
          model: Usuario,
          as: "usuario",
          attributes: ["idUsuario", "nombre", "email"],
          include: [
            {
              model: Residente,
              as: "residente",
              attributes: ["idResidente", "telefono"],
            },
            {
              model: Departamento,
              as: "departamentos",
              attributes: ["idDepartamento", "numero"],
            },
          ],
        },
        {
          model: ParqueoCaja,
          as: "parqueoCaja",
          attributes: ["idParqueoCaja", "numeroCaja"],
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
        tipoAreaComun: reserva.areaComun?.tipoArea || "",
        usuario: reserva.usuario?.nombre || "",    
        email: reserva.usuario?.email || "",
        telefono: reserva.usuario?.residente?.telefono || "",
        pagado: reserva.pagado,
        costoTotal: reserva.costoTotal || 0,
        horarioApertura: reserva.areaComun?.horarioApertura || "00:00",
        horarioCierre: reserva.areaComun?.horarioCierre || "23:59",
        costoBase: reserva.areaComun?.costoBase || 0,
        idDepartamento:
          reserva.usuario?.departamentos?.[0]?.idDepartamento || null,
        numeroDepartamento: reserva.usuario?.departamentos?.[0]?.numero || "",
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
    const reserva = await Reserva.findByPk(id, {
      include: [
        {
          model: AreaComun,
          as: "areaComun",
          attributes: [
            "idAreaComun",
            "nombreAreaComun",
            "costoBase",
            "tipoArea",
          ],
        },
      ],
    });

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    res.json(reserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la reserva" });
  }
};

export const updateReservaAdmin = async (req, res) => {
  const { idReserva } = req.params;
  const t = await sequelize.transaction();

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

    const {
      fechaReserva,
      fechaFinReserva,
      horaInicio,
      horaFin,
      motivo,
      numAsistentes,
      cajaId,
    } = req.body;

    // Si no se manda algo, se mantiene lo anterior
    const datosActualizados = {
      fechaReserva: fechaReserva || reserva.fechaReserva,
      fechaFinReserva: fechaFinReserva || reserva.fechaFinReserva,
      horaInicio: horaInicio ?? reserva.horaInicio,
      horaFin: horaFin ?? reserva.horaFin,
      motivo: motivo || reserva.motivo,
      numAsistentes: numAsistentes || reserva.numAsistentes,
      cajaId: cajaId || reserva.cajaId,
    };

    const esGimnasio = area.tipoArea === "gimnasio";
    const esParqueo = area.tipoArea === "parqueo";
    const esPorHoras =
      !!datosActualizados.horaInicio && !!datosActualizados.horaFin;
    const esPorDias =
      !!datosActualizados.fechaFinReserva &&
      !datosActualizados.horaInicio &&
      !datosActualizados.horaFin;

    if (esGimnasio && !esPorHoras) {
      await t.rollback();
      return res.status(400).json({
        message: "Para el gimnasio la reserva debe ser por horas",
      });
    }
    if (!esPorHoras && !esPorDias) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Debe elegir reserva por horas o por días" });
    }

    if (
      datosActualizados.numAsistentes > area.capacidadMaxima ||
      datosActualizados.numAsistentes < 1
    ) {
      await t.rollback();
      return res.status(400).json({
        message: `Número de asistentes inválido (min 1, máx ${area.capacidadMaxima})`,
      });
    }
    if (esParqueo && !datosActualizados.cajaId) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Debe seleccionar un cajón de parqueo." });
    }

    const parseDateLocal = (dateStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    };
    const toMinutes = (hhmm) => {
      if (!hhmm) return 0;
      const [hh, mm] = hhmm.split(":").map(Number);
      return hh * 60 + mm;
    };
    const toHours = (hhmm) => {
      if (!hhmm) return 0;
      const [hh, mm] = hhmm.split(":").map(Number);
      return hh + mm / 60;
    };

    const otrasReservas = await Reserva.findAll({
      where: {
        areaComunId: reserva.areaComunId,
        idReserva: { [Op.ne]: idReserva },
        estado: { [Op.notIn]: ["cancelada", "rechazada"] },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (esGimnasio) {
      const startMinNueva = toMinutes(datosActualizados.horaInicio);
      const endMinNueva = toMinutes(datosActualizados.horaFin);
      let asistentesEnHorario = Number(datosActualizados.numAsistentes);

      for (const r of otrasReservas) {
        if (
          r.fechaReserva === datosActualizados.fechaReserva &&
          r.horaInicio &&
          r.horaFin
        ) {
          const startMinExistente = toMinutes(r.horaInicio);
          const endMinExistente = toMinutes(r.horaFin);
          if (
            startMinExistente < endMinNueva &&
            endMinExistente > startMinNueva
          ) {
            asistentesEnHorario += r.numAsistentes || 0;
          }
        }
      }

      if (asistentesEnHorario > area.capacidadMaxima) {
        await t.rollback();
        return res.status(400).json({
          message: `Capacidad excedida. Máximo ${area.capacidadMaxima}, en este horario quedarían ${asistentesEnHorario}.`,
        });
      }
    } else {
      for (const r of otrasReservas) {
        if (esParqueo && r.cajaId != datosActualizados.cajaId) {
          continue;
        }

        const inicioExistDias = parseDateLocal(r.fechaReserva);
        const finExistDias = r.fechaFinReserva
          ? parseDateLocal(r.fechaFinReserva)
          : inicioExistDias;
        const inicioNuevaDias = parseDateLocal(datosActualizados.fechaReserva);
        const finNuevaDias = esPorDias
          ? parseDateLocal(datosActualizados.fechaFinReserva)
          : inicioNuevaDias;

        if (
          inicioNuevaDias <= finExistDias &&
          finNuevaDias >= inicioExistDias
        ) {
          if (esPorHoras && r.horaInicio) {
            const startMinNueva = toMinutes(datosActualizados.horaInicio);
            const endMinNueva = toMinutes(datosActualizados.horaFin);
            const startMinExistente = toMinutes(r.horaInicio);
            const endMinExistente = toMinutes(r.horaFin);

            if (
              startMinExistente < endMinNueva &&
              endMinExistente > startMinNueva
            ) {
              await t.rollback();
              return res.status(400).json({
                message:
                  "Ya existe una reserva en este horario. (REVISAR DISPONIBILIDAD ARRIBA)",
              });
            }
          } else {
            await t.rollback();
            return res.status(400).json({
              message:
                "Ya existe una reserva en este rango de fechas. (REVISAR DISPONIBILIDAD ARRIBA)",
            });
          }
        }
      }
    }

    let costoCalculado = 0;
    if (esGimnasio) {
      costoCalculado = parseFloat(area.costoBase);
    } else {
      if (esPorHoras) {
        const duracionEnHoras =
          toHours(datosActualizados.horaFin) -
          toHours(datosActualizados.horaInicio);
        if (duracionEnHoras > 0) {
          costoCalculado = duracionEnHoras * parseFloat(area.costoBase);
        }
      } else if (esPorDias) {
        const fechaInicio = parseDateLocal(datosActualizados.fechaReserva);
        const fechaFin = parseDateLocal(datosActualizados.fechaFinReserva);
        const diffTime = Math.abs(fechaFin - fechaInicio);
        const numeroDeDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        let horasAbiertoPorDia =
          toHours(area.horarioCierre) - toHours(area.horarioApertura);

        if (horasAbiertoPorDia === 0) {
          horasAbiertoPorDia = 24;
        }

        costoCalculado =
          numeroDeDias * horasAbiertoPorDia * parseFloat(area.costoBase);
      }
    }
    datosActualizados.costoTotal = costoCalculado.toFixed(2);

    reserva.set(datosActualizados);
    await reserva.save({ transaction: t });
    await t.commit();

    return res
      .status(200)
      .json({ reserva, message: "Reserva actualizada exitosamente" });
  } catch (error) {
    await t.rollback();
    console.error("updateReservaAdmin error:", error);
    return res.status(500).json({ message: "Error al actualizar la reserva" });
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
    const usuarioId = req.body.id;

    const reservas = await Reserva.findAll({
      where: { usuarioId },
      include: [
        {
          model: AreaComun,
          as: "areaComun", // nombre del alias de asociación
          attributes: ["idAreaComun", "nombreAreaComun", "tipoAreaComun"],
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

//TRAER RESERVAS DE UN USUARIO ESPECIFICO
export const getReservasUser = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const reservas = await Reserva.findAll({
      where: { usuarioId: idUsuario },
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
          model: Usuario,
          as: "usuario",
          attributes: ["idUsuario", "nombre", "email"],
          include: [
            {
              model: Residente,
              as: "residente",
              attributes: ["idResidente", "telefono"],
            },
          ],
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
        usuario: reserva.usuario?.nombre || "",
        email: reserva.usuario?.email || "",
        telefono: reserva.usuario?.residente?.telefono || "",
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
