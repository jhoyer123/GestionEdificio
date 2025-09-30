import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Reserva = sequelize.define(
  "Reserva",
  {
    idReserva: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    usuarioId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    areaComunId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cajaId: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    fechaReserva: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    horaInicio: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    horaFin: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    fechaFinReserva: {
      allowNull: true,
      type: DataTypes.DATEONLY, // Usar DATEONLY si solo te interesa el día
    },
    motivo: {
      type: DataTypes.TEXT,
    },
    numAsistentes: {
      type: DataTypes.INTEGER,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "confirmada", "rechazada", "cancelada"),
      defaultValue: "pendiente",
    },
    costoTotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    pagado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true, tableName: "reservas" }
);

export default Reserva;
