import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Departamento = sequelize.define(
  "Departamento",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    piso: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "departamentos",
    timestamps: true,
  }
);

export default Departamento;
