import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DetallesFactura = sequelize.define("DetallesFactura", {
  idDetalle: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  concepto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  facturaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},{
    tableName: "detallesFactura",
    timestamps: true,
});

export default DetallesFactura;
