import express from "express";
import dotenv from "dotenv";
// importamos rutas
import usuarioRoutes from "./routes/usuarios.routes.js"; 
import funcionesRoutes from "./routes/funciones.routes.js";
import authRoutes from "./routes/auth.routes.js";
import personalRoutes from "./routes/personal.routes.js";
import departamentoRoutes from "./routes/departamentos.routes.js";
import residenteRoutes from "./routes/residentes.routes.js";
// importamos asociaciones
import roleRoutes from "./routes/roles.routes.js";
//import de cors
import cors from "cors";

import cookieParser from "cookie-parser";
import "./asociaciones/asociaciones.js"; 

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // Reemplaza con la URL de tu frontend
  credentials: true,
}));

// Rutas
app.use(usuarioRoutes);
app.use(funcionesRoutes);
app.use(roleRoutes);
app.use(authRoutes);
app.use(personalRoutes);
app.use(departamentoRoutes);
app.use(residenteRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
});

/* 
++++ migra las tablas a la base de datos
npx sequelize-cli db:migrate
++++ deshace la última migración
npx sequelize-cli db:migrate:undo
++++ crea una migracion
npx sequelize-cli migration:generate --name create-usuarios

Usuario.hasMany(Producto): Un usuario puede tener muchos productos.
Producto.belongsTo(Usuario): Un producto pertenece a un solo usuario. 
*/

/* 
sequelize.sync() o sequelize.sync({ force: false })
Propósito: Este comando es para crear tablas que no existen.
Comportamiento: Si la tabla usuarios no existe, la crea. Si la tabla ya existe, no hace nada. 

sequelize.sync({ force: true })
Propósito: Este comando es para borrar y recrear la tabla.
Comportamiento: Elimina la tabla (DROP TABLE) y luego la vuelve a crear.

sequelize.sync({ alter: true })
Propósito: Este comando es para actualizar una tabla existente para que coincida con tu modelo.
Comportamiento: No borra la tabla. En su lugar, revisa la tabla actual y la compara con tu modelo. Si detecta que falta una columna (como email), la agrega a la tabla. También puede modificar columnas existentes. Es muy útil durante el desarrollo porque puedes hacer cambios en tu modelo sin perder los datos de prueba que ya tengas en la  */
