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
    id_unico_pago : {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    facturaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reservaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    metodoPago: {
      type: DataTypes.ENUM("transferencia", "QR", "efectivo"),
      allowNull: false,
      defaultValue: "QR",
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
