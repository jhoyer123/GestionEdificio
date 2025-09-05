//Archivo de configuracion de la base de datos
import dotenv from "dotenv";
import { Sequelize } from "sequelize";

// Conexion a la base de datos
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql", // O 'postgres', 'sqlite', etc.
    logging: false, // Deshabilita los logs de SQL en la consola
  }
);

export default sequelize;