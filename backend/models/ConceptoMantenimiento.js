import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

const ConceptoMantenimiento = sequelize.define(
  "conceptos_mantenimiento",
  {
    idConcepto: {
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
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    frecuencia: {
      type: DataTypes.ENUM("mensual", "anual", "unico"),
      allowNull: false,
      defaultValue: "mensual",
    },
    usado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ultimaFechaUso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "conceptos_mantenimiento",
    timestamps: true,
  }
);

export default ConceptoMantenimiento;
