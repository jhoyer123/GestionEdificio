import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Rol = sequelize.define(
  "Rol",
  {
    idRol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "roles",
    timestamps: true,
  }
);

export default Rol;
