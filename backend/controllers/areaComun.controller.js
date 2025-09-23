import AreaComun from "../models/AreaComun.js";
import Reserva from "../models/Reserva.js";
import sequelize from "../config/database.js";

//CREAR AREA COMUN
export const createAreaComun = async (req, res) => {
  try {
    const {
      nombreAreaComun,
      descripcion,
      capacidadMaxima,
      costoPorHora,
      horarioInicio,
      horarioFin,
      requiereAprobacion,
    } = req.body;
    if (
      !nombreAreaComun ||
      !capacidadMaxima ||
      !horarioInicio ||
      !horarioFin ||
      requiereAprobacion === undefined
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    const area = await AreaComun.create({
      nombreAreaComun,
      descripcion,
      capacidadMaxima,
      costoPorHora,
      horarioInicio,
      horarioFin,
      requiereAprobacion,
      imageUrl: req.file ? req.file.filename : null, // 👉 si no se envía imagen queda null
    });

    res
      .status(201)
      .json({ area: area, message: "Área común creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el área común" });
  }
};

// Listar todas las áreas
export const getAreasComunes = async (req, res) => {
  try {
    const areas = await AreaComun.findAll();
    res.json(areas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener áreas comunes" });
  }
};

// Obtener una sola área
export const getAreaComun = async (req, res) => {
  try {
    const { id } = req.params;
    //aqui debemos obtener el area con todas sus reservas existentes
    const area = await AreaComun.findByPk(id, {
      include: [{ model: Reserva, as: "reservas" }],
    });

    if (!area) {
      return res.status(404).json({ message: "Área no encontrada" });
    }

    res.json(area);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el área" });
  }
};

// UPDATE AREA COMUN
export const updateAreaComun = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el registro
    const area = await AreaComun.findByPk(id);
    if (!area) {
      return res.status(404).json({ message: "Área común no encontrada" });
    }

    // Campos que pueden actualizarse
    const {
      nombreAreaComun,
      descripcion,
      capacidadMaxima,
      costoPorHora,
      horarioInicio,
      horarioFin,
      requiereAprobacion,
    } = req.body;

    // Actualizar solo los campos enviados
    area.nombreAreaComun = nombreAreaComun ?? area.nombreAreaComun;
    area.descripcion = descripcion ?? area.descripcion;
    area.capacidadMaxima = capacidadMaxima ?? area.capacidadMaxima;
    area.costoPorHora = costoPorHora ?? area.costoPorHora;
    area.horarioInicio = horarioInicio ?? area.horarioInicio;
    area.horarioFin = horarioFin ?? area.horarioFin;
    // OJO: requiereAprobacion puede ser boolean false, por eso usamos !== undefined
    if (requiereAprobacion !== undefined) {
      area.requiereAprobacion = requiereAprobacion;
    }

    // Imagen nueva (si se envía)
    if (req.file) {
      area.imageUrl = req.file.filename;
    }

    await area.save();

    res.status(200).json({
      message: "Área común actualizada correctamente",
      area,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el área común" });
  }
};

// Eliminar un área
export const deleteAreaComun = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await AreaComun.findByPk(id);
    if (!area) {
      return res.status(404).json({ message: "Área no encontrada" });
    }
    await area.destroy();
    res.json({ message: "Área eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el área" });
  }
};
