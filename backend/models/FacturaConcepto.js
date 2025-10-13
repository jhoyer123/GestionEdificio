import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const FacturaConcepto = sequelize.define(
  "FacturaConcepto",
  {
    facturaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    conceptoMantenimientoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "factura_concepto",
    timestamps: true,
  }
);

export default FacturaConcepto;
