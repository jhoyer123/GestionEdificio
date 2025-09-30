import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ParqueoCaja = sequelize.define(
  "ParqueoCaja",
  {
    idParqueoCaja: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    numeroCaja: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    residenteAsignadoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "parqueocajas",
    timestamps: true,
  }
);

export default ParqueoCaja;
