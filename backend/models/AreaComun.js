import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AreaComun = sequelize.define(
  "AreaComun",
  {
    idAreaComun: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreAreaComun: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    capacidadMaxima: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    costoPorHora: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    horarioInicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    horarioFin: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    requiereAprobacion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Areas_Comunes",
    timestamps: true,
  }
);

export default AreaComun;
