import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AnuncioUsuario = sequelize.define(
  "AnuncioUsuario",
  {
    idAnuncioUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    anuncioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "anuncioUsuarios",
    timestamps: true,
  }
);

export default AnuncioUsuario;
