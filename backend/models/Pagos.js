import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Pago = sequelize.define(
  "Pago",
  {
    idPago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reservaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "reservas",
        key: "idReserva",
      },
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    metodoPago: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fechaPago: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "confirmado", "rechazado"),
      defaultValue: "pendiente",
    },
  },
  {
    timestamps: true,
    tableName: "pagos",
  }
);

export default Pago;
