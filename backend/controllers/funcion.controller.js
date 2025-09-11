import funcion from "../models/funcion.js";

//Crear una nueva funcion(cargo de empleo)
export const createFuncion = async (req, res) => {
  try {
    const { cargo, descripcion, salario } = req.body;
    if (!cargo || !descripcion || !salario) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    // Verificar si la funcion ya existe
    const funcionExistente = await funcion.findOne({ where: { cargo } });
    if (funcionExistente) {
      return res
        .status(409)
        .json({ message: "La funcion con este cargo ya existe" });
    }
    const nuevaFuncion = await funcion.create({ cargo, descripcion, salario });
    res.status(201).json({ funcion: nuevaFuncion, message: "Funcion creada correctamente" });
  } catch (error) {
    console.error("Error al crear la funcion:", error);
    res.status(500).json({ error: "Error al crear la funcion" });
  }
};

//Obtener todas las funciones
export const getFunciones = async (req, res) => {
  try {
    const funciones = await funcion.findAll({ attributes: { exclude: ['createdAt', 'updatedAt'] } });
    res.status(200).json(funciones);
  } catch (error) {
    console.error("Error al obtener las funciones:", error);
    res.status(500).json({ error: "Error al obtener las funciones" });
  }
};

//Editar una funcion
export const updateFuncion = async (req, res) => {
  try {
    const { id } = req.params;
    const { cargo, descripcion, salario } = req.body;
    const funcionExistente = await funcion.findByPk(id);
    if (!funcionExistente) {
      return res.status(404).json({ error: "Funcion no encontrada (id)" });
    }
    if (!cargo || !descripcion || !salario) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }
    // Actualizar la funcion
    funcionExistente.cargo = cargo;
    funcionExistente.descripcion = descripcion;
    funcionExistente.salario = salario;
    await funcionExistente.save();
    res.status(200).json(funcionExistente);
  } catch (error) {
    console.error("Error al actualizar la funcion:", error);
    res.status(500).json({ error: "Error al actualizar la funcion" });
  }
};

//Obtener una funcion por ID (opcional)
export const getFuncionById = async (req, res) => {
  try {
    const { id } = req.params;
    const funcionExistente = await funcion.findByPk(id);
    if (!funcionExistente) {
      return res.status(404).json({ error: "Funcion no encontrada (id)" });
    }
    res.status(200).json(funcionExistente);
  } catch (error) {
    console.error("Error al obtener la funcion:", error);
    res.status(500).json({ error: "Error al obtener la funcion" });
  }
};

//Eliminar una funcion
export const deleteFuncion = async (req, res) => {
  try {
    const { id } = req.params;
    const funcionExistente = await funcion.findByPk(id);
    if (!funcionExistente) {
      return res.status(404).json({ error: "Funcion no encontrada (id)" });
    }
    await funcionExistente.destroy();

    // Usar 200 para que sí devuelva el JSON
    res.status(200).json({ message: "Funcion eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la funcion:", error);
    res.status(500).json({ error: "Error al eliminar la funcion" });
  }
};
