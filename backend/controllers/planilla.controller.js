import Planilla from "../models/Planilla.js";
import Personal from "../models/Personal.js";
import Pago from "../models/Pagos.js";
import Funcion from "../models/Funcion.js";
import Usuario from "../models/Usuario.js";
import { Op } from "sequelize";
import nodemon from "nodemon";

//Crear planillas, estas planillas se crean para un mes especifico
export const createPlanillas = async (req, res) => {
  const { tipo } = req.body;
  try {
    //verificar si para este mes y año ya se genero las planillas de tipo sieldo
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Los meses en JavaScript son base 0
    const currentYear = currentDate.getFullYear();

    const existingPlanillas = await Planilla.findAll({
      where: {
        mes: currentMonth,
        anio: currentYear,
        tipo: "sueldos",
      },
    });

    if (existingPlanillas.length > 0) {
      return res.status(400).json({
        message:
          "Ya se generaron las planillas para los sueldos de este mes y año.",
      });
    }

    //traer a todos lo usuarios personales
    const personal = await Personal.findAll();

    //recorrer a todos los personales y crear la planilla para cada uno
    for (const person of personal) {
      await Planilla.create({
        mes: currentMonth,
        anio: currentYear,
        tipo: tipo,
        personalId: person.idPersonal,
      });
    }

    return res.status(201).json({ message: "Planillas creadas exitosamente." });
  } catch (error) {
    console.error("Error al crear la planilla:", error);
    return res.status(500).json({ message: "Error al crear la planilla." });
  }
};

//obtener todas las planillas
export const getPlanillas = async (req, res) => {
  try {
    const planillas = await Planilla.findAll({
      include: [
        {
          model: Personal,
          as: "personal",
          include: [
            { model: Funcion, as: "funcion" },
            { model: Usuario, as: "usuario" },
          ],
        },
        {
          model: Pago,
          as: "pago",
        },
      ],
    });
    //limpiar datos de cada planilla para el front
    const newPlanillas = [];
    for (const planilla of planillas) {
      newPlanillas.push({
        idPlanilla: planilla.idPlanilla,
        mes: Number(planilla.mes),
        anio: Number(planilla.anio),
        fechaGeneracion: `${planilla.mes}/${planilla.anio}`,
        tipo: planilla.tipo,
        pagado: planilla.pago ? true : false,
        urlRecibo: planilla.urlRecibo,
        idPersonal: planilla.personalId,
        nombrePersonal: planilla.personal.usuario.nombre,
        telefonoPersonal: planilla.personal.telefono,
        emailPersonal: planilla.personal.usuario.email,
        funcion: planilla.personal.funcion.cargo,
        salario: planilla.personal.funcion.salario,
        qrPersonal: planilla.personal.urlQR,
      });
    }
    return res.status(200).json(newPlanillas);
  } catch (error) {
    console.error("Error al obtener las planillas:", error);
    return res.status(500).json({ message: "Error al obtener las planillas." });
  }
};

//traer las planillas de un usuairio personal
export const getPlanillasByPersonal = async (req, res) => {
  let { personalId } = req.params;
  try {
    if (!personalId) {
      return res
        .status(400)
        .json({ message: "El ID del personal es requerido." });
    }

    const usuario = await Usuario.findByPk(personalId, {
      include: { model: Personal, as: "personal" },
    });
    if (!usuario.personal) {
      return res
        .status(404)
        .json({ message: "Este usuario no es un personal o no existe." });
    }

    personalId = usuario.personal.idPersonal;

    const planillas = await Planilla.findAll({
      where: { personalId: personalId },
      include: [
        {
          model: Personal,
          as: "personal",
          include: [
            { model: Funcion, as: "funcion" },
            { model: Usuario, as: "usuario" },
          ],
        },
        {
          model: Pago,
          as: "pago",
        },
      ],
    });
    //limpiar datos de cada planilla para el front
    const newPlanillas = [];
    for (const planilla of planillas) {
      newPlanillas.push({
        idPlanilla: planilla.idPlanilla,
        mes: Number(planilla.mes),
        anio: Number(planilla.anio),
        fechaGeneracion: `${planilla.mes}/${planilla.anio}`,
        tipo: planilla.tipo,
        pagado: planilla.pago ? true : false,
        urlRecibo: planilla.urlRecibo,
        idPersonal: planilla.personalId,
        nombrePersonal: planilla.personal.usuario.nombre,
        telefonoPersonal: planilla.personal.telefono,
        emailPersonal: planilla.personal.usuario.email,
        funcion: planilla.personal.funcion.cargo,
        salario: planilla.personal.funcion.salario,
        reciboUrl: planilla.reciboUrl,
      });
    }
    return res.status(200).json(newPlanillas);
  } catch (error) {
    console.error("Error al obtener las planillas:", error);
    return res.status(500).json({ message: "Error al obtener las planillas." });
  }
};
