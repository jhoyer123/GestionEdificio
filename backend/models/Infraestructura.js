import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Infraestructura = sequelize.define(
  "Infraestructura",
  {
    idInfraestructura: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ubicacion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(
        "operativo",
        "en mantenimiento",
        "fuera de servicio"
      ),
      allowNull: false,
    },
  },
  {
    tableName: "infraestructuras",
    timestamps: true,
  }
);

export default Infraestructura;
