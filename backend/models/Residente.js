import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Residente = sequelize.define(
  "Residente",
  {
    idResidente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "residentes",
    timestamps: true,
  }
);

export default Residente;
