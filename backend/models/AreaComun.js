import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AreaComun = sequelize.define(
  "AreaComun",
  {
    idAreaComun: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombreAreaComun: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    capacidadMaxima: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipoArea: {
      type: DataTypes.ENUM("salones", "gimnasio", "parqueo", "otros"),
      allowNull: false,
      defaultValue: "salones",
    },
    // <<< NUEVOS CAMPOS FLEXIBLES >>>
    costoBase: {
      defaultValue: 0,
      type: DataTypes.DECIMAL(10, 2),
    },
    // <<< FIN CAMPOS FLEXIBLES >>>
    /* costoPorHora: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    }, */
    horarioApertura: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    horarioCierre: {
      type: DataTypes.TIME,
      allowNull: true,
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
