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
    personalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mes: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reciboUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "planillas",
    timestamps: true,
  }
);

export default Planilla;
