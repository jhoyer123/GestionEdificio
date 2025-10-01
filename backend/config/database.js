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
    timezone: "+00:00", // Ajusta la zona horaria según sea necesario
    // !!! CONFIGURACIÓN ADICIONAL CRUCIAL PARA MYSQL !!!
    dialectOptions: {
      // Evita que el cliente MySQL haga conversiones de zona horaria
      // y asume que los valores de DATETIME/TIMESTAMP ya están en UTC.
      dateStrings: true,
      typeCast: true,
      timezone: "Z", // Opcional, forzando la conexión a usar UTC
    },
  }
);

export default sequelize;
