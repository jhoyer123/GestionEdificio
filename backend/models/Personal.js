import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Personal = sequelize.define(
  "Personal",
  {
    idPersonal: {
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
    fechaNacimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    genero: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    funcionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    urlQR: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    tableName: "personales",
    timestamps: true,
  }
);

export default Personal;
