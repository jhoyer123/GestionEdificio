import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Bloqueo = sequelize.define(
  "Bloqueo",
  {
    idBloqueo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    areaComunId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tipoAreaBloqueada: {
      type: DataTypes.ENUM(
        "salon",
        "gimnasio",
        "parqueo_visitas",
        "parqueo_extra"
      ),
      allowNull: true,
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "bloqueos",
    timestamps: true,
  }
);

export default Bloqueo;
