import ConceptoMantenimiento from "../models/ConceptoMantenimiento.js";

//Crear un nuevo concepto de mantenimiento
export const createConceptoMantenimiento = async (req, res) => {
  try {
    const { titulo, descripcion, monto, frecuencia } = req.body;

    if (!titulo || !descripcion || !monto || (!frecuencia && monto < 0)) {
      return res.status(400).json({
        error:
          "Todos los campos son obligatorios y el monto debe ser mayor que cero",
      });
    }

    const nuevoConcepto = await ConceptoMantenimiento.create({
      titulo,
      descripcion,
      monto,
      frecuencia,
    });

    res.status(201).json({
      nuevoConcepto: nuevoConcepto,
      message: "Concepto de mantenimiento creado exitosamente",
    });
  } catch (error) {
    console.error("Error al crear concepto de mantenimiento:", error);
    res.status(500).json({ error: "Error al crear concepto de mantenimiento" });
  }
};

//Actualizar un concepto de mantenimiento existente
export const updateConceptoMantenimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, monto, frecuencia } = req.body;
    const concepto = await ConceptoMantenimiento.findByPk(id);
    if (!concepto) {
      return res.status(404).json({ error: "Concepto no encontrado" });
    }
    if (!titulo || !descripcion || !monto || (!frecuencia && monto < 0)) {
      return res.status(400).json({
        error:
          "Todos los campos son obligatorios y el monto debe ser mayor que cero",
      });
    }

    await concepto.update({
      titulo,
      descripcion,
      monto,
      frecuencia,
    });

    res.status(200).json({
      concepto: concepto,
      message: "Concepto actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar concepto de mantenimiento:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar concepto de mantenimiento" });
  }
};

//Eliminar un concepto de mantenimiento
export const deleteConceptoMantenimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const concepto = await ConceptoMantenimiento.findByPk(id);
    if (!concepto) {
      return res.status(404).json({ error: "Concepto no encontrado" });
    }

    await concepto.destroy();
    res
      .status(200)
      .json({ message: "Concepto de mantenimiento eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar concepto de mantenimiento:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar concepto de mantenimiento" });
  }
};

//Obtener todos los conceptos de mantenimiento
export const getAllConceptosMantenimiento = async (req, res) => {
  try {
    const conceptos = await ConceptoMantenimiento.findAll();
    res.status(200).json(conceptos);
  } catch (error) {
    console.error("Error al obtener conceptos de mantenimiento:", error);
    res
      .status(500)
      .json({ error: "Error al obtener conceptos de mantenimiento" });
  }
};

//Obtener un concepto de mantenimiento por ID
export const getConceptoMantenimientoById = async (req, res) => {
  try {
    const { id } = req.params;
    const concepto = await ConceptoMantenimiento.findByPk(id);
    if (!concepto) {
      return res.status(404).json({ error: "Concepto no encontrado" });
    }
    res.status(200).json(concepto);
  } catch (error) {
    console.error("Error al obtener concepto de mantenimiento:", error);
    res
      .status(500)
      .json({ error: "Error al obtener concepto de mantenimiento" });
  }
};
