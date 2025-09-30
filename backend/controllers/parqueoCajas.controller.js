import ParqueoCaja from "../models/ParqueoCaja.js";

// Crear una nueva caja de parqueo
export const createParqueoCaja = async (req, res) => {
  try {
    const { numeroCaja } = req.body;
    if (!numeroCaja) {
      return res
        .status(400)
        .json({ error: "El número de caja es obligatorio" });
    }
    //verificar que no exista otra caja con el mismo numero
    const cajaExistente = await ParqueoCaja.findOne({
      where: { numeroCaja: numeroCaja },
    });
    if (cajaExistente) {
      return res
        .status(400)
        .json({ error: "Ya existe una caja con ese número" });
    }
    const nuevaCaja = await ParqueoCaja.create({ numeroCaja });
    res.status(201).json({
      nuevaCaja: nuevaCaja,
      message: "Caja de parqueo creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear la caja de parqueo:", error);
    res.status(500).json({ message: "Error al crear la caja de parqueo" });
  }
};

// editar una caja de parqueo
export const editParqueoCaja = async (req, res) => {
  try {
    const { id } = req.params;
    const { numeroCaja } = req.body;
    const caja = await ParqueoCaja.findByPk(id);
    if (!caja) {
      return res.status(404).json({ message: "Caja de parqueo no encontrada" });
    }
    if (!numeroCaja) {
      return res
        .status(400)
        .json({ message: "El número de caja es obligatorio" });
    }
    //verificar que no exista otra caja con el mismo numero
    const cajaExistente = await ParqueoCaja.findOne({
      where: { numeroCaja: numeroCaja },
    });
    if (cajaExistente) {
      return res
        .status(400)
        .json({ message: "Ya existe una caja con ese número" });
    }
    caja.numeroCaja = numeroCaja;
    await caja.save();
    res.status(200).json({
      caja: caja,
      message: "Caja de parqueo actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar la caja de parqueo:", error);
    res.status(500).json({ message: "Error al actualizar la caja de parqueo" });
  }
};

//obtener todas las cajas de parqueo
export const getAllParqueoCajas = async (req, res) => {
  try {
    const cajas = await ParqueoCaja.findAll();
    res.status(200).json(cajas);
  } catch (error) {
    console.error("Error al obtener las cajas de parqueo:", error);
    res.status(500).json({ message: "Error al obtener las cajas de parqueo" });
  }
};

//eliminar una caja de parqueo
export const deleteParqueoCaja = async (req, res) => {
  try {
    const { id } = req.params;
    const caja = await ParqueoCaja.findByPk(id);
    if (!caja) {
      return res.status(404).json({ message: "Caja de parqueo no encontrada" });
    }
    await caja.destroy();
    res.status(200).json({ message: "Caja de parqueo eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar la caja de parqueo:", error);
    res.status(500).json({ message: "Error al eliminar la caja de parqueo" });
  }
};
