import Usuario from "../models/Usuario.js";
import Residente from "../models/Residente.js";
import Departamento from "../models/Departamento.js";
import Habita from "../models/Habita.js";
import Rol from "../models/Rol.js";

//Obtener todos los usuarios residentes
export const getResidentes = async (req, res) => {
  try {
    let residentes = await Residente.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
          include: [
            {
              model: Departamento,
              as: "departamentos",
              through: { attributes: ["fecha", "tipoResidencia"] }, // columnas de Habita
              attributes: ["numero"],
            },
            {
              model: Rol,
              as: "rol",
              attributes: ["rol"],
            },
          ],
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    residentes = residentes.map((r) => ({
      residenteId: r.id,
      telefono: r.telefono,
      usuarioId: r.usuario.id,
      nombre: r.usuario.nombre,
      email: r.usuario.email,
      estado: r.usuario.estado,
      rolId: r.usuario.rolId,
      departamento: r.usuario.departamentos[0]
        ? {
            numero: r.usuario.departamentos[0].numero,
            fecha: r.usuario.departamentos[0].Habita.fecha,
            tipoResidencia: r.usuario.departamentos[0].Habita.tipoResidencia,
          }
        : null,
      rolId: r.usuario.rol.id,
      rol: r.usuario.rol.rol,
    }));
    res.json(residentes);
  } catch (error) {
    console.error("Error fetching residentes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
