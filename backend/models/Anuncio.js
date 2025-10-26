import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Anuncio = sequelize.define(
  "Anuncio",
  {
    idAnuncio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    visiblePara: {
      type: DataTypes.ENUM("residente", "personal", "todos"),
      allowNull: false,
    },
    fechaExpiracion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "anuncios",
    timestamps: true,
  }
);

export default Anuncio;
