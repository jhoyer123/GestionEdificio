import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UsuarioRol = sequelize.define(
  "UsuarioRol",
  {
    idUsuarioRol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "UsuarioRoles",
    timestamps: true,
  }
);

export default UsuarioRol;
