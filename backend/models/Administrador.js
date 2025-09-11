import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Administrador = sequelize.define(
  "Administrador",
  {
    idAdministrador: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cedula: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "administradores",
    timestamps: true,
  }
);

export default Administrador;
