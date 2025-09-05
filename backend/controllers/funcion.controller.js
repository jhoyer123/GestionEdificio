import funcion from "../models/funcion.js";

//Crear una nueva funcion(cargo de empleo)
export const createFuncion = async (req, res) => {
  try {
    const { cargo, descripcion, salario } = req.body;
    if (!cargo || !descripcion || !salario) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }
    // Verificar si la funcion ya existe
    const funcionExistente = await funcion.findOne({ where: { cargo } });
    if (funcionExistente) {
      return res.status(409).json({ error: "La funcion con este cargo ya existe" });
    }
    const nuevaFuncion = await funcion.create({ cargo, descripcion, salario });
    res.status(201).json(nuevaFuncion);
  } catch (error) {
    console.error("Error al crear la funcion:", error);
    res.status(500).json({ error: "Error al crear la funcion" });
  }
};
