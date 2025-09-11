import Turno from "../models/Turno.js";

// Crear un nuevo turno
export const createTurno = async (req, res) => {
  try {
    const { horaInicio, horaFin, dia } = req.body;
    if (!horaInicio || !horaFin || !dia) {
      return res
        .status(400)
        .json({ error: "Todos los datos son obligatorios" });
    }
    const turnoExistente = await Turno.findOne({
      where: { dia, horaInicio, horaFin },
    });
    if (turnoExistente) {
      return res.status(400).json({ error: "El turno ya existe" });
    }
    const nuevoTurno = await Turno.create({ horaInicio, horaFin, dia });
    res.status(201).json(nuevoTurno);
  } catch (error) {
    console.error("Error al crear el turno:", error);
    res.status(500).json({ error: "Error al crear el turno" });
  }
};

//obtener todos los turnos
export const getTurnos = async (req, res) => {
  try {
    const turnos = await Turno.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    res.json(turnos);
  } catch (error) {
    console.error("Error al obtener los turnos:", error);
    res.status(500).json({ error: "Error al obtener los turnos" });
  }
};

// Obtener un turno por ID
export const getTurnoById = async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findByPk(id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!turno) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }
    res.json(turno);
  } catch (error) {
    console.error("Error al obtener el turno:", error);
    res.status(500).json({ error: "Error al obtener el turno" });
  }
};

//actualizar un turno
export const updateTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const { horaInicio, horaFin, dia } = req.body;
    if (!horaInicio || !horaFin || !dia) {
      return res
        .status(400)
        .json({ error: "Todos los datos son obligatorios" });
    }
    const turno = await Turno.findByPk(id);
    if (!turno) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }
    turno.horaInicio = horaInicio;
    turno.horaFin = horaFin;
    turno.dia = dia;
    await turno.save();
    res.json(turno);
  } catch (error) {
    console.error("Error al actualizar el turno:", error);
    res.status(500).json({ error: "Error al actualizar el turno" });
  }
};

// Eliminar un turno
export const deleteTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findByPk(id);
    if (!turno) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }
    await turno.destroy();
    res.json({ message: "Turno eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el turno:", error);
    res.status(500).json({ error: "Error al eliminar el turno" });
  }
};
