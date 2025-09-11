import sequelize from "../../config/database.js";
import { QueryTypes } from "sequelize";

// Obtener los departamentos y además sus usuarios de los que tengan si no null
export const getDepartamentosConUsuarios = async (req, res) => {
  try {
    // ✅ Opción 1: Consulta más eficiente con LEFT JOIN
    const departamentos = await sequelize.query(
      `
        SELECT 
          d.idDepartamento, 
          d.numero, 
          d.descripcion, 
          u.nombre 
        FROM departamentos d 
        LEFT JOIN habita h ON d.idDepartamento = h.departamentoId 
        LEFT JOIN usuarios u ON h.usuarioId = u.idUsuario
        ORDER BY d.numero, u.nombre
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json(departamentos);
  } catch (error) {
    console.error("Error al obtener departamentos con usuarios:", error);
    res
      .status(500)
      .json({ error: "Error al obtener departamentos con usuarios" });
  }
};
