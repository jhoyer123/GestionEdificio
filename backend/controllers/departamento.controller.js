import departamento from "../models/departamento.js";

// Crear un nuevo departamento
export const createDepartamento = async (req, res) => {
  try {
    const { numero, descripcion, piso } = req.body;

    if (!numero || !descripcion || !piso) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevoDepartamento = await departamento.create({
      numero,
      descripcion,
      piso,
    });

    res.status(201).json(nuevoDepartamento);
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
    const departamentos = await departamento.findAll();
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
    const { numero, descripcion, piso } = req.body;

    const departamentoU = await departamento.findByPk(id);

    if (!departamentoU) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }

    if (!numero || !descripcion || !piso) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    departamentoU.numero = numero;
    departamentoU.descripcion = descripcion;
    departamentoU.piso = piso;

    await departamentoU.save();
    res.status(200).json(departamentoU, { message: "Departamento actualizado correctamente" });
  } catch (error) {
    console.error("Error al editar departamento:", error);
    res.status(500).json({ error: "Error al editar departamento" });
  }
};

// Eliminar un departamento
export const deleteDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const departamento = await departamento.findByPk(id);
    if (!departamento) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }
    await departamento.destroy();
    res.status(204).send("Departamento eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar departamento:", error);
    res.status(500).json({ error: "Error al eliminar departamento" });
  }
};
