import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Personal = sequelize.define(
  "Personal",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    funcionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Personal",
    timestamps: true,
  }
);

export default Personal;
