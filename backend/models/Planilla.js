import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Planilla = sequelize.define(
  "Planilla",
  {
    idPlanilla: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mes: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    salario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    personalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "planillas",
    timestamps: true,
  }
);

export default Planilla;
