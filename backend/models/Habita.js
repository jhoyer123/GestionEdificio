import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Habita = sequelize.define(
  "Habita",
  {
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    departamentoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "departamentos",
        key: "id",
      },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tipoResidencia: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Habita",
    timestamps: true,
  }
);

export default Habita;
