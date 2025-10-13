import Factura from "../models/Factura.js";
import Departamento from "../models/Departamento.js";
import Notificaciones from "../models/Notificaciones.js";
import ConceptoMantenimiento from "../models/ConceptoMantenimiento.js";
import sequelize from "../config/database.js";
import Habita from "../models/Habita.js";
import Usuario from "../models/Usuario.js";
import Residente from "../models/Residente.js";
import { Op } from "sequelize";
import dateFnsTz from "date-fns-tz";
const { formatInTimeZone } = dateFnsTz;
import Reserva from "../models/Reserva.js";

//crear facturas para todos los departamentos
export const crearFactura = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // 1) Obtener fecha actual y preparar contador para nroFactura
    const fechaActual = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    //console.log("Fecha actual:", fechaActual);
    //const hoy = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    // 2) Obtener departamentos con usuarios asignados y conceptos
    //departamenots donde solo vivne usuarios
    const departamentos = await Departamento.findAll({
      include: [
        {
          model: Usuario,
          as: "usuarios",
          required: true, // Solo departamentos con usuarios
        },
      ],
    });

    const conceptos = await ConceptoMantenimiento.findAll({
      include: [{ model: Factura, as: "facturas" }], // para revisar anual
      transaction: t,
    });

    // 3) Preparar fechas
    const ahora = new Date();
    const fechaEmision = ahora;
    const fechaVencimiento = new Date(
      ahora.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    let contador = 1;

    const totalFacturasHoy = await Factura.count({
      where: {
        nroFactura: { [Op.like]: `FAC-${fechaActual}-%` },
      },
    });

    if (totalFacturasHoy) {
      contador = totalFacturasHoy + 1;
    }
    // 4) Crear factura por cada departamento
    for (const dep of departamentos) {
      const userHabita = await Habita.findOne({
        where: { departamentoId: dep.idDepartamento },
        transaction: t,
      });

      const nroFactura = `FAC-${fechaActual}-${String(contador).padStart(
        3,
        "0"
      )}`;
      contador++;
      //console.log(`Generando factura ${nroFactura} para depto ${dep.numero}`);

      // Filtrar conceptos según frecuencia
      const conceptosParaFactura = conceptos.filter((c) => {
        if (c.frecuencia === "mensual") return true;
        if (c.frecuencia === "anual") {
          const currentYear = new Date().getFullYear();
          if (!c.facturas || c.facturas.length === 0) return true;
          const ultimaFactura = c.facturas[c.facturas.length - 1];
          const añoFactura = new Date(ultimaFactura.fechaEmision).getFullYear();
          return añoFactura < currentYear;
        }
        if (c.frecuencia === "unico") return !c.usado;
        return false;
      });

      // Calcular monto total
      const montoTotal = conceptosParaFactura.reduce((sum, c) => {
        const m = Number(c.monto ?? 0);
        return sum + (isNaN(m) ? 0 : m);
      }, 0);

      // Crear factura
      const factura = await Factura.create(
        {
          nroFactura,
          fechaEmision,
          fechaVencimiento,
          montoTotal,
          estado: "pendiente",
          departamentoId: dep.idDepartamento,
        },
        { transaction: t }
      );

      // Asociar conceptos
      const conceptoIds = conceptosParaFactura.map((c) => c.idConcepto);
      if (conceptoIds.length > 0) {
        await factura.addConceptosMantenimiento(conceptoIds, {
          transaction: t,
        });
      }

      // Actualizar "usado" solo para conceptos únicos
      await ConceptoMantenimiento.update(
        { usado: true },
        {
          where: {
            frecuencia: "unico",
            usado: false,
            idConcepto: conceptoIds,
          },
          transaction: t,
        }
      );

      // Crear notificación
      if (userHabita) {
        await Notificaciones.create(
          {
            titulo: "Nueva Factura Generada",
            mensaje: `Se ha generado la factura ${nroFactura} por mantenimiento. Monto: ${montoTotal.toFixed(
              2
            )}.`,
            usuarioId: userHabita.usuarioId,
            leida: false,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();
    return res.status(201).json({ message: "Facturas creadas exitosamente" });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear factura:", error);
    return res.status(500).json({
      message: "Error interno al crear factura",
      error: error.message,
    });
  }
};

//crear Factura Manual para reservas
export const crearFacturaReserva = async (req, res) => {
  const { montoTotal, reservaId } = req.body;
  
  const t = await sequelize.transaction();

  try {
    if (!montoTotal || !reservaId) {
      return res.status(400).json({ message: "faltan datos obligatorios" });
    }
    // 1) Obtener la reserva
    const reserva = await Reserva.findByPk(reservaId, { transaction: t });
    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    const fechaActual = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

    const ahora = new Date();
    const fechaEmision = ahora;

    let contador = 1;

    const totalFacturasHoy = await Factura.count({
      where: {
        nroFactura: { [Op.like]: `FAC-${fechaActual}-%` },
      },
    });

    if (totalFacturasHoy) {
      contador = totalFacturasHoy + 1;
    }

    const nroFactura = `FAC-${fechaActual}-${String(contador).padStart(
      3,
      "0"
    )}`;

    // Crear factura
    const factura = await Factura.create(
      {
        nroFactura,
        fechaEmision,
        montoTotal,
        estado: "pendiente",
        reservaId: reserva.idReserva,
      },
      { transaction: t }
    );

    await t.commit();
    return res
      .status(201)
      .json({ message: "Factura creada exitosamente", factura });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear factura:", error);
    return res.status(500).json({
      message: "Error interno al crear factura",
      error: error.message,
    });
  }
};

//obtener todas las facturas
export const getFacturas = async (req, res) => {
  try {
    const facturas = await Factura.findAll({
      include: [
        {
          model: Departamento,
          as: "departamento",
          include: [
            {
              model: Usuario,
              as: "usuarios",
              include: [{ model: Residente, as: "residente" }],
            },
          ],
        },
        { model: ConceptoMantenimiento, as: "conceptosMantenimiento" },
        {
          model: Reserva,
          as: "reserva",
          include: [
            {
              model: Usuario,
              as: "usuario",
              include: [{ model: Residente, as: "residente" }],
            },
          ],
        },
      ],
    });
    //limpiar datos de las facturas
    const facturasNuevas = facturas.map((f) => ({
      idFactura: f.idFactura,
      nroFactura: f.nroFactura,
      //convertir fecha a hora fecha hora boliviana
      //fechaEmision: f.fechaEmision,

      // Uso
      fechaEmision: formatInTimeZone(
        new Date(f.fechaEmision + "Z"),
        "America/La_Paz",
        "yyyy-MM-dd HH:mm:ss"
      ),

      fechaVencimiento: f.fechaVencimiento
        ? formatInTimeZone(
            new Date(f.fechaVencimiento + "Z"),
            "America/La_Paz",
            "yyyy-MM-dd HH:mm:ss"
          )
        : null, // o undefined si preferís no enviar nada

      montoTotal: f.montoTotal,
      estado: f.estado,
      //------------------- */
      departamentoId: f.departamentoId ? f.departamentoId : null,
      nroDepartamento: f.departamento ? f.departamento.nroDepartamento : null,

      reservaId: f.reservaId ? f.reservaId : null,
      //-----------------------
      usuarioId: f.departamento ? f.departamento.usuarios[0].idUsuario : null,
      nombreUsuario: f.departamento
        ? f.departamento.usuarios[0].nombre
        : f.reserva.usuario.nombre,
      emailUsuario: f.departamento
        ? f.departamento.usuarios[0].email
        : f.reserva.usuario.email,
      telefonoUsuario: f.departamento
        ? f.departamento.usuarios[0].residente.telefono
        : f.reserva.usuario.residente.telefono,

      //-----------------------------------------------
      conceptos: f.conceptosMantenimiento
        ? f.conceptosMantenimiento.map((c) => ({
            idConcepto: c.idConcepto,
            titulo: c.titulo,
            monto: c.monto,
            frecuencia: c.frecuencia,
            descripcion: c.descripcion,
          }))
        : [],
    }));
    return res.status(200).json(facturasNuevas);
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    return res.status(500).json({
      message: "Error interno al obtener facturas",
      error: error.message,
    });
  }
};

/* //obtener todas las facturas
export const getFacturas = async (req, res) => {
  try {
    const facturas = await Factura.findAll({
      include: [
        {
          model: Departamento,
          as: "departamento",
          include: [
            {
              model: Usuario,
              as: "usuarios",
              include: [{ model: Residente, as: "residente" }],
            },
          ],
        },
        { model: ConceptoMantenimiento, as: "conceptosMantenimiento" },
        {
          model: Reserva,
          as: "reserva",
          include: [{ model: Usuario, as: "usuario" }],
        },
      ],
    });
    //limpiar datos de las facturas
    const facturasNuevas = facturas.map((f) => ({
      idFactura: f.idFactura,
      nroFactura: f.nroFactura,
      //convertir fecha a hora fecha hora boliviana
      //fechaEmision: f.fechaEmision,

      fechaVencimiento: f.fechaVencimiento
        ? formatInTimeZone(
            new Date(f.fechaVencimiento + "Z"),
            "America/La_Paz",
            "yyyy-MM-dd HH:mm:ss"
          )
        : null, // o undefined si preferís no enviar nada

      montoTotal: f.montoTotal,
      estado: f.estado,
      //------------------
      departamentoId: f.departamentoId ? f.departamentoId : null,
      nroDepartamento: f.departamento ? f.departamento.nroDepartamento : null,

      reservaId: f.reservaId ? f.reservaId : null,
      //-----------------------
      usuarioId: f.departamento.usuarios.length
        ? f.departamento.usuarios[0].idUsuario
        : null,
      nombreUsuario: f.departamento.usuarios.length
        ? f.departamento.usuarios[0].nombre
        : "Sin usuario",
      emailUsuario: f.departamento ? f.departamento.usuarios.length
        ? f.departamento.usuarios[0].email
        : "Sin email",
      telefonoUsuario: f.departamento.usuarios[0].residente
        ? f.departamento.usuarios[0].residente.telefono
        : "Sin teléfono",
      conceptos: f.conceptosMantenimiento.map((c) => ({
        idConcepto: c.idConcepto,
        titulo: c.titulo,
        monto: c.monto,
        frecuencia: c.frecuencia,
        descripcion: c.descripcion,
      })),
    }));
    return res.status(200).json(facturasNuevas);
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    return res.status(500).json({
      message: "Error interno al obtener facturas",
      error: error.message,
    });
  }
}; */

//obtener factura por id
export const getFacturaById = async (req, res) => {
  const { id } = req.params;
  try {
    const factura = await Factura.findByPk(id, {
      include: [
        {
          model: Departamento,
          as: "departamento",
          include: [
            {
              model: Usuario,
              as: "usuarios",
              include: [{ model: Residente, as: "residente" }],
            },
          ],
        },
        { model: ConceptoMantenimiento, as: "conceptosMantenimiento" },
      ],
    });
    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    const facturaNueva = {
      idFactura: factura.idFactura,
      nroFactura: factura.nroFactura,
      //convertir fecha a hora fecha hora boliviana
      //fechaEmision: f.fechaEmision,

      // Uso
      fechaEmision: formatInTimeZone(
        new Date(factura.fechaEmision + "Z"),
        "America/La_Paz",
        "yyyy-MM-dd HH:mm:ss"
      ),

      fechaVencimiento: formatInTimeZone(
        new Date(factura.fechaVencimiento + "Z"),
        "America/La_Paz",
        "yyyy-MM-dd HH:mm:ss"
      ),
      montoTotal: factura.montoTotal,
      estado: factura.estado,
      departamentoId: factura.departamentoId,
      nroDepartamento: factura.departamento.nroDepartamento,
      usuarioId: factura.departamento.usuarios.length
        ? factura.departamento.usuarios[0].idUsuario
        : null,
      nombreUsuario: factura.departamento.usuarios.length
        ? factura.departamento.usuarios[0].nombre
        : "Sin usuario",
      emailUsuario: factura.departamento.usuarios.length
        ? factura.departamento.usuarios[0].email
        : "Sin email",
      telefonoUsuario: factura.departamento.usuarios[0].residente
        ? factura.departamento.usuarios[0].residente.telefono
        : "Sin teléfono",
      conceptos: factura.conceptosMantenimiento.map((c) => ({
        idConcepto: c.idConcepto,
        titulo: c.titulo,
        monto: c.monto,
        frecuencia: c.frecuencia,
        descripcion: c.descripcion,
      })),
    };
    return res.status(200).json(facturaNueva);
  } catch (error) {
    console.error("Error al obtener factura:", error);
    return res.status(500).json({
      message: "Error interno al obtener factura",
      error: error.message,
    });
  }
};

//obtener facturas de un usuairo especifico
export const getFacturasByUsuario = async (req, res) => {
  const { idUsuario } = req.params;
  try {
    // 1) Encontrar departamentos del usuario
    const usuario = await Usuario.findByPk(idUsuario, {
      include: [
        {
          model: Departamento,
          as: "departamentos",
        },
        {
          model: Residente,
          as: "residente",
        },
      ],
    });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const departamento = usuario.departamentos[0];

    if (!departamento) {
      return res
        .status(404)
        .json({ message: "El usuario no está asignado a ningún departamento" });
    }

    const facturas = await Factura.findAll({
      where: { departamentoId: departamento.idDepartamento },
      include: [{ model: ConceptoMantenimiento, as: "conceptosMantenimiento" }],
    });
    if (!facturas) {
      return res.status(404).json({ message: "No se encontraron facturas" });
    }

    //limpiar datos de las facturas
    const facturaNueva = facturas.map((f) => ({
      idFactura: f.idFactura,
      nroFactura: f.nroFactura,
      // Uso
      fechaEmision: formatInTimeZone(
        new Date(f.fechaEmision + "Z"),
        "America/La_Paz",
        "yyyy-MM-dd HH:mm:ss"
      ),

      fechaVencimiento: formatInTimeZone(
        new Date(f.fechaVencimiento + "Z"),
        "America/La_Paz",
        "yyyy-MM-dd HH:mm:ss"
      ),
      montoTotal: f.montoTotal,
      estado: f.estado,
      departamentoId: f.departamentoId,
      nroDepartamento: departamento.nroDepartamento,
      usuarioId: usuario.idUsuario,
      nombreUsuario: usuario.nombre,
      emailUsuario: usuario.email,
      telefonoUsuario: usuario.residente
        ? usuario.residente.telefono
        : "Sin teléfono",
      conceptos: f.conceptosMantenimiento.map((c) => ({
        idConcepto: c.idConcepto,
        titulo: c.titulo,
        monto: c.monto,
        frecuencia: c.frecuencia,
        descripcion: c.descripcion,
      })),
    }));

    return res.status(200).json(facturaNueva);
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    return res.status(500).json({
      message: "Error interno al obtener facturas",
      error: error.message,
    });
  }
};
