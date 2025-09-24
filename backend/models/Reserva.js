import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Reserva = sequelize.define(
  "Reserva",
  {
    idReserva: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      references: {
        model: "usuarios",
        key: "idUsuario",
      },
    },
    areaComunId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Areas_Comunes",
        key: "idAreaComun",
      },
    },
    fechaReserva: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    horaInicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    horaFin: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.TEXT,
    },
    numAsistentes: {
      type: DataTypes.INTEGER,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "confirmada","rechazada", "cancelada"),
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
