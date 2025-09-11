import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Departamento = sequelize.define(
  "Departamento",
  {
    idDepartamento: {
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
    alquilerPrecio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    tableName: "departamentos",
    timestamps: true,
  }
);

export default Departamento;
