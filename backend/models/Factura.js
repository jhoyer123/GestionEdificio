import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Factura = sequelize.define(
  "Factura",
  {
    idFactura: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nroFactura: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fechaEmision: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    montoTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "pagada", "vencida"),
      allowNull: false,
      defaultValue: "pendiente",
    },
    departamentoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reservaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "facturas",
    timestamps: true,
  }
);

export default Factura;
