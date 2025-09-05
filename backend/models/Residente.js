import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Residente = sequelize.define(
  "Residente",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "residentes",
    timestamps: true,
  }
);

export default Residente;
