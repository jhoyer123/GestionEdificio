import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Turno = sequelize.define(
  "Turno",
  {
    idTurno: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    horaInicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    horaFin: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    dia: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "turnos",
    timestamps: true,
  }
);

export default Turno;
