import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Funcion = sequelize.define(
  "Funcion",
  {
    idFuncion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "funciones",
    timestamps: true,
  }
);

export default Funcion;
