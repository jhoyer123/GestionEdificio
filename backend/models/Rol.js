import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Usuario from "./Usuario.js";

const Rol = sequelize.define(
  "Rol",
  {
    id: {
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
    timestamps: true, // quita createdAt / updatedAt automáticos
  }
);

export default Rol;
