// modelo de Usuario
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Rol from "./Rol.js";

const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    rolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "usuarios",
    timestamps: true, // quita createdAt / updatedAt automáticos
  }
);

/* //relaciones
Rol.hasMany(Usuario, { foreignKey: "rolId", as: "usuarios" });
Usuario.belongsTo(Rol, { foreignKey: "rolId", as: "rol" }); */


export default Usuario;
