import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Habita = sequelize.define(
  "Habita",
  {
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    departamentoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "habita",
    timestamps: true,
  }
);

export default Habita;
