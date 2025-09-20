import departamento from "../models/Departamento.js";
import { getDepartamentosConUsuarios } from "./helpers/departamento.js";

// Crear un nuevo departamento
export const createDepartamento = async (req, res) => {
  try {
    const { numero, descripcion, piso, alquilerPrecio } = req.body;

    if (!numero || !descripcion || !piso || !alquilerPrecio) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }
    const departamentoExistente = await departamento.findOne({
      where: { numero },
    });
    if (departamentoExistente) {
      return res.status(400).json({ message: "El departamento ya existe" });
    }
    const nuevoDepartamento = await departamento.create({
      numero,
      descripcion,
      piso,
      alquilerPrecio,
    });

    res.status(201).json({ message: "Departamento creado correctamente" });
  } catch (error) {
    console.error("Error al crear departamento:", error);
    res.status(500).json({ error: "Error al crear departamento" });
  }
};

// obterner un departamento
export const getDepartamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const departamentoU = await departamento.findByPk(id);
    if (!departamentoU) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }
    res.status(200).json(departamentoU);
  } catch (error) {
    console.error("Error al obtener departamento:", error);
    res.status(500).json({ error: "Error al obtener departamento" });
  }
};

// Obtener todos los departamentos
export const getDepartamentos = async (req, res) => {
  try {
    const departamentos = await departamento.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    res.status(200).json(departamentos);
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    res.status(500).json({ error: "Error al obtener departamentos" });
  }
};

// Editar un departamento
export const updateDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, descripcion, piso, alquilerPrecio } = req.body;

    const departamentoU = await departamento.findByPk(id);

    if (!departamentoU) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }

    if (!numero || !descripcion || !piso || !alquilerPrecio) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    departamentoU.numero = numero;
    departamentoU.descripcion = descripcion;
    departamentoU.piso = piso;
    departamentoU.alquilerPrecio = alquilerPrecio;

    await departamentoU.save();
    res.status(200).json(departamentoU, {
      message: "Departamento actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al editar departamento:", error);
    res.status(500).json({ error: "Error al editar departamento" });
  }
};

// Eliminar un departamento
export const deleteDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const Departamento = await departamento.findByPk(id);
    if (!Departamento) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }
    await Departamento.destroy();
    res.status(204).send({ message: "Departamento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar departamento:", error);
    res.status(500).json({ error: "Error al eliminar departamento" });
  }
};

//Consultas del modelo de negocio
export const obtenerDepartamentosConUsuarios = async (req, res) => {
  await getDepartamentosConUsuarios(req, res);
};
