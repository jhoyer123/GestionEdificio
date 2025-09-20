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
    });

    res.status(201).json({ area: area, message: "Área común creada correctamente" });
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

// Actualizar un área
export const updateAreaComun = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombreAreaComun,
      descripcion,
      capacidadMaxima,
      costoPorHora,
      horarioInicio,
      horarioFin,
      requiereAprobacion,
    } = req.body;

    const area = await AreaComun.findByPk(id);

    if (!area) {
      return res.status(404).json({ message: "Área no encontrada" });
    }

    // Actualizar los campos del área
    area.nombreAreaComun = nombreAreaComun;
    area.descripcion = descripcion;
    area.capacidadMaxima = capacidadMaxima;
    area.costoPorHora = costoPorHora;
    area.horarioInicio = horarioInicio;
    area.horarioFin = horarioFin;
    area.requiereAprobacion = requiereAprobacion;

    await area.save();

    res.json({ area: area, message: "Área actualizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el área" });
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
